type JwtPayload = {
  exp?: number;
};

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  const payload = parts[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    const json = typeof globalThis.atob === "function" ? globalThis.atob(padded) : base64Decode(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string, skewMs = 15_000): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return true;
  return expiryMs <= Date.now() + skewMs;
}

function base64Decode(value: string): string {
  let output = "";

  for (let i = 0; i < value.length; i += 4) {
    const encoded1 = BASE64_CHARS.indexOf(value[i] ?? "A");
    const encoded2 = BASE64_CHARS.indexOf(value[i + 1] ?? "A");
    const encoded3 = value[i + 2] === "=" ? -1 : BASE64_CHARS.indexOf(value[i + 2] ?? "A");
    const encoded4 = value[i + 3] === "=" ? -1 : BASE64_CHARS.indexOf(value[i + 3] ?? "A");

    const byte1 = (encoded1 << 2) | (encoded2 >> 4);
    output += String.fromCharCode(byte1);

    if (encoded3 >= 0) {
      const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      output += String.fromCharCode(byte2);
    }

    if (encoded4 >= 0) {
      const byte3 = ((encoded3 & 3) << 6) | encoded4;
      output += String.fromCharCode(byte3);
    }
  }

  try {
    return decodeURIComponent(escape(output));
  } catch {
    return output;
  }
}
