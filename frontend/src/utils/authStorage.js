const TOKEN_KEY = "ccira_token";
const USER_KEY = "ccira_user";
const LEGACY_TOKEN_KEY = "token";

export const getStoredToken = () => {
 const token = localStorage.getItem(TOKEN_KEY);

 if (token) {
  return token;
 }

 const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);

 if (legacyToken) {
  localStorage.setItem(TOKEN_KEY, legacyToken);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
 }

 return legacyToken;
};

export const setStoredToken = (token) => {
 if (!token) {
  return;
 }

 localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
 localStorage.removeItem(TOKEN_KEY);
 localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const getStoredUser = () => {
 const value = localStorage.getItem(USER_KEY);

 if (!value) {
  return null;
 }

 try {
  return JSON.parse(value);
 } catch (error) {
  localStorage.removeItem(USER_KEY);
  return null;
 }
};

export const setStoredUser = (user) => {
 if (!user) {
  return;
 }

 localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
 localStorage.removeItem(USER_KEY);
};

export const clearAuthStorage = () => {
 clearStoredToken();
 clearStoredUser();
};