import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
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

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => {
    // giữ nguyên response để service dùng .data
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Không có config
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // Không refresh cho auth APIs
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")
    ) {
      return Promise.reject(
        error.response?.data || error
      );
    }

    // Tránh loop vô hạn
    if (originalRequest._retry) {
      return Promise.reject(
        error.response?.data || error
      );
    }

    // Access token hết hạn
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