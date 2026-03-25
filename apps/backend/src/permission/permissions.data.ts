import { PermissionStatus, PermissionType } from './schema/permission.schema';

export const defaultPermissions = [
  {
    name: 'entity:create',
    description: 'Can create new entities',
    category: 'Entity',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'entity:read',
    description: 'Can view entities',
    category: 'Entity',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'entity:update',
    description: 'Can update existing entities',
    category: 'Entity',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'country:read',
    description: 'Can view countries',
    category: 'Country',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
];
