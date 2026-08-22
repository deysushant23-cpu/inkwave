import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthModalOpen: boolean;
  needsPhoneCapture: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
  setNeedsPhoneCapture: (needsCapture: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthModalOpen: false,
  needsPhoneCapture: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  setNeedsPhoneCapture: (needsCapture) => set({ needsPhoneCapture: needsCapture }),
}));
