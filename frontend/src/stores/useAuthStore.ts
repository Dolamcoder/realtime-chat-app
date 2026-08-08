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
          const res = await authService.signUp(
            username,
            password,
            email,
            firstname,
            lastname,
          );
          toast.success(res.message || "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP!");
          return res;
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "Đăng ký thất bại";
          toast.error(errorMessage);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      verifyEmail: async (email, otp) => {
        try {
          set({ loading: true });
          const res = await authService.verifyEmail(email, otp);
          toast.success(res.message || "Xác thực email thành công");
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "Xác thực thất bại";
          toast.error(errorMessage);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      resendVerification: async (email) => {
        try {
          set({ loading: true });
          const res = await authService.resendVerification(email);
          toast.success(res.message || "Đã gửi lại mã OTP");
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "Gửi lại mã OTP thất bại";
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
          return data;
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "Đăng nhập thất bại";
          toast.error(errorMessage);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      forgotPassword: async (email) => {
        try {
          set({ loading: true });
          const res = await authService.forgotPassword(email);
          toast.success(res.message || "Mã OTP đã được gửi đến email");
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "Gửi yêu cầu thất bại";
          toast.error(errorMessage);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      resetPassword: async (email, otp, newPassword) => {
        try {
          set({ loading: true });
          const res = await authService.resetPassword(email, otp, newPassword);
          toast.success(res.message || "Đặt lại mật khẩu thành công");
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "Đặt lại mật khẩu thất bại";
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
          const msg = err?.response?.data?.message || "Lỗi khi cập nhật ảnh đại diện";
          toast.error(msg);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      requestChangePasswordOtp: async () => {
        try {
          set({ loading: true });
          const res = await authService.requestChangePasswordOtp();
          toast.success(res.message || "Đã gửi mã OTP thay đổi mật khẩu về email của bạn");
        } catch (err: any) {
          const msg = err?.response?.data?.message || "Lỗi khi yêu cầu mã OTP";
          toast.error(msg);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      changePassword: async (oldPassword, newPassword, otp) => {
        try {
          set({ loading: true });
          await authService.changePassword(oldPassword, newPassword, otp);
          toast.success("Đổi mật khẩu thành công. Email thông báo bảo mật đã được gửi!");
        } catch (err: any) {
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
