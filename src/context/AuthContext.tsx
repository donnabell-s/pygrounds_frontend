// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, SignupData } from "../types/user";
import { authService } from "../services/authService";

type AuthContextType = {
  user: User | null;
  login: (u: string, p: string) => Promise<User>;
  register: (d: SignupData) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string) => {
    const u = await authService.login(username, password);
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    return u;
  };

  const register = async (data: SignupData) => {
    const u = await authService.register(data);
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
