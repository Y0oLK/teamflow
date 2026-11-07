import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockPasswordService: any;
  let mockTokenService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      session: {
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      verificationToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
    };

    mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashed_password_123'),
      verify: jest.fn(),
    };

    mockTokenService = {
      generateRandomToken: jest.fn().mockReturnValue('random_raw_token_xyz'),
      hashToken: jest.fn().mockReturnValue('hashed_token_abc'),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_access_token'),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'NODE_ENV') return 'development';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        isEmailVerified: false,
        createdAt: new Date(),
      });
      mockPrisma.session.create.mockResolvedValue({
        id: 's1',
        userId: 'u1',
      });
      mockPrisma.verificationToken.create.mockResolvedValue({
        id: 'vt1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(mockPasswordService.hash).toHaveBeenCalledWith('Password123!');
      expect(result.tokens.accessToken).toBe('mock_jwt_access_token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.verificationToken).toBe('random_raw_token_xyz');
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          email: 'duplicate@example.com',
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        isEmailVerified: true,
        createdAt: new Date(),
      });
      mockPasswordService.verify.mockResolvedValue(true);
      mockPrisma.session.create.mockResolvedValue({ id: 's1' });

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(mockPasswordService.verify).toHaveBeenCalledWith('Password123!', 'hashed_password_123');
      expect(result.tokens.accessToken).toBe('mock_jwt_access_token');
      expect(result.user.id).toBe('u1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
      });
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete the session from the database', async () => {
      mockPrisma.session.delete.mockResolvedValue({ id: 's1' });

      await service.logout('s1');

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: 's1' },
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email and delete token', async () => {
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        id: 'vt1',
        userId: 'u1',
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isEmailVerified: true });
      mockPrisma.verificationToken.delete.mockResolvedValue({ id: 'vt1' });

      const result = await service.verifyEmail({ token: 'valid_raw_token' });

      expect(result.message).toBe('Email verified successfully.');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isEmailVerified: true },
      });
      expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { id: 'vt1' },
      });
    });

    it('should throw BadRequestException if token is invalid or expired', async () => {
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);

      await expect(
        service.verifyEmail({ token: 'expired_or_invalid_token' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token if user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
      });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.verificationToken.create.mockResolvedValue({ id: 'vt2' });

      const result = await service.forgotPassword({ email: 'test@example.com' });

      expect(result.message).toContain('password reset link has been dispatched');
      expect(result.resetToken).toBe('random_raw_token_xyz');
    });

    it('should return success message even if user does not exist (anti-enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'notfound@example.com' });

      expect(result.message).toContain('password reset link has been dispatched');
      expect(result.resetToken).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should update password and invalidate all sessions for user', async () => {
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        id: 'vt2',
        userId: 'u1',
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1' });
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.verificationToken.delete.mockResolvedValue({ id: 'vt2' });

      const result = await service.resetPassword({
        token: 'valid_token',
        newPassword: 'NewPassword123!',
      });

      expect(result.message).toContain('Password has been reset successfully');
      expect(mockPasswordService.hash).toHaveBeenCalledWith('NewPassword123!');
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'invalid_token',
          newPassword: 'NewPassword123!',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should update password and revoke other sessions', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        passwordHash: 'current_hash',
      });
      mockPasswordService.verify.mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue({ id: 'u1' });
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.changePassword('u1', 'current_session_id', {
        currentPassword: 'CurrentPass123!',
        newPassword: 'NewPass123!',
      });

      expect(result.message).toContain('Password updated successfully');
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'u1',
          id: { not: 'current_session_id' },
        },
      });
    });

    it('should throw BadRequestException if current password is wrong', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        passwordHash: 'current_hash',
      });
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(
        service.changePassword('u1', 'current_session_id', {
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPass123!',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });
});

