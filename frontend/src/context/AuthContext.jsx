import { useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
} from "../api/authApi";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        const authenticatedUser = await loginAccount(credentials);
        setUser(authenticatedUser);
        return authenticatedUser;
      },
      async register(details) {
        const authenticatedUser = await registerAccount(details);
        setUser(authenticatedUser);
        return authenticatedUser;
      },
      async logout() {
        await logoutAccount();
        setUser(null);
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
