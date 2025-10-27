export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          owner_id: string
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          owner_id: string
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          owner_id?: string
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          parent_id: string | null
          order: number
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content: string
          parent_id?: string | null
          order?: number
          created_by: string
          created_at?: string
          updated_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string
          parent_id?: string | null
          order?: number
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
      page_versions: {
        Row: {
          id: string
          page_id: string
          content: string
          created_by: string
          created_at: string
          changes_summary: string
        }
        Insert: {
          id?: string
          page_id: string
          content: string
          created_by: string
          created_at?: string
          changes_summary: string
        }
        Update: {
          id?: string
          page_id?: string
          content?: string
          created_by?: string
          created_at?: string
          changes_summary?: string
        }
      }
      kanban_boards: {
        Row: {
          id: string
          project_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      kanban_columns: {
        Row: {
          id: string
          board_id: string
          name: string
          order: number
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          order?: number
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          order?: number
          color?: string | null
          created_at?: string
        }
      }
      kanban_cards: {
        Row: {
          id: string
          column_id: string
          board_id: string
          title: string
          description: string
          linked_page_id: string | null
          assignee_id: string | null
          due_date: string | null
          order: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          column_id: string
          board_id: string
          title: string
          description: string
          linked_page_id?: string | null
          assignee_id?: string | null
          due_date?: string | null
          order?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          column_id?: string
          board_id?: string
          title?: string
          description?: string
          linked_page_id?: string | null
          assignee_id?: string | null
          due_date?: string | null
          order?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      card_labels: {
        Row: {
          id: string
          card_id: string
          label_id: string
        }
        Insert: {
          id?: string
          card_id: string
          label_id: string
        }
        Update: {
          id?: string
          card_id?: string
          label_id?: string
        }
      }
      labels: {
        Row: {
          id: string
          project_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          project_id: string
          user_id: string
          action: 'created' | 'edited' | 'deleted' | 'moved' | 'assigned' | 'mentioned' | 'joined'
          resource_type: 'page' | 'card' | 'member' | 'project'
          resource_id: string
          resource_name: string
          changes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          action: 'created' | 'edited' | 'deleted' | 'moved' | 'assigned' | 'mentioned' | 'joined'
          resource_type: 'page' | 'card' | 'member' | 'project'
          resource_id: string
          resource_name: string
          changes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          action?: 'created' | 'edited' | 'deleted' | 'moved' | 'assigned' | 'mentioned' | 'joined'
          resource_type?: 'page' | 'card' | 'member' | 'project'
          resource_id?: string
          resource_name?: string
          changes?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'mention' | 'assignment' | 'update'
          message: string
          resource_id: string
          resource_type: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'mention' | 'assignment' | 'update'
          message: string
          resource_id: string
          resource_type: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'mention' | 'assignment' | 'update'
          message?: string
          resource_id?: string
          resource_type?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
