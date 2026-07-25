const ALL_PERMISSIONS = [
  "products:read", "products:create", "products:update", "products:delete",
  "sales:read", "sales:create", "sales:refund", "sales:cancel",
  "inventory:read", "inventory:adjust", "inventory:transfer",
  "reports:read", "reports:financial",
  "users:manage", "settings:manage", "pos:access",
  "purchases:read", "purchases:create", "purchases:approve",
  "customers:manage", "suppliers:manage",
  "expenses:manage",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

const BUSINESS_PERMISSIONS: Permission[] = [
  "products:read", "products:create", "products:update", "products:delete",
  "sales:read", "sales:create", "sales:refund", "sales:cancel",
  "inventory:read", "inventory:adjust", "inventory:transfer",
  "reports:read", "reports:financial",
  "users:manage", "settings:manage", "pos:access",
  "purchases:read", "purchases:create", "purchases:approve",
  "customers:manage", "suppliers:manage",
  "expenses:manage",
];

const MANAGER_PERMISSIONS: Permission[] = [
  "products:read", "products:create", "products:update",
  "sales:read", "sales:create", "sales:refund", "sales:cancel",
  "inventory:read", "inventory:adjust",
  "reports:read",
  "pos:access",
  "purchases:create",
  "customers:manage", "suppliers:manage",
  "expenses:manage",
];

const CASHIER_PERMISSIONS: Permission[] = [
  "pos:access",
  "sales:create",
  "sales:read",
  "products:read",
  "customers:manage",
];

const ACCOUNTANT_PERMISSIONS: Permission[] = [
  "reports:read", "reports:financial",
  "expenses:manage",
  "sales:read",
  "products:read",
  "inventory:read",
];

const INVENTORY_OFFICER_PERMISSIONS: Permission[] = [
  "inventory:read", "inventory:adjust", "inventory:transfer",
  "products:read", "products:create", "products:update",
  "purchases:create",
];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ALL_PERMISSIONS as unknown as Permission[],
  business_owner: BUSINESS_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  cashier: CASHIER_PERMISSIONS,
  accountant: ACCOUNTANT_PERMISSIONS,
  inventory_officer: INVENTORY_OFFICER_PERMISSIONS,
};

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  return permissions.includes(permission as Permission);
}

export function getPermissionsForRole(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}
