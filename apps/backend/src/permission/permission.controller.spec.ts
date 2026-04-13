import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';

jest.mock('@otplib/v12-adapter', () => ({
  authenticator: { check: jest.fn() },
}));

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { UserAccount } from '../auth/schema/user.schema';

describe('PermissionController', () => {
  let controller: PermissionController;
  let permissionService: Record<string, jest.Mock>;

  const mockReq = {
    user: {
      userId: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      permissions: ['manage:users'],
    },
  } as any;

  beforeEach(async () => {
    permissionService = {
      getAllPermissions: jest.fn(),
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        { provide: PermissionService, useValue: permissionService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: getModelToken(UserAccount.name), useValue: {} },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPermissions', () => {
    it('should call permissionService.getAllPermissions with request', async () => {
      const expected = [{ name: 'user:create' }, { name: 'user:read' }];
      permissionService.getAllPermissions.mockResolvedValue(expected);

      const result = await controller.getAllPermissions(mockReq);

      expect(permissionService.getAllPermissions).toHaveBeenCalledWith(mockReq);
      expect(result).toEqual(expected);
    });
  });

  describe('getAll', () => {
    it('should call permissionService.getAll with pagination params', async () => {
      const expected = {
        data: [{ name: 'user:create' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      permissionService.getAll.mockResolvedValue(expected);
      const query = { page: 1, limit: 10, search: 'user' };

      const result = await controller.getAll(mockReq, query as any);

      expect(permissionService.getAll).toHaveBeenCalledWith(mockReq, 1, 10, 'user');
      expect(result).toEqual(expected);
    });

    it('should handle query without search', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      permissionService.getAll.mockResolvedValue(expected);
      const query = { page: 1, limit: 10 };

      const result = await controller.getAll(mockReq, query as any);

      expect(permissionService.getAll).toHaveBeenCalledWith(
        mockReq,
        1,
        10,
        undefined,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call permissionService.create with request and body', async () => {
      const body = { name: 'user:delete', description: 'Delete users' };
      const expected = { ...body, _id: 'new-id' };
      permissionService.create.mockResolvedValue(expected);

      const result = await controller.create(mockReq, body as any);

      expect(permissionService.create).toHaveBeenCalledWith(mockReq, body);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call permissionService.update with request, id and body', async () => {
      const body = { name: 'user:delete-updated' };
      const expected = { ...body, _id: 'perm-id' };
      permissionService.update.mockResolvedValue(expected);

      const result = await controller.update(mockReq, 'perm-id', body as any);

      expect(permissionService.update).toHaveBeenCalledWith(
        mockReq,
        'perm-id',
        body,
      );
      expect(result).toEqual(expected);
    });
  });
});
