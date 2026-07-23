import React, { createContext, useMemo, useState } from "react";

export const UserContext = createContext({ profile: null, setProfile: () => {} });

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const value = useMemo(() => ({ profile, setProfile }), [profile]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
