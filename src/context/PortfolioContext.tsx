import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { DEFAULT_PORTFOLIO_BUNDLE } from '../data/defaultPortfolio';
import {
  ADMIN_EMAIL,
  auth,
  googleProvider,
  isFirebaseConfigured,
  testFirestoreConnection,
} from '../lib/firebase';
import { subscribeToPortfolioData } from '../lib/portfolioService';
import type { PortfolioDataBundle } from '../types/portfolio';

type ThemeMode = 'dark' | 'light';

interface PortfolioContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  data: PortfolioDataBundle;
  dataSource: 'firestore' | 'local-preview';
  loading: boolean;
  dataError: string | null;
  user: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  serverAuthorized: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [data, setData] = useState<PortfolioDataBundle>(DEFAULT_PORTFOLIO_BUNDLE);
  const [dataSource, setDataSource] = useState<'firestore' | 'local-preview'>(
    isFirebaseConfigured ? 'firestore' : 'local-preview',
  );
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const [dataError, setDataError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseConfigured);
  const [serverAuthorized, setServerAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('portfolio_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured) {
      void testFirestoreConnection();
    }

    const unsubscribe = subscribeToPortfolioData(
      (bundle, source) => {
        setData(bundle);
        setDataSource(source);
        setLoading(false);
        setDataError(null);
      },
      (err) => {
        console.warn('Firestore subscription notice:', err.message);
        setLoading(false);
        setDataError(err.message);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);
      if (!currentUser) {
        setServerAuthorized(false);
        setAuthLoading(false);
        return;
      }

      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (res.ok) {
          setServerAuthorized(true);
        } else {
          setServerAuthorized(false);
        }
      } catch (err) {
        console.warn('Server admin verification failed:', err);
        setServerAuthorized(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setAuthError('Firebase Authentication is not configured in this environment.');
      return;
    }
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setServerAuthorized(false);
        setAuthError(
          body.error ||
            `Signed in as ${result.user.email}, which is not authorized for portfolio administration.`,
        );
      } else {
        setServerAuthorized(true);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setServerAuthorized(false);
    setAuthError(null);
  }, []);

  const isAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      serverAuthorized,
  );

  return (
    <PortfolioContext.Provider
      value={{
        theme,
        toggleTheme,
        data,
        dataSource,
        loading,
        dataError,
        user,
        authLoading,
        isAdmin,
        serverAuthorized,
        authError,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
