import { requireEnv } from "@/utils/env-validation";

export const API_HOST_PREFIX = requireEnv(
  "EXPO_PUBLIC_API_HOST_PREFIX",
  process.env.EXPO_PUBLIC_API_HOST_PREFIX,
  "API base URL for backend services"
);
