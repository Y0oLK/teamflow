import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CycleDetectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates whether adding a directed dependency edge (taskId -> dependsOnTaskId)
   * would introduce a cycle in the project's dependency graph.
   *
   * Dependency Semantic: taskId depends on dependsOnTaskId.
   * This means dependsOnTaskId must finish BEFORE taskId.
   *
   * A cycle would be introduced if there is already a directed path from
   * taskId to dependsOnTaskId (or conversely if taskId is reachable from dependsOnTaskId).
   */
  async wouldCreateCycle(
    projectId: string,
    taskId: string,
    dependsOnTaskId: string
  ): Promise<boolean> {
    if (taskId === dependsOnTaskId) {
      return true; // Self-dependency is an immediate 1-node cycle
    }

    // 1. Fetch all existing active dependencies in the project
    const dependencies = await this.prisma.taskDependency.findMany({
      where: {
        task: { projectId, deletedAt: null },
        dependsOnTask: { projectId, deletedAt: null },
      },
      select: {
        taskId: true,
        dependsOnTaskId: true,
      },
    });

    // 2. Build directed adjacency list: from dependsOn -> to dependent tasks
    // If we want to know if adding (taskId -> dependsOnTaskId) creates a cycle,
    // we check if taskId is reachable starting from dependsOnTaskId along existing edges.
    const adjList = new Map<string, string[]>();

    for (const dep of dependencies) {
      const list = adjList.get(dep.taskId) ?? [];
      list.push(dep.dependsOnTaskId);
      adjList.set(dep.taskId, list);
    }

    // 3. Perform Depth-First Search (DFS) reachability check:
    // Can we reach `taskId` starting from `dependsOnTaskId`?
    const visited = new Set<string>();
    const stack: string[] = [dependsOnTaskId];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (current === taskId) {
        return true; // Path exists: dependsOnTaskId -> ... -> taskId. Cycle detected!
      }

      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = adjList.get(current) ?? [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return false;
  }
}
