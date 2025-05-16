// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>読み込み中...</div>;

  return user ? element : <Navigate to="/lounge" replace />;
};

export default ProtectedRoute;
