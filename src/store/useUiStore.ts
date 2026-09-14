import { create } from 'zustand';

interface UiState {
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (isOpen: boolean) => void;
  toggleAdminSidebar: () => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (isOpen: boolean) => void;
  toggleSearchModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  adminSidebarOpen: false,
  setAdminSidebarOpen: (isOpen) => set({ adminSidebarOpen: isOpen }),
  toggleAdminSidebar: () => set((state) => ({ adminSidebarOpen: !state.adminSidebarOpen })),
  searchModalOpen: false,
  setSearchModalOpen: (isOpen) => set({ searchModalOpen: isOpen }),
  toggleSearchModal: () => set((state) => ({ searchModalOpen: !state.searchModalOpen })),
}));
