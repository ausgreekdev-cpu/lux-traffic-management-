import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'lux_auth_user';

const users = [
  { id: 1, name: 'LUX Operations', email: 'admin@lux-traffic.com.au', password: 'luxadmin2026', role: 'admin', avatar: 'LO' },
  { id: 2, name: 'James Mitchell', email: 'james@lux-traffic.com.au', password: 'luxtm2026', role: 'manager', avatar: 'JM' },
  { id: 3, name: 'Emma Wilson', email: 'emma@lux-traffic.com.au', password: 'luxtm2026', role: 'manager', avatar: 'EW' },
  { id: 4, name: 'Tom Baker', email: 'tom@lux-traffic.com.au', password: 'luxtm2026', role: 'crew', avatar: 'TB' },
  { id: 5, name: 'Sarah Connor', email: 'sarah@lux-traffic.com.au', password: 'luxtm2026', role: 'crew', avatar: 'SC' },
  { id: 6, name: 'David Lee', email: 'david@lux-traffic.com.au', password: 'luxtm2026', role: 'viewer', avatar: 'DL' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return false;
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);