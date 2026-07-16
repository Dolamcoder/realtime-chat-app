import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const backendUrl = 'http://192.168.1.4:3000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true, // Cho phép truy cập từ thiết bị khác trong cùng mạng Wi-Fi (mạng LAN)
      allowedHosts: true,
      // Proxy chỉ dùng khi dev: chuyển request /api và /socket.io về backend local
      // Production: frontend gọi thẳng VITE_API_BACKEND_URL (domain thật)
      proxy: isDev ? {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true, // proxy websocket
        },
      } : undefined,
    },
  };
});

