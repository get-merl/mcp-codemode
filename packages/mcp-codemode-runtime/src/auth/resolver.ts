import type { AuthConfig } from "./schema.js";

export type AuthResult =
  | { status: "resolved"; token: string }
  | { status: "missing"; envVar: string }
  | { status: "none" };

/**
 * Resolve authentication token from environment variables based on auth config.
 * 
 * @param auth - Optional auth configuration
 * @returns AuthResult indicating whether token was resolved, missing, or not needed
 */
export function resolveAuth(auth: AuthConfig | undefined): AuthResult {
  if (!auth || auth.type === "none") {
    return { status: "none" };
  }

  if (auth.type === "bearer") {
    const token = process.env[auth.tokenEnv];
    if (!token || token.trim() === "") {
      return { status: "missing", envVar: auth.tokenEnv };
    }
    return { status: "resolved", token };
  }

  // Future auth types would be handled here
  return { status: "none" };
}

/**
 * Check if an error is an authentication error (401 Unauthorized or 403 Forbidden).
 * 
 * @param error - Error to check
 * @returns true if the error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Check for HTTP status codes
  if (
    errorString.includes("401") ||
    errorString.includes("unauthorized") ||
    errorString.includes("403") ||
    errorString.includes("forbidden")
  ) {
    return true;
  }

  // Check for common auth error patterns
  if (
    errorString.includes("authentication failed") ||
    errorString.includes("invalid token") ||
    errorString.includes("invalid credentials") ||
    errorString.includes("bearer token") ||
    errorString.includes("access denied")
  ) {
    return true;
  }

  // Check if error object has status property
  if (typeof error === "object" && error !== null) {
    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403) {
      return true;
    }
  }

  return false;
}
