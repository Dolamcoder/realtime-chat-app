import api from "../lib/axios";
export const authService = {
  signUp: async (
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
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
  signIn: async (username: String, password: String) => {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  },
  signOut: async () => {
    return await api.post("/auth/logout");
  },
  fetchMe: async () => {
    const res = await api.get("/users/me");
    return res.data.user;
  },
  refresh:async()=>{
    const res=await api.post("/auth/refresh");
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
  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.put("/users/change-password", { oldPassword, newPassword });
    return res.data;
  }
};
