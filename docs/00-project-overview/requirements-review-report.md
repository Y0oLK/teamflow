# TeamFlow — Requirements Review & Final Verification Report

**Audit Date:** November 2, 2026  
**Document Version:** 1.2.1 (Final Verification & Sign-Off Baseline)  
**Lead Architect & Reviewer:** Hamza Jemli  
**Governing Documents:** [`AGENTS.md`](../../AGENTS.md), [`context/01-teamflow-client-project-brief.md`](../../context/01-teamflow-client-project-brief.md), [`docs/00-project-overview/requirements.md`](./requirements.md)  
**Traceability Matrix:** [`traceability-matrix.md`](./traceability-matrix.md)

---

## 1. Executive Summary

This report documents the final focused verification pass conducted on the TeamFlow v1.2.0 requirements specification.

All six foundational architecture decisions (**Q1–Q6**) remain approved and unaltered. In this verification pass, **five technical focus areas (1–5)** were hardened and finalized:
1. **Kanban Concurrency & Ordering:** Fully defined duplicate-key handling, deterministic tie-breaking (`ORDER BY orderKey ASC, id ASC`), optimistic locking with integer `version` conditional updates, and exclusive row-level locking on the target status column during atomic rebalancing.
2. **Real-Time Event Reliability:** Documented the MVP's best-effort delivery model (PostgreSQL authoritative commit $\rightarrow$ post-commit Redis publish). Formulated the client-side crash recovery protocol (window focus sync, 60s background heartbeat sync, and reconnect delta queries) with an explicit future Outbox upgrade path for v1.2.
3. **File Upload Memory Safety:** Specified `multer.diskStorage()` with temporary disk spooling (capping file sizes at 10MB) to eliminate Node.js heap exhaustion (OOM), in-flight binary magic-byte inspection, guaranteed temp file unlinking, and 15-minute presigned download URL security behavior.
4. **Audit Log Retention & Privacy (GDPR/CCPA):** Replaced assumptions of indefinite retention with a compliant **365-day (1-year) retention policy**. Defined strict sensitive data prohibitions (passwords, tokens, payment data) and user pseudonymization (`"Former Member"`) upon account deletion.
5. **Release Timeline:** Explicitly categorized Gantt chart durations as **provisional engineering estimates** rather than contractual commitments.

---

## 2. Verification of the 5 Focus Items

### Item 1: Kanban Concurrency, Duplicate Keys & Rebalancing
- **Simultaneous Moves into the Same Gap:** If User A and User B concurrently drop two different cards between `"a1"` and `"a2"`, both cards may receive the intermediate key `"a1V"`.
- **Deterministic Tie-Breaking:** Queries and frontend sorting strictly enforce:
  $$\text{ORDER BY orderKey ASC, id ASC}$$
  Because `id` is an immutable UUIDv4, the relative position of the cards is 100% deterministic across all clients without visual jumping.
- **Moving the Same Card (Optimistic Concurrency):** Conditional update:
  $$\text{UPDATE tasks SET status=:s, orderKey=:k, version=version+1 WHERE id=:id AND version=:expectedVersion}$$
  If modified concurrently, 0 rows update $\rightarrow$ rollback $\rightarrow$ HTTP 409 Conflict $\rightarrow$ client reverts card and alerts user.
- **Atomic Rebalancing & Protected Records:** When an `orderKey` exceeds 64 characters, an atomic transaction acquires an exclusive row-level lock on **all active tasks in that project's status column**:
  $$\text{SELECT id FROM tasks WHERE projectId=:pId AND status=:status AND deletedAt IS NULL ORDER BY orderKey, id FOR UPDATE}$$
  Cards are re-spaced by discrete uniform keys (`"a0"`, `"a1"`...). Concurrent moves into that column wait until the transaction commits, preventing deadlocks or corrupted ordering.

### Item 2: Real-Time Event Reliability & Post-Commit Crash Recovery
- **Single Source of Truth:** PostgreSQL is the sole authoritative state. Redis Pub/Sub is an ephemeral transport layer.
- **Server Crash Scenario:** If the server crashes *after* PostgreSQL commits at $T_1$ but *before* publishing to Redis, the event is not broadcast over WebSockets.
- **Client Recovery Protocol:** Clients automatically recover authoritative state without requiring manual full page reloads:
  1. *Window Focus Sync:* When a user focuses the browser tab (`document.visibilityState === 'visible'`), the frontend queries `GET /api/v1/projects/:id/board?since=<lastSyncTimestamp>`.
  2. *Periodic Heartbeat Sync:* Active board clients execute a lightweight delta check every 60 seconds.
  3. *Reconnect Sync:* Socket.IO client auto-reconnection immediately triggers the board reconciliation query.
- **Outbox Upgrade Path:** For release v1.2, introducing the Transactional Outbox Pattern will record events in PostgreSQL within the business transaction, guaranteeing at-least-once publication even across server crashes.

### Item 3: File Upload Memory Safety & Presigned URL Security
- **Memory Safety via Disk Spooling:** `multer.memoryStorage()` is rejected because concurrent 10MB uploads risk Node.js heap exhaustion (OOM). TeamFlow utilizes `multer.diskStorage()` spooling to a temporary spool directory (`/tmp/teamflow-uploads/`). Node.js heap memory usage remains $< 64\text{ KB}$ per upload.
- **In-Flight Validation & Cleanup:** The server inspects the first 512 bytes via `file-type`. If valid, it streams from disk to S3/MinIO via `fs.createReadStream()`. The temporary disk file is unconditionally deleted in a `finally` block. Max 3 concurrent uploads per user.
- **Presigned Download URL Security:**
  - Presigned URLs expire strictly after **15 minutes (900 seconds)** (`X-Amz-Expires=900`). Requests after 900s are rejected by S3 with 403 Forbidden.
  - Issued only after verifying Layer 2 (Tenant) and Layer 4 (Project) access.
  - Response headers enforce `Content-Disposition: attachment; filename="sanitized.ext"` (preventing inline execution of malicious files) and `Cache-Control: private, no-store, max-age=0`.

### Item 4: Audit Log Retention, Hygiene & Privacy (GDPR/CCPA)
- **Retention Policy:** Retained for **365 calendar days (1 year)** standard compliance retention (replacing unsupported "permanent" retention claims). Older records are archived or pruned via a dedicated audit worker.
- **Strict Sensitive Data Prohibition:** The following must **NEVER** be recorded in audit logs or metadata:
  - Passwords or password hashes.
  - Authentication tokens, session cookies, password reset tokens.
  - Credit card, banking, or billing credentials.
  - Task description bodies, comment text, or personal file contents (only entity metadata like title/filename is logged).
- **Account Deletion & Right to Erasure:** When a user account is deleted:
  - The `User` record is anonymized or soft-deleted.
  - In `ActivityLog`, `actorId` is preserved or set to a system pseudonym (`metadata.actorName = "Former Member"`), and personal identifiers (`email`, `fullName`, `ipAddress`) are scrubbed. The operational audit trail remains immutable and verifiable without retaining PII.

### Item 5: Release Timeline Categorization
All timeline durations and Gantt charts across the SRS and roadmap are explicitly marked as **provisional engineering estimates** for architectural planning, rather than fixed delivery commitments.

---

## 3. Approved Architecture Decisions Log (Q1–Q6)

| Decision | Approved Architecture Contract | Status |
|---|---|:---:|
| **Q1: Workspace Routing** | **Path-based workspace routing** (`/app/orgs/:slug/...` or `/app/...` with active org context). Backend independently validates membership on every request; client-supplied IDs are never trusted as proof of access. | **APPROVED** |
| **Q2: Project Visibility** | **Private by default.** Only explicitly assigned `ProjectMember`s can view or access project resources. `ORG_OWNER` and `ORG_ADMIN` retain administrative override access. | **APPROVED** |
| **Q3: Kanban Ordering** | **String-based fractional indexing** (base-62 keys). Optimistic concurrency via integer `version` field. Deterministic tie-breaking via `ORDER BY orderKey ASC, id ASC`. Exclusive row-locking during atomic column rebalance. | **APPROVED** |
| **Q4: Subtask Hierarchy** | **Single-level checklist items** (`Subtask` entity). No recursive nesting. Kept strictly distinct from inter-task `TaskDependency` graphs. | **APPROVED** |
| **Q5: Guest Permissions** | **Read-only on assigned tasks with commenting rights.** Cannot create/edit tasks, change statuses, or manage members. Guests can edit/delete their own comments; Project Managers can moderate/delete guest comments. | **APPROVED** |
| **Q6: Notification Retention** | **90-day retention** for both read and unread notifications via daily cron. Audit logs (`ActivityLog`) are governed by a separate, privacy-compliant **365-day retention policy** with user pseudonymization. | **APPROVED** |

---

## 4. Traceability Matrix Verification Confirmation

The Requirements Traceability Matrix ([`traceability-matrix.md`](./traceability-matrix.md)) has been verified and strictly distinguishes between designed criteria and actual test execution:
- **Criterion Status:** `Defined` (100% of FRs and NFRs have complete Given-When-Then criteria).
- **Scenario Status:** `Designed` (Concrete test fixtures, endpoints, and assertions are designed).
- **Implementation Status:** `Planned (Not Implemented)` (Source code does not yet exist; accurately marked).
- **Execution Status:** `Pending (Not Executed)` (No tests have been executed; accurately marked).

---

## 5. Unresolved Technical Questions (For Milestone 2 Database Architecture)

All product requirements and business decisions are 100% resolved. The following low-level database tuning questions are logged for **Milestone 2 (Database Architecture)**:
1. **Prisma Connection Pooling vs. PgBouncer:** Verifying connection pool behavior with transactional queries in Docker environment.
2. **PostgreSQL Full-Text Search Tuning:** Designing `tsvector` column and GIN indexes for English language stemming across tasks and projects.
3. **Mail Transport Adapter:** Developing the abstract `MailService` interface to support local SMTP spooling in development and Amazon SES / Resend in production.

---

## 6. Final Requirements Sign-Off Checklist

- [x] All 6 Approved Architecture Decisions (Q1–Q6) formally codified.
- [x] Kanban string fractional indexing, duplicate keys, tie-breaking, and row-level locking rebalancing specified.
- [x] Optimistic concurrency control specified with integer `version` conditional updates.
- [x] Real-time post-commit event delivery and client crash recovery protocol defined.
- [x] File upload memory safety specified via disk spooling, magic bytes check, and 15-minute presigned download URLs.
- [x] Audit log retention updated to 365 days with sensitive data exclusion and GDPR pseudonymization.
- [x] Traceability matrix explicitly distinguishes planned tests from implemented/executed tests.
- [x] Release timeline marked as provisional engineering estimates.
- [x] MVP (v1.0) scope strictly isolated from subsequent releases.

---

## 7. Architectural Recommendation

> **FINAL VERDICT:** **The TeamFlow Requirements Specification (v1.2.1) has completed its final verification pass. It is COMPLETE, CONSISTENT, TRACEABLE, HARDENED, and FORMALLY READY for Milestone 2 (Database Architecture & Schema Design).**
