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

  // ✅ Login and store token & user
  const login = async (username: string, password: string) => {
    const u = await authService.login(username, password);
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("accessToken", u.token); // ensure token saved
    return u;
  };

  const register = async (data: SignupData) => {
    const u = await authService.register(data);
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("accessToken", u.token); // ensure token saved
    return u;
  };

  // ✅ Logout only clears relevant keys
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  // ✅ Fetch profile from backend
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (error: any) {
      console.error("Failed to fetch profile", error);
      // only logout if 401 unauthorized
      if (error?.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load user from storage first to persist session
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchProfile();
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
