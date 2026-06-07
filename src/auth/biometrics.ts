import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export type BiometricAvailability = {
  hasHardware: boolean;
  isEnrolled: boolean;
  isAvailable: boolean;
};

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === "web") {
    return { hasHardware: false, isEnrolled: false, isAvailable: false };
  }

  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  return {
    hasHardware,
    isEnrolled,
    isAvailable: hasHardware && isEnrolled,
  };
}

export async function promptBiometricAuth(promptMessage: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: "Cancelar",
    fallbackLabel: "Usar bloqueio do dispositivo",
    disableDeviceFallback: false,
  });

  return result.success;
}
