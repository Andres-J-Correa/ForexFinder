import { isAxiosError } from "axios";

import { logger } from "./logger";

/**
 * Standard error types for consistent error handling
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * Standardized error result type
 */
export interface ErrorResult {
  type: ErrorType;
  message: string;
  originalError: unknown;
  statusCode?: number;
  userMessage: string;
}

/**
 * Extracts user-friendly error message from various error types
 */
function getUserMessage(error: unknown, defaultMessage: string): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // Handle specific HTTP status codes
    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (status === 403) {
      return "You don't have permission to perform this action.";
    }
    if (status === 404) {
      return "The requested resource was not found.";
    }
    if (status === 422) {
      return serverMessage || "Invalid data provided. Please check your input.";
    }
    if (status === 429) {
      return "Too many requests. Please try again later.";
    }
    if (status && status >= 500) {
      return "Server error. Please try again later.";
    }
    if (status && status >= 400) {
      return serverMessage || "Request failed. Please try again.";
    }

    // Network errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "Request timed out. Please check your connection and try again.";
    }
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Network error. Please check your internet connection.";
    }

    return serverMessage || defaultMessage;
  }

  if (error instanceof Error) {
    // Handle specific error messages
    if (error.message.includes("token") || error.message.includes("auth")) {
      return "Authentication error. Please log in again.";
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Network error. Please check your internet connection.";
    }
    return error.message || defaultMessage;
  }

  return defaultMessage;
}

/**
 * Determines error type from error object
 */
function getErrorType(error: unknown): ErrorType {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return ErrorType.AUTHENTICATION;
    }
    if (status === 403) {
      return ErrorType.AUTHORIZATION;
    }
    if (status === 404) {
      return ErrorType.NOT_FOUND;
    }
    if (status === 422) {
      return ErrorType.VALIDATION;
    }
    if (status && status >= 500) {
      return ErrorType.SERVER;
    }
    if (status && status >= 400) {
      return ErrorType.VALIDATION;
    }

    // Network errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return ErrorType.NETWORK;
    }
    if (error.code === "ERR_NETWORK" || !error.response) {
      return ErrorType.NETWORK;
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes("token") ||
      error.message.includes("auth") ||
      error.message.includes("unauthorized")
    ) {
      return ErrorType.AUTHENTICATION;
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return ErrorType.NETWORK;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Standardized error handler
 * Processes errors consistently across the application
 *
 * @param error - The error to handle
 * @param context - Context where the error occurred (e.g., "UserContext.fetchCurrentUser")
 * @param defaultMessage - Default user-friendly message if error can't be parsed
 * @returns ErrorResult with standardized error information
 */
export function handleError(
  error: unknown,
  context: string,
  defaultMessage: string = "An unexpected error occurred. Please try again."
): ErrorResult {
  const errorType = getErrorType(error);
  const userMessage = getUserMessage(error, defaultMessage);
  const statusCode = isAxiosError(error) ? error.response?.status : undefined;

  // Log the error with context
  logger.error(`[${context}]`, error);

  return {
    type: errorType,
    message: error instanceof Error ? error.message : String(error),
    originalError: error,
    statusCode,
    userMessage,
  };
}

/**
 * Checks if error is an authentication error (401)
 */
export function isAuthenticationError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return (
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message.includes("timeout")
    );
  }
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("timeout")
    );
  }
  return false;
}

/**
 * Checks if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
}

/**
 * Wraps an async function with standardized error handling
 *
 * @param fn - The async function to wrap
 * @param context - Context for error logging
 * @param onError - Optional error handler callback
 * @returns The result or throws a standardized error
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  onError?: (error: ErrorResult) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const errorResult = handleError(
      error,
      context,
      "An unexpected error occurred"
    );

    if (onError) {
      onError(errorResult);
    }

    // Re-throw the original error to maintain error propagation
    throw error;
  }
}

