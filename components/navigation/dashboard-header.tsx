'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/lib/stores/user-store'
import { Moon, Sun, Bell, LogOut, Settings, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/lib/stores/ui-store'
import { useState, useEffect } from 'react'
import { usePageLoading } from '@/hooks/use-page-loading'
import { SearchBar } from './search-bar'

export function DashboardHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { currentUser, logout } = useUserStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { startLoading, stopLoading } = usePageLoading()

  const handleLogout = async () => {
    startLoading()
    logout()
    await router.push('/login')
    // Stop loader after navigation
    setTimeout(() => {
      stopLoading()
    }, 500)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="border-b border-border bg-card h-16 flex items-center justify-between px-8">
      {/* Left side - Menu and Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="hidden md:flex w-full">
          <SearchBar />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* Theme Toggle */}
        <Button size="icon" variant="ghost" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="rounded-full"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                {currentUser?.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm">{currentUser?.name}</span>
            </div>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => router.push('/settings')}
                className="w-full px-4 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-left hover:bg-muted text-destructive flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
