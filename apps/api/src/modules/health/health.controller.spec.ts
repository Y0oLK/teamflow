import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrismaService: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    mockPrismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return status ok and latency when database is reachable', async () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = {
      status: mockStatus,
    } as unknown as Response;

    await controller.checkHealth(mockResponse);

    expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        subsystems: expect.objectContaining({
          api: 'healthy',
          database: expect.objectContaining({
            status: 'healthy',
          }),
        }),
      })
    );
  });

  it('should return status degraded and 503 when database is unreachable', async () => {
    mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection lost'));

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = {
      status: mockStatus,
    } as unknown as Response;

    await controller.checkHealth(mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(503);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
        subsystems: expect.objectContaining({
          api: 'healthy',
          database: expect.objectContaining({
            status: 'unreachable',
          }),
        }),
      })
    );
  });
});

