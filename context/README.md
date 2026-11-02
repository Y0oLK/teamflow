# TeamFlow — Project Context & Reference Materials

> **Shared Conversation URL:** [ChatGPT Conversation: Career Roadmap Projects Skills](https://chatgpt.com/share/6ae7af5b-303c-83ea-943c-501ba294be27)  
> **Highlighted Message ID:** `5e22e6ac-a09f-43fa-b6be-59aef32f0b26` (Starting point of the complete Client Specification)  
> **Client / Product Owner:** ChatGPT Persona acting as demanding SaaS client & mentor  
> **Developer:** Hamza Jemli (Full-Stack Software Engineer)  
> **Operating Instructions:** [`AGENTS.md`](../AGENTS.md)

---

## Overview

This folder contains the complete, unclipped reference documentation extracted from the shared ChatGPT consultation that established the **TeamFlow** SaaS project.

The materials define the project scope, technical stack, architecture requirements, functional modules, testing and documentation rules, and the overall engineering roadmap.

---

## Documents in this Folder

### 1. [`01-teamflow-client-project-brief.md`](./01-teamflow-client-project-brief.md)
The **complete official client project specification** (Version 1.0) starting directly from the highlighted message in the share link. It contains:

- **Section 1: Product Vision** — Objectives, SaaS model, target personas (SMBs, remote teams, agencies).
- **Section 2: Scope & User Roles** — Multi-tenant organization isolation rules and role matrix (Platform Admin, Org Owner, Org Admin, Project Manager, Member, Guest).
- **Section 3: Functional Requirements (Modules A–L)**:
  - *Module A:* Authentication & Account Management (Sessions/JWT, secure cookies, reset flow).
  - *Module B:* Organization & Multi-tenancy (Workspaces, invites, tenant isolation).
  - *Module C:* Project Management (Lifecycle, project members, privacy).
  - *Module D:* Task Management (Priorities, statuses, assignments, due dates, subtasks).
  - *Module E:* Kanban Board (Drag-and-drop, real-time column state, optimistic updates).
  - *Module F:* Comments & Collaboration (Mentions, threaded discussions).
  - *Module G:* Notifications (In-app notification center, read/unread states).
  - *Module H:* Dashboard & Analytics (Project velocity, task distribution, KPI cards).
  - *Module I:* Search & Filtering (Full-text query, multi-attribute filters).
  - *Module J:* Activity Logs & Audit Trail (Tenant-scoped immutable audit logging).
  - *Module K:* File & Attachment Management (Upload validation, storage abstraction).
  - *Module L:* Organization Settings (Branding, member management, danger zone).
- **Section 4: UI & Application Pages** — Page hierarchy, modern Linear/Trello-inspired design rules, responsive desktop-first layout.
- **Section 5: Technical Specifications**:
  - *Tech Stack:* Next.js (TypeScript) + NestJS (TypeScript) + PostgreSQL + Prisma + Redis + Socket.IO + Docker Compose.
  - *Architecture:* Modular monolith backend with clean boundaries (Controllers -> Services -> Repositories/Prisma).
  - *Database:* Schema entities, relational integrity, foreign keys, cascading rules, tenant-scoping.
- **Section 6: API Specifications** — RESTful standards, OpenAPI/Swagger documentation, class-validator DTOs.
- **Section 7: Non-Functional Requirements** — Multi-tenant data leakage prevention, rate limiting, indexing, sub-200ms target response times.
- **Section 8: Real-Time Architecture** — Socket.IO rooms, authentication handshake, event schemas, Redis pub/sub adapter.
- **Section 9: Testing & QA** — Unit tests (Jest), Integration tests, E2E tests (Playwright).
- **Section 10: Docker & Deployment** — Multi-stage Dockerfiles, Docker Compose environment, reverse proxy (Nginx), GitHub Actions CI/CD.
- **Section 11: Engineering Learning Documentation** — Mandatory educational documentation structure (`docs/00` to `docs/09`) with Mermaid diagrams and deep explanations.
- **Section 12: AI Agent Instructions** — Rules governing the AI assistant (synchronized with [`AGENTS.md`](../AGENTS.md)).
- **Section 13: Project Milestones & Definition of Done** — Acceptance criteria for client sign-off.
- **Section 14: Final Delivery Package** — Verification checklist across App, Engineering, DevOps, Docs, and Portfolio.
- **Section 15: Out of Scope for v1** — Guardrails against scope creep (Billing, Native Mobile, AI assistants deferred to later versions).
- **Section 16: Developer's First Assignment** — Creation of the Software Requirements Specification (SRS) under `docs/00-project-overview/` before any application code is written.

---

### 2. [`02-career-roadmap-and-strategy.md`](./02-career-roadmap-and-strategy.md)
The strategic background discussion preceding the project brief:
- **Developer Career Goals** — Hamza's dual-track objectives: landing a strong software engineering job while building production apps.
- **2026 Developer Landscape** — In-demand skills: TypeScript, NestJS, Next.js, PostgreSQL optimization, Docker, real-time architectures, testing, and AI-assisted engineering workflows.
- **Why TeamFlow was Chosen** — Analysis comparing trivial tutorial projects versus full-featured multi-tenant SaaS products that convince hiring managers.
- **6-Month Learning Roadmap** — Step-by-step milestones, interview preparation, system design focus, and portfolio presentation.

---

## Next Steps

As established in Section 16 of the Client Specification and [`AGENTS.md`](../AGENTS.md):
- **Immediate Next Task:** Prepare the professional Software Requirements Specification (SRS) in `docs/00-project-overview/`.
- **Constraint:** No application code is to be written until the requirements and design are reviewed and agreed upon.

