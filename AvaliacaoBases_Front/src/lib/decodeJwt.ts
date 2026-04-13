// lib/decodeJwt.ts
export function decodeJwtPayload(token?: string): Record<string, any> | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // Normaliza base64 url -> base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
