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
    name: 'manage:application:initial',
    description: 'Can manage initial applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:read',
    description: 'Can view own applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:read:all',
    description: 'Can view all applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:read:draft',
    description: 'Can view draft applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:approve:draft',
    description: 'Can approve draft applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:reject:draft',
    description: 'Can reject draft applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:read:final',
    description: 'Can view final applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:approve:final',
    description: 'Can approve final applications',
    category: 'Application',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'application:reject:final',
    description: 'Can reject final applications',
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
  },

  // BA permissions
  {
    name: 'ba:read:all',
    description: 'Can view all BAs',
    category: 'BA',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'ba:read',
    description: 'Can view own BAs',
    category: 'BA',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'ba:create',
    description: 'Can create BA',
    category: 'BA',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'ba:update',
    description: 'Can update BA',
    category: 'BA',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },

  // User management permissions
  {
    name: 'manage:users', // must for manage user tab-> permissions/roles/users
    description: 'Can manage users',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  // Permission management

  {
    name: 'permission:read',
    description: 'Can view permissions',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'permission:create',
    description: 'Can create permissions',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'permission:update',
    description: 'Can update permissions',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },

  // Role management
  {
    name: 'role:create',
    description: 'Can create roles',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'role:update',
    description: 'Can update roles',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'role:read',
    description: 'Can view roles',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },

  // User management
  {
    name: 'user:create',
    description: 'Can create users',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'user:read',
    description: 'Can view users',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
  {
    name: 'user:update',
    description: 'Can update users',
    category: 'User Management',
    status: PermissionStatus.ACTIVE,
    type: PermissionType.DEFAULT,
  },
];
