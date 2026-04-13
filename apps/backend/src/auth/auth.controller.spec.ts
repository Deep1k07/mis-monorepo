import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';

jest.mock('@otplib/v12-adapter', () => ({
  authenticator: { check: jest.fn() },
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAccount } from './schema/user.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;
  let mockResponse: {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      verifyOtp: jest.fn(),
      resendOtp: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
    };

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: getModelToken(UserAccount.name), useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'password123', code: '' };

    it('should set cookie and return success when token is returned (non-production)', async () => {
      authService.login.mockResolvedValue({
        success: true,
        token: { access_token: 'jwt-token-123' },
      });

      const result = await controller.login(loginDto, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token-123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      expect(result).toEqual({ success: true, otpRequired: false });
    });

    it('should return OTP required result in production', async () => {
      const otpResult = {
        success: true,
        otpRequired: true,
        userId: 'user123',
      };
      authService.login.mockResolvedValue(otpResult);

      const result = await controller.login(loginDto, mockResponse as any);

      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(result).toEqual(otpResult);
    });

    it('should return 2FA prompt when 2FA is enabled', async () => {
      const twoFaResult = {
        success: false,
        twoFa: true,
        msg: 'Two-factor authentication is enabled. Please verify your code.',
      };
      authService.login.mockResolvedValue(twoFaResult);

      const result = await controller.login(loginDto, mockResponse as any);

      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(result).toEqual(twoFaResult);
    });
  });

  describe('verifyOtp', () => {
    it('should set cookie and return success on valid OTP', async () => {
      authService.verifyOtp.mockResolvedValue({
        success: true,
        token: { access_token: 'jwt-token-456' },
      });

      const result = await controller.verifyOtp(
        { userId: 'user123', otp: '123456' },
        mockResponse as any,
      );

      expect(authService.verifyOtp).toHaveBeenCalledWith('user123', '123456');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token-456',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it('should return service result when OTP verification fails', async () => {
      authService.verifyOtp.mockResolvedValue({ success: false });

      const result = await controller.verifyOtp(
        { userId: 'user123', otp: '000000' },
        mockResponse as any,
      );

      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });
  });

  describe('resendOtp', () => {
    it('should call authService.resendOtp and return result', async () => {
      const expected = { success: true, msg: 'OTP sent successfully' };
      authService.resendOtp.mockResolvedValue(expected);

      const result = await controller.resendOtp({ userId: 'user123' });

      expect(authService.resendOtp).toHaveBeenCalledWith('user123');
      expect(result).toEqual(expected);
    });
  });

  describe('logout', () => {
    it('should clear access_token cookie and return success', () => {
      const result = controller.logout(mockResponse as any);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('me', () => {
    it('should return the authenticated user from request', () => {
      const mockReq = {
        user: {
          userId: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'admin',
          permissions: ['manage:users'],
        },
      };

      const result = controller.me(mockReq as any);

      expect(result).toEqual(mockReq.user);
    });
  });

  describe('updateProfile', () => {
    it('should call authService.updateProfile with userId and dto', async () => {
      const mockReq = { user: { userId: 'user123' } };
      const dto = { firstName: 'Jane' };
      const expected = {
        success: true,
        user: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
        },
      };
      authService.updateProfile.mockResolvedValue(expected);

      const result = await controller.updateProfile(mockReq as any, dto);

      expect(authService.updateProfile).toHaveBeenCalledWith('user123', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with userId and dto', async () => {
      const mockReq = { user: { userId: 'user123' } };
      const dto = { currentPassword: 'oldPass', newPassword: 'newPass' };
      const expected = { success: true, msg: 'Password updated successfully' };
      authService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword(mockReq as any, dto);

      expect(authService.changePassword).toHaveBeenCalledWith('user123', dto);
      expect(result).toEqual(expected);
    });
  });
});
