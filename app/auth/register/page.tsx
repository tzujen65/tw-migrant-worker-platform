'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { UserRole } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  // Company Admin specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [services, setServices] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    // Safari Autofill safeguard: Read values directly from DOM in case Safari autofilled without triggering React's synthetic onChange
    const formElement = e.currentTarget;
    const pwdInput = formElement.elements.namedItem('password') as HTMLInputElement | null;
    const confirmPwdInput = formElement.elements.namedItem('confirmPassword') as HTMLInputElement | null;

    const actualPassword = (pwdInput?.value !== undefined ? pwdInput.value : password).trim();
    const actualConfirmPassword = (confirmPwdInput?.value !== undefined ? confirmPwdInput.value : confirmPassword).trim();

    // Sync state
    if (actualPassword !== password) setPassword(actualPassword);
    if (actualConfirmPassword !== confirmPassword) setConfirmPassword(actualConfirmPassword);

    if (!email.trim() || !actualPassword || !fullName.trim()) {
      setErrorMsg('請填寫所有必要欄位（Email、密碼、姓名）');
      return;
    }

    if (actualPassword.length < 6) {
      setErrorMsg('密碼長度至少需要 6 個字元');
      return;
    }

    if (actualPassword !== actualConfirmPassword) {
      setErrorMsg('兩次輸入的密碼不一致，請檢查大小寫或是否有多餘空格（可點擊小眼睛圖示確認）');
      return;
    }

    if (role === 'company_admin' && !companyName) {
      setErrorMsg('申請公司管理者身份必須填寫公司名稱');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUp({
        email: email.trim(),
        password: actualPassword,
        full_name: fullName.trim(),
        role,
        company_name: role === 'company_admin' ? companyName.trim() : undefined,
        company_tax_id: role === 'company_admin' ? companyTaxId.trim() : undefined,
        phone: phone.trim(),
      });


      if (!res.success) {
        setErrorMsg(res.error || '註冊失敗，請重試');
        setIsSubmitting(false);
        return;
      }

      // Redirect to email verification pending page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&role=${role}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '系統發生錯誤';
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '40px 16px' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
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
                新會員註冊
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                建立您的平台帳號
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                請選擇您的身分類別並填寫註冊資訊，註冊後需完成 Email 驗證開通
              </p>
            </div>

            {/* Role Switcher */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem', color: '#334155' }}>
                請選擇註冊帳號身分：
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: role === 'user' ? '2px solid #0f5bd3' : '1px solid #cbd5e1',
                    background: role === 'user' ? '#eef4ff' : 'white',
                    color: role === 'user' ? '#0f5bd3' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>👤</span>
                  <span>一般使用者</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                    求職移工 / 履歷應徵
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('company_admin')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: role === 'company_admin' ? '2px solid #0f5bd3' : '1px solid #cbd5e1',
                    background: role === 'company_admin' ? '#eef4ff' : 'white',
                    color: role === 'company_admin' ? '#0f5bd3' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>🏢</span>
                  <span>申請公司管理者</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                    企業雇主 / 人力仲介機構
                  </span>
                </button>
              </div>
            </div>

            {errorMsg && (
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

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#334155' }}>
                  電子郵件 (Email) <span style={{ color: '#ef4444' }}>*</span>
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
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  ※ 註冊後將寄送開通認證信至此 Email，請務必填寫正確
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* 設定密碼 */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#334155' }}>
                    設定密碼 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={passwordInputRef}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="至少 6 碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 14px',
                        border: `1px solid ${
                          password.length > 0 && password.length < 6
                            ? '#f87171'
                            : password.length >= 6
                            ? '#86efac'
                            : '#cbd5e1'
                        }`,
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentPassword = passwordInputRef.current?.value;
                        if (currentPassword !== undefined && currentPassword !== password) {
                          setPassword(currentPassword);
                        }
                        setShowPassword((isVisible) => !isVisible);
                      }}
                      aria-label={showPassword ? '隱藏密碼' : '顯示明文密碼'}
                      title={showPassword ? '隱藏密碼' : '顯示明文密碼'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        zIndex: 1,
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
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
                  {password.length > 0 && (
                    <div style={{
                      fontSize: '0.78rem',
                      marginTop: '4px',
                      color: password.length >= 6 ? '#16a34a' : '#dc2626',
                      fontWeight: 500,
                    }}>
                      {password.length >= 6
                        ? '✓ 密碼長度符合 (>= 6碼)'
                        : `密碼長度至少需 6 碼（目前 ${password.length} 碼）`}
                    </div>
                  )}
                </div>

                {/* 確認密碼 */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#334155' }}>
                    確認密碼 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={confirmPasswordInputRef}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="再次輸入密碼"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 14px',
                        border: `1px solid ${
                          confirmPassword.length > 0
                            ? password.trim() === confirmPassword.trim()
                              ? '#86efac'
                              : '#f87171'
                            : '#cbd5e1'
                        }`,
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentConfirmPassword = confirmPasswordInputRef.current?.value;
                        if (currentConfirmPassword !== undefined && currentConfirmPassword !== confirmPassword) {
                          setConfirmPassword(currentConfirmPassword);
                        }
                        setShowConfirmPassword((isVisible) => !isVisible);
                      }}
                      aria-label={showConfirmPassword ? '隱藏密碼' : '顯示明文密碼'}
                      title={showConfirmPassword ? '隱藏密碼' : '顯示明文密碼'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        zIndex: 1,
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: showConfirmPassword ? '#0f5bd3' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                      }}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
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
                  {confirmPassword.length > 0 && (
                    <div style={{
                      fontSize: '0.78rem',
                      marginTop: '4px',
                      fontWeight: 600,
                      color: password.trim() === confirmPassword.trim() ? '#16a34a' : '#dc2626',
                    }}>
                      {password.trim() === confirmPassword.trim()
                        ? '✓ 兩次密碼相符'
                        : '✕ 兩次輸入的密碼不一致'}
                    </div>
                  )}
                </div>
              </div>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#334155' }}>
                    真實姓名 / 負責人稱呼 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：王小明"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#334155' }}>
                    聯絡電話 / 手機
                  </label>
                  <input
                    type="tel"
                    placeholder="例如：0912-345-678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
              </div>

              {/* Company Admin Extra Fields */}
              {role === 'company_admin' && (
                <div style={{
                  background: '#f1f5f9',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginTop: '6px',
                  display: 'grid',
                  gap: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f5bd3', fontWeight: 700 }}>
                    <span>🏢</span>
                    <span>申請公司基本資料 (將由管理員審核合法資格)</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px', color: '#334155' }}>
                      公司 / 機構全名 <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例：台灣國際人才仲介股份有限公司"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px', color: '#334155' }}>
                      統一編號或就業服務私立執照字號
                    </label>
                    <input
                      type="text"
                      placeholder="例：88123456 或 許可證字號 2831"
                      value={companyTaxId}
                      onChange={(e) => setCompanyTaxId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px', color: '#334155' }}>
                      主要服務國家 / 項目
                    </label>
                    <input
                      type="text"
                      placeholder="例：越南、印尼 / 製造業、看護、簽證諮詢"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                color: '#1e40af',
                lineHeight: 1.5,
              }}>
                ℹ️ <strong>開通說明：</strong>完成註冊後，系統將寄送開通驗證信至您的 Email。點擊信內連結開通後，即可登入平台開始使用。
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="button button-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginTop: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? '註冊處理中...' : '確認註冊並寄送驗證信'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
              已經有帳號了？{' '}
              <Link href="/auth/login" style={{ color: '#0f5bd3', fontWeight: 700, textDecoration: 'underline' }}>
                立即登入
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
