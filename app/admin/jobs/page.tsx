'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Job } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function AdminJobsPage() {

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    country: '越南',
    category: '製造業',
    salary_min: 32000,
    salary_max: 45000,
    location: '',
    shift: '8 小時 / 日',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (response.ok) {
        alert('新增成功');
        setForm({
          title: '',
          country: '越南',
          category: '製造業',
          salary_min: 32000,
          salary_max: 45000,
          location: '',
          shift: '8 小時 / 日',
          deadline: '',
          description: ''
        });
        const refreshed = await fetch('/api/jobs').then((res) => res.json());
        setJobs(refreshed.jobs || []);
      } else {
        alert(result.message || '新增失敗');
      }
    } catch (error) {
      console.error(error);
      alert('新增失敗');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGuard allowedRoles={['admin']}>
      <SiteHeader />
      <main className="container" style={{ padding: '40px 20px', minHeight: 'calc(100vh - 160px)' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#0f5bd3', fontWeight: 'bold' }}>
            ← 回到管理後台
          </Link>
        </div>


      <h1>職缺管理</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '24px' }}>
        <div>
          <h2>新增職缺</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label>職缺名稱</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="例：工廠作業員"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label>國家</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="越南">越南</option>
                <option value="印尼">印尼</option>
                <option value="馬來西亞">馬來西亞</option>
              </select>
            </div>

            <div>
              <label>職位類別</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="製造業">製造業</option>
                <option value="餐飲業">餐飲業</option>
                <option value="物流倉儲">物流倉儲</option>
                <option value="清潔保全">清潔保全</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>最低薪資</label>
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label>最高薪資</label>
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label>工作地點</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="例：桃園 / 台中"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label>工時</label>
              <input
                type="text"
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                placeholder="例：8 小時 / 日"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label>截止日期</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label>職位描述</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="詳細職位描述"
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #0f5bd3, #2f7df7)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? '新增中...' : '新增職缺'}
            </button>
          </form>
        </div>

        <div>
          <h2>現有職缺 ({jobs.length})</h2>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
            {jobs.length === 0 ? (
              <p>目前沒有職缺</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    background: '#f9f9f9'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{job.title}</div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '4px' }}>
                    {job.country} / {job.category}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '4px' }}>
                    {job.location}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#0f5bd3', fontWeight: 'bold' }}>
                    NT$ {job.salary_min} ~ {job.salary_max}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
    <SiteFooter />
  </AuthGuard>
);
}

