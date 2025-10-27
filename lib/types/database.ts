export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  description: string
  ownerId: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  members: ProjectMember[]
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  user: User
  role: UserRole
  joinedAt: Date
}

export interface Page {
  id: string
  projectId: string
  title: string
  content: string
  parentId?: string
  order: number
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
  versions: PageVersion[]
}

export interface PageVersion {
  id: string
  pageId: string
  content: string
  createdBy: string
  createdAt: Date
  changesSummary: string
}

export interface KanbanBoard {
  id: string
  projectId: string
  name: string
  columns: KanbanColumn[]
  createdAt: Date
  updatedAt: Date
}

export interface KanbanColumn {
  id: string
  boardId: string
  name: string
  order: number
  color?: string
  createdAt: Date
}

export interface KanbanCard {
  id: string
  columnId: string
  boardId: string
  title: string
  description: string
  labels: Label[]
  assigneeId?: string
  assignee?: User
  linkedPageId?: string
  dueDate?: Date
  order: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Label {
  id: string
  projectId: string
  name: string
  color: string
  createdAt: Date
}

export interface Activity {
  id: string
  projectId: string
  userId: string
  user: User
  action: ActivityAction
  resourceType: 'page' | 'card' | 'member' | 'project'
  resourceId: string
  resourceName: string
  changes?: Record<string, any>
  createdAt: Date
}

export type ActivityAction =
  | 'created'
  | 'edited'
  | 'deleted'
  | 'moved'
  | 'assigned'
  | 'mentioned'
  | 'joined'

export interface Notification {
  id: string
  userId: string
  type: 'mention' | 'assignment' | 'update'
  message: string
  resourceId: string
  resourceType: string
  read: boolean
  createdAt: Date
}

export interface PresenceUser {
  userId: string
  user: User
  cursorPosition: number
  selectedText?: { from: number; to: number }
  color: string
  lastUpdated: Date
}

export interface Permissions {
  canEdit: boolean
  canDelete: boolean
  canManageMembers: boolean
  canViewActivity: boolean
  canViewVersions: boolean
  canAssignCards: boolean
}
