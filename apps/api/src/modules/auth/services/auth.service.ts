import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthTokens, JwtPayload } from '../interfaces/jwt-payload.interface';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
  verificationToken?: string; // Included in development/testing mode
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessionDurationDays = 7;
  private readonly emailTokenDurationHours = 24;
  private readonly resetTokenDurationHours = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Registers a new user account, creates an email verification token,
   * and issues an initial authenticated session.
   */
  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const rawVerificationToken = this.tokenService.generateRandomToken();
    const verificationTokenHash = this.tokenService.hashToken(rawVerificationToken);
    const rawSessionToken = this.tokenService.generateRandomToken();
    const sessionTokenHash = this.tokenService.hashToken(rawSessionToken);

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + this.sessionDurationDays);

    const verificationExpiresAt = new Date();
    verificationExpiresAt.setHours(verificationExpiresAt.getHours() + this.emailTokenDurationHours);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          isEmailVerified: false,
        },
      });

      // 2. Create Email Verification Token
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash: verificationTokenHash,
          type: TokenType.EMAIL_VERIFICATION,
          expiresAt: verificationExpiresAt,
        },
      });

      // 3. Create Initial Session
      const session = await tx.session.create({
        data: {
          userId: user.id,
          tokenHash: sessionTokenHash,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          expiresAt: sessionExpiresAt,
        },
      });

      return { user, session };
    });

    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.session.id
    );

    this.logger.log(`New user registered: ${result.user.email} (${result.user.id})`);

    const response: AuthResponse = {
      user: this.sanitizeUser(result.user),
      tokens,
    };

    // Expose raw verification token in non-production for automated testing / dev flow
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      response.verificationToken = rawVerificationToken;
    }

    return response;
  }

  /**
   * Authenticates a user with email and password, generating a new persistent session.
   */
  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate Session
    const rawSessionToken = this.tokenService.generateRandomToken();
    const sessionTokenHash = this.tokenService.hashToken(rawSessionToken);

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + this.sessionDurationDays);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionTokenHash,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        expiresAt: sessionExpiresAt,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, session.id);

    this.logger.log(`User logged in: ${user.email} (Session: ${session.id})`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Terminates a session, removing it from the database and preventing future token renewals.
   */
  async logout(sessionId: string): Promise<void> {
    await this.prisma.session
      .delete({
        where: { id: sessionId },
      })
      .catch(() => {
        // Idempotent: Ignore if already deleted
      });
  }

  /**
   * Retrieves the current user's profile with active organization memberships.
   */
  async me(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      ...this.sanitizeUser(user),
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        avatarUrl: m.organization.avatarUrl,
        role: m.role,
      })),
    };
  }

  /**
   * Validates an email verification token and marks the account as verified.
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);

    const verificationRecord = await this.prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      throw new BadRequestException('Verification token is invalid or has expired.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verificationRecord.userId },
        data: { isEmailVerified: true },
      });

      await tx.verificationToken.delete({
        where: { id: verificationRecord.id },
      });
    });

    return { message: 'Email verified successfully.' };
  }

  /**
   * Initiates a password reset request. Prevents account enumeration by always returning OK.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; resetToken?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    const response: { message: string; resetToken?: string } = {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    };

    if (!user) {
      return response;
    }

    const rawToken = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.resetTokenDurationHours);

    // Remove any prior active password reset tokens for this user
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: TokenType.PASSWORD_RESET },
    });

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        expiresAt,
      },
    });

    this.logger.log(`Password reset token generated for user: ${user.email}`);

    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      response.resetToken = rawToken;
    }

    return response;
  }

  /**
   * Resets password using token, and invalidates ALL active user sessions across all devices.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);

    const tokenRecord = await this.prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      // 1. Update Password
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: newPasswordHash },
      });

      // 2. Invalidate ALL existing sessions (Security Requirement FR-008)
      await tx.session.deleteMany({
        where: { userId: tokenRecord.userId },
      });

      // 3. Delete used token
      await tx.verificationToken.delete({
        where: { id: tokenRecord.id },
      });
    });

    this.logger.log(`Password reset completed for userId: ${tokenRecord.userId}. All sessions revoked.`);

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  /**
   * Changes user password when authenticated, revoking all other sessions except the current one.
   */
  async changePassword(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId, deletedAt: null },
    });

    const isCurrentValid = await this.passwordService.verify(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password does not match.');
    }

    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all OTHER sessions to protect compromised devices while preserving current session
      await tx.session.deleteMany({
        where: {
          userId,
          id: { not: currentSessionId },
        },
      });
    });

    return { message: 'Password updated successfully. Other active sessions have been revoked.' };
  }

  /**
   * Updates user profile fields.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponse> {
    const updated = await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
    });

    return this.sanitizeUser(updated);
  }

  private async generateTokens(
    userId: string,
    email: string,
    sessionId: string,
    currentOrgId?: string
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      sessionId,
      ...(currentOrgId && { currentOrgId }),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    return {
      accessToken,
      sessionId,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}

