import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveAuth, isAuthError } from "../src/auth/resolver.js";
import type { AuthConfig } from "../src/auth/schema.js";

describe("auth/resolver", () => {
  // Store original env to restore after tests
  const originalEnv: NodeJS.ProcessEnv = {};

  beforeEach(() => {
    // Save current env values
    originalEnv["TEST_TOKEN"] = process.env["TEST_TOKEN"];
    originalEnv["CLOUDFLARE_API_TOKEN"] = process.env["CLOUDFLARE_API_TOKEN"];
    originalEnv["SUPABASE_ACCESS_TOKEN"] = process.env["SUPABASE_ACCESS_TOKEN"];
  });

  afterEach(() => {
    // Restore original env values
    if (originalEnv["TEST_TOKEN"] === undefined) {
      delete process.env["TEST_TOKEN"];
    } else {
      process.env["TEST_TOKEN"] = originalEnv["TEST_TOKEN"];
    }
    if (originalEnv["CLOUDFLARE_API_TOKEN"] === undefined) {
      delete process.env["CLOUDFLARE_API_TOKEN"];
    } else {
      process.env["CLOUDFLARE_API_TOKEN"] = originalEnv["CLOUDFLARE_API_TOKEN"];
    }
    if (originalEnv["SUPABASE_ACCESS_TOKEN"] === undefined) {
      delete process.env["SUPABASE_ACCESS_TOKEN"];
    } else {
      process.env["SUPABASE_ACCESS_TOKEN"] = originalEnv["SUPABASE_ACCESS_TOKEN"];
    }
  });

  describe("resolveAuth", () => {
    it("should return 'none' status when auth is undefined", () => {
      const result = resolveAuth(undefined);
      expect(result.status).toBe("none");
    });

    it("should return 'none' status when auth type is 'none'", () => {
      const auth: AuthConfig = { type: "none" };
      const result = resolveAuth(auth);
      expect(result.status).toBe("none");
    });

    it("should return 'resolved' status when bearer token is provided", () => {
      const auth: AuthConfig = { type: "bearer", token: "my-secret-token" };
      const result = resolveAuth(auth);
      expect(result.status).toBe("resolved");
      expect(result).toEqual({ status: "resolved", token: "my-secret-token" });
    });

    it("should return 'missing' status when bearer token is empty string", () => {
      const auth: AuthConfig = { type: "bearer", token: "" };
      const result = resolveAuth(auth);
      expect(result.status).toBe("missing");
      expect(result).toEqual({ status: "missing", envVar: "token" });
    });

    it("should return 'missing' status when bearer token is whitespace only", () => {
      const auth: AuthConfig = { type: "bearer", token: "   " };
      const result = resolveAuth(auth);
      expect(result.status).toBe("missing");
      expect(result).toEqual({ status: "missing", envVar: "token" });
    });

    it("should handle direct token values", () => {
      const auth: AuthConfig = { type: "bearer", token: "cf-token-123" };
      const result = resolveAuth(auth);
      expect(result.status).toBe("resolved");
      expect(result).toEqual({ status: "resolved", token: "cf-token-123" });
    });

    it("should handle token from process.env (for TS configs)", () => {
      process.env["SUPABASE_ACCESS_TOKEN"] = "sb-token-456";
      const auth: AuthConfig = { 
        type: "bearer", 
        token: process.env.SUPABASE_ACCESS_TOKEN || "" 
      };
      const result = resolveAuth(auth);
      expect(result.status).toBe("resolved");
      expect(result).toEqual({ status: "resolved", token: "sb-token-456" });
    });
  });

  describe("isAuthError", () => {
    it("should return false for null/undefined errors", () => {
      expect(isAuthError(null)).toBe(false);
      expect(isAuthError(undefined)).toBe(false);
    });

    it("should detect 401 Unauthorized errors", () => {
      expect(isAuthError(new Error("HTTP 401 Unauthorized"))).toBe(true);
      expect(isAuthError(new Error("401 error"))).toBe(true);
      expect(isAuthError(new Error("unauthorized access"))).toBe(true);
    });

    it("should detect 403 Forbidden errors", () => {
      expect(isAuthError(new Error("HTTP 403 Forbidden"))).toBe(true);
      expect(isAuthError(new Error("403 error"))).toBe(true);
      expect(isAuthError(new Error("forbidden access"))).toBe(true);
    });

    it("should detect common auth error patterns", () => {
      expect(isAuthError(new Error("authentication failed"))).toBe(true);
      expect(isAuthError(new Error("invalid token"))).toBe(true);
      expect(isAuthError(new Error("invalid credentials"))).toBe(true);
      expect(isAuthError(new Error("bearer token required"))).toBe(true);
      expect(isAuthError(new Error("access denied"))).toBe(true);
    });

    it("should detect errors with status property", () => {
      expect(isAuthError({ status: 401 })).toBe(true);
      expect(isAuthError({ status: 403 })).toBe(true);
      expect(isAuthError({ status: 200 })).toBe(false);
      expect(isAuthError({ status: 500 })).toBe(false);
    });

    it("should return false for non-auth errors", () => {
      expect(isAuthError(new Error("Connection refused"))).toBe(false);
      expect(isAuthError(new Error("Timeout error"))).toBe(false);
      expect(isAuthError(new Error("Internal server error"))).toBe(false);
      expect(isAuthError(new Error("Not found"))).toBe(false);
    });

    it("should handle string errors", () => {
      expect(isAuthError("401 Unauthorized")).toBe(true);
      expect(isAuthError("403 Forbidden")).toBe(true);
      expect(isAuthError("Some other error")).toBe(false);
    });
  });
});

describe("auth integration", () => {
  const originalEnv: NodeJS.ProcessEnv = {};

  beforeEach(() => {
    originalEnv["INTEGRATION_TEST_TOKEN"] = process.env["INTEGRATION_TEST_TOKEN"];
  });

  afterEach(() => {
    if (originalEnv["INTEGRATION_TEST_TOKEN"] === undefined) {
      delete process.env["INTEGRATION_TEST_TOKEN"];
    } else {
      process.env["INTEGRATION_TEST_TOKEN"] = originalEnv["INTEGRATION_TEST_TOKEN"];
    }
  });

  it("should work with stdio server auth configuration", () => {
    // Simulate a server config with bearer auth (stdio requires tokenName)
    process.env["INTEGRATION_TEST_TOKEN"] = "test-token-value";
    const serverConfig = {
      name: "test-server",
      transport: {
        type: "stdio" as const,
        command: "npx",
        args: ["mcp-remote", "https://example.com/mcp"],
        auth: { 
          type: "bearer" as const, 
          token: process.env.INTEGRATION_TEST_TOKEN || "",
          tokenName: "INTEGRATION_TEST_TOKEN"
        },
      },
    };

    const resolvedResult = resolveAuth(serverConfig.transport.auth);
    expect(resolvedResult.status).toBe("resolved");
    if (resolvedResult.status === "resolved") {
      expect(resolvedResult.token).toBe("test-token-value");
    }
  });

  it("should work with http transport auth configuration", () => {
    // HTTP servers only need token, no tokenName required
    process.env["INTEGRATION_TEST_TOKEN"] = "http-bearer-token";
    const serverConfig = {
      name: "http-server",
      transport: {
        type: "http" as const,
        url: "https://api.example.com/mcp",
        auth: { 
          type: "bearer" as const, 
          token: process.env.INTEGRATION_TEST_TOKEN || ""
        },
      },
    };

    const result = resolveAuth(serverConfig.transport.auth);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.token).toBe("http-bearer-token");
    }
  });

  it("should handle servers without auth config", () => {
    const serverConfig = {
      name: "public-server",
      transport: {
        type: "http" as const,
        url: "https://public.example.com/mcp",
      },
    };

    // No auth property means resolveAuth gets undefined
    const result = resolveAuth(undefined);
    expect(result.status).toBe("none");
  });
});
