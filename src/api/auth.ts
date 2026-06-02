import { fetchApi } from "./http";
import { AuthSession, User } from "./types";

export async function loginWithPhone(data: {
  phone: string;
  password: string;
  deviceId: string;
  deviceName?: string;
}): Promise<AuthSession> {
  return fetchApi<AuthSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerWithPhone(data: {
  name: string;
  phone: string;
  password: string;
  deviceId: string;
  deviceName?: string;
}): Promise<AuthSession> {
  return fetchApi<AuthSession>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshDeviceSession(data: {
  deviceId: string;
  refreshToken: string;
}): Promise<AuthSession> {
  return fetchApi<AuthSession>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAuthenticatedUser(): Promise<User> {
  return fetchApi<User>("/api/auth/me");
}
