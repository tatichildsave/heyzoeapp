import React, { createContext, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";

export const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const { user, loading } = useAuth();
  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
