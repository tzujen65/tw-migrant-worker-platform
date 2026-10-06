'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, UserRole, UserProfile } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// Pre-defined demo accounts for easy local testing & evaluation
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'demo-admin-uuid-001',
    email: 'admin@migrant.tw',
    full_name: '系統最高管理者',
    role: 'admin',
    is_approved: true,
    email_confirmed: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  company_admin: {
    id: 'demo-company-uuid-002',
    email: 'company@migrant.tw',
    full_name: '陳經理 (永勝國際)',
    role: 'company_admin',
    company_name: '永勝國際人力仲介有限公司',
    company_tax_id: '54892301',
    phone: '02-2345-6789',
    is_approved: true,
    email_confirmed: true,
    created_at: '2026-02-15T00:00:00Z',
  },
  user: {
    id: 'demo-user-uuid-003',
    email: 'user@migrant.tw',
    full_name: '阮文雄 (Nguyen Van Hung)',
    role: 'user',
    phone: '0912-345-678',
    is_approved: true,
    email_confirmed: true,
    created_at: '2026-03-20T00:00:00Z',
  },
};

interface SignUpParams {
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  company_tax_id?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string; unverified?: boolean }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string; requireVerification?: boolean }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailSimulate: (email: string) => Promise<{ success: boolean }>;
  loginAsDemo: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'tw_migrant_current_profile';
const LOCAL_STORAGE_PENDING_KEY = 'tw_migrant_pending_verification';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync session and profile on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            await fetchProfile(session.user);
          } else if (mounted) {
            // Check local fallback session
            restoreLocalProfile();
          }

          // Listen to auth changes
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;
            if (newSession?.user) {
              setUser(newSession.user);
              await fetchProfile(newSession.user);
            } else {
              setUser(null);
              // Only clear profile if not in demo mode
              const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (!saved || !saved.includes('demo-')) {
                setProfile(null);
              }
            }
          });

          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          // Supabase not configured: load stored demo/local session if available
          restoreLocalProfile();
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        restoreLocalProfile();
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  function restoreLocalProfile() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        setProfile(parsed);
      }
    } catch {
      // ignore
    }
  }

  async function fetchProfile(authUser: User) {
    try {
      // 1. Try to fetch from `profiles` table in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const isEmailConfirmed = Boolean(authUser.email_confirmed_at);

      if (data && !error) {
        const userProfile: UserProfile = {
          ...data,
          email_confirmed: isEmailConfirmed,
        };
        setProfile(userProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
        return userProfile;
      } else {
        // Fallback to user_metadata if profiles row not created yet
        const meta = authUser.user_metadata || {};
        const fallbackProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: meta.full_name || authUser.email?.split('@')[0] || '使用者',
          role: (meta.role as UserRole) || 'user',
          company_name: meta.company_name,
          company_tax_id: meta.company_tax_id,
          phone: meta.phone,
          is_approved: meta.role === 'company_admin' ? false : true,
          email_confirmed: isEmailConfirmed,
          created_at: authUser.created_at,
        };
        setProfile(fallbackProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackProfile));
        return fallbackProfile;
      }
    } catch (err) {
      console.warn('Failed to fetch profile from DB, using metadata fallback:', err);
      const isEmailConfirmed = Boolean(authUser.email_confirmed_at);
      const meta = authUser.user_metadata || {};
      const fallbackProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: meta.full_name || authUser.email?.split('@')[0] || '使用者',
        role: (meta.role as UserRole) || 'user',
        company_name: meta.company_name,
        company_tax_id: meta.company_tax_id,
        phone: meta.phone,
        is_approved: meta.role === 'company_admin' ? false : true,
        email_confirmed: isEmailConfirmed,
        created_at: authUser.created_at,
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }

  // 註冊帳號
  async function signUp(params: SignUpParams) {
    const { email, password, full_name, role, company_name, company_tax_id, phone } = params;

    // Check if real Supabase Auth is enabled
    if (isSupabaseConfigured && password) {
      try {
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
              role,
              company_name: company_name || null,
              company_tax_id: company_tax_id || null,
              phone: phone || null,
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // If email confirmation is required:
        const userRequiresConfirm = !data.user?.email_confirmed_at;

        // Save pending verification info
        if (typeof window !== 'undefined') {
          const pending = {
            email,
            full_name,
            role,
            company_name,
            company_tax_id,
            phone,
            created_at: new Date().toISOString(),
          };
          localStorage.setItem(LOCAL_STORAGE_PENDING_KEY, JSON.stringify(pending));
        }

        return {
          success: true,
          requireVerification: userRequiresConfirm,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '註冊失敗';
        return { success: false, error: message };
      }
    }

    // Demo / Local Mode registration simulation
    const simulatedPendingProfile: UserProfile = {
      id: `local-${Date.now()}`,
      email,
      full_name,
      role,
      company_name,
      company_tax_id,
      phone,
      is_approved: role === 'company_admin' ? false : true,
      email_confirmed: false, // Needs email verification
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_PENDING_KEY, JSON.stringify(simulatedPendingProfile));
    }

    return {
      success: true,
      requireVerification: true,
    };
  }

  // 登入
  async function signIn(email: string, password?: string) {
    // 1. Check if matches pre-defined demo credentials
    const demoMatch = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (demoMatch) {
      setProfile(demoMatch);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoMatch));
      return { success: true };
    }

    // 2. Real Supabase Auth login
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If error is about email confirmation
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              unverified: true,
              error: '您的 Email 尚未通過驗證開通！請先前往信箱點擊驗證信以開通帳號。',
            };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          if (!data.user.email_confirmed_at) {
            return {
              success: false,
              unverified: true,
              error: '您的 Email 尚未通過驗證開通！請先前往信箱點擊驗證信以開通帳號。',
            };
          }
          setUser(data.user);
          await fetchProfile(data.user);
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '登入失敗';
        return { success: false, error: message };
      }
    }

    // 3. Fallback check from pending local storage
    if (typeof window !== 'undefined') {
      const pendingRaw = localStorage.getItem(LOCAL_STORAGE_PENDING_KEY);
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw) as UserProfile;
        if (pending.email.toLowerCase() === email.toLowerCase()) {
          if (!pending.email_confirmed) {
            return {
              success: false,
              unverified: true,
              error: '您的 Email 尚未完成驗證開通！請點擊信箱驗證連結，或使用模擬驗證開通。',
            };
          }
          setProfile(pending);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
          return { success: true };
        }
      }
    }

    return {
      success: false,
      error: '帳號或密碼錯誤。如為本機測試，請使用示範帳號或先行註冊。',
    };
  }

  // 登出
  async function signOut() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  // 重新發送驗證信
  async function resendVerification(email: string) {
    if (isSupabaseConfigured) {
      try {
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '重新發送失敗';
        return { success: false, error: message };
      }
    }

    // Demo / fallback mode
    return { success: true };
  }

  // 模擬驗證開通 (供本機測試/展示快速通過)
  async function verifyEmailSimulate(email: string) {
    if (typeof window !== 'undefined') {
      const pendingRaw = localStorage.getItem(LOCAL_STORAGE_PENDING_KEY);
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw) as UserProfile;
        if (pending.email.toLowerCase() === email.toLowerCase()) {
          pending.email_confirmed = true;
          setProfile(pending);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
          localStorage.setItem(LOCAL_STORAGE_PENDING_KEY, JSON.stringify(pending));
          return { success: true };
        }
      }

      // If no pending record, create active user
      const verifiedProfile: UserProfile = {
        id: `local-sim-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role: 'user',
        is_approved: true,
        email_confirmed: true,
        created_at: new Date().toISOString(),
      };
      setProfile(verifiedProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(verifiedProfile));
      return { success: true };
    }
    return { success: false };
  }

  // 一鍵登入示範帳號
  function loginAsDemo(role: UserRole) {
    const demo = DEMO_USERS[role];
    setProfile(demo);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demo));
    }
  }

  // 更新個人資料
  async function updateProfile(data: Partial<UserProfile>) {
    if (!profile) return { success: false, error: '未登入' };

    const updated = { ...profile, ...data, updated_at: new Date().toISOString() };
    setProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user.id);

        if (error) {
          console.warn('Could not update Supabase profiles table:', error.message);
        }
      } catch (err) {
        console.warn('Error updating profile in Supabase:', err);
      }
    }

    return { success: true };
  }

  const value: AuthContextType = {
    user,
    profile,
    role: profile?.role || null,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resendVerification,
    verifyEmailSimulate,
    loginAsDemo,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
