import React, { createContext, useContext, useEffect, useState } from "react";

import { api } from "@/trpc/react";
type User = { id: string | null; name: string | null; email: string | null };

const AuthContext = createContext<{
  user: User;
  updateUser: (user: User) => void;
}>({
  user: { id: null, name: null, email: null },
  updateUser: (user: User) => void { user },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>({ id: null, name: null, email: null });

  const { data } = api.auth.getUser.useQuery();
  const updateUser = (user: User) => {
    setUser(user);
  };
  useEffect(() => {
    try {
      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
        });
      }
    } catch (error) {
      console.error("Error setting user data", error);
    }
  }, [data]);

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
