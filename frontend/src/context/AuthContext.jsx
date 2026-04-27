import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAuthStorage,
  getStoredToken,
  setStoredToken,
  setStoredUser
} from "../utils/authStorage";

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const payload = JSON.parse(atob(payloadBase64));

    if (!payload.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  } catch {
    return true;
  }
};

const decodeToken = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));

    return {
      id: payload.sub,
      role: payload.roles?.[0]?.replace("ROLE_", "").toLowerCase()
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getStoredToken());

  const [user, setUser] = useState(() => {
    const storedToken = getStoredToken();
    return storedToken && !isTokenExpired(storedToken)
      ? decodeToken(storedToken)
      : null;
  });

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
  };

  const login = ({ token: nextToken }) => {
    const decodedUser = decodeToken(nextToken);

    setToken(nextToken);
    setUser(decodedUser);

    setStoredToken(nextToken);
    setStoredUser(decodedUser);
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    if (isTokenExpired(token)) {
      logout();
    } else {
      setUser(decodeToken(token));
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token) && !isTokenExpired(token),
      login,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};