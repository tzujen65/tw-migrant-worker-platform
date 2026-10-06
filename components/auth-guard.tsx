'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/supabase';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireEmailVerified?: boolean;
}

export function AuthGuard({
  children,
  allowedRoles,
  requireEmailVerified = true,
}: AuthGuardProps) {
  const { profile, role, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #dfe9f5',
          borderTopColor: '#0f5bd3',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#5f6f85' }}>身分驗證中，請稍候...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in
  if (!profile) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '520px', textAlign: 'center' }}>
        <div style={{
          background: 'white',
          padding: '40px 32px',
          borderRadius: '16px',
          border: '1px solid #dfe9f5',
          boxShadow: '0 18px 40px rgba(13, 32, 72, 0.08)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 700 }}>請先登入帳號</h2>
          <p style={{ color: '#5f6f85', marginBottom: '28px' }}>
            此區域需要身分權限驗證，請先登入您的帳號後再進行操作。
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/auth/login" className="button button-primary">
              前往登入
            </Link>
            <Link href="/auth/register" className="button button-secondary">
              免費註冊
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Email not verified
  if (requireEmailVerified && !profile.email_confirmed) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '560px', textAlign: 'center' }}>
        <div style={{
          background: '#fff9e6',
          padding: '40px 32px',
          borderRadius: '16px',
          border: '1px solid #f9c74f',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <h2 style={{ marginBottom: '12px', color: '#b7791f' }}>帳號尚未完成 Email 驗證</h2>
          <p style={{ color: '#744210', marginBottom: '24px' }}>
            系統已發送驗證信至 <strong>{profile.email}</strong>。為確保資訊安全，您必須先點擊信中連結開通帳號後，才能使用此功能。
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href={`/auth/verify-email?email=${encodeURIComponent(profile.email)}`} className="button button-primary">
              前往驗證頁面開通
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const roleLabels: Record<UserRole, string> = {
      admin: '系統最高管理者',
      company_admin: '申請公司管理者',
      user: '一般求職使用者',
    };

    const allowedNames = allowedRoles.map((r) => roleLabels[r]).join(' 或 ');

    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '560px', textAlign: 'center' }}>
        <div style={{
          background: 'white',
          padding: '40px 32px',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          boxShadow: '0 18px 40px rgba(13, 32, 72, 0.08)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ marginBottom: '12px', color: '#dc2626' }}>存取權限不足 (403 Forbidden)</h2>
          <p style={{ color: '#5f6f85', marginBottom: '8px' }}>
            您的目前身分為：<strong>【{roleLabels[role]}】</strong>
          </p>
          <p style={{ color: '#5f6f85', marginBottom: '28px' }}>
            此區域僅供<strong>【{allowedNames}】</strong>訪問，您無權瀏覽此頁面。
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {role === 'admin' && (
              <Link href="/admin" className="button button-primary">
                前往管理後台
              </Link>
            )}
            {role === 'company_admin' && (
              <Link href="/company/dashboard" className="button button-primary">
                前往公司專區
              </Link>
            )}
            {role === 'user' && (
              <Link href="/dashboard" className="button button-primary">
                前往個人中心
              </Link>
            )}
            <Link href="/" className="button button-secondary">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
