import React, { createContext, useMemo } from "react";
import { T } from "../theme";

export const ThemeContext = createContext(T);

export function ThemeProvider({ children }) {
  const value = useMemo(() => T, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
