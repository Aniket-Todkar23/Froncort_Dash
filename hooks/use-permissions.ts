import { useUserStore } from '@/lib/stores/user-store'
import { canPerformAction } from '@/lib/utils/permissions'
import type { Permissions } from '@/lib/types/database'

export function usePermissions(): Permissions {
  const { currentRole } = useUserStore()

  if (!currentRole) {
    return {
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canViewActivity: false,
      canViewVersions: false,
      canAssignCards: false,
    }
  }

  return {
    canEdit: canPerformAction(currentRole, 'canEdit'),
    canDelete: canPerformAction(currentRole, 'canDelete'),
    canManageMembers: canPerformAction(currentRole, 'canManageMembers'),
    canViewActivity: canPerformAction(currentRole, 'canViewActivity'),
    canViewVersions: canPerformAction(currentRole, 'canViewVersions'),
    canAssignCards: canPerformAction(currentRole, 'canAssignCards'),
  }
}
