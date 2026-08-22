import { create } from 'zustand';

interface UiState {
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (isOpen: boolean) => void;
  toggleAdminSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  adminSidebarOpen: false,
  setAdminSidebarOpen: (isOpen) => set({ adminSidebarOpen: isOpen }),
  toggleAdminSidebar: () => set((state) => ({ adminSidebarOpen: !state.adminSidebarOpen })),
}));
