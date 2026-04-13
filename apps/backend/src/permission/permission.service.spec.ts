import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getModelToken } from '@nestjs/mongoose';
import { Permission } from './schema/permission.schema';
import { BadRequestException } from '@nestjs/common';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionModel: Record<string, jest.Mock>;

  const mockPermissions = [
    { name: 'user:create', description: 'Create users', category: 'User Management' },
    { name: 'user:read', description: 'Read users', category: 'User Management' },
    { name: 'role:create', description: 'Create roles', category: 'Role Management' },
  ];

  const mockRequest = (permissions: string[]) =>
    ({
      user: {
        userId: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'admin',
        permissions,
      },
    }) as any;

  beforeEach(async () => {
    permissionModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      exec: jest.fn(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: getModelToken(Permission.name), useValue: permissionModel },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPermissions', () => {
    it('should return all permissions when user has permission:read', async () => {
      permissionModel.exec.mockResolvedValue(mockPermissions);

      const result = await service.getAllPermissions(
        mockRequest(['permission:read']),
      );

      expect(permissionModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockPermissions);
    });

    it('should return empty array when user lacks permission:read', async () => {
      const result = await service.getAllPermissions(
        mockRequest(['some:other']),
      );

      expect(permissionModel.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      permissionModel.sort.mockResolvedValue(mockPermissions);
      permissionModel.countDocuments.mockResolvedValue(3);
    });

    it('should return paginated permissions when user has manage:users', async () => {
      const result = await service.getAll(
        mockRequest(['manage:users']),
        1,
        10,
      );

      expect(result.data).toEqual(mockPermissions);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should return paginated permissions when user has permission:read', async () => {
      const result = await service.getAll(
        mockRequest(['permission:read']),
        1,
        10,
      );

      expect(result.data).toEqual(mockPermissions);
      expect(result.total).toBe(3);
    });

    it('should return empty result when user lacks required permissions', async () => {
      const result = await service.getAll(
        mockRequest(['some:other']),
        1,
        10,
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should apply search filter across name, description, and category', async () => {
      await service.getAll(
        mockRequest(['manage:users']),
        1,
        10,
        'user',
      );

      const findCall = permissionModel.find.mock.calls[0][0];
      expect(findCall.$or).toBeDefined();
      expect(findCall.$or).toHaveLength(3);
      expect(findCall.$or[0].name).toBeInstanceOf(RegExp);
      expect(findCall.$or[1].description).toBeInstanceOf(RegExp);
      expect(findCall.$or[2].category).toBeInstanceOf(RegExp);
    });

    it('should escape special regex characters in search', async () => {
      await service.getAll(
        mockRequest(['manage:users']),
        1,
        10,
        'user.create',
      );

      const findCall = permissionModel.find.mock.calls[0][0];
      const regexSource = findCall.$or[0].name.source;
      expect(regexSource).toContain('user\\.create');
    });

    it('should calculate correct skip for pagination', async () => {
      await service.getAll(mockRequest(['manage:users']), 3, 5);

      expect(permissionModel.skip).toHaveBeenCalledWith(10); // (3-1) * 5
      expect(permissionModel.limit).toHaveBeenCalledWith(5);
    });

    it('should calculate correct totalPages', async () => {
      permissionModel.countDocuments.mockResolvedValue(25);

      const result = await service.getAll(
        mockRequest(['manage:users']),
        1,
        10,
      );

      expect(result.totalPages).toBe(3); // Math.ceil(25/10)
    });

    it('should sort by category then name', async () => {
      await service.getAll(mockRequest(['manage:users']), 1, 10);

      expect(permissionModel.sort).toHaveBeenCalledWith({
        category: 1,
        name: 1,
      });
    });

    it('should not apply search filter when search is undefined', async () => {
      await service.getAll(mockRequest(['manage:users']), 1, 10);

      const findCall = permissionModel.find.mock.calls[0][0];
      expect(findCall.$or).toBeUndefined();
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'user:delete',
      description: 'Delete users',
      category: 'User Management',
    };

    it('should throw BadRequestException when user lacks permissions', async () => {
      await expect(
        service.create(mockRequest(['some:other']), createDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when permission name already exists', async () => {
      permissionModel.findOne.mockResolvedValue({ name: 'user:delete' });

      await expect(
        service.create(mockRequest(['manage:users']), createDto),
      ).rejects.toThrow('Permission with this name already exists');
    });

    it('should create permission when user has manage:users', async () => {
      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.create.mockResolvedValue({ ...createDto, _id: 'new-id' });

      const result = await service.create(
        mockRequest(['manage:users']),
        createDto,
      );

      expect(permissionModel.findOne).toHaveBeenCalledWith({
        name: 'user:delete',
      });
      expect(permissionModel.create).toHaveBeenCalledWith(createDto);
      expect(result._id).toBe('new-id');
    });

    it('should create permission when user has permission:create', async () => {
      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.create.mockResolvedValue({ ...createDto, _id: 'new-id' });

      const result = await service.create(
        mockRequest(['permission:create']),
        createDto,
      );

      expect(result._id).toBe('new-id');
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'user:delete-updated',
      description: 'Updated description',
    };

    const existingPermission = {
      _id: 'perm-id',
      name: 'user:delete',
      description: 'Delete users',
    };

    it('should throw BadRequestException when user lacks permissions', async () => {
      await expect(
        service.update(mockRequest(['some:other']), 'perm-id', updateDto as any),
      ).rejects.toThrow('You do not have permission to update a permission');
    });

    it('should throw BadRequestException when permission not found', async () => {
      permissionModel.findById.mockResolvedValue(null);

      await expect(
        service.update(mockRequest(['manage:users']), 'perm-id', updateDto as any),
      ).rejects.toThrow('Permission not found');
    });

    it('should throw BadRequestException when new name already exists', async () => {
      permissionModel.findById.mockResolvedValue(existingPermission);
      permissionModel.findOne.mockResolvedValue({ name: 'user:delete-updated' });

      await expect(
        service.update(mockRequest(['manage:users']), 'perm-id', updateDto as any),
      ).rejects.toThrow('Permission with this name already exists');
    });

    it('should update permission successfully', async () => {
      const updated = { ...existingPermission, ...updateDto };
      permissionModel.findById.mockResolvedValue(existingPermission);
      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.update(
        mockRequest(['manage:users']),
        'perm-id',
        updateDto as any,
      );

      expect(permissionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'perm-id',
        { $set: updateDto },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(updated);
    });

    it('should update when user has permission:update', async () => {
      permissionModel.findById.mockResolvedValue(existingPermission);
      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.findByIdAndUpdate.mockResolvedValue(existingPermission);

      await service.update(
        mockRequest(['permission:update']),
        'perm-id',
        updateDto as any,
      );

      expect(permissionModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should skip name uniqueness check when name is unchanged', async () => {
      const sameNameDto = { name: 'user:delete', description: 'New desc' };
      permissionModel.findById.mockResolvedValue(existingPermission);
      permissionModel.findByIdAndUpdate.mockResolvedValue(existingPermission);

      await service.update(
        mockRequest(['manage:users']),
        'perm-id',
        sameNameDto as any,
      );

      expect(permissionModel.findOne).not.toHaveBeenCalled();
      expect(permissionModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
