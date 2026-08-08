import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")
    ) {
      return Promise.reject(
        error.response?.data || error
      );
    }

    if (originalRequest._retry) {
      return Promise.reject(
        error.response?.data || error
      );
    }

    if (error.response?.status === 403) {
      originalRequest._retry = true;

      try {
        const res = await instance.post(
          "/auth/refresh"
        );

        const newAccessToken =
          res.data.accessToken;

        useAuthStore
          .getState()
          .setAccessToken(newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshError: any) {
        useAuthStore.getState().clearState();

        return Promise.reject(
          refreshError.response?.data ||
          refreshError
        );
      }
    }

    return Promise.reject(
      error.response?.data || error
    );
  }
);

export default instance;