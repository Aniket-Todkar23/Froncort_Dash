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
    <header className="border-b border-border/50 bg-gradient-to-r from-card via-card to-card/95 h-16 flex items-center justify-between px-8 shadow-sm backdrop-blur-sm">
      {/* Left side - Menu and Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hover-lift rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:flex w-full">
          <SearchBar />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative group">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 hover-lift animate-pulse-subtle"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse group-hover:animate-glow-pulse" />
        </div>

        {/* Theme Toggle */}
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={toggleTheme}
          className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 hover-lift group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 via-primary/20 to-transparent -left-full group-hover:left-full transition-all duration-500 dark:via-primary/25" />
          {theme === 'light' ? (
            <Moon className="h-5 w-5 relative z-10" />
          ) : (
            <Sun className="h-5 w-5 relative z-10" />
          )}
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="rounded-full hover:bg-primary/10 transition-all duration-200 hover-lift group"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-semibold text-primary shadow-sm group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-200 group-hover:from-primary/40 group-hover:to-primary/20">
                {currentUser?.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{currentUser?.name}</span>
            </div>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border/50 rounded-xl shadow-xl py-1 z-50 animate-in zoom-in-95 duration-200 backdrop-blur-sm">
              <button
                onClick={() => router.push('/settings')}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-primary/10 hover:text-primary flex items-center gap-3 transition-all duration-150 group/item font-medium"
              >
                <Settings className="h-4 w-4 group-hover/item:rotate-90 transition-transform duration-300" />
                Settings
              </button>
              <div className="border-t border-border/40" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-destructive/10 text-destructive hover:text-destructive flex items-center gap-3 transition-all duration-150 group/item font-medium"
              >
                <LogOut className="h-4 w-4 group-hover/item:translate-x-1 transition-transform duration-300" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
