import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserAccount } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
jest.mock('@otplib/v12-adapter', () => ({
  authenticator: {
    check: jest.fn(),
  },
}));

import { authenticator } from '@otplib/v12-adapter';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Record<string, jest.Mock>;
  let jwtService: { signAsync: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let emailService: { verifyOtp: jest.Mock };

  const mockUser = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    password: 'hashedPassword123',
    status: 'active',
    twoFA: { enabled: false, secret: '' },
    save: jest.fn(),
  };

  beforeEach(async () => {
    const selectChain = {
      select: jest.fn().mockReturnThis(),
    };

    userModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      }),
      findById: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    emailService = {
      verifyOtp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(UserAccount.name), useValue: userModel },
        { provide: JwtService, useValue: jwtService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'password123', code: '' };

    beforeEach(() => {
      // Set up the chained select calls to return mockUser
      const selectChain = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const selectChain = { select: jest.fn().mockResolvedValue(null) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if password is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user status is inactive', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const inactiveUser = { ...mockUser, status: 'inactive' };
      const selectChain = { select: jest.fn().mockResolvedValue(inactiveUser) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user status is suspended', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const suspendedUser = { ...mockUser, status: 'suspended' };
      const selectChain = { select: jest.fn().mockResolvedValue(suspendedUser) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user status is rejected', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const rejectedUser = { ...mockUser, status: 'rejected' };
      const selectChain = { select: jest.fn().mockResolvedValue(rejectedUser) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should return 2FA prompt when 2FA is enabled and no code provided', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const twoFaUser = { ...mockUser, twoFA: { enabled: true, secret: 'secret123' } };
      const selectChain = { select: jest.fn().mockResolvedValue(twoFaUser) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      const result = await service.login({ ...loginDto, code: '' });

      expect(result.success).toBe(false);
      expect(result.twoFa).toBe(true);
    });

    it('should throw NotFoundException if 2FA code is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (authenticator.check as jest.Mock).mockReturnValue(false);
      const twoFaUser = { ...mockUser, twoFA: { enabled: true, secret: 'secret123' } };
      const selectChain = { select: jest.fn().mockResolvedValue(twoFaUser) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      await expect(
        service.login({ ...loginDto, code: '123456' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return token directly in non-production environment', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.otpRequired).toBe(false);
      expect(result.token).toEqual({ access_token: 'mock-jwt-token' });

      process.env.NODE_ENV = originalEnv;
    });

    it('should emit user:login event and return otpRequired in production', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const result = await service.login(loginDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith('user:login', {
        email: mockUser.email,
        userId: '507f1f77bcf86cd799439011',
      });
      expect(result.success).toBe(true);
      expect(result.otpRequired).toBe(true);
      expect(result.userId).toBe('507f1f77bcf86cd799439011');

      process.env.NODE_ENV = originalEnv;
    });

    it('should pass 2FA check with valid code', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (authenticator.check as jest.Mock).mockReturnValue(true);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const twoFaUser = { ...mockUser, twoFA: { enabled: true, secret: 'secret123' } };
      const selectChain = { select: jest.fn().mockResolvedValue(twoFaUser) };
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(selectChain),
      });

      const result = await service.login({ ...loginDto, code: '123456' });

      expect(authenticator.check).toHaveBeenCalledWith('123456', 'secret123');
      expect(result.success).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('verifyOtp', () => {
    it('should throw BadRequestException if OTP is invalid', async () => {
      emailService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp('userId', '000000')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found after OTP verification', async () => {
      emailService.verifyOtp.mockResolvedValue(true);
      userModel.findById.mockResolvedValue(null);

      await expect(service.verifyOtp('userId', '123456')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return success with token on valid OTP', async () => {
      emailService.verifyOtp.mockResolvedValue(true);
      userModel.findById.mockResolvedValue(mockUser);

      const result = await service.verifyOtp('userId', '123456');

      expect(result.success).toBe(true);
      expect(result.token).toEqual({ access_token: 'mock-jwt-token' });
    });
  });

  describe('resendOtp', () => {
    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(service.resendOtp('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should emit user-login event and return success', async () => {
      userModel.findById.mockResolvedValue(mockUser);

      const result = await service.resendOtp('userId');

      expect(eventEmitter.emit).toHaveBeenCalledWith('user-login', {
        email: mockUser.email,
        userId: '507f1f77bcf86cd799439011',
      });
      expect(result.success).toBe(true);
      expect(result.msg).toBe('OTP sent successfully');
    });
  });

  describe('updateProfile', () => {
    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('invalidId', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update firstName only', async () => {
      const user = { ...mockUser, save: jest.fn() };
      userModel.findById.mockResolvedValue(user);

      const result = await service.updateProfile('userId', {
        firstName: 'Jane',
      });

      expect(user.firstName).toBe('Jane');
      expect(user.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.user.firstName).toBe('Jane');
    });

    it('should update multiple fields', async () => {
      const user = { ...mockUser, save: jest.fn() };
      userModel.findById.mockResolvedValue(user);

      const result = await service.updateProfile('userId', {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
      });

      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      expect(user.phone).toBe('9876543210');
      expect(user.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should not change fields that are not provided', async () => {
      const user = { ...mockUser, save: jest.fn() };
      userModel.findById.mockResolvedValue(user);

      await service.updateProfile('userId', {});

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.phone).toBe('1234567890');
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'oldPass123',
      newPassword: 'newPass123',
    };

    beforeEach(() => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ ...mockUser, save: jest.fn() }),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.changePassword('invalidId', changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('userId', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash new password and save', async () => {
      const user = { ...mockUser, save: jest.fn() };
      userModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      const result = await service.changePassword('userId', changePasswordDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPass123', 'salt');
      expect(user.password).toBe('newHashedPassword');
      expect(user.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.msg).toBe('Password updated successfully');
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token with correct payload', async () => {
      const result = await service.generateToken(mockUser);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { userId: mockUser._id, email: mockUser.email },
        { expiresIn: '1d' },
      );
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });
  });
});
