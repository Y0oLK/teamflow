# TeamFlow — User Journeys & System Workflows

**Document Version:** 1.2.0 (Architecturally Audited & Client-Approved)  
**Specification Standard:** Aligned with IEEE 830 / ISO/IEC/IEEE 29148  
**Audit Report:** [`requirements-review-report.md`](./requirements-review-report.md)  
**Traceability Matrix:** [`traceability-matrix.md`](./traceability-matrix.md)

This document models the critical user journeys, state transitions, string-based Kanban ordering interactions, and real-time event flows across the **TeamFlow** platform.

---

## 1. Journey 1: Registration, Verification & Organization Onboarding

### User Story
> As a new user, I want to create an account, verify my email address, and establish a new company workspace so that my team can immediately begin collaborating.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Front as Next.js Frontend
    participant API as NestJS Auth Controller
    participant AuthSvc as Auth Service
    participant DB as PostgreSQL
    participant Mail as Mail Service (Dev/SMTP)

    User->>Front: Fill Registration Form (Name, Email, Password)
    Front->>API: POST /api/v1/auth/register
    API->>AuthSvc: register(dto)
    AuthSvc->>AuthSvc: Validate password complexity & Hash with Argon2id ($m=65536, t=3, p=4$)
    AuthSvc->>DB: Check email uniqueness & Insert User (isEmailVerified=false)
    AuthSvc->>AuthSvc: Generate cryptographically secure Verification Token (24h TTL)
    AuthSvc->>DB: Store Verification Token
    AuthSvc->>Mail: Queue Verification Email
    AuthSvc-->>API: Return Registration Success DTO
    API-->>Front: 201 Created (Prompt: Check your email)

    Note over User,Mail: User receives email & clicks verification link

    User->>Front: Open /verify-email?token=xyz
    Front->>API: POST /api/v1/auth/verify-email { token: "xyz" }
    API->>AuthSvc: verifyEmail(token)
    AuthSvc->>DB: Find token, verify not expired & not used
    AuthSvc->>DB: UPDATE User SET isEmailVerified = true
    AuthSvc->>DB: DELETE / Invalidate Verification Token
    AuthSvc-->>API: Email verified successfully
    API-->>Front: 200 OK -> Redirect to /onboarding

    Note over User,Front: Workspace Creation (First Organization)

    User->>Front: Enter Organization Name ("Acme Corp")
    Front->>API: POST /api/v1/organizations { name: "Acme Corp" }
    API->>DB: BEGIN Transaction
    API->>DB: INSERT Organization (name, slug)
    API->>DB: INSERT Membership (userId, orgId, role="ORG_OWNER")
    API->>DB: INSERT ActivityLog (actorId, action="ORGANIZATION_CREATED")
    API->>DB: COMMIT Transaction
    API-->>Front: 201 Created (Sets active org cookie & path context)
    Front-->>User: Redirect to /app/orgs/acme-corp/dashboard
```

---

## 2. Journey 2: Member Invitation & Workspace Joining

### User Story
> As an Organization Owner or Admin, I want to invite an employee to my workspace via email with a designated role, and have the system safely enroll them once accepted.

### 2.1 Reconciled Invitation State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Org Admin invites email with target Role
    PENDING --> ACCEPTED: Invitee clicks link & accepts (email matches account)
    PENDING --> DECLINED: Invitee clicks decline button
    PENDING --> EXPIRED: 7 days elapse without response
    PENDING --> REVOKED: Org Admin actively cancels invitation
    ACCEPTED --> [*]
    DECLINED --> [*]
    EXPIRED --> [*]
    REVOKED --> [*]
```

### 2.2 Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Org Admin
    actor Invitee as Invitee User
    participant Front as Next.js UI
    participant API as NestJS Gateway / API
    participant DB as PostgreSQL
    participant Mail as Mail Service

    Admin->>Front: Invite "dev@acme.com" as "ORG_MEMBER"
    Front->>API: POST /api/v1/organizations/:id/invitations
    API->>API: Validate Admin has ORG_OWNER or ORG_ADMIN role (Layer 3 Check)
    API->>DB: INSERT Invitation (email, role, token, expiresAt=now()+7d, status=PENDING)
    API->>Mail: Send Invitation Email with accept/decline links
    API-->>Front: 201 Created (Invitation pending)

    Note over Invitee,Mail: Invitee receives email with link

    alt Invitee Declines
        Invitee->>Front: Click "Decline" (/invitations/decline?token=abc)
        Front->>API: POST /api/v1/organizations/invitations/decline { token }
        API->>DB: UPDATE Invitation SET status = 'DECLINED' where status = 'PENDING'
        API-->>Front: 200 OK (Invitation declined)
    else Invitee Accepts
        Invitee->>Front: Open /invitations/accept?token=abc
        Front->>API: POST /api/v1/organizations/invitations/accept { token }
        API->>DB: Find Invitation by token where status=PENDING and expiresAt > now()
        alt Invitee Email does not match Auth Account
            API-->>Front: 403 Forbidden (Invite belongs to different email address)
        else Email matches
            API->>DB: BEGIN Transaction
            API->>DB: INSERT Membership (userId, orgId, role=invitation.role)
            API->>DB: UPDATE Invitation SET status = 'ACCEPTED'
            API->>DB: INSERT ActivityLog (actorId, action='MEMBER_JOINED')
            API->>DB: COMMIT Transaction
            API-->>Front: 200 OK (Membership confirmed)
            Front-->>Invitee: Redirect to Organization Dashboard
        end
    end
```

---

## 3. Journey 3: Project Creation & Member Scoping (Decision Q2: Private by Default)

### User Story
> As an Organization Member (or Admin), I want to create a new project and automatically be assigned as its Project Manager, then assign a specific subset of organization members so that sensitive client work remains strictly private.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Org Member / Admin
    actor Member as Assigned Colleague (David)
    actor Guest as Client Collaborator (Elena)
    participant Front as Next.js UI
    participant API as NestJS Projects Controller
    participant Guard as TenantGuard & ProjectGuard
    participant DB as PostgreSQL
    participant RT as Realtime Gateway

    Creator->>Front: Submit Create Project ("Mobile App v2", dates, description)
    Front->>API: POST /api/v1/organizations/:orgId/projects
    API->>Guard: Verify Creator is active ORG_OWNER, ORG_ADMIN, or ORG_MEMBER (Layer 2 & 3)
    Guard-->>API: Authorized
    API->>DB: BEGIN Transaction
    API->>DB: INSERT Project (orgId, title, status='PLANNING', isPrivate=true)
    API->>DB: INSERT ProjectMember (projectId, userId=Creator.id, role='PROJECT_MANAGER')
    API->>DB: INSERT ActivityLog (actorId=Creator.id, action='PROJECT_CREATED')
    API->>DB: COMMIT Transaction
    API-->>Front: 201 Created (Creator is now Project Manager of Mobile App v2)

    Note over Creator,Front: Assigning Internal Team Member (CONTRIBUTOR)

    Creator->>Front: Add Member (select "David", role="CONTRIBUTOR")
    Front->>API: POST /api/v1/projects/:projectId/members { userId: "david_id", role: "CONTRIBUTOR" }
    API->>Guard: Verify Creator is PROJECT_MANAGER of this Project (Layer 4 Check)
    API->>DB: Verify David is active member of parent Organization (Layer 2 Check)
    API->>DB: INSERT ProjectMember (projectId, userId=David.id, role='CONTRIBUTOR')
    API->>DB: INSERT Notification (recipient=David, type='PROJECT_ASSIGNED')
    API->>RT: Emit to David's personal room ("notification.created")
    API-->>Front: 200 OK (David added to project)

    Note over Creator,Front: Assigning External Client (Decision Q5: VIEWER)

    Creator->>Front: Add Guest (select "Elena", role="VIEWER")
    Front->>API: POST /api/v1/projects/:projectId/members { userId: "elena_id", role: "VIEWER" }
    API->>DB: INSERT ProjectMember (projectId, userId=Elena.id, role='VIEWER')
    API-->>Front: 200 OK (Elena added as read-only viewer with commenting rights)
```

---

## 4. Journey 4: Task Lifecycle & Kanban Board Workflow (Decision Q3: String Fractional Indexing)

### User Story
> As an engineer, I want to drag my task across columns on the Kanban board with instant visual feedback, having status changes persisted atomically with string-based ordering keys and synced live to teammates.

### 4.1 Task Status State Machine with Dynamic Blocker Modeling

```mermaid
stateDiagram-v2
    [*] --> BACKLOG: Created in product backlog
    [*] --> TODO: Created directly in sprint
    BACKLOG --> TODO: Sprint planning triage
    TODO --> IN_PROGRESS: Developer begins work
    IN_PROGRESS --> IN_REVIEW: Pull Request opened
    IN_REVIEW --> IN_PROGRESS: Changes requested / review feedback
    IN_REVIEW --> DONE: Code merged & verified
    TODO --> CANCELLED: Feature deprecated
    BACKLOG --> CANCELLED: Feature deprecated
    DONE --> [*]
    CANCELLED --> [*]

    note right of IN_PROGRESS
      Dynamic Blocker Attribute:
      isBlocked = true
      when unresolved TaskDependency exists.
      Task remains in current column
      displaying visual "Blocked" badge.
    end note
```

### 4.2 Optimistic Drag-and-Drop Sequence with String Fractional Indexing & Optimistic Concurrency

```mermaid
sequenceDiagram
    autonumber
    actor DevA as Developer A
    actor DevB as Developer B
    participant UI_A as Dev A Browser (Kanban)
    participant API as NestJS Tasks Controller
    participant DB as PostgreSQL
    participant Redis as Redis Pub/Sub
    participant Gateway as Socket.IO Gateway
    participant UI_B as Dev B Browser (Kanban)

    Note over DevA,UI_A: Dev A drags Task #104 (version: 3) from TODO to IN_PROGRESS between "a1" and "a2"
    UI_A->>UI_A: Optimistic UI Update: Render card in target slot immediately
    UI_A->>API: PATCH /api/v1/tasks/104/status { newStatus: "IN_PROGRESS", prevKey: "a1", nextKey: "a2", version: 3 }
    
    API->>API: Layer 2 & 4 Auth: Verify Dev A has CONTRIBUTOR or PM role in Project
    API->>API: Generate string intermediate key between "a1" and "a2" -> "a1V"
    
    API->>DB: BEGIN Transaction
    API->>DB: UPDATE Task SET status = 'IN_PROGRESS', orderKey = 'a1V', version = 4 WHERE id = 104 AND version = 3
    alt Version mismatch (Task was modified concurrently by another user)
        API->>DB: ROLLBACK Transaction
        API-->>UI_A: 409 Conflict { errorCode: "CONCURRENT_MODIFICATION" }
        UI_A->>UI_A: Revert card to original column and position; toast "Task was updated by another user"
    else Version matches
        API->>DB: INSERT TaskStatusHistory (taskId=104, old='TODO', new='IN_PROGRESS', actor=DevA)
        API->>DB: INSERT ActivityLog (actorId=DevA, action='TASK_STATUS_CHANGED')
        API->>DB: COMMIT Transaction (Phase 1 Complete)

        Note over API,Redis: Phase 2: Post-Commit Best-Effort Broadcast
        API->>Redis: Publish ("project:10": "task.status_changed", { taskId: 104, newStatus: "IN_PROGRESS", orderKey: "a1V", version: 4 })
        API-->>UI_A: 200 OK { success: true, updatedTask }

        Note over Redis,UI_B: Phase 3: Client Event Delivery
        Redis->>Gateway: Relay published event
        Gateway->>UI_B: WebSocket emit("task.status_changed", payload)
        UI_B->>UI_B: Animate Task #104 moving to "IN_PROGRESS" slot "a1V" without refresh
    end
```

---

## 5. Journey 5: Real-Time Collaboration & Guest Interactions (Decision Q5)

### User Story
> As a project participant (or guest client), I want to comment on a task, mention colleagues, and receive real-time notifications, while project managers retain comment moderation authority.

```mermaid
sequenceDiagram
    autonumber
    actor Elena as Elena (Guest / Client Viewer)
    actor PM as Alex (Project Manager)
    participant Front_E as Elena Browser
    participant API as NestJS Comments Controller
    participant DB as PostgreSQL
    participant EventBus as NestJS EventEmitter2
    participant Gateway as Realtime WebSocket Gateway
    participant Front_A as Alex Browser

    Elena->>Front_E: Post comment: "Looks great, but can we change the logo color? @alex"
    Front_E->>API: POST /api/v1/tasks/104/comments { content: "Looks great..." }
    
    API->>API: Layer 4 Check: Elena is VIEWER of Project -> Commenting permitted (Decision Q5)
    API->>API: Sanitize markdown HTML with DOMPurify
    API->>API: Parse mentions: found ["@alex"]
    
    API->>DB: BEGIN Transaction
    API->>DB: INSERT Comment (taskId=104, authorId=Elena.id, content)
    API->>DB: INSERT Notification (recipient=Alex.id, actor=Elena.id, type='MENTION')
    API->>DB: COMMIT Transaction
    
    API->>EventBus: emit("comment.created", payload)
    API-->>Front_E: 201 Created (Elena can edit/delete her own comment)

    EventBus->>Gateway: handleCommentCreated(payload)
    Gateway->>Front_A: WebSocket emit("comment.created") & emit("notification.created")
    Front_A-->>PM: Display toast: "Elena mentioned you in Task #104"

    Note over PM,Front_A: Moderation Capability (Decision Q5)
    PM->>Front_A: PM decides to delete inappropriate comment
    Front_A->>API: DELETE /api/v1/comments/:id
    API->>API: Layer 4 Check: Alex is PROJECT_MANAGER -> Moderation deletion permitted
    API->>DB: UPDATE Comment SET deletedAt = NOW()
    API-->>Front_A: 200 OK (Comment deleted by PM)
```
