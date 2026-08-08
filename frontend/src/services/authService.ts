import api from "../lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstname: string,
    lastname: string,
  ) => {
    const res = await api.post("/auth/register", {
      username,
      password,
      email,
      firstname,
      lastname,
    });
    return res.data;
  },
  verifyEmail: async (email: string, otp: string) => {
    const res = await api.post("/auth/verify-email", { email, otp });
    return res.data;
  },
  resendVerification: async (email: string) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },
  signIn: async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await api.post("/auth/reset-password", { email, otp, newPassword });
    return res.data;
  },
  signOut: async () => {
    return await api.post("/auth/logout");
  },
  fetchMe: async () => {
    const res = await api.get("/users/me");
    return res.data.user;
  },
  refresh: async () => {
    const res = await api.post("/auth/refresh");
    return res.data.accessToken;
  },
  updateProfile: async (displayName: string, bio: string, phone: string) => {
    const res = await api.put("/users/profile", { displayName, bio, phone });
    return res.data;
  },
  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.put("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  requestChangePasswordOtp: async () => {
    const res = await api.post("/users/change-password-otp");
    return res.data;
  },
  changePassword: async (oldPassword: string, newPassword: string, otp: string) => {
    const res = await api.put("/users/change-password", { oldPassword, newPassword, otp });
    return res.data;
  }
};
