import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../../modules/prisma/prisma.service';

describe('JwtAuthGuard (Session Revocation & Auth Verification)', () => {
  let guard: JwtAuthGuard;
  let mockReflector: any;
  let mockJwtService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    mockJwtService = {
      verifyAsync: jest.fn(),
    };
    mockPrisma = {
      session: {
        findUnique: jest.fn(),
        update: jest.fn().mockReturnValue({ catch: jest.fn() }),
      },
    };

    guard = new JwtAuthGuard(
      mockReflector as unknown as Reflector,
      mockJwtService as unknown as JwtService,
      mockPrisma as unknown as PrismaService
    );
  });

  const createMockContext = (
    headers: Record<string, string> = {},
    cookies: Record<string, string> = {}
  ): ExecutionContext => {
    const request = {
      headers,
      cookies,
      user: undefined,
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access without token if endpoint is marked @Public()', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should extract token from Bearer header and validate active PostgreSQL session', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({ authorization: 'Bearer valid_jwt_token' });

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'alex@example.com',
      sessionId: 'session-123',
    });

    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-123',
      expiresAt: new Date(Date.now() + 100000), // active
      user: {
        id: 'user-1',
        email: 'alex@example.com',
        firstName: 'Alex',
        lastName: 'Vance',
        avatarUrl: null,
        isEmailVerified: true,
        deletedAt: null,
      },
    });

    const result = await guard.canActivate(context);
    const request = context.switchToHttp().getRequest() as any;

    expect(result).toBe(true);
    expect(request.user.id).toBe('user-1');
    expect(request.user.sessionId).toBe('session-123');
  });

  it('SESSION REVOCATION AUDIT: should reject request with 401 if session was deleted from database', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({ authorization: 'Bearer valid_jwt_token' });

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'alex@example.com',
      sessionId: 'revoked-session-456',
    });

    // Session row was deleted (e.g. user logged out or reset password)
    mockPrisma.session.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Session expired or invalidated. Please log in again.')
    );
  });

  it('should reject request if session is expired in database', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({ authorization: 'Bearer valid_jwt_token' });

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      sessionId: 'expired-session-789',
    });

    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'expired-session-789',
      expiresAt: new Date(Date.now() - 10000), // in the past
      user: { id: 'user-1', deletedAt: null },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject request if user account is soft-deleted', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({ authorization: 'Bearer valid_jwt_token' });

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      sessionId: 'session-123',
    });

    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-123',
      expiresAt: new Date(Date.now() + 100000),
      user: { id: 'user-1', deletedAt: new Date() }, // soft deleted
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('User account has been deactivated.')
    );
  });
});
