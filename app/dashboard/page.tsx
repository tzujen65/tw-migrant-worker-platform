'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useAuth } from '@/lib/auth-context';
import type { Job } from '@/lib/supabase';

interface ApplicationItem {
  id: number;
  job_title: string;
  company_name: string;
  country: string;
  salary: string;
  applied_at: string;
  status: '審核中' | '已安排線上面試' | '文件送審中';
}

const SAMPLE_APPLICATIONS: ApplicationItem[] = [
  {
    id: 1,
    job_title: '電子零組件製造作業員',
    company_name: '永勝國際人力仲介',
    country: '越南',
    salary: 'NT$ 32,000 ~ 45,000',
    applied_at: '2026-03-28',
    status: '已安排線上面試',
  },
  {
    id: 2,
    job_title: '物流倉儲揀貨包裝專員',
    company_name: '台灣職涯協進',
    country: '印尼',
    salary: 'NT$ 33,000 ~ 48,000',
    applied_at: '2026-04-02',
    status: '審核中',
  },
];

export default function UserDashboardPage() {
  const { profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');

  // Profile form
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [nationality, setNationality] = useState('越南');
  const [targetCategory, setTargetCategory] = useState('製造業');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveNotice(null);

    const res = await updateProfile({
      full_name: fullName,
      phone,
    });

    if (res.success) {
      setSaveNotice('求職個人資料已成功更新！');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  }

  return (
    <AuthGuard allowedRoles={['user', 'company_admin', 'admin']}>
      <SiteHeader />

      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          {/* Top Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0f5bd3 0%, #3b82f6 100%)',
            color: 'white',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '28px',
            boxShadow: '0 20px 40px rgba(15, 91, 211, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '10px',
              }}>
                👤 求職移工會員中心
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', color: 'white' }}>
                您好，{profile?.full_name || '求職朋友'}！
              </h1>
              <p style={{ margin: 0, color: '#e0f2fe', fontSize: '0.92rem' }}>
                帳號 Email：{profile?.email} | 狀態：
                {profile?.email_confirmed ? (
                  <span style={{ color: '#bbf7d0', fontWeight: 700 }}> ✓ Email 已開通</span>
                ) : (
                  <span style={{ color: '#fed7aa', fontWeight: 700 }}> ⏳ 待驗證開通</span>
                )}
              </p>
            </div>

            <div>
              <Link href="/jobs" className="button" style={{ background: 'white', color: '#0f5bd3', fontWeight: 700 }}>
                探索最新工作機會 →
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '24px',
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              style={{
                padding: '12px 20px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'applications' ? '#0f5bd3' : '#64748b',
                borderBottom: activeTab === 'applications' ? '3px solid #0f5bd3' : '3px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              💼 我的應徵與諮詢紀錄 ({SAMPLE_APPLICATIONS.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '12px 20px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'profile' ? '#0f5bd3' : '#64748b',
                borderBottom: activeTab === 'profile' ? '3px solid #0f5bd3' : '3px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              📝 求職條件與個人基本資料
            </button>
          </div>

          {/* Tab 1: Applications */}
          {activeTab === 'applications' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #dfe9f5',
                boxShadow: '0 8px 24px rgba(15, 91, 211, 0.04)',
              }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a' }}>
                  目前送出的應徵與媒合進度
                </h2>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {SAMPLE_APPLICATIONS.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '18px 20px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            {app.country}
                          </span>
                          <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{app.job_title}</strong>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          🏢 承辦仲介：{app.company_name} | 投遞日期：{app.applied_at}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#0f5bd3', fontWeight: 700, marginTop: '4px' }}>
                          待遇：{app.salary}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          background: app.status === '已安排線上面試' ? '#dcfce7' : '#e0f2fe',
                          color: app.status === '已安排線上面試' ? '#15803d' : '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Link href="/jobs" className="button button-primary">
                    查看更多職缺並主動投遞
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Profile Settings */}
          {activeTab === 'profile' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #dfe9f5',
              boxShadow: '0 8px 24px rgba(15, 91, 211, 0.04)',
              maxWidth: '600px',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                求職者基本檔案
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                完整填寫您的聯絡方式與專長意願，有助於合法仲介更快為您安排面試
              </p>

              {saveNotice && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  marginBottom: '16px',
                }}>
                  ✅ {saveNotice}
                </div>
              )}

              <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                    真實姓名
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
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                    聯絡電話 / 通訊軟體
                  </label>
                  <input
                    type="tel"
                    placeholder="例：0912-345-678 (Zalo / LINE)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                      原籍國籍
                    </label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                    >
                      <option value="越南">越南 (Vietnam)</option>
                      <option value="印尼">印尼 (Indonesia)</option>
                      <option value="馬來西亞">馬來西亞 (Malaysia)</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                      偏好求職職種
                    </label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                    >
                      <option value="製造業">製造業作業員</option>
                      <option value="物流倉儲">物流倉儲</option>
                      <option value="餐飲業">餐飲服務</option>
                      <option value="清潔保全">清潔保全</option>
                      <option value="看護照護">機構/家庭看護</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                    登入帳號 (Email，不可變更)
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
                  className="button button-primary"
                  style={{ padding: '12px', marginTop: '8px', fontWeight: 700 }}
                >
                  儲存個人檔案
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </AuthGuard>
  );
}
