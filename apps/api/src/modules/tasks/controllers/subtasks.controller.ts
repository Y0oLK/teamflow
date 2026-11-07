import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { ProjectMemberGuard } from '../../../common/guards/project-member.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { SubtasksService, SubtaskResponse } from '../services/subtasks.service';
import { CreateSubtaskDto } from '../dto/create-subtask.dto';
import { UpdateSubtaskDto } from '../dto/update-subtask.dto';

@ApiTags('Subtasks')
@Controller('organizations/:orgId/projects/:projectId/tasks/:taskId/subtasks')
@UseGuards(TenantGuard, ProjectMemberGuard)
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  @ApiOperation({ summary: 'Add a single-level checklist item to a task (Decision Q4)' })
  @ApiResponse({ status: 201, description: 'Checklist item added' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto
  ): Promise<SubtaskResponse> {
    return this.subtasksService.create(taskId, user.id, dto);
  }

  @Patch(':subtaskId')
  @ApiOperation({ summary: 'Update checklist item completion status, title, or position' })
  @ApiResponse({ status: 200, description: 'Checklist item updated' })
  async update(
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto
  ): Promise<SubtaskResponse> {
    return this.subtasksService.update(subtaskId, dto);
  }

  @Delete(':subtaskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a checklist item' })
  @ApiResponse({ status: 200, description: 'Checklist item deleted' })
  async delete(@Param('subtaskId') subtaskId: string): Promise<{ message: string }> {
    return this.subtasksService.delete(subtaskId);
  }
}
