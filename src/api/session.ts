import type { AuthSession } from "./types";

let currentSession: AuthSession | null = null;
let refreshHandler: (() => Promise<AuthSession | null>) | null = null;

export function getCurrentSession(): AuthSession | null {
  return currentSession;
}

export function setCurrentSession(session: AuthSession | null): void {
  currentSession = session;
}

export function setSessionRefreshHandler(handler: (() => Promise<AuthSession | null>) | null): void {
  refreshHandler = handler;
}

export async function tryRefreshSession(): Promise<AuthSession | null> {
  if (!refreshHandler) return null;
  return refreshHandler();
}
