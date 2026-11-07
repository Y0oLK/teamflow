import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { ProjectMemberGuard } from '../../../common/guards/project-member.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentTenant, TenantContext } from '../../../common/decorators/current-tenant.decorator';
import { CurrentProject, ProjectContext } from '../../../common/decorators/current-project.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { TasksService, TaskResponse } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';
import { AssignUsersDto } from '../dto/assign-users.dto';

@ApiTags('Tasks')
@Controller('organizations/:orgId/projects/:projectId/tasks')
@UseGuards(TenantGuard, ProjectMemberGuard)
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task in the project' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 400, description: 'Invalid assignees or invalid data' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentProject() project: ProjectContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto
  ): Promise<TaskResponse> {
    return this.tasksService.create(tenant.id, project.id, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks in project with optional filters' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'assigneeId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'List of matching tasks' })
  async findAll(
    @CurrentProject() project: ProjectContext,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('assigneeId') assigneeId?: string,
    @Query('search') search?: string
  ): Promise<TaskResponse[]> {
    return this.tasksService.findAll(project.id, {
      status,
      priority,
      assigneeId,
      search,
    });
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get task details including subtasks and dependencies' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @CurrentProject() project: ProjectContext,
    @Param('taskId') taskId: string
  ): Promise<Record<string, unknown>> {
    return this.tasksService.findById(project.id, taskId);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update task details with Optimistic Concurrency Control' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 409, description: 'OCC Conflict: Task was concurrently modified' })
  async update(
    @CurrentProject() project: ProjectContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto
  ): Promise<TaskResponse> {
    return this.tasksService.update(project.id, taskId, user.id, dto);
  }

  @Patch(':taskId/move')
  @ApiOperation({ summary: 'Move task / change Kanban column status with OCC (TX-01)' })
  @ApiResponse({ status: 200, description: 'Task moved' })
  @ApiResponse({ status: 409, description: 'OCC Conflict' })
  async move(
    @CurrentProject() project: ProjectContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto
  ): Promise<TaskResponse> {
    return this.tasksService.moveTask(project.id, taskId, user.id, dto);
  }

  @Put(':taskId/assignees')
  @ApiOperation({ summary: 'Synchronize task assignees' })
  @ApiResponse({ status: 200, description: 'Assignees updated' })
  @ApiResponse({ status: 400, description: 'Assignees not in project' })
  async syncAssignees(
    @CurrentProject() project: ProjectContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string,
    @Body() dto: AssignUsersDto
  ): Promise<{ message: string }> {
    return this.tasksService.syncAssignees(project.id, taskId, user.id, dto.userIds);
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  async delete(
    @CurrentProject() project: ProjectContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string
  ): Promise<{ message: string }> {
    return this.tasksService.delete(project.id, taskId, user.id);
  }
}
