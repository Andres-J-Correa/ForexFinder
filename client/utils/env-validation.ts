/**
 * Environment variable validation utility
 * Validates required environment variables at startup to fail fast
 */

/**
 * Validates that a required environment variable is set
 * @param name - The name of the environment variable
 * @param value - The value from process.env
 * @param description - Optional description for better error messages
 * @returns The validated value
 * @throws Error if the variable is missing or empty
 */
export function requireEnv(
  name: string,
  value: string | undefined,
  description?: string
): string {
  if (!value || value.trim() === "") {
    const errorMessage = description
      ? `Missing required environment variable: ${name} (${description})`
      : `Missing required environment variable: ${name}`;
    throw new Error(errorMessage);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param name - The name of the environment variable
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
export function getEnv(
  name: string,
  defaultValue: string
): string {
  return process.env[name] || defaultValue;
}

