# TeamFlow — User Journeys & System Workflows

This document models the critical user journeys, state transitions, and real-time interaction flows across the **TeamFlow** platform using formal software engineering sequence diagrams and state machines.

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
    AuthSvc->>AuthSvc: Validate password complexity & Hash with Argon2id
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
    API->>DB: INSERT Membership (userId, orgId, role="OWNER")
    API->>DB: INSERT ActivityLog (actorId, action="ORGANIZATION_CREATED")
    API->>DB: COMMIT Transaction
    API-->>Front: 201 Created (Sets active org cookie)
    Front-->>User: Redirect to /dashboard
```

---

## 2. Journey 2: Member Invitation & Workspace Joining

### User Story
> As an Organization Owner or Admin, I want to invite an employee to my workspace via email with a designated role, and have the system safely enroll them once accepted.

### 2.1 Invitation State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Org Admin invites email with Role
    PENDING --> ACCEPTED: Invitee clicks link & accepts (email matches)
    PENDING --> EXPIRED: 7 days elapse without acceptance
    PENDING --> REVOKED: Org Admin cancels invitation
    ACCEPTED --> [*]
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

    Admin->>Front: Invite "dev@acme.com" as "MEMBER"
    Front->>API: POST /api/v1/organizations/:id/invitations
    API->>API: Validate Admin has OWNER/ADMIN role in Org
    API->>DB: INSERT Invitation (email, role, token, expiresAt=now()+7d, status=PENDING)
    API->>Mail: Send Invitation Email with accept link
    API-->>Front: 201 Created (Invitation pending)

    Note over Invitee,Mail: Invitee receives email with link

    Invitee->>Front: Open /invitations/accept?token=abc
    Front->>API: POST /api/v1/organizations/invitations/accept { token }
    API->>DB: Find Invitation by token where status=PENDING and expiresAt > now()
    alt Invitee Email does not match Auth Account
        API-->>Front: 403 Forbidden (Invite belongs to different email)
    else Email matches
        API->>DB: BEGIN Transaction
        API->>DB: INSERT Membership (userId, orgId, role=invitation.role)
        API->>DB: UPDATE Invitation SET status = 'ACCEPTED'
        API->>DB: INSERT ActivityLog (actorId, action='MEMBER_JOINED')
        API->>DB: COMMIT Transaction
        API-->>Front: 200 OK (Membership confirmed)
        Front-->>Invitee: Redirect to Organization Dashboard
    end
```

---

## 3. Journey 3: Project Creation & Member Scoping

### User Story
> As a Project Manager, I want to create a new project and assign a specific subset of organization members so that sensitive projects remain strictly isolated from uninvolved staff.

```mermaid
sequenceDiagram
    autonumber
    actor PM as Project Manager
    participant Front as Next.js UI
    participant API as NestJS Projects Controller
    participant Guard as Tenant & Role Guards
    participant DB as PostgreSQL
    participant RT as Realtime Gateway

    PM->>Front: Submit Create Project ("Mobile App v2", dates, description)
    Front->>API: POST /api/v1/organizations/:orgId/projects
    API->>Guard: Verify PM is active member of org with CREATE_PROJECT permission
    Guard-->>API: Authorized
    API->>DB: BEGIN Transaction
    API->>DB: INSERT Project (orgId, title, status='PLANNING')
    API->>DB: INSERT ProjectMember (projectId, userId=PM.id, role='PROJECT_MANAGER')
    API->>DB: COMMIT Transaction
    API-->>Front: 201 Created (Project created)

    Note over PM,Front: Assigning Project Members

    PM->>Front: Add Member (select "David", role="CONTRIBUTOR")
    Front->>API: POST /api/v1/projects/:projectId/members { userId: "david_id" }
    API->>Guard: Verify PM is assigned Manager of Project
    API->>DB: Verify David is an active member of parent Organization
    API->>DB: INSERT ProjectMember (projectId, userId, role)
    API->>DB: INSERT Notification (recipient=David, type='PROJECT_ASSIGNED')
    API->>RT: Emit to David's personal room ("notification.created")
    API-->>Front: 200 OK (Member added to project)
```

---

## 4. Journey 4: Task Lifecycle & Kanban Board Workflow

### User Story
> As an engineer, I want to drag my task across columns on the Kanban board with instant visual feedback, having status changes persisted atomically and synced live to teammates.

### 4.1 Task Status State Machine

```mermaid
stateDiagram-v2
    [*] --> BACKLOG: Created in backlog
    [*] --> TODO: Created directly in sprint
    BACKLOG --> TODO: Sprint planning
    TODO --> IN_PROGRESS: Developer starts work
    IN_PROGRESS --> IN_REVIEW: Pull Request opened
    IN_REVIEW --> IN_PROGRESS: Changes requested
    IN_REVIEW --> DONE: Approved & merged
    IN_PROGRESS --> BLOCKED: Dependency impediment
    BLOCKED --> IN_PROGRESS: Blocker resolved
    TODO --> CANCELLED: Deprecated
    BACKLOG --> CANCELLED: Deprecated
    DONE --> [*]
    CANCELLED --> [*]
```

### 4.2 Optimistic Drag-and-Drop Sequence with Concurrency Protection

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

    Note over DevA,UI_A: Developer A drags Task #104 from "TODO" to "IN_PROGRESS"
    UI_A->>UI_A: Optimistic UI Update: Move card immediately in DOM
    UI_A->>API: PATCH /api/v1/tasks/104/status { newStatus: "IN_PROGRESS", prevTaskId: 102, nextTaskId: 105 }
    
    API->>API: Verify Dev A is assigned member of parent Project
    API->>API: Calculate new fractional orderIndex between Task 102 and Task 105
    
    API->>DB: BEGIN Transaction
    API->>DB: UPDATE Task SET status = 'IN_PROGRESS', orderIndex = 4.5, updatedAt = now()
    API->>DB: INSERT TaskStatusHistory (taskId=104, old='TODO', new='IN_PROGRESS', actor=DevA)
    API->>DB: INSERT ActivityLog (actorId=DevA, action='TASK_STATUS_CHANGED')
    API->>DB: COMMIT Transaction

    API->>Redis: Publish ("project:10": "task.status_changed", payload)
    API-->>UI_A: 200 OK { success: true, updatedTask }

    Redis->>Gateway: Receive published event
    Gateway->>UI_B: WebSocket emit("task.status_changed", payload)
    UI_B->>UI_B: Animate Task #104 moving to "IN_PROGRESS" column without page refresh
```

### 4.3 Error / Rejection Rollback Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant UI as Browser (Kanban)
    participant API as NestJS API

    Dev->>UI: Drag Task to "DONE"
    UI->>UI: Optimistically drop card into "DONE" column
    UI->>API: PATCH /api/v1/tasks/104/status { newStatus: "DONE" }
    API->>API: Evaluation: Task has unresolved blocking dependency (Task #101 is TODO)
    API-->>UI: 400 Bad Request { error: "TASK_HAS_UNRESOLVED_DEPENDENCY", message: "Task 101 must be completed first." }
    UI->>UI: ROLLBACK: Animate card back to original column ("TODO")
    UI->>Dev: Display error toast notification ("Cannot complete task: blocked by Task #101")
```

---

## 5. Journey 5: Real-Time Collaboration & Notification Broadcasting

### User Story
> As a team member, when someone comments on my assigned task or mentions me, I want to receive an immediate real-time in-app notification without refreshing the page.

```mermaid
sequenceDiagram
    autonumber
    actor Commenter as Alex (Project Manager)
    actor Assignee as David (Assigned Developer)
    participant Front_A as Alex Browser
    participant API as NestJS Comments Controller
    participant EventBus as NestJS EventEmitter2
    participant Gateway as Realtime WebSocket Gateway
    participant Front_D as David Browser

    Commenter->>Front_A: Type comment: "Great progress @david, please review the PR"
    Front_A->>API: POST /api/v1/tasks/104/comments { content: "Great progress @david..." }
    
    API->>API: Parse mentions: found ["@david"]
    API->>API: Verify David is member of Project
    
    API->>API: Save Comment & create Notification records in DB
    API->>EventBus: emit("comment.created", { comment, taskId, projectId, mentions })
    API-->>Front_A: 201 Created (Comment posted)

    EventBus->>Gateway: handleCommentCreatedEvent(payload)
    
    par Broadcast to Project Room
        Gateway->>Gateway: socket.to("project:10").emit("comment.created", comment)
        Gateway-->>Front_D: Append comment to open task modal in real time
    and Direct Notification to Mentioned User Room
        Gateway->>Gateway: socket.to("user:david_id").emit("notification.created", notification)
        Gateway-->>Front_D: Increment unread bell counter & display Toast: "Alex mentioned you in Task #104"
    end
```

