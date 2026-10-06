'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Agency } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function AdminAgenciesPage() {

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    country: '越南',
    services: '',
    description: ''
  });

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await fetch('/api/agencies');
        const data = await res.json();
        setAgencies(data.agencies || []);
      } catch (error) {
        console.error('Failed to fetch agencies:', error);
      }
    };
    fetchAgencies();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (response.ok) {
        alert('新增成功');
        setForm({
          name: '',
          country: '越南',
          services: '',
          description: ''
        });
        const refreshed = await fetch('/api/agencies').then((res) => res.json());
        setAgencies(refreshed.agencies || []);
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


      <h1>仲介公司管理</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '24px' }}>
        <div>
          <h2>新增仲介公司</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label>仲介公司名稱</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：台灣職涯協進"
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
              <label>服務國家</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="例：越南 / 印尼"
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
              <label>服務項目（用逗號分隔）</label>
              <input
                type="text"
                value={form.services}
                onChange={(e) => setForm({ ...form, services: e.target.value })}
                placeholder="例：簽證協助,履歷評估,面試安排,到台安置"
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
              <label>公司介紹</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="詳細介紹公司服務內容"
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
              {isSubmitting ? '新增中...' : '新增仲介公司'}
            </button>
          </form>
        </div>

        <div>
          <h2>現有仲介公司 ({agencies.length})</h2>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
            {agencies.length === 0 ? (
              <p>目前沒有仲介公司</p>
            ) : (
              agencies.map((agency) => (
                <div
                  key={agency.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    background: '#f9f9f9'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{agency.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '4px' }}>
                    {agency.country}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {agency.services}
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

