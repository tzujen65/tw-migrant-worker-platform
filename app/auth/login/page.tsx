'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { UserRole } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, loginAsDemo, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVerifiedNotice = searchParams.get('verified') === 'true';
  const emailParam = searchParams.get('email');
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setUnverifiedEmail(null);

    const formElement = e.currentTarget;
    const pwdInput = formElement.elements.namedItem('password') as HTMLInputElement | null;
    const actualPassword = (pwdInput?.value !== undefined ? pwdInput.value : password).trim();
    const actualEmail = email.trim();

    if (!actualEmail) {
      setErrorMsg('請輸入電子信箱');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signIn(actualEmail, actualPassword);


      if (!res.success) {
        if (res.unverified) {
          setUnverifiedEmail(email);
        }
        setErrorMsg(res.error || '登入失敗，請確認帳號密碼');
        setIsSubmitting(false);
        return;
      }

      // Login success, redirect based on destination or role
      if (redirectParam) {
        router.push(redirectParam);
        return;
      }

      // Check role from demo or default
      const demoUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (demoUser?.role === 'admin') {
        router.push('/admin');
      } else if (demoUser?.role === 'company_admin') {
        router.push('/company/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '系統發生錯誤';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  }

  function handleQuickDemo(role: UserRole) {
    loginAsDemo(role);
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'company_admin') {
      router.push('/company/dashboard');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid #dfe9f5',
        boxShadow: '0 20px 40px rgba(15, 91, 211, 0.06)',
        padding: '36px 32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '20px',
            background: '#eef4ff',
            color: '#0f5bd3',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '10px'
          }}>
            會員登入
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            歡迎回到移工媒合平台
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            請輸入帳號密碼，經 Email 驗證開通之帳號方可登入
          </p>
        </div>

        {/* Verified Notice Banner */}
        {isVerifiedNotice && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>🎉</span>
            <span>Email 驗證成功！帳號已完成開通，請登入。</span>
          </div>
        )}

        {/* Unverified Email Warning Banner */}
        {unverifiedEmail && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '14px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '20px',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>
              ⚠️ 此帳號尚未完成 Email 開通驗證
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
              為維護平台安全，新註冊帳號需點擊認證信連結開通後才能登入。
            </p>
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
              className="button button-primary"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}
            >
              前往開通驗證頁面 / 重寄驗證信 →
            </Link>
          </div>
        )}

        {errorMsg && !unverifiedEmail && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '20px',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#334155' }}>
              電子郵件 (Email)
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
                密碼
              </label>
              <Link href="/auth/verify-email" style={{ fontSize: '0.8rem', color: '#0f5bd3' }}>
                未收到驗證信？
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '隱藏密碼' : '顯示明文密碼'}
                title={showPassword ? '隱藏密碼' : '顯示明文密碼'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: showPassword ? '#0f5bd3' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            className="button button-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? '登入中...' : '登入系統'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
          還沒有帳號？{' '}
          <Link href="/auth/register" style={{ color: '#0f5bd3', fontWeight: 700, textDecoration: 'underline' }}>
            立即註冊
          </Link>
        </div>

        {/* Fast Demo Role Switcher for Testing */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#475569',
            marginBottom: '10px',
            textAlign: 'center',
          }}>
            ⚡ 快速測試體驗（免密碼切換三種身分與權限）：
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <strong style={{ color: '#991b1b', fontSize: '0.88rem' }}>👑 最高權限：後台管理者</strong>
                <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>全權審核公司、管理使用者與職缺</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>以管理者進入 →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('company_admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <strong style={{ color: '#1e40af', fontSize: '0.88rem' }}>🏢 一般管理者：申請公司管理者</strong>
                <div style={{ fontSize: '0.75rem', color: '#1e3a8a' }}>管理自家公司資訊、發布與管理職缺</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 700 }}>以公司登入 →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <strong style={{ color: '#166534', fontSize: '0.88rem' }}>👤 一般使用者：移工 / 求職者</strong>
                <div style={{ fontSize: '0.75rem', color: '#14532d' }}>瀏覽熱門職缺、應徵與收藏紀錄</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>以求職者登入 →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '40px 16px' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>載入中...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
