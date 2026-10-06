'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resendVerification, verifyEmailSimulate, isConfigured } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [cooldown, setCooldown] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleResend() {
    if (!email) {
      setStatusMsg({ type: 'error', text: '請輸入欲接收驗證信的 Email' });
      return;
    }

    setIsResending(true);
    setStatusMsg(null);

    try {
      const res = await resendVerification(email);
      if (res.success) {
        setStatusMsg({ type: 'success', text: `驗證信已重新發送至 ${email}，請至信箱查收！` });
        setCooldown(60);
      } else {
        setStatusMsg({ type: 'error', text: res.error || '重新發送失敗，請稍後再試' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '系統發生錯誤';
      setStatusMsg({ type: 'error', text: message });
    } finally {
      setIsResending(false);
    }
  }

  async function handleSimulateVerify() {
    if (!email) return;
    setIsSimulating(true);

    try {
      const res = await verifyEmailSimulate(email);
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: '🎉 Email 驗證成功！帳號已正式開通，即將自動引導至登入畫面...',
        });
        setTimeout(() => {
          router.push(`/auth/login?verified=true&email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch {
      setStatusMsg({ type: 'error', text: '模擬開通失敗' });
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid #dfe9f5',
        boxShadow: '0 20px 40px rgba(15, 91, 211, 0.06)',
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #eef4ff, #dbeafe)',
          color: '#0f5bd3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          margin: '0 auto 20px auto',
        }}>
          ✉️
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          請驗證您的 Email 帳號
        </h1>

        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
          系統已寄發開通確認信至您的信箱：<br />
          <strong style={{ color: '#0f5bd3', fontSize: '1.1rem' }}>{email || '您的註冊信箱'}</strong>
        </p>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px 20px',
          textAlign: 'left',
          fontSize: '0.9rem',
          color: '#334155',
          marginBottom: '28px',
          display: 'grid',
          gap: '8px',
        }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>📋 開通帳號三步驟：</div>
          <div>1. 請開啟您的電子信箱收件匣（如未收到可檢查垃圾郵件匣）。</div>
          <div>2. 點擊信中的<strong>「確認電子郵件地址」</strong>或<strong>「開通帳號連結」</strong>。</div>
          <div>3. 連結驗證成功後，系統將自動為您開通權限，即可正常登入！</div>
        </div>

        {statusMsg && (
          <div style={{
            background: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: statusMsg.type === 'success' ? '#166534' : '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            textAlign: 'left',
          }}>
            {statusMsg.type === 'success' ? '✅' : '⚠️'} {statusMsg.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="button button-secondary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: (isResending || cooldown > 0) ? 'not-allowed' : 'pointer',
              color: '#0f5bd3',
              borderColor: '#0f5bd3',
            }}
          >
            {isResending
              ? '發送中...'
              : cooldown > 0
              ? `重新發送驗證信 (${cooldown}s)`
              : '沒收到信？重新發送驗證信'}
          </button>

          <Link
            href="/auth/login"
            className="button button-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            我已點擊信件驗證，前往登入 →
          </Link>
        </div>

        {/* Local / Evaluation Simulation Helper */}
        <div style={{
          borderTop: '1px dashed #cbd5e1',
          paddingTop: '20px',
          marginTop: '20px',
        }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
            🛠️ <strong>本機測試 / 評估輔助工具：</strong>
            <br />
            若您未配置外部 SMTP 郵件伺服器，可直接點擊下方按鈕模擬完成開通：
          </p>
          <button
            type="button"
            onClick={handleSimulateVerify}
            disabled={isSimulating}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSimulating ? 'not-allowed' : 'pointer',
            }}
          >
            {isSimulating ? '模擬驗證中...' : '⚡ 一鍵模擬完成 Email 驗證並開通帳號'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '60px 16px' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>載入中...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
