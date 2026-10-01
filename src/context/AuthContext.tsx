/**
 * HaulSense - Authentication and Role Management Context
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DRIVERS } from '../data/mockData';

export type UserRole = 'manager' | 'driver';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  driverId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginManager: (email: string, pass: string) => { success: boolean; error?: string };
  loginDriver: (driverId: string, pin: string) => { success: boolean; error?: string };
  loginAsDefaultManager: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('haulsense_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('haulsense_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('haulsense_user');
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [user]);

  const loginManager = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanEmail === 'manager@haulsense.in' && cleanPass === 'haul123') {
      const newUser: AuthUser = {
        id: 'MGR-001',
        name: 'Karthik Subramanian',
        role: 'manager',
        email: 'manager@haulsense.in',
      };
      setUser(newUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Use manager@haulsense.in / haul123',
    };
  };

  const loginDriver = (driverId: string, pin: string) => {
    const cleanId = driverId.trim().toUpperCase();
    const cleanPin = pin.trim();

    const matchedDriver = DRIVERS.find((d) => d.id === cleanId);
    if (!matchedDriver) {
      return {
        success: false,
        error: `Driver ID '${driverId}' not found in fleet roster. Try DRV-001`,
      };
    }

    if (cleanPin !== '1234') {
      return {
        success: false,
        error: 'Invalid PIN. Fleet default is 1234',
      };
    }

    const newUser: AuthUser = {
      id: matchedDriver.id,
      name: matchedDriver.name,
      role: 'driver',
      driverId: matchedDriver.id,
    };
    setUser(newUser);
    return { success: true };
  };

  const loginAsDefaultManager = () => {
    const defaultUser: AuthUser = {
      id: 'MGR-001',
      name: 'Karthik Subramanian',
      role: 'manager',
      email: 'manager@haulsense.in',
    };
    setUser(defaultUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loginManager,
        loginDriver,
        loginAsDefaultManager,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
