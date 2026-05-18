import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  signUp: async (username, password, email, firstname, lastname) => {
    try {
      set({ loading: true });
      await authService.signUp(username, password, email, firstname, lastname);
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
      set({ loading: true });
      const data = await authService.signIn(username, password);
      get().setAccessToken(data.accessToken );
      console.log("<<<<check data", data.accessToken);
      await get().fetchMe();
      toast.success("Đăng nhập thành công");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "Đăng nhập thất bại";
      toast.error(errorMessage);
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
      console.log("check useAuthStore", user);
      set({ user });
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lấy thông tin user! Hãy thử đăng nhập lại");
    } finally {
      set({ loading: false });
    }
  },
  refresh: async () => {
    try {
      set({ loading: true });
      const accessToken = await authService.refresh();
      const { user, fetchMe, setAccessToken} = get();
      setAccessToken(accessToken);
      if (!user) {
        await fetchMe();
      }
    } catch (err) {
      console.error(err);
      toast.error("Hết phiên đăng nhập! vui lòng đăng nhập lại");
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
