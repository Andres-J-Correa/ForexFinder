import { getCurrentUser } from "@/services/auth-service";
import { clearTokens, getAccessToken } from "@/services/token-storage";
import type { User } from "@/types/auth-service.types";
import { isAxiosError } from "axios";
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
      console.log("accessToken", accessToken);
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
      if (isAxiosError(error)) {
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      console.error("Error fetching current user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      console.log("clearing tokens");
      await clearTokens();
    } catch (error) {
      console.error("Error during logout:", error);

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
    if(isAuthenticated) {
        console.log("fetching current user");
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

