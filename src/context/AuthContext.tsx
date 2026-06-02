import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import {
  loginWithPhone,
  refreshDeviceSession,
  registerWithPhone,
} from "../api/auth";
import { setCurrentSession, setSessionRefreshHandler } from "../api/session";
import { AuthSession } from "../api/types";

interface AuthContextData {
  userId: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const SESSION_KEY = "gm_session";
const DEVICE_ID_KEY = "gm_device_id";

function createDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = async (session: AuthSession | null) => {
    if (session) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
    setCurrentSession(session);
    setUserId(session?.user.id ?? null);
  };

  useEffect(() => {
    SecureStore.getItemAsync(SESSION_KEY)
      .then((raw) => {
        if (!raw) return;
        const session = JSON.parse(raw) as AuthSession;
        setCurrentSession(session);
        setUserId(session.user.id);
      })
      .catch(() => {
        setCurrentSession(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setSessionRefreshHandler(async () => {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!raw) return null;
      try {
        const session = JSON.parse(raw) as AuthSession;
        const refreshed = await refreshDeviceSession({
          deviceId: session.deviceId,
          refreshToken: session.refreshToken,
        });
        await persistSession(refreshed);
        return refreshed;
      } catch {
        await persistSession(null);
        return null;
      }
    });

    return () => setSessionRefreshHandler(null);
  }, []);

  const login = async (phone: string, password: string) => {
    const digits = phone.replace(/\D/g, "");
    const normalizedPhone = digits ? `+${digits}` : "";
    if (!/^\+[1-9]\d{10,14}$/.test(normalizedPhone)) {
      throw new Error("Digite um telefone válido.");
    }
    if (!password.trim()) {
      throw new Error("Digite sua senha.");
    }

    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = createDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    const session = await loginWithPhone({
      phone: normalizedPhone,
      password,
      deviceId,
      deviceName: "gm_finance_app",
    });
    await persistSession(session);
  };

  const register = async (name: string, phone: string, password: string) => {
    const digits = phone.replace(/\D/g, "");
    const normalizedPhone = digits ? `+${digits}` : "";
    if (!/^\+[1-9]\d{10,14}$/.test(normalizedPhone)) {
      throw new Error("Digite um telefone válido.");
    }
    if (!name.trim()) {
      throw new Error("Digite seu nome.");
    }
    if (!password.trim() || password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = createDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    const session = await registerWithPhone({
      name: name.trim(),
      phone: normalizedPhone,
      password,
      deviceId,
      deviceName: "gm_finance_app",
    });
    await persistSession(session);
  };

  const logout = async () => {
    await persistSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ userId, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
