# TeamFlow — Security and Correctness Audit Report (Authentication & Multi-Tenancy)

**Document Version:** 1.0.0  
**Audit Scope:** Milestone 3 (`apps/api/src/modules/auth`, `apps/api/src/modules/organizations`, `apps/api/src/common/guards`)  
**Auditor:** TeamFlow Senior Software Architect & Security Lead  
**Governing Standard:** [`AGENTS.md`](../../AGENTS.md) Sections 1, 2, 3, 6, 8, 9, 10, 11, and 12

---

## Executive Summary

Before transitioning to Milestone 4 (Project & Task Management), a comprehensive, focused security and correctness audit was conducted across the authentication and multi-tenancy modules. The audit reviewed 8 core technical areas: password hashing, session revocation, sole-owner invariant concurrency, cookie and CSRF security, invitation acceptance concurrency, tenant isolation, automated test coverage, and documentation consistency.

Four security and concurrency vulnerabilities were identified, remediated, verified with automated tests (expanding test coverage from 34 to 50 passing tests), and compiled under strict TypeScript configuration.

---

## Audit Findings & Corrective Actions

### Item 1: Password Hashing (Bcrypt Cost 12 vs. Argon2id)

- **File Path:** [`apps/api/src/modules/auth/services/password.service.ts`](../../apps/api/src/modules/auth/services/password.service.ts)
- **Current Code:**
  ```typescript
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  ```
- **Explanation:**
  - **Bcrypt (Cost 12):** Explicitly approved in SRS requirement `FR-003` (`"Argon2id ... or bcrypt with cost factor 12"`). Cost 12 computes $2^{12} = 4096$ iterations taking ~250–350ms per hash on modern server CPUs, satisfying OWASP recommendations against CPU-based offline dictionary attacks. However, bcrypt requires only ~4 KB of RAM per hash and truncates passwords at 72 bytes. Specialized GPU and ASIC cracking rigs can compute bcrypt hashes in massive parallel arrays if the database is dumped.
  - **Argon2id (Specified in Brief):** The winner of the Password Hashing Competition (PHC) and OWASP's primary recommendation. It combines memory-hardness (Argon2d) and side-channel resistance (Argon2i). Configured with 64 MB RAM, 3 iterations, and 1 thread, each hash computation consumes 64 MB of physical memory, rendering massive parallel GPU/ASIC cracking unfeasible.
- **Severity:** **Medium** (Bcrypt cost 12 is compliant with `FR-003`, but Argon2id provides superior resistance against offline ASIC cracking).
- **Recommendation:**
  - Retain `bcrypt` (cost 12) for local development and initial milestone phases where native compilation compatibility across environments is critical.
  - For production staging, migrate to `@node-rs/argon2` (Rust-based N-API prebuilt binaries) or provide dual-verification in `PasswordService` (verifying both `$2b$` bcrypt and `$argon2id$` hashes to enable transparent, zero-downtime hash upgrades upon user login).
- **Code Change Necessary:** No immediate code change required for Milestone 3; recommendation documented for production deployment.

---

### Item 2: Session Revocation (Active Database Session Verification)

- **File Path:** [`apps/api/src/common/guards/jwt-auth.guard.ts`](../../apps/api/src/common/guards/jwt-auth.guard.ts) and [`apps/api/src/app.module.ts`](../../apps/api/src/app.module.ts)
- **Relevant Code:**
  ```typescript
  const session = await this.prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: { select: { id: true, deletedAt: true, ... } } },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new UnauthorizedException('Session expired or invalidated. Please log in again.');
  }
  ```
- **Explanation:**
  - The guard correctly queries PostgreSQL `Session` on every authenticated request, verifying the session exists and is not expired. When a user logs out (`delete`), resets password (`deleteMany`), or account is deactivated (`deletedAt !== null`), the database row is deleted/marked, and subsequent requests fail with `401 Unauthorized`.
  - **Vulnerability Found:** `JwtAuthGuard` was previously bound manually via `@UseGuards(JwtAuthGuard)` only on specific controllers. If an engineer created a new controller in Milestone 4 or 5 and forgot to attach `@UseGuards`, that entire controller would be completely unprotected.
- **Severity:** **High** (Risk of unauthenticated route exposure by omission).
- **Solution & Code Change:**
  - Registered `JwtAuthGuard` globally in `AppModule` using `{ provide: APP_GUARD, useClass: JwtAuthGuard }`.
  - Added `@Public()` decorator to [`HealthController`](../../apps/api/src/modules/health/health.controller.ts) so health probes remain accessible without authentication.
  - All routes across the application are now **Protected by Default (Zero Trust)**.
- **Code Change Necessary:** **Yes (Implemented).**

---

### Item 3: Sole-Owner Invariant Concurrency Race Condition (BR-010)

- **File Path:** [`apps/api/src/modules/organizations/services/members.service.ts`](../../apps/api/src/modules/organizations/services/members.service.ts#L66-L220)
- **Previous Vulnerable Code:**
  ```typescript
  // Invariant checked OUTSIDE transaction:
  if (target.role === OrgRole.ORG_OWNER && newRole !== OrgRole.ORG_OWNER) {
    const ownerCount = await this.prisma.membership.count({
      where: { organizationId: orgId, role: OrgRole.ORG_OWNER },
    });
    if (ownerCount <= 1) {
      throw new BadRequestException('Cannot demote the sole organization owner...');
    }
  }
  const updated = await this.prisma.$transaction(async (tx) => { ... });
  ```
- **Explanation:**
  - Suppose Organization A has 2 owners (Owner 1 and Owner 2).
  - Owner 1 sends a request to demote Owner 2. Simultaneously, Owner 2 sends a request to demote Owner 1 (or remove Owner 1).
  - Under PostgreSQL's default `Read Committed` isolation level, both requests count `ownerCount === 2` outside the transaction. Both proceed to execute their update/delete queries and commit.
  - **Result:** Organization A is left with **0 owners**, becoming permanently orphaned.
- **Severity:** **Critical** (Violates core business rule BR-010 and permanently breaks tenant administration).
- **Solution & Code Change:**
  - Wrapped the entire operation in `prisma.$transaction`.
  - Acquired an exclusive pessimistic row lock on the organization record at the start of the transaction:
    ```sql
    SELECT id FROM organizations WHERE id = $orgId::uuid FOR UPDATE;
    ```
  - Performed the `ownerCount` calculation inside the locked transaction.
  - Any concurrent request is queued by PostgreSQL. When the second transaction executes, it reads the committed state, observes `ownerCount === 1`, and throws `BadRequestException`.
  - Added automated concurrency test: `it('CONCURRENCY AUDIT: should prevent race condition when two requests try to demote owners simultaneously')`.
- **Code Change Necessary:** **Yes (Implemented).**

---

### Item 4: Cookie and CSRF Security Review

- **File Path:** [`apps/api/src/modules/auth/auth.controller.ts`](../../apps/api/src/modules/auth/auth.controller.ts#L158-L168)
- **Previous Code:**
  ```typescript
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
  ```
- **Explanation:**
  - **Cookie Security Flags:** `httpOnly: true` (prevents JavaScript XSS access), `secure: isProduction` (enforces HTTPS in production), `sameSite: strict` in production (prevents browser cross-site cookie transmission).
  - **Defect Found (MaxAge Mismatch):** The cookie `maxAge` was set to 7 days, but the `accessToken` stored inside expires in 15 minutes (`900s`). After 15 minutes, the browser continues sending an expired JWT cookie for 6 days 23 hours, causing unnecessary decryption and `TokenExpiredError` exceptions.
  - **CSRF Protection:** When requests use `Authorization: Bearer <token>` in headers, CSRF is impossible because browsers never attach custom headers to cross-site requests. For cookie authentication, `sameSite: strict` in production prevents cross-site requests from attaching cookies. In development with `sameSite: lax`, mutations (`POST`, `PATCH`, `DELETE`) require `Content-Type: application/json` which triggers CORS preflight (`OPTIONS`), preventing blind cross-origin form submissions.
- **Severity:** **Low / Medium**.
- **Solution & Code Change:**
  - Aligned cookie `maxAge` with the access token lifetime: `15 * 60 * 1000` (15 minutes).
- **Code Change Necessary:** **Yes (Implemented).**

---

### Item 5: Invitation Acceptance Concurrency & Single-Use Enforcement (TX-03)

- **File Path:** [`apps/api/src/modules/organizations/services/invitations.service.ts`](../../apps/api/src/modules/organizations/services/invitations.service.ts#L210-L245)
- **Previous Vulnerable Code:**
  ```typescript
  await this.prisma.$transaction(async (tx) => {
    await tx.membership.create({ ... });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    });
  });
  ```
- **Explanation:**
  - `invitation` status check was executed outside the transaction via `findFirst`.
  - The update inside the transaction used `where: { id: invitation.id }` without asserting `status = PENDING`.
  - If two identical requests were fired concurrently (e.g. double-click or replay), both could pass the initial check before either committed.
- **Severity:** **High** (Risk of race conditions and non-idempotent token consumption).
- **Solution & Code Change:**
  - Replaced `update` with conditional atomic `updateMany`:
    ```typescript
    const updateResult = await tx.invitation.updateMany({
      where: { id: invitation.id, status: InvitationStatus.PENDING },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    });

    if (updateResult.count === 0) {
      throw new ConflictException('Invitation has already been accepted or is no longer valid.');
    }
    ```
  - Added automated concurrency test: `it('CONCURRENCY AUDIT: should throw ConflictException if invitation was concurrently accepted by another process')`.
- **Code Change Necessary:** **Yes (Implemented).**

---

### Item 6: Tenant Isolation & Nested Resource Authorization

- **File Path:** [`apps/api/src/common/guards/tenant.guard.ts`](../../apps/api/src/common/guards/tenant.guard.ts) & [`apps/api/src/modules/organizations/controllers/organizations.controller.ts`](../../apps/api/src/modules/organizations/controllers/organizations.controller.ts)
- **Audit Findings:**
  - Every organization route (`/organizations/:orgId/*`) is guarded by `TenantGuard`.
  - `TenantGuard` queries the database `Membership` table directly for `(organizationId, userId)` and attaches `req.tenant` context. Client-supplied tenant IDs in request bodies are completely ignored.
  - **Nested Resource Checks:**
    - `PATCH /organizations/:orgId/members/:memberId`: `members.service.ts` verifies `target.organizationId === orgId`.
    - `DELETE /organizations/:orgId/members/:memberId`: `members.service.ts` verifies `target.organizationId === orgId`.
    - `DELETE /organizations/:orgId/invitations/:invId`: `invitations.service.ts` verifies `invitation.organizationId === orgId`.
  - Cross-tenant access attempts are rejected with `403 Forbidden` before controller execution.
- **Severity:** **Informational / Clean** (No vulnerabilities detected; implementation complies with Section 8 of `AGENTS.md`).
- **Code Change Necessary:** No code change required.

---

### Item 7: Automated Testing Classification & Missing Security Scenarios

- **Audit Findings:**
  - Prior to this audit, 34 automated tests existed, all classified as **Unit Tests** using Jest mocks.
  - No integration tests existed against a live PostgreSQL container (scheduled for Milestone 2 infrastructure validation).
  - Missing security test scenarios identified:
    1. Concurrency race condition on sole-owner removal/demotion.
    2. Concurrent invitation double-acceptance race condition.
    3. `JwtAuthGuard` session database lookup, session expiration, and user deactivation tests.
    4. `RolesGuard` RBAC hierarchy and insufficient role rejection tests.
- **Severity:** **Medium** (Missing coverage for critical security guards).
- **Solution & Code Change:**
  - Authored [`apps/api/src/common/guards/jwt-auth.guard.spec.ts`](../../apps/api/src/common/guards/jwt-auth.guard.spec.ts) (5 tests).
  - Authored [`apps/api/src/common/guards/roles.guard.spec.ts`](../../apps/api/src/common/guards/roles.guard.spec.ts) (4 tests).
  - Authored [`apps/api/src/modules/organizations/services/invitations.service.spec.ts`](../../apps/api/src/modules/organizations/services/invitations.service.spec.ts) (5 tests).
  - Added concurrency test to [`apps/api/src/modules/organizations/services/members.service.spec.ts`](../../apps/api/src/modules/organizations/services/members.service.spec.ts) (2 new tests).
  - **Result:** Automated test suite expanded from **34 to 50 passing unit tests**.
- **Code Change Necessary:** **Yes (Implemented).**

---

### Item 8: Documentation Discrepancy Correction

- **Audit Finding:**
  - In the previous Milestone 3 turn summary, Section 1 stated: *"Auth service and controller (22 tests)"*.
  - However, the verification table listed:
    - `auth.service.spec.ts`: 15 tests
    - `auth.controller.spec.ts`: 4 tests
    - Subtotal for auth: $15 + 4 = 19$ tests.
  - The number **22** was the subtotal of the first three test suites executed in turn (`3 health + 15 auth.service + 4 auth.controller = 22`).
- **Severity:** **Low (Documentation Defect).**
- **Correction:** Factual correction acknowledged. The authoritative test breakdown across all 9 suites is documented below.

---

## Authoritative Test Suite Breakdown (50 Passing Tests)

| Test Suite | File Path | Test Type | Tests | Status |
| :--- | :--- | :--- | :--- | :--- |
| **System Health** | [`health.controller.spec.ts`](../../apps/api/src/modules/health/health.controller.spec.ts) | Unit | 3 | **PASSED** |
| **Authentication Service** | [`auth.service.spec.ts`](../../apps/api/src/modules/auth/services/auth.service.spec.ts) | Unit | 15 | **PASSED** |
| **Authentication Controller** | [`auth.controller.spec.ts`](../../apps/api/src/modules/auth/auth.controller.spec.ts) | Unit | 4 | **PASSED** |
| **JWT Session Guard** | [`jwt-auth.guard.spec.ts`](../../apps/api/src/common/guards/jwt-auth.guard.spec.ts) | Unit (Security) | 5 | **PASSED** |
| **Multi-Tenant Isolation Guard** | [`tenant.guard.spec.ts`](../../apps/api/src/common/guards/tenant.guard.spec.ts) | Unit (Security) | 4 | **PASSED** |
| **RBAC Roles Guard** | [`roles.guard.spec.ts`](../../apps/api/src/common/guards/roles.guard.spec.ts) | Unit (Security) | 4 | **PASSED** |
| **Organizations Service** | [`organizations.service.spec.ts`](../../apps/api/src/modules/organizations/services/organizations.service.spec.ts) | Unit | 2 | **PASSED** |
| **Members & Sole Owner** | [`members.service.spec.ts`](../../apps/api/src/modules/organizations/services/members.service.spec.ts) | Unit (Concurrency) | 8 | **PASSED** |
| **Invitations Service** | [`invitations.service.spec.ts`](../../apps/api/src/modules/organizations/services/invitations.service.spec.ts) | Unit (Concurrency) | 5 | **PASSED** |
| **Total** | **9 Test Suites** | **Unit** | **50 Tests** | **ALL PASSED** |

