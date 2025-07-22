import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api";
import type { User } from "../types/user";

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<User>; // ✅ updated
  logout: () => void;
  isLoading: boolean;
};



const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access")
  );



  const login = async (username: string, password: string): Promise<User> => {
    const { data: tokens } = await authApi.login({ username, password });

    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    setAccessToken(tokens.access);

    const { data: profile } = await authApi.getProfile();
    setUser(profile);
    localStorage.setItem("user", JSON.stringify(profile));

    return profile; // ✅ return the user
  };


  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  };

  // Load from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, []);


  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
