import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

let refreshPromise: Promise<any> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,
      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        localStorage.clear();
          useChatStore.getState().reset();
      },
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      signUp: async (username, password, email, firstname, lastname) => {
        try {
          set({ loading: true });
          await authService.signUp(
            username,
            password,
            email,
            firstname,
            lastname,
          );
          toast.success("Đăng ký thành công");
        } catch (err: any) {
          console.error(err);
          const errorMessage = err?.message || "Đăng ký thất bại";
          toast.error(errorMessage);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      signIn: async (username, password) => {
        try {
          localStorage.clear();
          useChatStore.getState().reset();
          set({ loading: true });
          const data = await authService.signIn(username, password);
          get().setAccessToken(data.accessToken);
          await get().fetchMe();
          await useChatStore.getState().fetchConversations();
          toast.success("Đăng nhập thành công");
        } catch (err: any) {
          console.error(err);
          const errorMessage = err?.message || "Đăng nhập thất bại";
          toast.error(errorMessage);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          await authService.signOut();
          get().clearState();
          toast.success("Đăng xuất thành công");
        } catch (err) {
          console.error(err);
          toast.error("Lỗi khi logout! Hãy thử lại");
        } finally {
          set({ loading: false });
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();
          set({ user });
        } catch (err) {
          console.error(err);
          toast.error("Lỗi lấy thông tin user! Hãy thử đăng nhập lại");
        } finally {
          set({ loading: false });
        }
      },
      refresh: async () => {
        if (refreshPromise) {
          return refreshPromise;
        }

        refreshPromise = (async () => {
          try {
            set({ loading: true });
            const accessToken = await authService.refresh();
            const { user, fetchMe, setAccessToken } = get();
            setAccessToken(accessToken);
            if (!user) {
              await fetchMe();
            }
            return accessToken;
          } catch (err) {
            console.error(err);
            if (get().user) {
              toast.error("Hết phiên đăng nhập! vui lòng đăng nhập lại");
            }
            get().clearState();
            throw err;
          } finally {
            set({ loading: false });
            refreshPromise = null;
          }
        })();

        return refreshPromise;
      },
      updateProfile: async (displayName, bio, phone) => {
        try {
          set({ loading: true });
          const res = await authService.updateProfile(displayName, bio, phone);
          set({ user: res.user });
          toast.success("Cập nhật thông tin thành công");
        } catch (err: any) {
          console.error(err);
          const msg = err?.response?.data?.message || "Lỗi khi cập nhật thông tin";
          toast.error(msg);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      updateAvatar: async (file) => {
        try {
          set({ loading: true });
          const res = await authService.updateAvatar(file);
          set({ user: res.user });
          toast.success("Cập nhật ảnh đại diện thành công");
        } catch (err: any) {
          console.error(err);
          const msg = err?.response?.data?.message || "Lỗi khi cập nhật ảnh đại diện";
          toast.error(msg);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      changePassword: async (oldPassword, newPassword) => {
        try {
          set({ loading: true });
          await authService.changePassword(oldPassword, newPassword);
          toast.success("Đổi mật khẩu thành công");
        } catch (err: any) {
          console.error(err);
          const msg = err?.response?.data?.message || "Lỗi khi đổi mật khẩu";
          toast.error(msg);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
