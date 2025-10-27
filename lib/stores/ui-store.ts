import { create } from 'zustand'

interface UIStoreState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  activeTab: 'docs' | 'board' | 'activity' | 'settings'
  selectedCardId: string | null
  showVersionHistory: boolean
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: 'docs' | 'board' | 'activity' | 'settings') => void
  setSelectedCardId: (id: string | null) => void
  setShowVersionHistory: (show: boolean) => void
}

export const useUIStore = create<UIStoreState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  activeTab: 'docs',
  selectedCardId: null,
  showVersionHistory: false,
  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCardId: (id) => set({ selectedCardId: id }),
  setShowVersionHistory: (show) => set({ showVersionHistory: show }),
}))
