import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL,
  withCredentials: true,
});
instance.interceptors.response.use(
  function (response) {
    if (response.data && response.data.data) return response.data;
    return response;
  },
  function (error) {
    if (error.response && error.response.data)
      return Promise.reject(error.response.data);
    return Promise.reject(error);
  },
);
instance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      try {
        const res = await instance.post("/auth/refresh", {
          withCredentials: true,
        });
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
export default instance;
