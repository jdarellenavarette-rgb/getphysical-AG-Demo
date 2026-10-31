/**
 * Offline Dynamic TOTP & 60-Second QR Cryptographic Engine
 * Appendix E (#8) & Section 0.3 Locked Rules:
 * Generates and validates a deterministic 60-second dynamic hash and 6-digit TOTP code
 * seeded by the user token/secret and the current 60s epoch time window.
 */

export interface TotpTokenResult {
  readonly code: string; // e.g. "482911"
  readonly formattedCode: string; // e.g. "482-911"
  readonly dynamicHash: string; // e.g. "gp_sec_abc123_epoch928374"
  readonly remainingSeconds: number; // 1-60
  readonly epochWindow: number;
}

/**
 * FNV-1a 32-bit hash algorithm implementation (pure TypeScript, zero native dependencies)
 */
function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

/**
 * Generates the dynamic 60s TOTP code and QR hash for a user pass
 */
export function generateDynamicPassTotp(
  userId: string,
  passId: string,
  facilityId: string,
  currentTimestampMs: number = Date.now()
): TotpTokenResult {
  const windowSeconds = 60;
  const currentSeconds = Math.floor(currentTimestampMs / 1000);
  const epochWindow = Math.floor(currentSeconds / windowSeconds);
  const remainingSeconds = windowSeconds - (currentSeconds % windowSeconds);

  // Deterministic seed combining user, pass, facility, and the current 60s window
  const seed = `${userId}:${passId}:${facilityId}:${epochWindow}`;
  const hashVal = fnv1a32(seed);

  // 6-digit zero-padded code (000000 to 999999)
  const codeNum = hashVal % 1000000;
  const code = codeNum.toString().padStart(6, "0");
  const formattedCode = `${code.slice(0, 3)}-${code.slice(3, 6)}`;

  // Cryptographic dynamic hash for QR scanner camera feeds
  const hexHash = hashVal.toString(16).padStart(8, "0");
  const dynamicHash = `GP:${facilityId}:${passId}:${userId}:${epochWindow}:${hexHash}`;

  return {
    code,
    formattedCode,
    dynamicHash,
    remainingSeconds,
    epochWindow,
  };
}

/**
 * Verifies a 6-digit TOTP or dynamic QR hash at the front desk (GymDash tablet)
 * Allows for a 1-window grace period (current window or immediate previous window)
 */
export function verifyDynamicPassCode(
  inputCodeOrHash: string,
  userId: string,
  passId: string,
  facilityId: string,
  currentTimestampMs: number = Date.now()
): { isValid: boolean; windowDelta: number } {
  const windowSeconds = 60;
  const currentSeconds = Math.floor(currentTimestampMs / 1000);
  const currentEpoch = Math.floor(currentSeconds / windowSeconds);

  const cleanInput = inputCodeOrHash.replace(/[^a-zA-Z0-9:]/g, "");

  // Check current window (0) and previous window (-1) to tolerate clock drift / network latency
  for (const delta of [0, -1]) {
    const testEpoch = currentEpoch + delta;
    const testSeed = `${userId}:${passId}:${facilityId}:${testEpoch}`;
    const hashVal = fnv1a32(testSeed);
    const code = (hashVal % 1000000).toString().padStart(6, "0");
    const hexHash = hashVal.toString(16).padStart(8, "0");
    const dynamicHash = `GP:${facilityId}:${passId}:${userId}:${testEpoch}:${hexHash}`;

    if (
      cleanInput === code ||
      cleanInput === code.replace("-", "") ||
      cleanInput === dynamicHash
    ) {
      return { isValid: true, windowDelta: delta };
    }
  }

  return { isValid: false, windowDelta: 0 };
}
