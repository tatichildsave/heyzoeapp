import React from "react";
import { useContext } from "react";
import { AuthContext } from "../../contexts";

export default function ProtectedRoute({ children, fallback = null, loadingFallback = null }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return loadingFallback;
  if (!user) return fallback;
  return children;
}
