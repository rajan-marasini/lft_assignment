import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/stores/use-auth-store";

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
