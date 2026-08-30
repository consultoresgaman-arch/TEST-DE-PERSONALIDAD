// Usa Web Crypto (globalThis.crypto.subtle) en vez del modulo "crypto" de
// Node: este archivo lo importa tanto rutas API normales como middleware.ts,
// y middleware corre en Edge Runtime, que no soporta el modulo "crypto" de
// Node pero si expone Web Crypto.

export const SESSION_COOKIE_NAME = "gg_admin_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 horas

function getSecret(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error("ADMIN_PASSWORD no configurada en el servidor.");
  return pwd;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, mensaje: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(mensaje));
  return toHex(firma);
}

// base64url manual con atob/btoa (Web APIs, disponibles tanto en Node como
// en Edge Runtime) en vez de Buffer, que en Edge Runtime es solo un polyfill
// parcial no garantizado.
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function validarPassword(intento: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return timingSafeEqualStr(intento, real);
}

export async function crearTokenSesion(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const firma = await hmacHex(getSecret(), payload);
  return base64UrlEncode(`${payload}.${firma}`);
}

export async function validarTokenSesion(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const decoded = base64UrlDecode(token);
    const separador = decoded.lastIndexOf(".");
    if (separador === -1) return false;
    const payload = decoded.slice(0, separador);
    const firma = decoded.slice(separador + 1);

    const esperada = await hmacHex(getSecret(), payload);
    if (!timingSafeEqualStr(firma, esperada)) return false;

    const ts = Number(payload.split(":")[1]);
    if (!Number.isFinite(ts)) return false;
    const edadMs = Date.now() - ts;
    return edadMs >= 0 && edadMs < SESSION_MAX_AGE_MS;
  } catch {
    return false;
  }
}
