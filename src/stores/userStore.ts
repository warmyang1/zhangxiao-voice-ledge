import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserSettings, Platform, PlatformInfo } from '../types';
import { PLATFORMS } from '../utils/platforms';

interface UserStore {
  user: UserProfile | null;
  platforms: PlatformInfo[];
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  connectPlatform: (platformId: Platform) => void;
  disconnectPlatform: (platformId: Platform) => void;
  syncPlatform: (platformId: Platform) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      platforms: PLATFORMS,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      updateSettings: (settings) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, settings: { ...state.user.settings, ...settings } }
            : null,
        }));
      },

      connectPlatform: (platformId) => {
        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === platformId ? { ...p, connected: true, lastSync: new Date() } : p
          ),
        }));
      },

      disconnectPlatform: (platformId) => {
        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === platformId ? { ...p, connected: false, lastSync: undefined } : p
          ),
        }));
      },

      syncPlatform: (platformId) => {
        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === platformId ? { ...p, lastSync: new Date() } : p
          ),
        }));
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'voice-ledger-user',
      partialize: (state) => ({
        user: state.user,
        platforms: state.platforms,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
