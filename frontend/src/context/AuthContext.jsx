import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, role, member_id, phone, address }
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Pulihkan sesi dari token yang tersimpan.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return;
    api.auth.profile().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, [logout]);

  // Simpan token dari respons login/register, lalu muat profil lengkap.
  const start = useCallback(async ({ token }) => {
    setToken(token);
    try {
      const me = await api.auth.profile();
      setUser(me);
      return me;
    } catch (e) {
      setToken(null);
      throw e;
    }
  }, []);

  const login = useCallback((email, password) => api.auth.login({ email, password }).then(start), [start]);
  const register = useCallback((form) => api.auth.register(form).then(start), [start]);

  const value = useMemo(() => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
