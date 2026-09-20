import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export type UserRole = 'admin' | 'manager';

export interface AuthUser {
  role: UserRole;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: UserRole;
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
  login: (pin: string, preferredRole?: UserRole) => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_KEY = 'lovely_eatery_admin_token';
const ROLE_KEY = 'lovely_eatery_user_role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  });
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(ROLE_KEY);
    return savedRole === 'manager' ? 'manager' : 'admin';
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedRole = (localStorage.getItem(ROLE_KEY) as UserRole) || 'admin';
    return token ? { role: savedRole, name: savedRole === 'admin' ? 'Administrator' : 'Manager' } : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedRole = (localStorage.getItem(ROLE_KEY) as UserRole) || 'admin';
    if (token) {
      setIsAuthenticated(true);
      setRoleState(savedRole);
      setUser({ role: savedRole, name: savedRole === 'admin' ? 'Administrator' : 'Manager' });
    }
  }, []);

  const login = async (pin: string, preferredRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(pin, preferredRole);
      if (res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        const resolvedRole: UserRole = res.user?.role === 'manager' ? 'manager' : 'admin';
        localStorage.setItem(ROLE_KEY, resolvedRole);
        setIsAuthenticated(true);
        setRoleState(resolvedRole);
        setUser({
          role: resolvedRole,
          name: res.user?.name || (resolvedRole === 'admin' ? 'Administrator' : 'Manager'),
        });
        return true;
      }
      return false;
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid PIN or credentials');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_KEY, newRole);
    setUser({
      role: newRole,
      name: newRole === 'admin' ? 'Administrator' : 'Manager',
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        isAdmin: role === 'admin',
        isManager: role === 'manager',
        isLoading,
        login,
        switchRole,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
