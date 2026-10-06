'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useAuth } from '@/lib/auth-context';
import type { Job } from '@/lib/supabase';

export default function CompanyDashboardPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Job modal / drawer state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    country: '越南',
    category: '製造業',
    salary_min: 34000,
    salary_max: 48000,
    location: '桃園市 / 新北市',
    shift: '8 小時 / 日',
    deadline: '',
    description: '',
  });

  useEffect(() => {
    async function fetchCompanyJobs() {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanyJobs();
  }, []);

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...newJob,
        company_name: profile?.company_name || '合規認證企業',
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        alert('🎉 職缺發布成功！');
        setJobs((prev) => [data.data || { ...payload, id: Date.now(), is_active: true, created_at: new Date().toISOString() }, ...prev]);
        setShowAddModal(false);
        setNewJob({
          title: '',
          country: '越南',
          category: '製造業',
          salary_min: 34000,
          salary_max: 48000,
          location: '桃園市 / 新北市',
          shift: '8 小時 / 日',
          deadline: '',
          description: '',
        });
      } else {
        alert('發布失敗，請檢查欄位');
      }
    } catch (err) {
      console.error(err);
      alert('發布失敗');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGuard allowedRoles={['company_admin', 'admin']}>
      <SiteHeader />

      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Company Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0f5bd3 0%, #1e40af 100%)',
            color: 'white',
            borderRadius: '20px',
            padding: '36px 32px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(15, 91, 211, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
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
                marginBottom: '12px',
              }}>
                🏢 申請公司管理者專區 (Company Admin)
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>
                {profile?.company_name || '企業雇主 / 人力仲介管理專區'}
              </h1>
              <p style={{ margin: 0, color: '#dbeafe', fontSize: '0.95rem' }}>
                管理者：<strong>{profile?.full_name}</strong> ({profile?.email}) | 統編執照：{profile?.company_tax_id || '審核建檔中'}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="button"
                style={{
                  background: 'white',
                  color: '#0f5bd3',
                  fontWeight: 800,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                }}
              >
                + 發布新招募職缺
              </button>
            </div>
          </div>

          {/* Qualification status badge */}
          <div style={{
            background: profile?.is_approved ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${profile?.is_approved ? '#a7f3d0' : '#fde68a'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>{profile?.is_approved ? '🛡️' : '⏳'}</span>
              <div>
                <strong style={{ color: profile?.is_approved ? '#065f46' : '#92400e' }}>
                  {profile?.is_approved ? '公司審核狀態：合法資質已認證' : '公司審核狀態：審核開通中'}
                </strong>
                <div style={{ fontSize: '0.85rem', color: profile?.is_approved ? '#047857' : '#b45309' }}>
                  {profile?.is_approved
                    ? '您具備合法招募資格，發布之職缺將第一時間於首頁與工作機會專區公開曝光。'
                    : '管理員正進行公司執照與基本資料核實，審核通過前您仍可預先建立職缺。'}
                </div>
              </div>
            </div>

            <Link
              href="/company/profile"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: profile?.is_approved ? '#065f46' : '#92400e',
                textDecoration: 'underline',
              }}
            >
              編輯公司檔案資料 →
            </Link>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #dfe9f5' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>有效刊登中職缺</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f5bd3', margin: '4px 0' }}>
                {jobs.length} 筆
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>目前接受求職移工投遞</div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #dfe9f5' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>收到求職諮詢 / 應徵</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>
                12 人次
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>來自越南、印尼、馬來西亞</div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #dfe9f5' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>職缺累計瀏覽次數</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6', margin: '4px 0' }}>
                1,840 次
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>曝光率良好</div>
            </div>
          </div>

          {/* Jobs Management Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #dfe9f5',
            boxShadow: '0 10px 30px rgba(15, 91, 211, 0.04)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  本公司職缺招募管理
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                  管理您公司刊登的職務名稱、薪資待遇與工作地點
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="button button-primary"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
              >
                + 發布職缺
              </button>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>職缺載入中...</div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px' }}>
                <p style={{ color: '#64748b', marginBottom: '16px' }}>目前尚未建立招募職缺</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="button button-primary"
                >
                  立即刊登第一筆職缺
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>
                          {job.country}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.75rem',
                        }}>
                          {job.category}
                        </span>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{job.title}</strong>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        📍 {job.location} | ⏰ {job.shift} | 📅 截止：{job.deadline || '長期招募'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontWeight: 800, color: '#0f5bd3', fontSize: '1rem' }}>
                        NT$ {job.salary_min} ~ {job.salary_max}
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}>
                        刊登中
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Job Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>新增招募職缺</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateJob} style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    職缺名稱 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：電子零組件組裝作業員"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      招募國籍偏好
                    </label>
                    <select
                      value={newJob.country}
                      onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                    >
                      <option value="越南">越南</option>
                      <option value="印尼">印尼</option>
                      <option value="馬來西亞">馬來西亞</option>
                      <option value="不限國籍">不限國籍</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      產業分類
                    </label>
                    <select
                      value={newJob.category}
                      onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                    >
                      <option value="製造業">製造業</option>
                      <option value="物流倉儲">物流倉儲</option>
                      <option value="餐飲業">餐飲業</option>
                      <option value="清潔保全">清潔保全</option>
                      <option value="看護與照護">看護與照護</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      最低月薪 (NT$)
                    </label>
                    <input
                      type="number"
                      required
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob({ ...newJob, salary_min: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      最高月薪 (NT$)
                    </label>
                    <input
                      type="number"
                      required
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob({ ...newJob, salary_max: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      工作地點
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例如：桃園市中壢區"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      工時說明
                    </label>
                    <input
                      type="text"
                      placeholder="例如：8 小時 / 日，週休二日"
                      value={newJob.shift}
                      onChange={(e) => setNewJob({ ...newJob, shift: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    招募截止日
                  </label>
                  <input
                    type="date"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    詳細工作描述與福利
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="說明工作內容、供膳宿條件、語言要求或加班津貼等..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="button button-primary"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    {isSubmitting ? '建立中...' : '確認發布職缺'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="button button-secondary"
                    style={{ padding: '12px 20px' }}
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </AuthGuard>
  );
}
