/**
 * Device Manager
 * Manages device identification for multi-device login support
 */

const DEVICE_ID_KEY = "device_id";
const DEVICE_NAME_KEY = "device_name";

/**
 * Get or generate device ID
 * Device ID is persistent across sessions for the same browser/device
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    // Server-side: generate a temporary ID
    return generateDeviceId();
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    // Ensure we always return a valid device ID
    return deviceId || generateDeviceId();
  } catch (error) {
    // If localStorage fails (e.g., private browsing), generate a new ID
    console.warn('Failed to access localStorage, generating new device ID:', error);
    return generateDeviceId();
  }
}

/**
 * Get device name (human-readable)
 */
export function getDeviceName(): string {
  if (typeof window === "undefined") {
    return "Unknown Device";
  }

  let deviceName = localStorage.getItem(DEVICE_NAME_KEY);

  if (!deviceName) {
    deviceName = detectDeviceName();
    localStorage.setItem(DEVICE_NAME_KEY, deviceName);
  }

  return deviceName;
}

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  // Try to get existing device ID from various sources
  if (typeof window !== "undefined") {
    // Check localStorage first
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    // Check sessionStorage as fallback
    const sessionId = sessionStorage.getItem(DEVICE_ID_KEY);
    if (sessionId) {
      localStorage.setItem(DEVICE_ID_KEY, sessionId);
      return sessionId;
    }
  }

  // Generate new UUID with robust fallback across browsers
  const uuid = generateUUID();
  return `web-${uuid}`;
}

/**
 * Detect device name from user agent and screen info
 */
function detectDeviceName(): string {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "Unknown Device";
  }

  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Detect OS
  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Detect Browser
  let browser = "Unknown Browser";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  // Detect device type
  let deviceType = "Desktop";
  if (ua.includes("Mobile")) deviceType = "Mobile";
  else if (ua.includes("Tablet") || ua.includes("iPad")) deviceType = "Tablet";

  return `${browser} on ${os} (${deviceType})`;
}

/**
 * Clear device info (useful for logout or device reset)
 */
export function clearDeviceInfo(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(DEVICE_NAME_KEY);
  }
}

/**
 * Generate RFC4122 v4 UUID with multiple fallbacks:
 * - Uses crypto.randomUUID when available
 * - Falls back to crypto.getRandomValues
 * - Finally falls back to Math.random (lowest entropy, last resort)
 */
function generateUUID(): string {
  try {
    // Most modern browsers (and Node) support this
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}

  try {
    // Use Web Crypto API to construct a UUID v4
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      // Per RFC4122 set version and variant bits
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
    }
  } catch {}

  // Last resort fallback (not cryptographically strong)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

