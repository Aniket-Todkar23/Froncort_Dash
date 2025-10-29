'use client'

import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}))

export const usePageLoading = () => {
  return useLoadingStore((state) => ({
    isLoading: state.isLoading,
    startLoading: state.startLoading,
    stopLoading: state.stopLoading,
  }))
}
