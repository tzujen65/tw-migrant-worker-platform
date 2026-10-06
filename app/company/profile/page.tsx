'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useAuth } from '@/lib/auth-context';

export default function CompanyProfilePage() {
  const { profile, updateProfile } = useAuth();

  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [companyTaxId, setCompanyTaxId] = useState(profile?.company_tax_id || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    const res = await updateProfile({
      company_name: companyName,
      company_tax_id: companyTaxId,
      full_name: fullName,
      phone,
    });

    if (res.success) {
      setNotice('公司資料已成功更新！');
    } else {
      setNotice('更新失敗，請稍候重試');
    }
    setIsSaving(false);
  }

  return (
    <AuthGuard allowedRoles={['company_admin', 'admin']}>
      <SiteHeader />

      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Link href="/company/dashboard" style={{ color: '#0f5bd3', fontWeight: 600, fontSize: '0.9rem' }}>
              ← 回到公司管理專區
            </Link>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #dfe9f5',
            padding: '36px 32px',
            boxShadow: '0 10px 30px rgba(15, 91, 211, 0.05)',
          }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
              維護公司資料與資格執照
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
              更新您的企業名稱、私立就業服務機構許可證字號與招募窗口聯絡資訊
            </p>

            {notice && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                marginBottom: '20px',
              }}>
                ✅ {notice}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  公司 / 仲介機構名稱
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  統一編號或就服執照證號
                </label>
                <input
                  type="text"
                  value={companyTaxId}
                  onChange={(e) => setCompanyTaxId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  負責人 / 招募窗口姓名
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  聯絡電話
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  註冊 Email（不可變更）
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f1f5f9', color: '#64748b' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="button button-primary"
                style={{ padding: '12px', marginTop: '10px', fontWeight: 700 }}
              >
                {isSaving ? '儲存中...' : '儲存變更'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </AuthGuard>
  );
}
