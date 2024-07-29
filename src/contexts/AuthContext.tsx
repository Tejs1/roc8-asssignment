import React, { createContext, useContext } from "react";

import { api } from "@/trpc/react";
type User = { id: string | null; name: string | null; email: string | null };

const AuthContext = createContext<{
  user: User | null | undefined;
  isLoading: boolean;
}>({
  user: { id: null, name: null, email: null },
  isLoading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = api.auth.getUser.useQuery(undefined, {
    retry: false,
  });

  return (
    <AuthContext.Provider value={{ user: data, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
