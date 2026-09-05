import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/stores/use-auth-store";

export const GuestRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
