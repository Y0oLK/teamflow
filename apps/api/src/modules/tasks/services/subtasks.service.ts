import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubtaskDto } from '../dto/create-subtask.dto';
import { UpdateSubtaskDto } from '../dto/update-subtask.dto';

export interface SubtaskResponse {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adds a single-level checklist item to a task (Decision Q4).
   */
  async create(
    taskId: string,
    actorId: string,
    dto: CreateSubtaskDto
  ): Promise<SubtaskResponse> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId, deletedAt: null },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Determine position if not provided
    let position = dto.position;
    if (position === undefined) {
      const lastSubtask = await this.prisma.subtask.findFirst({
        where: { taskId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      position = (lastSubtask?.position ?? -1) + 1;
    }

    const subtask = await this.prisma.subtask.create({
      data: {
        taskId,
        title: dto.title,
        position,
        createdById: actorId,
      },
    });

    return subtask;
  }

  /**
   * Updates checklist item title, completion status, or position.
   */
  async update(subtaskId: string, dto: UpdateSubtaskDto): Promise<SubtaskResponse> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      throw new NotFoundException('Checklist item not found');
    }

    const updated = await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
    });

    return updated;
  }

  /**
   * Deletes a checklist item.
   */
  async delete(subtaskId: string): Promise<{ message: string }> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.prisma.subtask.delete({
      where: { id: subtaskId },
    });

    return { message: 'Checklist item deleted successfully' };
  }
}
