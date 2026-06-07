import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  loginWithPhone,
  refreshDeviceSession,
  registerWithPhone,
} from "../api/auth";
import { setCurrentSession, setSessionRefreshHandler } from "../api/session";
import { AuthSession } from "../api/types";
import {
  getBiometricAvailability,
  promptBiometricAuth,
} from "../auth/biometrics";
import { isTokenExpired } from "../auth/token";
import {
  isBrazilianPhoneValueValid,
  normalizeBrazilianPhone,
} from "../utils/phone";
import { User } from "../api/types";

interface AuthContextData {
  userId: string | null;
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  canUseBiometricLogin: boolean;
  shouldPromptBiometricOptIn: boolean;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  dismissBiometricPrompt: () => void;
  loginWithBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const SESSION_KEY = "gm_session";
const DEVICE_ID_KEY = "gm_device_id";
const BIOMETRIC_ENABLED_KEY = "gm_biometric_enabled";

function createDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [canUseBiometricLogin, setCanUseBiometricLogin] = useState(false);
  const [shouldPromptBiometricOptIn, setShouldPromptBiometricOptIn] =
    useState(false);
  const biometricEnabledRef = useRef(false);
  const biometricAvailableRef = useRef(false);

  const persistSession = async (session: AuthSession | null) => {
    if (session) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
    setCurrentSession(session);
    setUserId(session?.user.id ?? null);
    setUser(session?.user ?? null);
    setCanUseBiometricLogin(Boolean(session && biometricEnabledRef.current));
  };

  const loadStoredSession = async (): Promise<AuthSession | null> => {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  };

  const readOrCreateDeviceId = async (): Promise<string> => {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = createDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  };

  const refreshPersistedSession = async (options?: {
    requireBiometric?: boolean;
    promptMessage?: string;
  }): Promise<AuthSession> => {
    const session = await loadStoredSession();
    if (!session) {
      throw new Error("Sessão não encontrada.");
    }
    if (isTokenExpired(session.refreshToken)) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    if (options?.requireBiometric) {
      const confirmed = await promptBiometricAuth(
        options.promptMessage ?? "Confirme sua identidade para entrar",
      );
      if (!confirmed) {
        throw new Error("Autenticação biométrica cancelada.");
      }
    }

    return refreshDeviceSession({
      deviceId: session.deviceId,
      refreshToken: session.refreshToken,
    });
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [availability, biometricFlag, session] = await Promise.all([
          getBiometricAvailability(),
          SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY),
          loadStoredSession(),
        ]);

        const biometricEnabled = biometricFlag === "true";
        if (!mounted) return;

        biometricAvailableRef.current = availability.isAvailable;
        biometricEnabledRef.current = biometricEnabled;
        setIsBiometricAvailable(availability.isAvailable);
        setIsBiometricEnabled(biometricEnabled);

        if (!session) {
          setCurrentSession(null);
          setUserId(null);
          setUser(null);
          setCanUseBiometricLogin(false);
          return;
        }

        if (isTokenExpired(session.refreshToken)) {
          await persistSession(null);
          return;
        }

        if (!isTokenExpired(session.accessToken)) {
          setCurrentSession(session);
          setUserId(session.user.id);
          setCanUseBiometricLogin(biometricEnabled && availability.isAvailable);
          return;
        }

        if (biometricEnabled && availability.isAvailable) {
          setCurrentSession(null);
          setUserId(null);
          setUser(null);
          setCanUseBiometricLogin(true);
          return;
        }

        const refreshed = await refreshPersistedSession();
        await persistSession(refreshed);
      } catch {
        await persistSession(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSessionRefreshHandler(async () => {
      try {
        const refreshed = await refreshPersistedSession({
          requireBiometric:
            biometricEnabledRef.current && biometricAvailableRef.current,
          promptMessage: "Confirme sua identidade para renovar a sessão",
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

  useEffect(() => {
    biometricEnabledRef.current = isBiometricEnabled;
  }, [isBiometricEnabled]);

  useEffect(() => {
    biometricAvailableRef.current = isBiometricAvailable;
  }, [isBiometricAvailable]);

  const login = async (phone: string, password: string) => {
    const normalizedPhone = normalizeBrazilianPhone(phone);
    if (!isBrazilianPhoneValueValid(phone)) {
      throw new Error("Digite um telefone válido.");
    }
    if (!password.trim()) {
      throw new Error("Digite sua senha.");
    }

    const deviceId = await readOrCreateDeviceId();

    const session = await loginWithPhone({
      phone: normalizedPhone,
      password,
      deviceId,
      deviceName: "gm_finance_app",
    });
    await persistSession(session);
    setShouldPromptBiometricOptIn(
      isBiometricAvailable && !biometricEnabledRef.current,
    );
  };

  const register = async (name: string, phone: string, password: string) => {
    const normalizedPhone = normalizeBrazilianPhone(phone);
    if (!isBrazilianPhoneValueValid(phone)) {
      throw new Error("Digite um telefone válido.");
    }
    if (!name.trim()) {
      throw new Error("Digite seu nome.");
    }
    if (!password.trim() || password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    const deviceId = await readOrCreateDeviceId();

    const session = await registerWithPhone({
      name: name.trim(),
      phone: normalizedPhone,
      password,
      deviceId,
      deviceName: "gm_finance_app",
    });
    await persistSession(session);
    setShouldPromptBiometricOptIn(
      isBiometricAvailable && !biometricEnabledRef.current,
    );
  };

  const logout = async () => {
    setShouldPromptBiometricOptIn(false);
    await persistSession(null);
  };

  const enableBiometric = async () => {
    if (!isBiometricAvailable) {
      throw new Error("Biometria não disponível neste dispositivo.");
    }

    const confirmed = await promptBiometricAuth(
      "Confirme sua identidade para habilitar a biometria",
    );
    if (!confirmed) {
      throw new Error("Autenticação biométrica cancelada.");
    }

    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
    biometricEnabledRef.current = true;
    setIsBiometricEnabled(true);
    setCanUseBiometricLogin(Boolean(await loadStoredSession()));
    setShouldPromptBiometricOptIn(false);
  };

  const disableBiometric = async () => {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    biometricEnabledRef.current = false;
    setIsBiometricEnabled(false);
    setCanUseBiometricLogin(false);
    setShouldPromptBiometricOptIn(false);
  };

  const dismissBiometricPrompt = () => {
    setShouldPromptBiometricOptIn(false);
  };

  const loginWithBiometrics = async () => {
    if (!biometricEnabledRef.current || !biometricAvailableRef.current) {
      throw new Error("Biometria não está habilitada neste dispositivo.");
    }

    const refreshed = await refreshPersistedSession({
      requireBiometric: true,
      promptMessage: "Use sua biometria para entrar",
    });
    await persistSession(refreshed);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        user,
        isLoading,
        login,
        register,
        logout,
        isBiometricAvailable,
        isBiometricEnabled,
        canUseBiometricLogin,
        shouldPromptBiometricOptIn,
        enableBiometric,
        disableBiometric,
        dismissBiometricPrompt,
        loginWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
