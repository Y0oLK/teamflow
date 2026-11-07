import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'System Health & Liveness Probe' })
  @ApiResponse({ status: 200, description: 'All systems operational' })
  @ApiResponse({ status: 503, description: 'One or more subsystem unhealthy' })
  async checkHealth(@Res() res: Response): Promise<void> {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = 'unreachable';
    }

    const isHealthy = dbStatus === 'healthy';
    const status = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(status).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      totalLatencyMs: Date.now() - startTime,
      subsystems: {
        api: 'healthy',
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    });
  }
}

