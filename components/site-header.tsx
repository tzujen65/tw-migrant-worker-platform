'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export function SiteHeader() {
  const { profile, role, signOut, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const roleMeta = {
    admin: { label: '最高管理者', badgeClass: 'badge-admin', path: '/admin', title: '後台管理' },
    company_admin: { label: '公司管理者', badgeClass: 'badge-company', path: '/company/dashboard', title: '企業中心' },
    user: { label: '一般求職者', badgeClass: 'badge-user', path: '/dashboard', title: '會員中心' },
  };

  const currentRole = role ? roleMeta[role] : null;

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand" aria-label="台灣移工媒合平台首頁">
          <span className="brand-mark">TW</span>
          <span>台灣移工媒合平台</span>
        </Link>

        <nav className="main-nav" aria-label="主導覽">
          <Link href="/jobs">工作機會</Link>
          <Link href="/agencies">仲介公司</Link>
          <Link href="/process">申請流程</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoading ? (
            <div style={{ width: '80px', height: '36px', background: '#eef4ff', borderRadius: '20px' }} />
          ) : profile ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href={currentRole?.path || '/dashboard'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  background: '#f8fafc',
                  border: '1px solid #dfe9f5',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: role === 'admin' ? '#ef4444' : role === 'company_admin' ? '#0f5bd3' : '#10b981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {profile.full_name?.charAt(0) || 'U'}
                </span>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.full_name}
                </span>
                {currentRole && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: role === 'admin' ? '#fee2e2' : role === 'company_admin' ? '#e0e7ff' : '#d1fae5',
                      color: role === 'admin' ? '#b91c1c' : role === 'company_admin' ? '#3730a3' : '#065f46',
                      fontWeight: 700,
                    }}
                  >
                    {currentRole.label}
                  </span>
                )}
              </Link>

              <Link
                href={currentRole?.path || '/dashboard'}
                className="button button-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {currentRole?.title || '進入專區'}
              </Link>

              <button
                type="button"
                onClick={() => signOut()}
                className="button button-secondary"
                style={{
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.85rem',
                  color: '#64748b',
                  borderColor: '#cbd5e1',
                }}
                title="登出系統"
              >
                登出
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/auth/login"
                className="button button-secondary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.9rem' }}
              >
                登入
              </Link>
              <Link
                href="/auth/register"
                className="button button-primary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.9rem' }}
              >
                註冊帳號
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

