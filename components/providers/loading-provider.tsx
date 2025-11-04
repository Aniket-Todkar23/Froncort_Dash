'use client'

import { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { PageLoader } from '@/components/Loaders/PageLoader'
import { useLoadingStore } from '@/hooks/use-page-loading'

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const isLoading = useLoadingStore((state) => state.isLoading)
  const startLoading = useLoadingStore((state) => state.startLoading)
  const stopLoading = useLoadingStore((state) => state.stopLoading)

  useEffect(() => {
    setMounted(true)
    // Only show loader if page is actually loading
    if (document.readyState === 'loading') {
      startLoading()
    }
  }, [startLoading])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let minLoadingTime: NodeJS.Timeout
    let loadingStartTime: number

    // Ensure minimum 1 second loading duration for smooth UX
    const ensureMinimumLoadingDuration = (callback: () => void) => {
      const elapsedTime = Date.now() - loadingStartTime
      const remainingTime = Math.max(0, 1000 - elapsedTime)
      
      if (remainingTime > 0) {
        minLoadingTime = setTimeout(callback, remainingTime)
      } else {
        callback()
      }
    }

    // Wait for page to be fully interactive
    const waitForPageLoad = () => {
      // Clear any existing timeout
      clearTimeout(timeout)
      
      // Use requestIdleCallback for better performance detection
      if ('requestIdleCallback' in window) {
        timeout = window.requestIdleCallback(() => {
          ensureMinimumLoadingDuration(() => stopLoading())
        }, { timeout: 5000 }) as unknown as NodeJS.Timeout
      } else {
        // Fallback: wait for document to be interactive and a bit more
        if (document.readyState === 'complete') {
          ensureMinimumLoadingDuration(() => stopLoading())
        } else {
          timeout = setTimeout(() => {
            ensureMinimumLoadingDuration(() => stopLoading())
          }, 500)
        }
      }
    }

    // Intercept all link clicks and form submissions
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a')
      if (target && target.hostname === window.location.hostname) {
        loadingStartTime = Date.now()
        startLoading()
        // Give page time to navigate, then wait for actual load
        setTimeout(() => {
          if (document.readyState === 'complete') {
            ensureMinimumLoadingDuration(() => stopLoading())
          } else {
            waitForPageLoad()
          }
        }, 100)
      }
    }

    const handleFormSubmit = () => {
      loadingStartTime = Date.now()
      startLoading()
      setTimeout(() => {
        if (document.readyState === 'complete') {
          ensureMinimumLoadingDuration(() => stopLoading())
        } else {
          waitForPageLoad()
        }
      }, 100)
    }

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      loadingStartTime = Date.now()
      startLoading()
      waitForPageLoad()
    }

    document.addEventListener('click', handleLinkClick)
    document.addEventListener('submit', handleFormSubmit)
    window.addEventListener('popstate', handlePopState)

    // Stop loading when page is ready
    const handleDOMContentLoaded = () => {
      waitForPageLoad()
    }

    const handleLoadComplete = () => {
      stopLoading()
    }

    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
    window.addEventListener('load', handleLoadComplete)
    
    // Also check if already interactive
    if (document.readyState === 'complete') {
      stopLoading()
    }

    return () => {
      document.removeEventListener('click', handleLinkClick)
      document.removeEventListener('submit', handleFormSubmit)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      window.removeEventListener('load', handleLoadComplete)
      clearTimeout(timeout)
      clearTimeout(minLoadingTime)
    }
  }, [startLoading, stopLoading])

  if (!mounted) return <>{children}</>

  return (
    <>
      <PageLoader isLoading={isLoading} />
      {children}
    </>
  )
}
