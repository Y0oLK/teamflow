import {
  Controller,
  Post,
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
import { DependenciesService, DependencyResponse } from '../services/dependencies.service';
import { AddDependencyDto } from '../dto/add-dependency.dto';

@ApiTags('Dependencies')
@Controller('organizations/:orgId/projects/:projectId/tasks/:taskId/dependencies')
@UseGuards(TenantGuard, ProjectMemberGuard)
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class DependenciesController {
  constructor(private readonly dependenciesService: DependenciesService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a task prerequisite dependency (with DAG cycle detection)',
  })
  @ApiResponse({ status: 201, description: 'Dependency relationship created' })
  @ApiResponse({ status: 400, description: 'Self-dependency rejected' })
  @ApiResponse({ status: 409, description: 'Cycle detected: Circular dependency rejected' })
  async addDependency(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: AddDependencyDto
  ): Promise<DependencyResponse> {
    return this.dependenciesService.addDependency(projectId, taskId, dto.dependsOnTaskId);
  }

  @Delete(':dependsOnTaskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a task dependency' })
  @ApiResponse({ status: 200, description: 'Dependency removed' })
  async removeDependency(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Param('dependsOnTaskId') dependsOnTaskId: string
  ): Promise<{ message: string }> {
    return this.dependenciesService.removeDependency(projectId, taskId, dependsOnTaskId);
  }
}
