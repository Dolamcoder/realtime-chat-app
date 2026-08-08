import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (!accessToken) {
          await refresh();
        } else if (!user) {
          await fetchMe();
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setStarting(false);
      }
    };

    init();
  }, []);

  if (starting) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
