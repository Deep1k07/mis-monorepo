import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),

      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) ?? false;
      },

      fetchUser: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
            { credentials: "include" },
          );
          if (res.ok) {
            const user = await res.json();
            set({ user, isLoading: false });
          } else {
            set({ user: null, isLoading: false });
            if (res.status === 401) {
              // token expired or invalid — redirect to login
              if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
              }
            }
          }
        } catch {
          set({ user: null, isLoading: false });
        }
      },

      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

/** Call from anywhere (outside React) when a 401 is received */
export function handleUnauthorized() {
  const { user, logout } = useAuthStore.getState();
  if (!user) return; // already logged out
  logout();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}
