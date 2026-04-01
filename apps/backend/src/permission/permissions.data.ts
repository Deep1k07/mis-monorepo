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
    name: 'entity:read:all',
    description: 'Can view all entities',
    category: 'Entity',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'entity:approve',
    description: 'Can approve entities',
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

  //Country permission
  {
    name: 'country:read',
    description: 'Can view countries',
    category: 'Country',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },

  // Application permissions
  {
    name: 'application:read',
    description: 'Can view own applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },

  // Cab and Standards permissions
  {
    name: 'cab-standard:read',
    description: 'Can view cab and standards',
    category: 'CertificationBody',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'cab:create',
    description: 'Can create cab',
    category: 'CertificationBody',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'standard:create',
    description: 'Can create standard',
    category: 'CertificationBody',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  }
];
