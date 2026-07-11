import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
  type User,
} from "@workspace/api-client-react";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  invalidate: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  invalidate: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
  }

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, invalidate }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
