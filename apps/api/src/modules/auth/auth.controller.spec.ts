import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user and set cookie', async () => {
      const mockResult = {
        user: { id: 'u1', email: 'test@example.com' },
        tokens: { accessToken: 'token_123', sessionId: 's1', expiresIn: 900 },
      };
      mockAuthService.register.mockResolvedValue(mockResult);

      const mockCookie = jest.fn();
      const res = { cookie: mockCookie } as unknown as Response;
      const req = { ip: '127.0.0.1', headers: {} } as unknown as Request;

      const result = await controller.register(
        {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        },
        req,
        res
      );

      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        'token_123',
        expect.objectContaining({ httpOnly: true })
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const mockResult = {
        user: { id: 'u1', email: 'test@example.com' },
        tokens: { accessToken: 'token_abc', sessionId: 's1', expiresIn: 900 },
      };
      mockAuthService.login.mockResolvedValue(mockResult);

      const mockCookie = jest.fn();
      const res = { cookie: mockCookie } as unknown as Response;
      const req = { ip: '127.0.0.1', headers: {} } as unknown as Request;

      const result = await controller.login(
        {
          email: 'test@example.com',
          password: 'Password123!',
        },
        req,
        res
      );

      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        'token_abc',
        expect.objectContaining({ httpOnly: true })
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('logout', () => {
    it('should revoke session and clear cookie', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      const mockClearCookie = jest.fn();
      const res = { clearCookie: mockClearCookie } as unknown as Response;

      const result = await controller.logout(
        {
          id: 'u1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: null,
          isEmailVerified: true,
          sessionId: 's1',
        },
        res
      );

      expect(mockAuthService.logout).toHaveBeenCalledWith('s1');
      expect(mockClearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        path: '/',
      });
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      const mockProfile = { id: 'u1', email: 'test@example.com', organizations: [] };
      mockAuthService.me.mockResolvedValue(mockProfile);

      const result = await controller.me({
        id: 'u1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: null,
        isEmailVerified: true,
        sessionId: 's1',
      });

      expect(mockAuthService.me).toHaveBeenCalledWith('u1');
      expect(result).toBe(mockProfile);
    });
  });
});

