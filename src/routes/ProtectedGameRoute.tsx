import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGame } from "../context/GameContext";
import type { ReactNode } from "react"; // ✅ type-only import

const ProtectedGameRoute = ({ children }: { children: ReactNode }) => {
  const { activeSession } = useGame();
  const location = useLocation();

  if (!activeSession) {
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser)?.id : null;

    return <Navigate to={`/${userId}/home`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedGameRoute;
