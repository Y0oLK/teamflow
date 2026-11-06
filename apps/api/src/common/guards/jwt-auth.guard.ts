import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '../../modules/auth/interfaces/jwt-payload.interface';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Verify active session exists in database and is not expired
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isEmailVerified: true,
              deletedAt: true,
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalidated. Please log in again.');
      }

      if (session.user.deletedAt !== null) {
        throw new UnauthorizedException('User account has been deactivated.');
      }

      // Populate authenticated user context
      request.user = {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        avatarUrl: session.user.avatarUrl,
        isEmailVerified: session.user.isEmailVerified,
        sessionId: session.id,
        currentOrgId: payload.currentOrgId,
      };

      // Asynchronously bump lastActiveAt (without blocking request execution)
      this.prisma.session
        .update({
          where: { id: session.id },
          data: { lastActiveAt: new Date() },
        })
        .catch(() => {
          // Non-blocking catch to prevent logging noise
        });

      return true;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractToken(request: Request): string | null {
    // 1. Check Authorization Bearer Header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Check signed or unsigned cookies
    if (request.cookies?.['access_token']) {
      return request.cookies['access_token'];
    }

    return null;
  }
}
