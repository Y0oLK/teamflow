# Career Roadmap & Portfolio Project Strategy

> Source: ChatGPT conversation with Hamza Jemli  
> URL: https://chatgpt.com/share/6ae7af5b-303c-83ea-943c-501ba294be27  
> Context: Preceding discussion leading to the selection and specification of TeamFlow.

---

## 👤 Hamza (Developer)

ive 2 things in life that i wanna do first working on the app that ive second my personal career and protfolio where i want to build diffrent projects and skills to add to my github
i wanna show that im a full stack developer but also i can handle the structre data base and system design and containers and docker and all of that stuff of devops and i want toshow that im confident working with ai tools and know the basics of the languages or frameworks im using and you know i want to make projects and learn skills that are required in the IT field in 2026 and build projects show this profffecy and also i want them to be projects that some of them are clients projects or project that i did myself 
find me the skills needed in 2026 suggest me projects to do and add to github do everything for me ...

---

## 🤖 Mentor / Advisor

Hamza, I think you should approach this as **building two careers simultaneously, but making them reinforce each other.**

You have two important objectives:

1. **Veemo:** Build your own startup, develop the product, understand the business, and eventually turn it into a real company.
2. **Your personal developer career:** Become a strong, employable full-stack developer who can build, architect, deploy, maintain, and scale software products.

And I want to make one important distinction: I don't think you should aim to become someone who knows 15 programming languages superficially.

I want you to build a portfolio that makes a technical recruiter or engineering manager think:

> This developer can take a product from an idea to production. He understands frontend, backend, databases, APIs, architecture, infrastructure, deployment, security, and AI-assisted development. He can work independently and make engineering decisions.

That's a much stronger professional identity than simply saying you're a full-stack developer.

Your portfolio should demonstrate five capabilities:

- **Software engineering:** Building maintainable frontend, backend, and mobile applications.
- **System design:** Designing databases, APIs, distributed systems, and scalable architectures.
- **DevOps and infrastructure:** Docker, CI/CD, Linux, cloud infrastructure, monitoring, and deployment.
- **AI-assisted engineering:** Using AI coding agents effectively while understanding, reviewing, testing, and securing their output.
- **Product development:** Taking real client requirements or your own ideas and delivering working products.

I would build your career around this identity:

  ### Full-Stack Software Engineer

  BACKEND · MOBILE · SYSTEM DESIGN · DEVOPS · AI ENGINEERING
  A developer capable of designing, building, deploying, and maintaining production-ready applications across the full software development lifecycle.

Let's turn that into an actual roadmap, not just a list of technologies to learn.

---

## 🤖 Mentor / Advisor

## 1. The skills you should develop in 2026

I researched the 2026 developer and technology trends, including Stack Overflow's 2026 Developer Survey, GitHub's latest Octoverse report, and the 2026 technology hiring survey.

There is a particularly important trend: employers increasingly need developers who can work with AI, but also understand what the AI produces.

For example:
- The 2026 Stack Overflow survey reports that 71.8% of respondents used an LLM, and coding assistants and agents have become a dominant AI use case. 
- GitHub reports that TypeScript and Python had the largest contributor increases among the top languages in its latest annual analysis. 
- The 2026 CoderPad hiring survey highlights debugging, system design, and AI/LLM application skills as important areas of development. 
- CI/CD, containers, infrastructure as code, and GitOps remain central DevOps practices. 

Based on these trends and your existing experience, this is the skill roadmap I'd recommend.

### A. Programming languages and software development

**[Highest priority]**

| Skill | What you should know |
|---|---|
| TypeScript | Advanced practical knowledge, types, generics, async programming |
| JavaScript | DOM, promises, event loop, browser fundamentals |
| Python | APIs, automation, scripting, background jobs |
| SQL | Joins, indexes, transactions, optimization, window functions |
| Dart | Flutter, asynchronous programming, state management |
| Bash | Linux automation, scripts, deployment |

**My recommendation:** Make TypeScript your primary language, Python your secondary language, and keep Dart for mobile development.

Don't start learning Go, Rust, Java, C#, and five other languages simultaneously. You can explore them later when a project or job requires them.

### B. Frontend and mobile development

**[Highest priority]**

You already have Flutter and some React/Next.js experience. Build on that.

| Technology | Target knowledge |
|---|---|
| React | Components, hooks, state, rendering, performance |
| Next.js | App Router, Server Components, SSR, caching |
| Tailwind CSS | Responsive interfaces, reusable components |
| Flutter | Architecture, state management, networking, testing |
| REST APIs | HTTP, status codes, pagination, validation |
| WebSockets | Real-time communication |
| Authentication | JWT, refresh tokens, OAuth 2.0, sessions |

Additional skills:
- Accessibility and responsive design.
- Frontend performance optimization.
- Form validation and error handling.
- State management.
- Component architecture.
- Mobile offline-first architecture and local persistence.

### C. Backend engineering

**[Highest priority]**

This is where I want you to become particularly strong.

| Skill | What you should master |
|---|---|
| Node.js | Event loop, asynchronous I/O, streams |
| NestJS | Modules, dependency injection, guards, interceptors |
| API design | REST, versioning, pagination, error handling |
| Authentication | JWT, OAuth, RBAC, permissions |
| Background processing | Queues, workers, scheduled jobs |
| Redis | Caching, rate limiting, distributed locks |
| WebSockets | Real-time events and communication |
| Testing | Unit, integration, end-to-end |

You should be able to explain how a request travels from a client to your backend, how it gets authenticated, how data is validated, how the database is accessed, and how errors are handled.

### D. Databases and data architecture

**[Highest priority]**

This is an area that can distinguish you from developers who only know how to create CRUD endpoints.

| Skill | What to learn |
|---|---|
| PostgreSQL | Advanced SQL, relationships, constraints |
| Database design | Normalization, denormalization, ER diagrams |
| Indexing | B-tree, composite indexes, query plans |
| Transactions | ACID, isolation levels, locking |
| Optimization | EXPLAIN ANALYZE, slow queries |
| Redis | Caching, expiration, data structures |
| Migrations | Versioning and safe schema changes |
| Data integrity | Foreign keys, constraints, consistency |

You should also understand:
- One-to-one, one-to-many and many-to-many relationships.
- Database connection pooling.
- Read replicas and database scaling.
- Optimistic versus pessimistic locking.
- Multi-tenant database architecture.
- Backup and recovery strategies.

**Your target:** Be able to receive a business requirement, design its database from scratch, justify your choices, and implement it properly.

### E. System design and software architecture

**[Highest priority]**

This is one of the most important areas I want you to invest in.

Learn:

1. Monolithic versus microservices architecture.
2. Modular monolith architecture.
3. Event-driven architecture.
4. Message brokers and asynchronous processing.
5. Horizontal versus vertical scaling.
6. Caching strategies.
7. Load balancing and reverse proxies.
8. Database scaling and replication.
9. Rate limiting.
10. Fault tolerance and retries.
11. Idempotency.
12. Consistency and distributed transactions.
13. API gateways.
14. Object storage and CDN architecture.

Also learn the principles behind:

- SOLID.
- Clean Architecture.
- Domain-Driven Design (DDD).
- Design patterns.
- Separation of concerns.

You don't need to implement microservices everywhere. You need to know when they make sense and when a modular monolith is better.

### F. DevOps, cloud and infrastructure

**[Highest priority]**

This is where you can demonstrate that you are more than someone who writes code and uploads it to a hosting provider.

| Technology | Target knowledge |
|---|---|
| Linux | Processes, permissions, SSH, networking |
| Docker | Images, containers, volumes, networks |
| Docker Compose | Multi-container environments |
| Nginx | Reverse proxy, HTTPS, load balancing |
| GitHub Actions | Automated CI/CD |
| Git | Branching, pull requests, conflict resolution |
| Cloud | AWS fundamentals or another major cloud |
| Terraform | Infrastructure as Code |
| Kubernetes | Fundamentals, deployments, services |
| Monitoring | Prometheus, Grafana |
| Logging | Structured logs, centralized collection |
| OpenTelemetry | Traces, metrics, observability |

I would prioritize Docker, Linux, CI/CD, networking, Nginx, and monitoring before Kubernetes.

Kubernetes is valuable, but don't spend months learning orchestration before you can reliably deploy and operate a Dockerized application.

### G. Security and DevSecOps

You should be able to build applications that are reasonably secure, not just functional.

Learn:

- OWASP Top 10.
- OWASP API Security Top 10.
- SQL injection and XSS.
- CSRF and CORS.
- Password hashing.
- Secure authentication and authorization.
- Secrets management.
- Dependency vulnerability scanning.
- HTTPS and TLS.
- Rate limiting and brute-force protection.
- Docker image security.
- Database permissions and least privilege.

### H. AI-assisted software engineering

**[Very important in 2026]**

This is not about becoming a prompt engineer.

I want you to demonstrate that you can use AI as a genuine engineering productivity tool.

**Tools worth learning:**

- **Claude Code**.
- **OpenAI Codex**.
- **GitHub Copilot**.
- **Cursor**.
- **n8n**.

You don't need to master all five. Pick one primary coding agent and one alternative.

**The engineering skills to demonstrate:**

1. Giving agents structured project requirements.
2. Providing codebase context and architecture documentation.
3. Asking agents to implement features in controlled steps.
4. Reviewing generated code.
5. Identifying hallucinated APIs and incorrect implementations.
6. Writing tests for AI-generated code.
7. Using AI for debugging and refactoring.
8. Running security reviews.
9. Using agents for documentation and codebase exploration.
10. Understanding when NOT to trust the AI.

An excellent GitHub portfolio could include an `AI_WORKFLOW.md` file explaining how you use AI, how you review its output, and how you prevent unverified changes from reaching production.

---

## 2. Your ideal technology stack

I don't want you to keep switching technologies. You already have a good foundation with Veemo.

Here is the stack I'd standardize around:

  ### Your core engineering stack

  
    **Languages**
    
      **[TypeScript]**
      **[Python]**
      **[Dart]**
      **[SQL]**
      **[Bash]**
    
  
  
---

  
    **Frontend and mobile**
    
      **[React]**
      **[Next.js]**
      **[Tailwind CSS]**
      **[Flutter]**
    
  
  
---

  
    **Backend and data**
    
      **[NestJS]**
      **[PostgreSQL]**
      **[Redis]**
      **[Prisma or TypeORM]**
      **[RabbitMQ]**
    
  
  
---

  
    **Infrastructure**
    
      **[Docker]**
      **[Linux]**
      **[Nginx]**
      **[GitHub Actions]**
      **[Terraform]**
      **[Kubernetes]**
    
  
  
---

  
    **Quality and observability**
    
      **[Jest]**
      **[Playwright]**
      **[Grafana]**
      **[Prometheus]**
      **[OpenTelemetry]**
    
  
  
---

  
    **AI engineering**
    
      **[Claude Code / Codex]**
      **[GitHub Copilot]**
      **[n8n]**
      **[LLM APIs]**
    
  

This is your main stack, not a requirement to use every technology in every project.

---

## 3. The projects I want you to build

This is the most important part.

You don't need 20 basic GitHub repositories. You need approximately 5–7 excellent projects that demonstrate different engineering capabilities.

I would divide them into three categories:

- Real products: Veemo and client projects.
- Engineering portfolio: projects specifically designed to demonstrate technical depth.
- AI and automation: projects showing modern AI integration.

Here are my recommendations, in priority order.

---

## 🤖 Mentor / Advisor

## 4. The actual GitHub portfolio projects

These are the projects I would choose if I were building your portfolio from your current position.

### Project 1 — Veemo: Production social commerce platform

  **[Already building]**
  **[Flagship project]**

> 🖼️ **UI/Design References:**
> - *modern social commerce mobile app short video shopping feed UI*
> - *ecommerce seller analytics dashboard modern web UI*
> - *live shopping ecommerce mobile app interface*

**Repository:** `veemo-platform` (or keep your existing repository)

This is your strongest project because it demonstrates that you can build a real product, not just follow a tutorial.

Your current stack already gives you a lot:

- Flutter mobile application.
- NestJS backend.
- PostgreSQL database.
- Redis.
- Next.js seller dashboard.
- WebSockets.
- Agora live streaming.
- Cloudflare R2.
- Firebase Cloud Messaging.
- Docker and Nginx.

But I want you to improve the engineering documentation and production quality.

**What to add:**

| Area | Deliverable |
|---|---|
| System design | Architecture diagram |
| Database | ERD with relationships |
| Backend | API documentation |
| Infrastructure | Docker Compose production setup |
| CI/CD | GitHub Actions pipeline |
| Testing | Unit, integration and E2E tests |
| Security | Authentication and permissions review |
| Performance | Database query optimization |
| Monitoring | Logs, metrics and health checks |
| Documentation | Deployment and troubleshooting guides |

**Particularly important:** Document how the live shopping feature works.

For example:

1. Seller creates a live session.
2. Backend creates a session record.
3. Agora handles the video stream.
4. WebSockets handle real-time interactions.
5. Customers send comments and purchase requests.
6. Backend processes orders and updates inventory.
7. Notifications reach relevant users.

This single feature gives you an opportunity to demonstrate real-time system architecture.

You can turn Veemo into a complete engineering case study.

### Project 2 — Multi-tenant SaaS business management platform

**[Full-stack + database + system design]**

> 🖼️ **UI/Design References:**
> - *modern SaaS CRM dashboard analytics UI*
> - *SaaS project management application kanban dashboard*
> - *modern business management admin dashboard*

**Repository:** `saas-business-platform`

Build a SaaS application where multiple businesses can register and manage their operations.

Think of a simplified combination of CRM, appointment management and business administration.

**Features:**

- User registration and authentication.
- Organization creation.
- Multiple employees per organization.
- Role-based access control.
- Customer management.
- Appointments and bookings.
- Invoices and payments.
- Notifications.
- Analytics dashboard.
- Subscription plans.

**The real engineering challenge: multi-tenancy.**

Imagine:
- Company A has 5 employees.
- Company B has 20 employees.
- Both use the same application.
- Neither company can access the other's data.

You need to design the database and backend so that tenant isolation is enforced everywhere.

**Technologies:**

- Next.js + TypeScript.
- NestJS.
- PostgreSQL.
- Redis.
- Docker.
- Stripe test mode or a mock payment provider.
- GitHub Actions.

**What this project proves:**

- Advanced relational database design.
- Multi-tenant architecture.
- RBAC and authorization.
- API architecture.
- Transactions.
- SaaS business logic.
- Testing and deployment.

This could also become an actual client project if you find a small business that needs CRM or booking software.

### Project 3 — Distributed order processing system

**[System design showcase]**

> 🖼️ **UI/Design References:**
> - *distributed microservices architecture diagram ecommerce order payment inventory*
> - *event driven architecture message broker diagram*
> - *monitoring observability Grafana dashboard metrics*

**Repository:** `distributed-order-system`

This is specifically designed to demonstrate backend engineering and system design.

Build a system that processes orders through independent services.

**Architecture:**

- API Gateway.
- Order Service.
- Inventory Service.
- Payment Service.
- Notification Service.
- Message Broker.
- PostgreSQL.
- Redis.

Use RabbitMQ for asynchronous communication.

**Example workflow:**

A customer places an order.

1. Order service creates a pending order.
2. An event is published to RabbitMQ.
3. Inventory service reserves stock.
4. Payment service processes payment.
5. Order service confirms or rejects the order.
6. Notification service sends an update.

Now introduce real engineering problems:

- What happens when payment fails?
- What if the same event is received twice?
- What if a service is unavailable?
- What if inventory reservation succeeds but payment fails?
- How do you prevent duplicate orders?
- How do you retry failed jobs?
- How do you track an order across multiple services?

Implement idempotency, retries, dead-letter queues, timeouts and compensating actions.

**Technologies:**

NestJS, TypeScript, PostgreSQL, Redis, RabbitMQ, Docker Compose, OpenTelemetry, Prometheus and Grafana.

This project will teach you far more about distributed systems than another ordinary CRUD application.

You don't need to use microservices for Veemo just to demonstrate this skill. Keep this as a separate engineering experiment.

### Project 4 — Production-ready DevOps deployment platform

**[DevOps showcase]**

> 🖼️ **UI/Design References:**
> - *DevOps CI CD pipeline GitHub Actions diagram*
> - *Docker containers infrastructure architecture diagram nginx*
> - *Grafana Prometheus monitoring dashboard server*

**Repository:** `production-deployment-template`

Create a reusable infrastructure template for deploying full-stack applications.

The idea is that someone clones your repository, configures environment variables, and can deploy an application using your documented workflow.

**Include:**

- Dockerfiles for frontend and backend.
- Docker Compose.
- PostgreSQL and Redis.
- Nginx reverse proxy.
- HTTPS configuration.
- GitHub Actions CI/CD.
- Automated tests before deployment.
- Database migrations.
- Environment secrets.
- Backup scripts.
- Health checks.
- Logging and monitoring.
- Deployment and rollback instructions.

Then extend it:

**Version 2:**
- Terraform infrastructure.
- Cloud deployment.
- Object storage.
- Centralized monitoring.
- Automated vulnerability scanning.

**Version 3 (optional):**
- Kubernetes.
- Helm charts.
- Horizontal scaling.
- GitOps with Argo CD.

The objective isn't to have a complicated infrastructure diagram. It's to have a deployment system that actually works.

### Project 5 — AI-powered knowledge base and support assistant

**[AI engineering showcase]**

> 🖼️ **UI/Design References:**
> - *AI customer support chatbot knowledge base dashboard interface*
> - *RAG document search AI assistant web application UI*
> - *AI chat assistant source citations interface*

**Repository:** `ai-knowledge-assistant`

Build an application where a business uploads its documentation, FAQs, policies and product information.

Customers can ask questions and receive answers grounded in those documents.

**Features:**

- Document upload.
- PDF and text extraction.
- Document chunking.
- Embeddings.
- Vector search.
- Retrieval-Augmented Generation (RAG).
- AI responses with source citations.
- Conversation history.
- Admin dashboard.
- Feedback system.

**Technologies:**

- Next.js.
- NestJS or Python FastAPI.
- PostgreSQL + pgvector.
- Redis.
- OpenAI or another LLM API.
- Docker.

Don't just build a chatbot interface.

Demonstrate:
- How retrieval works.
- How you select chunks.
- How you reduce hallucinations.
- How you evaluate answer quality.
- How you handle token limits.
- How you protect documents from unauthorized access.
- How you monitor cost and latency.

This project demonstrates that you understand how to integrate AI into real software products.

### Project 6 — Automation and integration platform

**[Python + APIs + automation]**

> 🖼️ **UI/Design References:**
> - *workflow automation visual node editor dashboard*
> - *business automation dashboard task workflows interface*
> - *webhook integration automation platform UI*

**Repository:** `business-automation-engine`

Build a small automation engine inspired by Zapier and n8n.

Users can create workflows such as:

- When a new order arrives, send an email.
- When a form is submitted, create a customer.
- When an invoice is overdue, notify the business.
- When a webhook is received, trigger a background job.

**Technologies:**

- Python + FastAPI.
- PostgreSQL.
- Redis.
- Celery or another task queue.
- Webhooks.
- Docker.
- Next.js.

This is also useful for your freelance work because you can reuse components for client automations.

---

## 5. Which projects should you actually prioritize?

Don't attempt all six simultaneously.

Here is my ranking:

| Project | Main competency | Priority |
|---|---|---|
| Veemo | Full product engineering | 1 |
| Multi-tenant SaaS | Full-stack + database | 2 |
| DevOps deployment platform | DevOps + infrastructure | 3 |
| Distributed order system | System design | 4 |
| AI knowledge assistant | AI engineering | 5 |
| Automation engine | Python + integrations | 6 |

My recommendation is to finish four excellent projects before starting six unfinished ones.

Also, don't underestimate client work. A real booking system built for an actual business, with real requirements, deployment and maintenance, can be more convincing than a complicated fictional project.

I would aim for this portfolio balance:

- 1 flagship startup project (Veemo).
- 2 real client projects.
- 2 engineering-focused personal projects.
- 1 AI-focused project.

You can combine some categories, so you don't necessarily need six separate repositories.

---

## 6. How every GitHub project should look

I want you to change how you approach GitHub.

A repository should not simply contain source code. It should tell an engineering story.

Every serious project should contain:

  **Example repository structure**
  ```text
  project-name/
  │
  ├── apps/
  │   ├── frontend/
  │   └── backend/
  │
  ├── packages/
  │
  ├── infrastructure/
  │   ├── docker/
  │   ├── nginx/
  │   └── terraform/
  │
  ├── docs/
  │   ├── architecture.md
  │   ├── database-design.md
  │   ├── api-design.md
  │   ├── deployment.md
  │   └── decisions/
  │
  ├── tests/
  │
  ├── .github/
  │   └── workflows/
  │
  ├── .env.example
  ├── docker-compose.yml
  ├── README.md
  ├── CONTRIBUTING.md
  └── AI_WORKFLOW.md
  ```
  Illustrative structure; adapt it to the actual architecture rather than forcing every project into a monorepo.

### Your README should include

1. Project description.
2. Problem it solves.
3. Screenshots or demo video.
4. Technology stack.
5. System architecture diagram.
6. Database ER diagram.
7. Main features.
8. Installation instructions.
9. Environment configuration.
10. Testing instructions.
11. Deployment architecture.
12. Engineering challenges and decisions.

### Add these engineering documents

**`architecture.md`**

Explain the components, their responsibilities, and how they communicate.

**`database-design.md`**

Show the schema, relationships, indexes and important design decisions.

**`decisions/`**

Create Architecture Decision Records (ADRs).

Example:

`001-use-postgresql.md`

Why did you choose PostgreSQL instead of MongoDB?

`002-use-modular-monolith.md`

Why did you choose a modular monolith instead of microservices?

`003-use-redis-for-caching.md`

What problem does Redis solve in this application?

These documents demonstrate that you understand why you built something, not just how.

### Your GitHub profile

Your GitHub should have:

- A professional profile README.
- A clear professional introduction.
- Your core technologies.
- Your best repositories pinned.
- Projects with screenshots and demos.
- Meaningful commits and pull requests.
- A clean contribution history.

Don't chase green contribution squares. Quality and evidence matter much more.

---

## 🤖 Mentor / Advisor

Hamza, I think you should approach this as **building two careers simultaneously, but making them reinforce each other.**

You have two important objectives:

1. **Veemo:** Build your own startup, develop the product, understand the business, and eventually turn it into a real company.
2. **Your personal developer career:** Become a strong, employable full-stack developer who can build, architect, deploy, maintain, and scale software products.

And I want to make one important distinction: I don't think you should aim to become someone who knows 15 programming languages superficially.

I want you to build a portfolio that makes a technical recruiter or engineering manager think:

> This developer can take a product from an idea to production. He understands frontend, backend, databases, APIs, architecture, infrastructure, deployment, security, and AI-assisted development. He can work independently and make engineering decisions.

That's a much stronger professional identity than simply saying you're a full-stack developer.

Your portfolio should demonstrate five capabilities:

- **Software engineering:** Building maintainable frontend, backend, and mobile applications.
- **System design:** Designing databases, APIs, distributed systems, and scalable architectures.
- **DevOps and infrastructure:** Docker, CI/CD, Linux, cloud infrastructure, monitoring, and deployment.
- **AI-assisted engineering:** Using AI coding agents effectively while understanding, reviewing, testing, and securing their output.
- **Product development:** Taking real client requirements or your own ideas and delivering working products.

I would build your career around this identity:

  ### Full-Stack Software Engineer

  BACKEND · MOBILE · SYSTEM DESIGN · DEVOPS · AI ENGINEERING
  A developer capable of designing, building, deploying, and maintaining production-ready applications across the full software development lifecycle.

Let's turn that into an actual roadmap, not just a list of technologies to learn.

## 1. The skills you should develop in 2026

I researched the 2026 developer and technology trends, including Stack Overflow's 2026 Developer Survey, GitHub's latest Octoverse report, and the 2026 technology hiring survey.

There is a particularly important trend: employers increasingly need developers who can work with AI, but also understand what the AI produces.

For example:
- The 2026 Stack Overflow survey reports that 71.8% of respondents used an LLM, and coding assistants and agents have become a dominant AI use case. 
- GitHub reports that TypeScript and Python had the largest contributor increases among the top languages in its latest annual analysis. 
- The 2026 CoderPad hiring survey highlights debugging, system design, and AI/LLM application skills as important areas of development. 
- CI/CD, containers, infrastructure as code, and GitOps remain central DevOps practices. 

Based on these trends and your existing experience, this is the skill roadmap I'd recommend.

### A. Programming languages and software development

**[Highest priority]**

| Skill | What you should know |
|---|---|
| TypeScript | Advanced practical knowledge, types, generics, async programming |
| JavaScript | DOM, promises, event loop, browser fundamentals |
| Python | APIs, automation, scripting, background jobs |
| SQL | Joins, indexes, transactions, optimization, window functions |
| Dart | Flutter, asynchronous programming, state management |
| Bash | Linux automation, scripts, deployment |

**My recommendation:** Make TypeScript your primary language, Python your secondary language, and keep Dart for mobile development.

Don't start learning Go, Rust, Java, C#, and five other languages simultaneously. You can explore them later when a project or job requires them.

### B. Frontend and mobile development

**[Highest priority]**

You already have Flutter and some React/Next.js experience. Build on that.

| Technology | Target knowledge |
|---|---|
| React | Components, hooks, state, rendering, performance |
| Next.js | App Router, Server Components, SSR, caching |
| Tailwind CSS | Responsive interfaces, reusable components |
| Flutter | Architecture, state management, networking, testing |
| REST APIs | HTTP, status codes, pagination, validation |
| WebSockets | Real-time communication |
| Authentication | JWT, refresh tokens, OAuth 2.0, sessions |

Additional skills:
- Accessibility and responsive design.
- Frontend performance optimization.
- Form validation and error handling.
- State management.
- Component architecture.
- Mobile offline-first architecture and local persistence.

### C. Backend engineering

**[Highest priority]**

This is where I want you to become particularly strong.

| Skill | What you should master |
|---|---|
| Node.js | Event loop, asynchronous I/O, streams |
| NestJS | Modules, dependency injection, guards, interceptors |
| API design | REST, versioning, pagination, error handling |
| Authentication | JWT, OAuth, RBAC, permissions |
| Background processing | Queues, workers, scheduled jobs |
| Redis | Caching, rate limiting, distributed locks |
| WebSockets | Real-time events and communication |
| Testing | Unit, integration, end-to-end |

You should be able to explain how a request travels from a client to your backend, how it gets authenticated, how data is validated, how the database is accessed, and how errors are handled.

### D. Databases and data architecture

**[Highest priority]**

This is an area that can distinguish you from developers who only know how to create CRUD endpoints.

| Skill | What to learn |
|---|---|
| PostgreSQL | Advanced SQL, relationships, constraints |
| Database design | Normalization, denormalization, ER diagrams |
| Indexing | B-tree, composite indexes, query plans |
| Transactions | ACID, isolation levels, locking |
| Optimization | EXPLAIN ANALYZE, slow queries |
| Redis | Caching, expiration, data structures |
| Migrations | Versioning and safe schema changes |
| Data integrity | Foreign keys, constraints, consistency |

You should also understand:
- One-to-one, one-to-many and many-to-many relationships.
- Database connection pooling.
- Read replicas and database scaling.
- Optimistic versus pessimistic locking.
- Multi-tenant database architecture.
- Backup and recovery strategies.

**Your target:** Be able to receive a business requirement, design its database from scratch, justify your choices, and implement it properly.

### E. System design and software architecture

**[Highest priority]**

This is one of the most important areas I want you to invest in.

Learn:

1. Monolithic versus microservices architecture.
2. Modular monolith architecture.
3. Event-driven architecture.
4. Message brokers and asynchronous processing.
5. Horizontal versus vertical scaling.
6. Caching strategies.
7. Load balancing and reverse proxies.
8. Database scaling and replication.
9. Rate limiting.
10. Fault tolerance and retries.
11. Idempotency.
12. Consistency and distributed transactions.
13. API gateways.
14. Object storage and CDN architecture.

Also learn the principles behind:

- SOLID.
- Clean Architecture.
- Domain-Driven Design (DDD).
- Design patterns.
- Separation of concerns.

You don't need to implement microservices everywhere. You need to know when they make sense and when a modular monolith is better.

### F. DevOps, cloud and infrastructure

**[Highest priority]**

This is where you can demonstrate that you are more than someone who writes code and uploads it to a hosting provider.

| Technology | Target knowledge |
|---|---|
| Linux | Processes, permissions, SSH, networking |
| Docker | Images, containers, volumes, networks |
| Docker Compose | Multi-container environments |
| Nginx | Reverse proxy, HTTPS, load balancing |
| GitHub Actions | Automated CI/CD |
| Git | Branching, pull requests, conflict resolution |
| Cloud | AWS fundamentals or another major cloud |
| Terraform | Infrastructure as Code |
| Kubernetes | Fundamentals, deployments, services |
| Monitoring | Prometheus, Grafana |
| Logging | Structured logs, centralized collection |
| OpenTelemetry | Traces, metrics, observability |

I would prioritize Docker, Linux, CI/CD, networking, Nginx, and monitoring before Kubernetes.

Kubernetes is valuable, but don't spend months learning orchestration before you can reliably deploy and operate a Dockerized application.

### G. Security and DevSecOps

You should be able to build applications that are reasonably secure, not just functional.

Learn:

- OWASP Top 10.
- OWASP API Security Top 10.
- SQL injection and XSS.
- CSRF and CORS.
- Password hashing.
- Secure authentication and authorization.
- Secrets management.
- Dependency vulnerability scanning.
- HTTPS and TLS.
- Rate limiting and brute-force protection.
- Docker image security.
- Database permissions and least privilege.

### H. AI-assisted software engineering

**[Very important in 2026]**

This is not about becoming a prompt engineer.

I want you to demonstrate that you can use AI as a genuine engineering productivity tool.

**Tools worth learning:**

- **Claude Code**.
- **OpenAI Codex**.
- **GitHub Copilot**.
- **Cursor**.
- **n8n**.

You don't need to master all five. Pick one primary coding agent and one alternative.

**The engineering skills to demonstrate:**

1. Giving agents structured project requirements.
2. Providing codebase context and architecture documentation.
3. Asking agents to implement features in controlled steps.
4. Reviewing generated code.
5. Identifying hallucinated APIs and incorrect implementations.
6. Writing tests for AI-generated code.
7. Using AI for debugging and refactoring.
8. Running security reviews.
9. Using agents for documentation and codebase exploration.
10. Understanding when NOT to trust the AI.

An excellent GitHub portfolio could include an `AI_WORKFLOW.md` file explaining how you use AI, how you review its output, and how you prevent unverified changes from reaching production.

---

## 2. Your ideal technology stack

I don't want you to keep switching technologies. You already have a good foundation with Veemo.

Here is the stack I'd standardize around:

  ### Your core engineering stack

  
    **Languages**
    
      **[TypeScript]**
      **[Python]**
      **[Dart]**
      **[SQL]**
      **[Bash]**
    
  
  
---

  
    **Frontend and mobile**
    
      **[React]**
      **[Next.js]**
      **[Tailwind CSS]**
      **[Flutter]**
    
  
  
---

  
    **Backend and data**
    
      **[NestJS]**
      **[PostgreSQL]**
      **[Redis]**
      **[Prisma or TypeORM]**
      **[RabbitMQ]**
    
  
  
---

  
    **Infrastructure**
    
      **[Docker]**
      **[Linux]**
      **[Nginx]**
      **[GitHub Actions]**
      **[Terraform]**
      **[Kubernetes]**
    
  
  
---

  
    **Quality and observability**
    
      **[Jest]**
      **[Playwright]**
      **[Grafana]**
      **[Prometheus]**
      **[OpenTelemetry]**
    
  
  
---

  
    **AI engineering**
    
      **[Claude Code / Codex]**
      **[GitHub Copilot]**
      **[n8n]**
      **[LLM APIs]**
    
  

This is your main stack, not a requirement to use every technology in every project.

---

## 3. The projects I want you to build

This is the most important part.

You don't need 20 basic GitHub repositories. You need approximately 5–7 excellent projects that demonstrate different engineering capabilities.

I would divide them into three categories:

- Real products: Veemo and client projects.
- Engineering portfolio: projects specifically designed to demonstrate technical depth.
- AI and automation: projects showing modern AI integration.

Here are my recommendations, in priority order.

## 4. The actual GitHub portfolio projects

These are the projects I would choose if I were building your portfolio from your current position.

### Project 1 — Veemo: Production social commerce platform

  **[Already building]**
  **[Flagship project]**

> 🖼️ **UI/Design References:**
> - *modern social commerce mobile app short video shopping feed UI*
> - *ecommerce seller analytics dashboard modern web UI*
> - *live shopping ecommerce mobile app interface*

**Repository:** `veemo-platform` (or keep your existing repository)

This is your strongest project because it demonstrates that you can build a real product, not just follow a tutorial.

Your current stack already gives you a lot:

- Flutter mobile application.
- NestJS backend.
- PostgreSQL database.
- Redis.
- Next.js seller dashboard.
- WebSockets.
- Agora live streaming.
- Cloudflare R2.
- Firebase Cloud Messaging.
- Docker and Nginx.

But I want you to improve the engineering documentation and production quality.

**What to add:**

| Area | Deliverable |
|---|---|
| System design | Architecture diagram |
| Database | ERD with relationships |
| Backend | API documentation |
| Infrastructure | Docker Compose production setup |
| CI/CD | GitHub Actions pipeline |
| Testing | Unit, integration and E2E tests |
| Security | Authentication and permissions review |
| Performance | Database query optimization |
| Monitoring | Logs, metrics and health checks |
| Documentation | Deployment and troubleshooting guides |

**Particularly important:** Document how the live shopping feature works.

For example:

1. Seller creates a live session.
2. Backend creates a session record.
3. Agora handles the video stream.
4. WebSockets handle real-time interactions.
5. Customers send comments and purchase requests.
6. Backend processes orders and updates inventory.
7. Notifications reach relevant users.

This single feature gives you an opportunity to demonstrate real-time system architecture.

You can turn Veemo into a complete engineering case study.

### Project 2 — Multi-tenant SaaS business management platform

**[Full-stack + database + system design]**

> 🖼️ **UI/Design References:**
> - *modern SaaS CRM dashboard analytics UI*
> - *SaaS project management application kanban dashboard*
> - *modern business management admin dashboard*

**Repository:** `saas-business-platform`

Build a SaaS application where multiple businesses can register and manage their operations.

Think of a simplified combination of CRM, appointment management and business administration.

**Features:**

- User registration and authentication.
- Organization creation.
- Multiple employees per organization.
- Role-based access control.
- Customer management.
- Appointments and bookings.
- Invoices and payments.
- Notifications.
- Analytics dashboard.
- Subscription plans.

**The real engineering challenge: multi-tenancy.**

Imagine:
- Company A has 5 employees.
- Company B has 20 employees.
- Both use the same application.
- Neither company can access the other's data.

You need to design the database and backend so that tenant isolation is enforced everywhere.

**Technologies:**

- Next.js + TypeScript.
- NestJS.
- PostgreSQL.
- Redis.
- Docker.
- Stripe test mode or a mock payment provider.
- GitHub Actions.

**What this project proves:**

- Advanced relational database design.
- Multi-tenant architecture.
- RBAC and authorization.
- API architecture.
- Transactions.
- SaaS business logic.
- Testing and deployment.

This could also become an actual client project if you find a small business that needs CRM or booking software.

### Project 3 — Distributed order processing system

**[System design showcase]**

> 🖼️ **UI/Design References:**
> - *distributed microservices architecture diagram ecommerce order payment inventory*
> - *event driven architecture message broker diagram*
> - *monitoring observability Grafana dashboard metrics*

**Repository:** `distributed-order-system`

This is specifically designed to demonstrate backend engineering and system design.

Build a system that processes orders through independent services.

**Architecture:**

- API Gateway.
- Order Service.
- Inventory Service.
- Payment Service.
- Notification Service.
- Message Broker.
- PostgreSQL.
- Redis.

Use RabbitMQ for asynchronous communication.

**Example workflow:**

A customer places an order.

1. Order service creates a pending order.
2. An event is published to RabbitMQ.
3. Inventory service reserves stock.
4. Payment service processes payment.
5. Order service confirms or rejects the order.
6. Notification service sends an update.

Now introduce real engineering problems:

- What happens when payment fails?
- What if the same event is received twice?
- What if a service is unavailable?
- What if inventory reservation succeeds but payment fails?
- How do you prevent duplicate orders?
- How do you retry failed jobs?
- How do you track an order across multiple services?

Implement idempotency, retries, dead-letter queues, timeouts and compensating actions.

**Technologies:**

NestJS, TypeScript, PostgreSQL, Redis, RabbitMQ, Docker Compose, OpenTelemetry, Prometheus and Grafana.

This project will teach you far more about distributed systems than another ordinary CRUD application.

You don't need to use microservices for Veemo just to demonstrate this skill. Keep this as a separate engineering experiment.

### Project 4 — Production-ready DevOps deployment platform

**[DevOps showcase]**

> 🖼️ **UI/Design References:**
> - *DevOps CI CD pipeline GitHub Actions diagram*
> - *Docker containers infrastructure architecture diagram nginx*
> - *Grafana Prometheus monitoring dashboard server*

**Repository:** `production-deployment-template`

Create a reusable infrastructure template for deploying full-stack applications.

The idea is that someone clones your repository, configures environment variables, and can deploy an application using your documented workflow.

**Include:**

- Dockerfiles for frontend and backend.
- Docker Compose.
- PostgreSQL and Redis.
- Nginx reverse proxy.
- HTTPS configuration.
- GitHub Actions CI/CD.
- Automated tests before deployment.
- Database migrations.
- Environment secrets.
- Backup scripts.
- Health checks.
- Logging and monitoring.
- Deployment and rollback instructions.

Then extend it:

**Version 2:**
- Terraform infrastructure.
- Cloud deployment.
- Object storage.
- Centralized monitoring.
- Automated vulnerability scanning.

**Version 3 (optional):**
- Kubernetes.
- Helm charts.
- Horizontal scaling.
- GitOps with Argo CD.

The objective isn't to have a complicated infrastructure diagram. It's to have a deployment system that actually works.

### Project 5 — AI-powered knowledge base and support assistant

**[AI engineering showcase]**

> 🖼️ **UI/Design References:**
> - *AI customer support chatbot knowledge base dashboard interface*
> - *RAG document search AI assistant web application UI*
> - *AI chat assistant source citations interface*

**Repository:** `ai-knowledge-assistant`

Build an application where a business uploads its documentation, FAQs, policies and product information.

Customers can ask questions and receive answers grounded in those documents.

**Features:**

- Document upload.
- PDF and text extraction.
- Document chunking.
- Embeddings.
- Vector search.
- Retrieval-Augmented Generation (RAG).
- AI responses with source citations.
- Conversation history.
- Admin dashboard.
- Feedback system.

**Technologies:**

- Next.js.
- NestJS or Python FastAPI.
- PostgreSQL + pgvector.
- Redis.
- OpenAI or another LLM API.
- Docker.

Don't just build a chatbot interface.

Demonstrate:
- How retrieval works.
- How you select chunks.
- How you reduce hallucinations.
- How you evaluate answer quality.
- How you handle token limits.
- How you protect documents from unauthorized access.
- How you monitor cost and latency.

This project demonstrates that you understand how to integrate AI into real software products.

### Project 6 — Automation and integration platform

**[Python + APIs + automation]**

> 🖼️ **UI/Design References:**
> - *workflow automation visual node editor dashboard*
> - *business automation dashboard task workflows interface*
> - *webhook integration automation platform UI*

**Repository:** `business-automation-engine`

Build a small automation engine inspired by Zapier and n8n.

Users can create workflows such as:

- When a new order arrives, send an email.
- When a form is submitted, create a customer.
- When an invoice is overdue, notify the business.
- When a webhook is received, trigger a background job.

**Technologies:**

- Python + FastAPI.
- PostgreSQL.
- Redis.
- Celery or another task queue.
- Webhooks.
- Docker.
- Next.js.

This is also useful for your freelance work because you can reuse components for client automations.

---

## 5. Which projects should you actually prioritize?

Don't attempt all six simultaneously.

Here is my ranking:

| Project | Main competency | Priority |
|---|---|---|
| Veemo | Full product engineering | 1 |
| Multi-tenant SaaS | Full-stack + database | 2 |
| DevOps deployment platform | DevOps + infrastructure | 3 |
| Distributed order system | System design | 4 |
| AI knowledge assistant | AI engineering | 5 |
| Automation engine | Python + integrations | 6 |

My recommendation is to finish four excellent projects before starting six unfinished ones.

Also, don't underestimate client work. A real booking system built for an actual business, with real requirements, deployment and maintenance, can be more convincing than a complicated fictional project.

I would aim for this portfolio balance:

- 1 flagship startup project (Veemo).
- 2 real client projects.
- 2 engineering-focused personal projects.
- 1 AI-focused project.

You can combine some categories, so you don't necessarily need six separate repositories.

---

## 6. How every GitHub project should look

I want you to change how you approach GitHub.

A repository should not simply contain source code. It should tell an engineering story.

Every serious project should contain:

  **Example repository structure**
  ```text
  project-name/
  │
  ├── apps/
  │   ├── frontend/
  │   └── backend/
  │
  ├── packages/
  │
  ├── infrastructure/
  │   ├── docker/
  │   ├── nginx/
  │   └── terraform/
  │
  ├── docs/
  │   ├── architecture.md
  │   ├── database-design.md
  │   ├── api-design.md
  │   ├── deployment.md
  │   └── decisions/
  │
  ├── tests/
  │
  ├── .github/
  │   └── workflows/
  │
  ├── .env.example
  ├── docker-compose.yml
  ├── README.md
  ├── CONTRIBUTING.md
  └── AI_WORKFLOW.md
  ```
  Illustrative structure; adapt it to the actual architecture rather than forcing every project into a monorepo.

### Your README should include

1. Project description.
2. Problem it solves.
3. Screenshots or demo video.
4. Technology stack.
5. System architecture diagram.
6. Database ER diagram.
7. Main features.
8. Installation instructions.
9. Environment configuration.
10. Testing instructions.
11. Deployment architecture.
12. Engineering challenges and decisions.

### Add these engineering documents

**`architecture.md`**

Explain the components, their responsibilities, and how they communicate.

**`database-design.md`**

Show the schema, relationships, indexes and important design decisions.

**`decisions/`**

Create Architecture Decision Records (ADRs).

Example:

`001-use-postgresql.md`

Why did you choose PostgreSQL instead of MongoDB?

`002-use-modular-monolith.md`

Why did you choose a modular monolith instead of microservices?

`003-use-redis-for-caching.md`

What problem does Redis solve in this application?

These documents demonstrate that you understand why you built something, not just how.

### Your GitHub profile

Your GitHub should have:

- A professional profile README.
- A clear professional introduction.
- Your core technologies.
- Your best repositories pinned.
- Projects with screenshots and demos.
- Meaningful commits and pull requests.
- A clean contribution history.

Don't chase green contribution squares. Quality and evidence matter much more.

## 7. Your 6-month learning and building roadmap

I would organize your next six months around building things, not watching courses.

  ### November 2026 – April 2027

  A practical roadmap alongside Veemo development.
  
    
      **Month 1 — Strengthen your foundations**

      - TypeScript and advanced JavaScript.
      - SQL and PostgreSQL optimization.
      - NestJS architecture.
      - Linux and networking fundamentals.
      - Git workflows and automated testing.

      **[Deliverable]**

      Build a well-tested REST API with authentication, RBAC, PostgreSQL, Redis and Docker.
    
    
      **Month 2 — Database design and system architecture**

      - ER diagrams and database normalization.
      - Transactions and indexing.
      - Caching and database performance.
      - Modular monolith architecture.
      - API design and documentation.

      **[Deliverable]**

      Start the multi-tenant SaaS project.
    
    
      **Month 3 — DevOps and deployment**

      - Docker and Docker Compose.
      - Linux server administration.
      - Nginx and HTTPS.
      - GitHub Actions.
      - Cloud deployment.
      - Monitoring and logging.

      **[Deliverable]**

      Deploy your SaaS application with an automated CI/CD pipeline.
    
    
      **Month 4 — Advanced backend and distributed systems**

      - RabbitMQ.
      - Background jobs.
      - Event-driven architecture.
      - Idempotency and retries.
      - Distributed transactions.
      - OpenTelemetry.

      **[Deliverable]**

      Build the distributed order processing system.
    
    
      **Month 5 — AI engineering**

      - AI coding agents.
      - LLM APIs.
      - Embeddings and vector databases.
      - RAG.
      - AI evaluation.
      - Agent workflows.

      **[Deliverable]**

      Build and deploy your AI knowledge assistant.
    
    
      **Month 6 — Professional portfolio and job readiness**

      - Finish and polish projects.
      - Improve documentation.
      - Create architecture case studies.
      - Record project demonstrations.
      - Practice system design interviews.
      - Practice backend and full-stack technical interviews.

      **[Deliverable]**

      A professional portfolio, GitHub profile and updated CV.
    
  

You don't have to wait six months to apply for jobs. Start applying as soon as your first projects demonstrate the required skills.

## 8. How to balance Veemo and your personal career

This is important because I don't want your personal portfolio to become another startup that consumes all your time.

The trick is to make Veemo part of your learning.

For example:

| Skill you want to learn | Apply it to |
|---|---|
| PostgreSQL optimization | Veemo |
| Docker and deployment | Veemo |
| CI/CD | Veemo |
| Flutter architecture | Veemo |
| System design | Veemo |
| RabbitMQ | Separate project |
| Multi-tenancy | SaaS project |
| Terraform | Deployment project |
| RAG and AI | AI assistant |

I would use this initial time allocation:

  ### Weekly time allocation

  
    
      **Veemo**
      ### 60%

    
    
      
    
  
  
    
      **Career development**
      ### 40%

    
    
      
    
  
  Suggested starting allocation, not a fixed rule. Adjust when Veemo has important deadlines or you have a job opportunity.

One more thing: don't make learning passive.

For every technology you learn, create something with it.

For example:

- Learn Docker → Dockerize an actual application.
- Learn PostgreSQL indexes → Optimize a slow query and document the improvement.
- Learn RabbitMQ → Build a reliable order-processing workflow.
- Learn Terraform → Provision a real cloud environment.
- Learn AI agents → Use one to implement a feature, then review and test its work.

That's how you turn knowledge into portfolio evidence.

## 9. Learning resources worth your time

These are the resources I would use instead of randomly searching YouTube.

  
    
> 🖼️ **UI/Design Reference:** *roadmap.sh developer roadmaps website logo*

    
      ****roadmap.sh****

      Follow the Backend, DevOps, Docker, SQL and System Design roadmaps.

      [Explore roadmaps](https://roadmap.sh/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *The System Design Primer GitHub repository logo*

    
      ****System Design Primer****

      One of the best free resources for understanding large-scale system design.

      [GitHub repository](https://github.com/donnemartin/system-design-primer)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *Docker official whale logo*

    
      ****Docker documentation****

      Learn containers, networking, volumes, Compose and production practices.

      [Official documentation](https://docs.docker.com/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *PostgreSQL elephant logo*

    
      ****PostgreSQL documentation****

      Learn SQL, indexing, transactions and query optimization.

      [Official documentation](https://www.postgresql.org/docs/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *OWASP logo*

    
      ****OWASP****

      Learn application security and API security.

      [Official website](https://owasp.org/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *Full Stack Open course logo*

    
      ****Full Stack Open****

      Free, practical full-stack training covering React, Node, TypeScript, testing and more.

      [Start the course](https://fullstackopen.com/en/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *GitHub Skills logo*

    
      ****GitHub Skills****

      Practice GitHub Actions, pull requests and collaboration.

      [Start learning](https://skills.github.com/)
    
  

---

## 10. What I want your final professional portfolio to look like

Imagine a recruiter opens your portfolio.

  
    ### Hamza Jemli

    ### Full-Stack Software Developer

    Building scalable web and mobile applications, designing reliable backend systems, and deploying production-ready software.
    
      **[Full-stack]**
      **[System Design]**
      **[DevOps]**
      **[AI Engineering]**
    
    
      GitHub · LinkedIn · Email · Resume
    
  
  
---

  **Featured projects**
  
    
> 🖼️ **UI/Design Reference:** *social commerce mobile app ecommerce short video shopping interface*

    **Veemo — Social Commerce Platform**

    Production-oriented mobile and web commerce platform with real-time features.
    Flutter · NestJS · PostgreSQL · Redis · Docker
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *modern SaaS CRM dashboard UI analytics*

    **Multi-tenant SaaS Platform**

    Organization isolation, RBAC, relational database architecture and subscription management.
    Next.js · NestJS · PostgreSQL · Redis
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *distributed microservices architecture monitoring dashboard*

    **Distributed Order Processing**

    Event-driven architecture, asynchronous processing and fault tolerance.
    NestJS · RabbitMQ · Docker · OpenTelemetry
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *AI knowledge base chatbot dashboard interface*

    **AI Knowledge Assistant**

    Document retrieval, embeddings, RAG and source-grounded AI responses.
    Python · PostgreSQL · pgvector · LLM APIs
  

For each project, provide a live demo if possible, a GitHub repository, and a short technical case study.

For client projects, only publish code, screenshots and business details you have permission to share. You can also create anonymized case studies.

## 11. Let's turn this into your actual working plan

I don't want this conversation to end with you having another roadmap that you read once and forget.

I want us to build your developer career step by step. We can use this conversation as the foundation for your personal development program.

My suggested first actions:

1. Audit your existing GitHub repositories and identify what can be improved or showcased.
2. Create your personal developer roadmap and skill tracker.
3. Establish the first project's technical requirements and architecture.
4. Start implementing the projects while learning the missing skills.
5. Build your portfolio website when you have enough substantial work to showcase.

### Before we start, I want to establish four things.

{@body const [hours,setHours] = DIL.useState("4–6 hours")}
{@body const [direction,setDirection] = DIL.useState("Full-stack + Backend + DevOps")}
{@body const [learning,setLearning] = DIL.useState("Build projects while learning")}
{@body const [github,setGithub] = DIL.useState("I have several repositories, some unfinished")}

  **1. How much time can you dedicate daily to your personal career, excluding Veemo?**
  
    - [ ] **1–2 hours** 1–2 hours
    - [ ] **2–4 hours** 2–4 hours
    - [ ] **4–6 hours** 4–6 hours
    - [ ] **6+ hours** 6+ hours
  
  
---

  **2. Which professional direction do you want to prioritize?**
  
    - [ ] **Full-stack + Backend + DevOps** Full-stack + Backend + DevOps
    - [ ] **Backend + System Design + Cloud** Backend + System Design + Cloud
    - [ ] **Full-stack + Mobile Development** Full-stack + Mobile Development
    - [ ] **Full-stack + AI Engineering** Full-stack + AI Engineering
  
  
---

  **3. How do you prefer to learn?**
  
    - [ ] **Build projects while learning** Build projects while learning
    - [ ] **Study fundamentals first, then build** Study fundamentals first, then build
    - [ ] **A combination of courses, exercises and projects** A combination of courses, exercises and projects
  
  
---

  **4. What's the current state of your GitHub?**
  
    - [ ] **Almost empty** Almost empty
    - [ ] **I have several repositories, some unfinished** Several repositories, some unfinished
    - [ ] **I have completed projects but poor documentation** Completed projects but poor documentation
    - [ ] **I already have a decent portfolio** Already have a decent portfolio
  
  

**My ultimate objective for you:** By the time you finish this roadmap, you shouldn't just have a GitHub account full of projects. You should have the engineering knowledge and practical evidence to confidently apply for full-stack, backend, and junior software engineering positions, including remote opportunities.

And importantly, everything you learn should also make you a better founder and technical decision-maker for Veemo.

---

## 🤖 Mentor / Advisor

## 7. Your 6-month learning and building roadmap

I would organize your next six months around building things, not watching courses.

  ### November 2026 – April 2027

  A practical roadmap alongside Veemo development.
  
    
      **Month 1 — Strengthen your foundations**

      - TypeScript and advanced JavaScript.
      - SQL and PostgreSQL optimization.
      - NestJS architecture.
      - Linux and networking fundamentals.
      - Git workflows and automated testing.

      **[Deliverable]**

      Build a well-tested REST API with authentication, RBAC, PostgreSQL, Redis and Docker.
    
    
      **Month 2 — Database design and system architecture**

      - ER diagrams and database normalization.
      - Transactions and indexing.
      - Caching and database performance.
      - Modular monolith architecture.
      - API design and documentation.

      **[Deliverable]**

      Start the multi-tenant SaaS project.
    
    
      **Month 3 — DevOps and deployment**

      - Docker and Docker Compose.
      - Linux server administration.
      - Nginx and HTTPS.
      - GitHub Actions.
      - Cloud deployment.
      - Monitoring and logging.

      **[Deliverable]**

      Deploy your SaaS application with an automated CI/CD pipeline.
    
    
      **Month 4 — Advanced backend and distributed systems**

      - RabbitMQ.
      - Background jobs.
      - Event-driven architecture.
      - Idempotency and retries.
      - Distributed transactions.
      - OpenTelemetry.

      **[Deliverable]**

      Build the distributed order processing system.
    
    
      **Month 5 — AI engineering**

      - AI coding agents.
      - LLM APIs.
      - Embeddings and vector databases.
      - RAG.
      - AI evaluation.
      - Agent workflows.

      **[Deliverable]**

      Build and deploy your AI knowledge assistant.
    
    
      **Month 6 — Professional portfolio and job readiness**

      - Finish and polish projects.
      - Improve documentation.
      - Create architecture case studies.
      - Record project demonstrations.
      - Practice system design interviews.
      - Practice backend and full-stack technical interviews.

      **[Deliverable]**

      A professional portfolio, GitHub profile and updated CV.
    
  

You don't have to wait six months to apply for jobs. Start applying as soon as your first projects demonstrate the required skills.

## 8. How to balance Veemo and your personal career

This is important because I don't want your personal portfolio to become another startup that consumes all your time.

The trick is to make Veemo part of your learning.

For example:

| Skill you want to learn | Apply it to |
|---|---|
| PostgreSQL optimization | Veemo |
| Docker and deployment | Veemo |
| CI/CD | Veemo |
| Flutter architecture | Veemo |
| System design | Veemo |
| RabbitMQ | Separate project |
| Multi-tenancy | SaaS project |
| Terraform | Deployment project |
| RAG and AI | AI assistant |

I would use this initial time allocation:

  ### Weekly time allocation

  
    
      **Veemo**
      ### 60%

    
    
      
    
  
  
    
      **Career development**
      ### 40%

    
    
      
    
  
  Suggested starting allocation, not a fixed rule. Adjust when Veemo has important deadlines or you have a job opportunity.

One more thing: don't make learning passive.

For every technology you learn, create something with it.

For example:

- Learn Docker → Dockerize an actual application.
- Learn PostgreSQL indexes → Optimize a slow query and document the improvement.
- Learn RabbitMQ → Build a reliable order-processing workflow.
- Learn Terraform → Provision a real cloud environment.
- Learn AI agents → Use one to implement a feature, then review and test its work.

That's how you turn knowledge into portfolio evidence.

## 9. Learning resources worth your time

These are the resources I would use instead of randomly searching YouTube.

  
    
> 🖼️ **UI/Design Reference:** *roadmap.sh developer roadmaps website logo*

    
      ****roadmap.sh****

      Follow the Backend, DevOps, Docker, SQL and System Design roadmaps.

      [Explore roadmaps](https://roadmap.sh/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *The System Design Primer GitHub repository logo*

    
      ****System Design Primer****

      One of the best free resources for understanding large-scale system design.

      [GitHub repository](https://github.com/donnemartin/system-design-primer)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *Docker official whale logo*

    
      ****Docker documentation****

      Learn containers, networking, volumes, Compose and production practices.

      [Official documentation](https://docs.docker.com/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *PostgreSQL elephant logo*

    
      ****PostgreSQL documentation****

      Learn SQL, indexing, transactions and query optimization.

      [Official documentation](https://www.postgresql.org/docs/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *OWASP logo*

    
      ****OWASP****

      Learn application security and API security.

      [Official website](https://owasp.org/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *Full Stack Open course logo*

    
      ****Full Stack Open****

      Free, practical full-stack training covering React, Node, TypeScript, testing and more.

      [Start the course](https://fullstackopen.com/en/)
    
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *GitHub Skills logo*

    
      ****GitHub Skills****

      Practice GitHub Actions, pull requests and collaboration.

      [Start learning](https://skills.github.com/)
    
  

---

## 10. What I want your final professional portfolio to look like

Imagine a recruiter opens your portfolio.

  
    ### Hamza Jemli

    ### Full-Stack Software Developer

    Building scalable web and mobile applications, designing reliable backend systems, and deploying production-ready software.
    
      **[Full-stack]**
      **[System Design]**
      **[DevOps]**
      **[AI Engineering]**
    
    
      GitHub · LinkedIn · Email · Resume
    
  
  
---

  **Featured projects**
  
    
> 🖼️ **UI/Design Reference:** *social commerce mobile app ecommerce short video shopping interface*

    **Veemo — Social Commerce Platform**

    Production-oriented mobile and web commerce platform with real-time features.
    Flutter · NestJS · PostgreSQL · Redis · Docker
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *modern SaaS CRM dashboard UI analytics*

    **Multi-tenant SaaS Platform**

    Organization isolation, RBAC, relational database architecture and subscription management.
    Next.js · NestJS · PostgreSQL · Redis
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *distributed microservices architecture monitoring dashboard*

    **Distributed Order Processing**

    Event-driven architecture, asynchronous processing and fault tolerance.
    NestJS · RabbitMQ · Docker · OpenTelemetry
  
  
---

  
    
> 🖼️ **UI/Design Reference:** *AI knowledge base chatbot dashboard interface*

    **AI Knowledge Assistant**

    Document retrieval, embeddings, RAG and source-grounded AI responses.
    Python · PostgreSQL · pgvector · LLM APIs
  

For each project, provide a live demo if possible, a GitHub repository, and a short technical case study.

For client projects, only publish code, screenshots and business details you have permission to share. You can also create anonymized case studies.

## 11. Let's turn this into your actual working plan

I don't want this conversation to end with you having another roadmap that you read once and forget.

I want us to build your developer career step by step. We can use this conversation as the foundation for your personal development program.

My suggested first actions:

1. Audit your existing GitHub repositories and identify what can be improved or showcased.
2. Create your personal developer roadmap and skill tracker.
3. Establish the first project's technical requirements and architecture.
4. Start implementing the projects while learning the missing skills.
5. Build your portfolio website when you have enough substantial work to showcase.

### Before we start, I want to establish four things.

{@body const [hours,setHours] = DIL.useState("4–6 hours")}
{@body const [direction,setDirection] = DIL.useState("Full-stack + Backend + DevOps")}
{@body const [learning,setLearning] = DIL.useState("Build projects while learning")}
{@body const [github,setGithub] = DIL.useState("I have several repositories, some unfinished")}

  **1. How much time can you dedicate daily to your personal career, excluding Veemo?**
  
    - [ ] **1–2 hours** 1–2 hours
    - [ ] **2–4 hours** 2–4 hours
    - [ ] **4–6 hours** 4–6 hours
    - [ ] **6+ hours** 6+ hours
  
  
---

  **2. Which professional direction do you want to prioritize?**
  
    - [ ] **Full-stack + Backend + DevOps** Full-stack + Backend + DevOps
    - [ ] **Backend + System Design + Cloud** Backend + System Design + Cloud
    - [ ] **Full-stack + Mobile Development** Full-stack + Mobile Development
    - [ ] **Full-stack + AI Engineering** Full-stack + AI Engineering
  
  
---

  **3. How do you prefer to learn?**
  
    - [ ] **Build projects while learning** Build projects while learning
    - [ ] **Study fundamentals first, then build** Study fundamentals first, then build
    - [ ] **A combination of courses, exercises and projects** A combination of courses, exercises and projects
  
  
---

  **4. What's the current state of your GitHub?**
  
    - [ ] **Almost empty** Almost empty
    - [ ] **I have several repositories, some unfinished** Several repositories, some unfinished
    - [ ] **I have completed projects but poor documentation** Completed projects but poor documentation
    - [ ] **I already have a decent portfolio** Already have a decent portfolio
  
  

**My ultimate objective for you:** By the time you finish this roadmap, you shouldn't just have a GitHub account full of projects. You should have the engineering knowledge and practical evidence to confidently apply for full-stack, backend, and junior software engineering positions, including remote opportunities.

And importantly, everything you learn should also make you a better founder and technical decision-maker for Veemo.

---

## 👤 Hamza (Developer)

i want project to put in my github and learn from them so i can find a job and i want  something like what i told you

---

## 🤖 Mentor / Advisor

I understand what you're looking for now. You don't want a list of technologies to learn or generic tutorials. You want **a collection of real, substantial software projects that you can build, learn from, publish on GitHub, and use as proof of your engineering abilities when applying for jobs.**

You want someone looking at your GitHub to see that you can:
- Build complete frontend and backend applications.
- Design databases and complex data relationships.
- Understand system architecture and scalability.
- Work with Docker, Linux, networking and DevOps.
- Build APIs, authentication systems and real-time applications.
- Work with AI coding agents and AI APIs.
- Write maintainable, tested and secure code.
- Understand how software gets deployed and maintained in production.

I would approach your portfolio as a collection of **engineering case studies**, rather than a collection of random applications.

# 1. The projects I would actually put on your GitHub

These are the projects I recommend you build. Each one has a different purpose, so you're not repeatedly building the same CRUD application.

  
    
> 🖼️ **UI/Design Reference:** *modern SaaS project management dashboard kanban team workspace interface*

    
      **[Project 01 · Start here]**
      **TeamFlow — Multi-tenant Project Management SaaS**

      A project management platform similar to a simplified Trello/Linear.

      Next.js · NestJS · PostgreSQL · Redis · Docker
    
  
  **What you'll build:**
  - Organizations and workspaces.
  - Teams, invitations and user roles.
  - Projects, tasks, comments and attachments.
  - Kanban boards.
  - Real-time task updates.
  - Notifications.
  - Activity logs.
  - Search, filtering and pagination.

  **What you'll learn:**
  - Relational database architecture.
  - Multi-tenancy and data isolation.
  - RBAC and authorization.
  - Database transactions and indexing.
  - WebSockets.
  - API architecture.
  - Unit and integration testing.

  **Advanced challenges:**
  - Optimistic updates.
  - Audit logs.
  - Redis caching.
  - Background jobs.
  - Rate limiting.

  Job signal: Full-stack developer, backend developer, SaaS engineering.
  
---

  
    
> 🖼️ **UI/Design Reference:** *ecommerce order management inventory analytics dashboard modern software interface*

    
      **[Project 02]**
      **StockFlow — Inventory and Order Management System**

      A complete inventory and order processing platform for businesses.

      NestJS · PostgreSQL · Redis · RabbitMQ · Docker
    
  
  **What you'll build:**
  - Product and warehouse management.
  - Stock tracking.
  - Purchase and sales orders.
  - Inventory reservations.
  - Order status management.
  - Supplier management.
  - Sales reports.
  - Notifications.

  **What you'll learn:**
  - Advanced PostgreSQL.
  - Database normalization.
  - Transactions and concurrency.
  - Event-driven architecture.
  - Message queues.
  - Background workers.
  - Idempotency.
  - Distributed system fundamentals.

  **Advanced challenges:**
  - Prevent overselling when multiple customers purchase simultaneously.
  - Implement stock reservation and expiration.
  - Handle failed payment workflows.
  - Implement retry mechanisms and dead-letter queues.
  - Track inventory changes through an immutable movement history.

  Job signal: Backend engineering, database design, system design.
  
---

  
    
> 🖼️ **UI/Design Reference:** *DevOps monitoring dashboard Grafana docker infrastructure deployment interface*

    
      **[Project 03]**
      **DeployKit — Production Infrastructure Template**

      A reusable infrastructure setup for deploying modern full-stack applications.

      Docker · Linux · Nginx · GitHub Actions · Terraform
    
  
  **What you'll build:**
  - Multi-stage Dockerfiles.
  - Docker Compose infrastructure.
  - Nginx reverse proxy.
  - PostgreSQL and Redis containers.
  - Automated CI/CD.
  - HTTPS.
  - Automated database backups.
  - Health checks.
  - Monitoring and centralized logging.

  **Advanced challenges:**
  - Deploy to a VPS or cloud provider.
  - Provision infrastructure with Terraform.
  - Implement automated rollback.
  - Add Prometheus and Grafana.
  - Add vulnerability scanning.
  - Experiment with Kubernetes.

  **What makes this impressive:** Don't just upload a Docker Compose file. Demonstrate that you can take an application from a GitHub commit to a running production deployment.

  Job signal: DevOps, cloud engineering, backend infrastructure.
  
---

  
    
> 🖼️ **UI/Design Reference:** *AI customer support knowledge base chatbot web application interface with sources*

    
      **[Project 04]**
      **KnowBase — AI Knowledge Management Platform**

      A platform that allows companies to upload documents and build AI assistants that answer questions based on their information.

      Python · FastAPI · PostgreSQL · pgvector · LLM APIs
    
  
  **What you'll build:**
  - Document upload and processing.
  - PDF extraction.
  - Text chunking.
  - Embeddings and vector search.
  - RAG pipeline.
  - AI-generated answers with citations.
  - Conversation history.
  - User permissions.
  - Admin dashboard.

  **Advanced challenges:**
  - Evaluate retrieval accuracy.
  - Prevent hallucinations.
  - Handle prompt injection.
  - Implement token and API cost tracking.
  - Compare different embedding models.
  - Add caching and background document processing.

  Job signal: AI integration, Python backend, modern application development.
  
---

  
    
> 🖼️ **UI/Design Reference:** *workflow automation visual editor nodes connections SaaS dashboard*

    
      **[Project 05]**
      **FlowForge — Workflow Automation Engine**

      A small automation platform inspired by n8n and Zapier.

      TypeScript or Python · NestJS · PostgreSQL · Redis
    
  
  **What you'll build:**
  - Workflow creation.
  - Trigger/action architecture.
  - Webhook triggers.
  - Scheduled jobs.
  - API integrations.
  - Execution history.
  - Retry mechanisms.
  - Workflow logs.

  **Advanced challenges:**
  - Build a workflow execution engine.
  - Manage dependencies between tasks.
  - Handle failures and retries.
  - Implement workflow scheduling.
  - Design a plugin system for integrations.

  Job signal: Backend engineering, automation, integrations, asynchronous processing.

# 2. Don't forget real client projects

I actually want you to have real client projects in your portfolio too.

A recruiter can learn a lot from a project that had real users, business requirements, deadlines and deployment constraints.

Given your freelance web development experience, you could turn some of your client work into professional case studies.

Here are examples of projects worth targeting:

  
    
> 🖼️ **UI/Design Reference:** *modern dental clinic appointment booking website design*

    **Appointment booking platform**

    Clinics, salons and service providers.
  
  
    
> 🖼️ **UI/Design Reference:** *modern ecommerce website product catalog checkout design*

    **E-commerce platform**

    Small businesses and online shops.
  
  
    
> 🖼️ **UI/Design Reference:** *modern restaurant ordering management dashboard*

    **Restaurant ordering system**

    Orders, menus and delivery management.
  
  
    
> 🖼️ **UI/Design Reference:** *modern real estate property listing management dashboard*

    **Real estate management**

    Listings, customers and inquiries.
  

For each client project, document:

- The client's problem.
- Requirements and constraints.
- Your proposed architecture.
- Database design.
- Technologies used.
- Challenges you encountered.
- Deployment.
- Screenshots and results.

You don't have to open-source client source code. A detailed case study with permission is enough.

# 3. How these projects cover your professional skills

This is the part I particularly want you to pay attention to.

| Competency | Project that proves it |
|---|---|
| Frontend engineering | TeamFlow, Veemo |
| Backend engineering | All projects |
| Database design | TeamFlow, StockFlow |
| Advanced SQL | StockFlow |
| System design | StockFlow, FlowForge |
| Distributed systems | StockFlow |
| Docker and containers | DeployKit |
| CI/CD | DeployKit |
| Linux and networking | DeployKit |
| Cloud and IaC | DeployKit |
| AI integration | KnowBase |
| Python | KnowBase, FlowForge |
| Real-time applications | Veemo, TeamFlow |
| Mobile development | Veemo |
| Client communication and delivery | Client projects |
| AI coding agents | All projects |

This is how you avoid having five projects that all demonstrate the same three skills.

# 4. How I want you to build each project

Don't build everything at once. Each project should have three stages.

  
    **[Stage 1]**
    **Working MVP**

    Build the main functionality. It must work, have a usable interface, a real database and a functional backend.
  
  
---

  
    **[Stage 2]**
    **Production engineering**

    Add testing, Docker, CI/CD, logging, security, validation, error handling, documentation and deployment.
  
  
---

  
    **[Stage 3]**
    **Advanced engineering**

    Add scaling, caching, queues, optimization, monitoring, architectural improvements and advanced features.
  

For example, don't start TeamFlow by immediately implementing microservices, Kubernetes and distributed caching.

First make a well-designed application. Then improve its engineering.

# 5. Your GitHub portfolio structure

I would aim for these repositories:

| Repository | Purpose |
|---|---|
| `veemo` | Real startup, full-stack and mobile |
| `teamflow` | Advanced full-stack SaaS |
| `stockflow` | Backend and system design |
| `deploykit` | DevOps and infrastructure |
| `knowbase` | AI engineering |
| `flowforge` | Automation and asynchronous processing |

Pin your best four or six repositories.

Every repository should have:

- A professional README.
- Screenshots and a live demo.
- Architecture diagram.
- Database ER diagram where relevant.
- API documentation.
- Docker setup.
- Automated tests.
- GitHub Actions.
- Setup instructions.
- Engineering decisions.
- A section explaining what you learned.

And use AI coding tools throughout the development process, but don't let them make you a passive developer. You should be able to explain and defend every important architectural decision.

---

# 6. My recommended execution order

  ### Your project execution plan

  
    
      **TeamFlow**

      Start with TypeScript, NestJS, PostgreSQL, database design and frontend architecture.

      Target: 4–6 weeks
    
    
      **DeployKit**

      Take TeamFlow and learn how to deploy, monitor, secure and maintain it.

      Target: 2–3 weeks
    
    
      **StockFlow**

      Focus on advanced backend engineering, database concurrency and system design.

      Target: 4–5 weeks
    
    
      **KnowBase**

      Learn Python, LLM APIs, embeddings and RAG.

      Target: 3–4 weeks
    
    
      **FlowForge**

      Explore workflow engines, integrations and background processing.

      Target: 3–4 weeks
    
  
  These are approximate learning/building estimates, not deadlines. Continue developing Veemo alongside them.

## 7. What I suggest we do next

I want to actually help you execute this, not just give you project ideas.

My suggestion is that we start with **TeamFlow**, and I help you develop it like a real software engineering project.

We will work through:

1. Requirements specification.
2. Functional and non-functional requirements.
3. System architecture.
4. Database ER diagram.
5. Technology selection and justification.
6. Backend project structure.
7. Frontend architecture.
8. API design.
9. Implementation tasks.
10. Docker and CI/CD.
11. Testing and deployment.
12. GitHub documentation.

For each technology, I'll give you the concepts to learn, practical exercises, implementation tasks and review criteria. We can use AI agents to accelerate development while making sure you understand the resulting code.

**One thing I'd like to establish first:** Do you want to target remote jobs primarily as a:

- Full-stack developer (React/Next.js + Node/NestJS).
- Backend developer (Node.js, databases, system design).
- Full-stack developer with strong DevOps/cloud skills.

My recommendation is the third: it gives you a broad profile without losing your backend specialization.

---

## 👤 Hamza (Developer)

ok where i should tart now

---

## 🤖 Mentor / Advisor

Start with **TeamFlow**, but don't start coding immediately. I want you to approach it like a professional software engineer working on a real product.

Your first objective is to build one complete, well-architected application that demonstrates your full-stack abilities. Then we'll use it to develop your DevOps and system design skills.

# Step 1 — Start TeamFlow

  
> 🖼️ **UI/Design Reference:** *modern Linear inspired project management SaaS dashboard kanban board interface*

  
    **TeamFlow — Project Management SaaS**

    A multi-tenant project management platform for teams to organize projects, tasks and collaboration.
    **[Your first portfolio project]**
  

### Technology stack

Use technologies you already have some experience with, but challenge yourself to understand them deeply.

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| Styling | Tailwind CSS |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Real-time | WebSockets |
| Testing | Jest + Playwright |
| Containers | Docker |
| CI/CD | GitHub Actions |

Don't add Kubernetes, microservices or complicated infrastructure yet.

# Step 2 — Your first week

Here is exactly what I want you to do.

  ### Week 1: Foundation and architecture

  {@body const tasks = [{day:"Day 1",name:"Understand the product",detail:"Define users, features, requirements and project scope."},{day:"Day 2",name:"Design the database",detail:"Create entities, relationships, constraints and an ER diagram."},{day:"Day 3",name:"Design the architecture",detail:"Define frontend, backend, API communication and application structure."},{day:"Day 4",name:"Set up the backend",detail:"Initialize NestJS, Prisma, PostgreSQL and configuration."},{day:"Day 5",name:"Authentication",detail:"Implement registration, login, password hashing and JWT."},{day:"Day 6",name:"Docker",detail:"Containerize the backend and PostgreSQL; configure Docker Compose."},{day:"Day 7",name:"Review and document",detail:"Write documentation, test your implementation and review what you learned."}]}
  {@body const [done,setDone] = DIL.useState([])}
  
    {done.length} / 7 completed
    **[{Math.round(done.length/7*100)}%]**
  
  
    
  
  {#each tasks as task,i}
    
      - [ ] setDone(old=>v?[...old,i]:old.filter(x=>x!==i))}/>
      
        **{task.day}: {task.name}**
        {task.detail}
      
    
  {/each}

# Step 3 — Learn while building

For every feature, follow this process:

1. Understand the concept.
2. Read the official documentation.
3. Implement it yourself.
4. Use Claude Code or Codex to assist where useful.
5. Review the generated code.
6. Write tests.
7. Document what you learned.

For example, when designing the database, don't just ask AI to generate tables. Understand primary keys, foreign keys, indexes, constraints and relationships.

That's how you become an engineer rather than someone who can generate code.

# Step 4 — Your first task starts now

Before we write code, let's define TeamFlow properly.

I suggest we begin with a requirements specification (PRD) covering:

- Product overview.
- User roles.
- Functional requirements.
- Non-functional requirements.
- Main features.
- Database entities.
- Security requirements.
- Future improvements.

**I can help you create this specification, then we'll design the database and architecture before opening the IDE.**

My advice: don't rush. A properly engineered project that takes six weeks is worth much more than five unfinished projects.

Let's start by building TeamFlow as if you were developing it for a real client.

---

## 👤 Hamza (Developer)

ok ure the client and im developer and ure asking me to build this what is the delivrable that u want how this app should be build and what features and its specifcation and everything i need to have in this app
i will build it with ai agent to assist me and i will make it explain for me everything that he did by details so i can learn throught this so every thing will have an explaination doc and diagrams and examples how everything is working u can mention this in the delivrable that i will give to the ai agent so he explain for me what he is building and doing

---

