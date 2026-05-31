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
    console.log("check mee<<<<<", res.data.user);
    return res.data.user;
  },
  refresh:async()=>{
    const res=await api.post("/auth/refresh");
    console.log(res);
    return res.data.accessToken;
  }
};
