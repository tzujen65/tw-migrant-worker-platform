'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured, UserRole } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, role } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('正在驗證您的 Email 並開通帳號...');

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        if (!isSupabaseConfigured) {
          setStatus('success');
          setMessage('驗證完成！帳號已開通。');
          setTimeout(() => {
            router.push('/auth/login?verified=true');
          }, 1500);
          return;
        }

        // Supabase App Router callback: exchange code for session
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code:', error);
            setStatus('error');
            setMessage(`驗證失敗：${error.message}`);
            return;
          }

          if (data.session?.user) {
            // Update profile email_confirmed in supabase
            await supabase
              .from('profiles')
              .update({ email_confirmed: true })
              .eq('id', data.session.user.id);

            const userRole = (data.session.user.user_metadata?.role as UserRole) || 'user';
            setStatus('success');
            setMessage('🎉 恭喜！Email 驗證成功，帳號已開通。正在引導至控制台...');

            setTimeout(() => {
              if (userRole === 'admin') {
                router.push('/admin');
              } else if (userRole === 'company_admin') {
                router.push('/company/dashboard');
              } else {
                router.push('/dashboard');
              }
            }, 1200);
            return;
          }
        }

        // If no code, check active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage('帳號已驗證開通，正在為您導向...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1200);
        } else {
          setStatus('success');
          setMessage('驗證程序已完成，請使用您的帳號登入。');
          setTimeout(() => {
            router.push('/auth/login?verified=true');
          }, 1500);
        }
      } catch (err: unknown) {
        console.error(err);
        setStatus('error');
        const errMessage = err instanceof Error ? err.message : '驗證過程發生未預期錯誤';
        setMessage(errMessage);
      }
    }

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div style={{
      maxWidth: '480px',
      margin: '60px auto',
      background: 'white',
      padding: '40px 32px',
      borderRadius: '20px',
      border: '1px solid #dfe9f5',
      boxShadow: '0 20px 40px rgba(15, 91, 211, 0.08)',
      textAlign: 'center',
    }}>
      {status === 'verifying' && (
        <>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #dfe9f5',
            borderTopColor: '#0f5bd3',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px auto',
          }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>驗證處理中</h2>
          <p style={{ color: '#64748b' }}>{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#166534' }}>帳號驗證開通成功！</h2>
          <p style={{ color: '#475569', marginBottom: '24px' }}>{message}</p>
          <Link href="/auth/login" className="button button-primary">
            立即前往登入
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626' }}>驗證失敗或連結已過期</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{message}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/auth/verify-email" className="button button-primary">
              重新發送驗證信
            </Link>
            <Link href="/auth/login" className="button button-secondary">
              返回登入頁
            </Link>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 16px' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>處理驗證中...</div>}>
        <CallbackContent />
      </Suspense>
    </main>
  );
}
