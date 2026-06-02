import { API_URL } from './config';
import { getCurrentSession, tryRefreshSession } from './session';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const session = getCurrentSession();
  const makeRequest = async (accessToken?: string | null) =>
    fetch(url, {
      cache: 'no-store',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options?.headers,
      },
    });

  let response = await makeRequest(session?.accessToken ?? null);

  if (response.status === 401 && session?.refreshToken) {
    const refreshed = await tryRefreshSession();
    if (refreshed?.accessToken) {
      response = await makeRequest(refreshed.accessToken);
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
