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
  updateUser: (updated: User) => void;
  isLoading: boolean;
  sessionExpired: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

 
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await authService.login(username, password);
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      localStorage.setItem("accessToken", u.token); // ensure token saved
      try {
        localStorage.removeItem("tokenExpired");
        localStorage.removeItem("tokenExpiredHandled");
      } catch (e) {}
      setSessionExpired(false);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const u = await authService.register(data);
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      localStorage.setItem("accessToken", u.token); // ensure token saved
      try {
        localStorage.removeItem("tokenExpired");
        localStorage.removeItem("tokenExpiredHandled");
      } catch (e) {}
      setSessionExpired(false);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

 
  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };


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
      try {
      
        localStorage.removeItem("tokenExpired");
        localStorage.removeItem("tokenExpiredHandled");
      } catch (e) {}
      setSessionExpired(false);
    } catch (error: any) {
      console.error("Failed to fetch profile", error);
   
      if (error?.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
   
    const onExpired = () => setSessionExpired(true);
    window.addEventListener("auth:expired", onExpired as EventListener);

   
    const onStorage = (e: StorageEvent) => {
      try {
        if (e.key === "tokenExpiredHandled" && e.newValue) {
          setSessionExpired(false);
        }
      } catch (err) {}
    };
    window.addEventListener("storage", onStorage);

    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading, sessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
