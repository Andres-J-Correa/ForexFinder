import * as SecureStore from "expo-secure-store";

import { handleError } from "@/utils/error-handler";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Securely stores the access token
 */
export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/**
 * Securely stores the refresh token
 */
export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/**
 * Retrieves the access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    handleError(
      error,
      "token-storage.getAccessToken",
      "Failed to retrieve access token"
    );
    return null;
  }
}

/**
 * Retrieves the refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    handleError(
      error,
      "token-storage.getRefreshToken",
      "Failed to retrieve refresh token"
    );
    return null;
  }
}

/**
 * Removes both access and refresh tokens
 */
export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    handleError(
      error,
      "token-storage.clearTokens",
      "Failed to clear tokens"
    );
  }
}

/**
 * Saves both access and refresh tokens
 */
export async function saveTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    saveAccessToken(accessToken),
    saveRefreshToken(refreshToken),
  ]);
}

