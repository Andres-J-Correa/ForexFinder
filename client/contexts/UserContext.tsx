import { getCurrentUser } from "@/services/auth-service";
import { clearTokens, getAccessToken } from "@/services/token-storage";
import type { User } from "@/types/auth-service.types";
import {
    handleError,
    isAuthenticationError,
} from "@/utils/error-handler";
import { logger } from "@/utils/logger";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setUser(null);
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      const response = await getCurrentUser();
      if (response.data) {
        setUser(response.data);
        // isAuthenticated is already true when this is called, but ensure it stays true
        setIsAuthenticated(true);
      }
    } catch (error) {
      const errorResult = handleError(
        error,
        "UserContext.fetchCurrentUser",
        "Failed to fetch user information"
      );

      // If authentication error, clear user state
      if (isAuthenticationError(error)) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      logger.log("Clearing tokens");
      await clearTokens();
    } catch (error) {
      handleError(
        error,
        "UserContext.logout",
        "Failed to log out completely"
      );
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Initialize isAuthenticated on mount based on token existence
  useEffect(() => {
    const checkInitialAuth = async () => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    checkInitialAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      logger.log("Fetching current user");
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        logout,
        setAuthenticated: setIsAuthenticated,
      }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

