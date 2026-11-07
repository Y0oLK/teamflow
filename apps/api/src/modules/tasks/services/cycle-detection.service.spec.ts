import { Test, TestingModule } from '@nestjs/testing';
import { CycleDetectionService } from './cycle-detection.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CycleDetectionService (DAG Cycle Prevention Algorithm)', () => {
  let service: CycleDetectionService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      taskDependency: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CycleDetectionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CycleDetectionService>(CycleDetectionService);
  });

  it('should detect immediate 1-node cycle (task depending on itself)', async () => {
    const result = await service.wouldCreateCycle('p1', 'task-A', 'task-A');
    expect(result).toBe(true);
  });

  it('should allow valid dependency edge in an empty graph', async () => {
    mockPrisma.taskDependency.findMany.mockResolvedValue([]);

    const result = await service.wouldCreateCycle('p1', 'task-A', 'task-B');
    expect(result).toBe(false);
  });

  it('should detect direct 2-node circular dependency (A -> B, adding B -> A)', async () => {
    // Existing: A depends on B (task-A -> task-B)
    mockPrisma.taskDependency.findMany.mockResolvedValue([
      { taskId: 'task-A', dependsOnTaskId: 'task-B' },
    ]);

    // Attempt: B depends on A (task-B -> task-A)
    const result = await service.wouldCreateCycle('p1', 'task-B', 'task-A');
    expect(result).toBe(true);
  });

  it('should detect transitive multi-node circular dependency (A -> B -> C -> D, adding D -> A)', async () => {
    // Existing: A -> B, B -> C, C -> D
    mockPrisma.taskDependency.findMany.mockResolvedValue([
      { taskId: 'task-A', dependsOnTaskId: 'task-B' },
      { taskId: 'task-B', dependsOnTaskId: 'task-C' },
      { taskId: 'task-C', dependsOnTaskId: 'task-D' },
    ]);

    // Attempt: D depends on A (task-D -> task-A) creates loop A -> B -> C -> D -> A
    const result = await service.wouldCreateCycle('p1', 'task-D', 'task-A');
    expect(result).toBe(true);
  });

  it('should allow valid diamond DAG (A -> B, A -> C, B -> D, adding C -> D)', async () => {
    // Existing: A -> B, A -> C, B -> D
    mockPrisma.taskDependency.findMany.mockResolvedValue([
      { taskId: 'task-A', dependsOnTaskId: 'task-B' },
      { taskId: 'task-A', dependsOnTaskId: 'task-C' },
      { taskId: 'task-B', dependsOnTaskId: 'task-D' },
    ]);

    // Attempt: C depends on D. Diamond DAG: D has two parents (B and C) which both depend on A.
    // This is valid in a DAG.
    const result = await service.wouldCreateCycle('p1', 'task-C', 'task-D');
    expect(result).toBe(false);
  });
});
