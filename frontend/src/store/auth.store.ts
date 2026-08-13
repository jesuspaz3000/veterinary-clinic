import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthResponse } from "@/features/auth/types/authTypes";
import { Permission } from "@/shared/config/permissions";

export interface AuthState {
    user: AuthResponse | null;
    _hasHydrated: boolean;

    setHasHydrated: (value: boolean) => void;
    setSession: (user: AuthResponse) => void;
    clearSession: () => void;

    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            _hasHydrated: false,

            setHasHydrated: (value) => set({ _hasHydrated: value }),

            setSession: (user) => {
                set({ user });
                if (typeof window !== "undefined") {
                    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
                }
            },

            clearSession: () => {
                set({ user: null });
                if (typeof window !== "undefined") {
                    document.cookie = "auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                }
            },

            hasPermission: (permission) =>
                get().user?.permissions?.includes(permission) ?? false,

            hasAnyPermission: (permissions) =>
                permissions.some((p) => get().user?.permissions?.includes(p) ?? false),

            hasAllPermissions: (permissions) =>
                permissions.every((p) => get().user?.permissions?.includes(p) ?? false),
        }),
        {
            name: "auth-session",
            storage: createJSONStorage(() => localStorage),
            /** Evita leer localStorage en SSR y estabiliza getServerSnapshot (React 19). */
            skipHydration: true,
            partialize: (state) => ({
                user: state.user,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
