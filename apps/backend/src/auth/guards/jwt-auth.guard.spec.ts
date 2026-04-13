import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { UserAccount } from '../schema/user.schema';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };
  let userModel: { findById: jest.Mock };

  const mockPermissions = [
    { name: 'manage:users', status: 'active' },
    { name: 'role:read', status: 'active' },
  ];

  const mockUser = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    role: {
      role: 'admin',
      permissions: mockPermissions,
    },
  };

  function createMockExecutionContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    };

    userModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: getModelToken(UserAccount.name), useValue: userModel },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token extraction', () => {
    it('should extract token from cookies', async () => {
      const request = {
        cookies: { access_token: 'cookie-token' },
        headers: {},
      };

      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });

      const context = createMockExecutionContext(request);
      await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('cookie-token');
    });

    it('should extract token from Authorization header when no cookie', async () => {
      const request = {
        cookies: {},
        headers: { authorization: 'Bearer header-token' },
      };

      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });

      const context = createMockExecutionContext(request);
      await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('header-token');
    });

    it('should prefer cookie over Authorization header', async () => {
      const request = {
        cookies: { access_token: 'cookie-token' },
        headers: { authorization: 'Bearer header-token' },
      };

      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });

      const context = createMockExecutionContext(request);
      await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('cookie-token');
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const request = { cookies: {}, headers: {} };
      const context = createMockExecutionContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return null for non-Bearer authorization header', async () => {
      const request = {
        cookies: {},
        headers: { authorization: 'Basic some-credentials' },
      };
      const context = createMockExecutionContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('token verification', () => {
    it('should throw UnauthorizedException when token is invalid', async () => {
      const request = {
        cookies: { access_token: 'invalid-token' },
        headers: {},
      };

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const context = createMockExecutionContext(request);
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when payload is null', async () => {
      const request = {
        cookies: { access_token: 'token' },
        headers: {},
      };

      jwtService.verifyAsync.mockResolvedValue(null);

      const context = createMockExecutionContext(request);
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('user population', () => {
    it('should attach user with permissions to request', async () => {
      const request = {
        cookies: { access_token: 'valid-token' },
        headers: {},
        user: null as any,
      };

      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });

      const context = createMockExecutionContext(request);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual({
        userId: '507f1f77bcf86cd799439011',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'admin',
        permissions: ['manage:users', 'role:read'],
      });
    });

    it('should populate role with active permissions only', async () => {
      const request = {
        cookies: { access_token: 'valid-token' },
        headers: {},
        user: null as any,
      };

      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });

      const context = createMockExecutionContext(request);
      await guard.canActivate(context);

      expect(userModel.findById).toHaveBeenCalledWith('user123');
      const populateCall = userModel.findById('user123').populate;
      expect(populateCall).toBeDefined();
    });

    it('should return empty permissions array when role has no permissions', async () => {
      const request = {
        cookies: { access_token: 'valid-token' },
        headers: {},
        user: null as any,
      };

      const userNoPerms = {
        ...mockUser,
        role: { role: 'viewer', permissions: null },
      };

      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(userNoPerms),
      });

      const context = createMockExecutionContext(request);
      await guard.canActivate(context);

      expect(request.user.permissions).toEqual([]);
    });

    it('should handle user with no role', async () => {
      const request = {
        cookies: { access_token: 'valid-token' },
        headers: {},
        user: null as any,
      };

      const userNoRole = { ...mockUser, role: null };
      jwtService.verifyAsync.mockResolvedValue({ userId: 'user123' });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(userNoRole),
      });

      const context = createMockExecutionContext(request);
      await guard.canActivate(context);

      expect(request.user.role).toBeUndefined();
      expect(request.user.permissions).toEqual([]);
    });
  });
});
