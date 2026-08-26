'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthContextType, User } from '@/types/auth';
import { mapSupabaseUserToUser } from '@/types/auth';
import * as authService from '@/services/auth-service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const intentionalLogoutRef = useRef(false);

  const loadUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser) {
        setUser(null);
        return;
      }

      const role = await authService.fetchRole(supabaseUser.id);
      setUser(mapSupabaseUserToUser(supabaseUser, role));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = await authService.fetchRole(session.user.id);
        setUser(mapSupabaseUserToUser(session.user, role));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (intentionalLogoutRef.current) {
          intentionalLogoutRef.current = false;
          return;
        }
        if (window.location.pathname.startsWith('/dashboard')) {
          router.replace('/login?error=expired');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser, router]);

  const loginWithPassword = async (email: string, password: string) => {
    return authService.loginWithPassword(email, password);
  };

  const logout = async () => {
    intentionalLogoutRef.current = true;
    await authService.logout();
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
