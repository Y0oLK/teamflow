import { PrismaClient, OrgRole, ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting TeamFlow database seed...');

  // 1. Password Hashing (Cost factor 12)
  const passwordHash = await bcrypt.hash('Teamflow123!', 12);

  // 2. Upsert Platform Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@teamflow.local' },
    update: {},
    create: {
      email: 'admin@teamflow.local',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Vance',
      isEmailVerified: true,
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@teamflow.local' },
    update: {},
    create: {
      email: 'member@teamflow.local',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Connor',
      isEmailVerified: true,
    },
  });

  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@teamflow.local' },
    update: {},
    create: {
      email: 'guest@teamflow.local',
      passwordHash,
      firstName: 'Kyle',
      lastName: 'Reese',
      isEmailVerified: true,
    },
  });

  // 3. Upsert Primary Tenant (Acme Corp)
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });

  // 4. Upsert Secondary Tenant (Beta Labs - For Multi-Tenant Isolation Verification)
  const betaOrg = await prisma.organization.upsert({
    where: { slug: 'beta-labs' },
    update: {},
    create: {
      name: 'Beta Labs',
      slug: 'beta-labs',
    },
  });

  // 5. Establish Multi-Tenant Memberships
  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: acmeOrg.id, userId: adminUser.id } },
    update: {},
    create: { organizationId: acmeOrg.id, userId: adminUser.id, role: OrgRole.ORG_OWNER },
  });

  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: acmeOrg.id, userId: memberUser.id } },
    update: {},
    create: { organizationId: acmeOrg.id, userId: memberUser.id, role: OrgRole.ORG_MEMBER },
  });

  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: acmeOrg.id, userId: guestUser.id } },
    update: {},
    create: { organizationId: acmeOrg.id, userId: guestUser.id, role: OrgRole.ORG_GUEST },
  });

  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: betaOrg.id, userId: adminUser.id } },
    update: {},
    create: { organizationId: betaOrg.id, userId: adminUser.id, role: OrgRole.ORG_OWNER },
  });

  // 6. Create Projects (Private by Default)
  const websiteProject = await prisma.project.upsert({
    where: {
      organizationId_key: {
        organizationId: acmeOrg.id,
        key: 'WEB',
      },
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      name: 'Website Redesign',
      key: 'WEB',
      description: 'Marketing website refresh and customer portal design',
      createdById: adminUser.id,
    },
  });

  // 7. Establish Project Membership
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: websiteProject.id, userId: memberUser.id } },
    update: {},
    create: { projectId: websiteProject.id, userId: memberUser.id, role: ProjectRole.PROJECT_MEMBER },
  });

  // 8. Create Kanban Tasks with Fractional Order Keys
  const task1 = await prisma.task.upsert({
    where: {
      projectId_taskNumber: {
        projectId: websiteProject.id,
        taskNumber: 1,
      },
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      projectId: websiteProject.id,
      taskNumber: 1,
      title: 'Design Hero Section Mockup',
      description: 'Create high-fidelity Figma components for the landing hero.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      orderKey: 'a0',
      createdById: adminUser.id,
    },
  });

  const task2 = await prisma.task.upsert({
    where: {
      projectId_taskNumber: {
        projectId: websiteProject.id,
        taskNumber: 2,
      },
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      projectId: websiteProject.id,
      taskNumber: 2,
      title: 'Set Up Tailwind Design System',
      description: 'Configure typography, color palette, and component primitives.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      orderKey: 'a0',
      createdById: adminUser.id,
    },
  });

  // 9. Assign Tasks
  await prisma.taskAssignee.upsert({
    where: { taskId_userId: { taskId: task2.id, userId: memberUser.id } },
    update: {},
    create: { taskId: task2.id, userId: memberUser.id, assignedById: adminUser.id },
  });

  // 10. Checklist Items (Subtasks)
  const existingSubtask = await prisma.subtask.findFirst({
    where: { taskId: task2.id, position: 1 },
  });

  if (!existingSubtask) {
    await prisma.subtask.create({
      data: {
        taskId: task2.id,
        title: 'Define dark mode semantic tokens',
        isCompleted: true,
        position: 1,
        createdById: memberUser.id,
      },
    });
  }

  console.log('✅ TeamFlow database seed completed successfully.');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

