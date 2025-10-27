import { type UserRole, type Permissions } from '@/lib/types/database'

export const PERMISSION_MATRIX: Record<UserRole, Permissions> = {
  owner: {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canViewActivity: true,
    canViewVersions: true,
    canAssignCards: true,
  },
  admin: {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canViewActivity: true,
    canViewVersions: true,
    canAssignCards: true,
  },
  editor: {
    canEdit: true,
    canDelete: false,
    canManageMembers: false,
    canViewActivity: true,
    canViewVersions: true,
    canAssignCards: true,
  },
  viewer: {
    canEdit: false,
    canDelete: false,
    canManageMembers: false,
    canViewActivity: true,
    canViewVersions: true,
    canAssignCards: false,
  },
}

export function getPermissions(role: UserRole): Permissions {
  return PERMISSION_MATRIX[role]
}

export function canPerformAction(role: UserRole, action: keyof Permissions): boolean {
  return getPermissions(role)[action]
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  }
  return labels[role]
}
