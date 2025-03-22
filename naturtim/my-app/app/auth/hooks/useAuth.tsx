"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";
import { jwtDecode } from "jwt-decode";
import { User, AuthUser } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Przy starcie aplikacji sprawdź, czy token istnieje w localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      try {
        // Dekoduj token, żeby wyciągnąć dane użytkownika
        const decoded = jwtDecode<AuthUser>(storedToken);
        // Przekształć dane z tokenu na format użytkownika
        const userData: User = {
          id: decoded.id,
          login: decoded.login,
          username: decoded.username,
          userSurname: decoded.userSurname,
          permissions: decoded.permissions.map(name => ({ id: 0, name }))
        };
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        // Token nieprawidłowy - wyczyść
        console.error("Nieprawidłowy token:", error);
        localStorage.removeItem("auth_token");
      }
    }
  }, []);

  const login = async (login: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("/auth/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Zapisz token w localStorage
        localStorage.setItem("auth_token", data.token);

        // Ustaw dane użytkownika
        setUser(data.user);
        setToken(data.token);

        toast({
          title: "Sukces",
          description: "Zalogowano pomyślnie"
        });

        // Przekieruj do głównej strony po zalogowaniu
        router.push("/workspace");
      } else {
        toast({
          variant: "destructive",
          title: "Błąd",
          description: data.message || "Nieprawidłowe dane logowania"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Wystąpił błąd serwera"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Wywołaj endpoint wylogowania
      await fetch("/auth/api", { method: "DELETE" });

      // Wyczyść dane po wylogowaniu
      localStorage.removeItem("auth_token");
      setUser(null);
      setToken(null);

      // Przekieruj na stronę główną (logowanie)
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się wylogować"
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.some(p => p.name === permission);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
