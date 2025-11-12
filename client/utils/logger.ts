/**
 * Secure logger utility that prevents sensitive data exposure
 * Only logs in development mode and sanitizes sensitive information
 */

const isDev = __DEV__;

/**
 * Sanitizes a string to remove sensitive patterns (tokens, passwords, etc.)
 */
function sanitizeString(str: string): string {
  if (typeof str !== "string") return str;

  // Pattern to match JWT tokens (three base64 parts separated by dots)
  const jwtPattern = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/g;
  
  // Pattern to match bearer tokens in URLs or strings
  const bearerTokenPattern = /bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
  
  // Pattern to match API keys (long alphanumeric strings)
  const apiKeyPattern = /\b[A-Za-z0-9]{32,}\b/g;
  
  // Pattern to match URLs with query parameters that might contain tokens
  const urlWithTokenPattern = /[?&](token|access_token|refresh_token|api_key|apikey|auth|authorization)=[^&\s]+/gi;

  let sanitized = str;
  
  // Replace JWT tokens
  sanitized = sanitized.replace(jwtPattern, "[TOKEN_REDACTED]");
  
  // Replace bearer tokens
  sanitized = sanitized.replace(bearerTokenPattern, "bearer [TOKEN_REDACTED]");
  
  // Replace API keys (be careful not to replace normal IDs)
  sanitized = sanitized.replace(apiKeyPattern, (match) => {
    // Only replace if it looks like an API key (very long or has specific patterns)
    return match.length > 40 ? "[API_KEY_REDACTED]" : match;
  });
  
  // Replace URL parameters with tokens
  sanitized = sanitized.replace(urlWithTokenPattern, (match) => {
    const [key] = match.split("=");
    return `${key}=[REDACTED]`;
  });

  return sanitized;
}

/**
 * Sanitizes an object to remove sensitive fields
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== "object") {
    // Sanitize strings
    if (typeof data === "string") {
      return sanitizeString(data);
    }
    return data;
  }

  const sensitiveKeys = [
    "accessToken",
    "refreshToken",
    "idToken",
    "token",
    "password",
    "authorization",
    "auth",
    "secret",
    "apiKey",
    "api_key",
    "credentials",
    "cookie",
    "x-api-key",
    "x-auth-token",
  ];

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((sensitiveKey) =>
      lowerKey.includes(sensitiveKey.toLowerCase())
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitizes error objects to prevent sensitive data exposure
 */
function sanitizeError(error: unknown): any {
  if (!error) return error;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeString(error.message),
      stack: isDev ? sanitizeString(error.stack || "") : undefined,
    };
  }

  // Handle Axios errors
  if (typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    const sanitizedError: any = {
      message: sanitizeString(axiosError.message || "Request failed"),
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
    };

    // Sanitize response data
    if (axiosError.response?.data) {
      sanitizedError.data = sanitizeData(axiosError.response.data);
    }

    // Sanitize request config (may contain headers with tokens)
    if (axiosError.config) {
      sanitizedError.config = {
        method: axiosError.config.method,
        url: sanitizeString(axiosError.config.url || ""),
        baseURL: sanitizeString(axiosError.config.baseURL || ""),
        // Headers are sanitized separately
        headers: axiosError.config.headers
          ? sanitizeData(axiosError.config.headers)
          : undefined,
      };
    }

    // Sanitize request data if present
    if (axiosError.config?.data) {
      sanitizedError.requestData = sanitizeData(axiosError.config.data);
    }

    return sanitizedError;
  }

  return sanitizeData(error);
}

export const logger = {
  /**
   * Logs a message (only in development)
   */
  log: (...args: any[]): void => {
    if (!isDev) return;
    console.log(...args.map((arg) => sanitizeData(arg)));
  },

  /**
   * Logs an error (only in development, with sanitization)
   */
  error: (message: string, error?: unknown): void => {
    if (!isDev) return;
    if (error) {
      console.error(message, sanitizeError(error));
    } else {
      console.error(message);
    }
  },

  /**
   * Logs a warning (only in development)
   */
  warn: (...args: any[]): void => {
    if (!isDev) return;
    console.warn(...args.map((arg) => sanitizeData(arg)));
  },

  /**
   * Logs debug information (only in development)
   */
  debug: (...args: any[]): void => {
    if (!isDev) return;
    console.debug(...args.map((arg) => sanitizeData(arg)));
  },
};

