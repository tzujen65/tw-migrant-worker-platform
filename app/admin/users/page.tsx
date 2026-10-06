'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { UserRole, UserProfile } from '@/lib/supabase';
import { DEMO_USERS } from '@/lib/auth-context';

interface AdminManagedUser extends UserProfile {
  company_tax_id?: string;
  status: 'active' | 'suspended';
}

const INITIAL_USERS: AdminManagedUser[] = [
  {
    ...DEMO_USERS.admin,
    status: 'active',
  },
  {
    ...DEMO_USERS.company_admin,
    status: 'active',
  },
  {
    ...DEMO_USERS.user,
    status: 'active',
  },
  {
    id: 'user-004',
    email: 'hr@taiwantech-agency.com',
    full_name: '林經理 (台越就業服務)',
    role: 'company_admin',
    company_name: '台越就業服務股份有限公司',
    company_tax_id: '91238475',
    phone: '02-8765-4321',
    is_approved: false, // 待審核公司
    email_confirmed: true,
    created_at: '2026-03-25T10:20:00Z',
    status: 'active',
  },
  {
    id: 'user-005',
    email: 'siti.nur@example.com',
    full_name: 'Siti Nurhaliza (印尼求職者)',
    role: 'user',
    phone: '0988-123-456',
    is_approved: true,
    email_confirmed: false, // 尚未驗證 Email
    created_at: '2026-04-01T14:15:00Z',
    status: 'active',
  },
  {
    id: 'user-006',
    email: 'lee.malaysia@example.com',
    full_name: '李偉強 (馬來西亞求職者)',
    role: 'user',
    phone: '0977-654-321',
    is_approved: true,
    email_confirmed: true,
    created_at: '2026-04-02T09:00:00Z',
    status: 'active',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted users or fallback to INITIAL_USERS
    const saved = localStorage.getItem('tw_migrant_admin_users');
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch {
        setUsers(INITIAL_USERS);
      }
    } else {
      setUsers(INITIAL_USERS);
    }
  }, []);

  function saveUsers(updated: AdminManagedUser[]) {
    setUsers(updated);
    localStorage.setItem('tw_migrant_admin_users', JSON.stringify(updated));
  }

  // 變更使用者權限/身份
  function handleRoleChange(userId: string, newRole: UserRole) {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveUsers(updated);
    showNotice(`已將用戶權限調整為【${getRoleLabel(newRole)}】`);
  }

  // 切換帳號啟用/停權狀態
  function handleToggleStatus(userId: string) {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: 'active' | 'suspended' = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsers(updated);
    showNotice('帳號狀態已更新');
  }

  // 管理者手動開通 Email 驗證
  function handleForceVerifyEmail(userId: string) {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, email_confirmed: true };
      }
      return u;
    });
    saveUsers(updated);
    showNotice('已為該帳號強制開通 Email 認證！');
  }

  // 審核公司管理者資格
  function handleToggleCompanyApproval(userId: string) {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, is_approved: !u.is_approved };
      }
      return u;
    });
    saveUsers(updated);
    showNotice('公司審核狀態已更新');
  }

  function showNotice(msg: string) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '最高管理者 (Admin)';
      case 'company_admin':
        return '公司管理者 (Company Admin)';
      case 'user':
        return '一般使用者 (User)';
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company_name && u.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = filterRole === 'all' || u.role === filterRole;

    return matchSearch && matchRole;
  });

  return (
    <AuthGuard allowedRoles={['admin']}>
      <SiteHeader />

      <main style={{ minHeight: 'calc(100vh - 160px)', background: '#f8fafc', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '20px' }}>
            <Link href="/admin" style={{ color: '#0f5bd3', fontWeight: 600, fontSize: '0.9rem' }}>
              ← 回到管理後台首頁
            </Link>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                使用者帳號與身分權限管理
              </h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
                管理全平台註冊用戶、指派角色權限（最高管理者 / 申請公司管理者 / 一般使用者）、審核開通狀態
              </p>
            </div>
          </div>

          {actionNotice && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '0.92rem',
              fontWeight: 600,
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)',
            }}>
              ✅ {actionNotice}
            </div>
          )}

          {/* Search & Filter Bar */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #dfe9f5',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                placeholder="搜尋姓名、Email、公司名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '10px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                }}
              />

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  background: 'white',
                }}
              >
                <option value="all">全部身分權限 ({users.length})</option>
                <option value="admin">最高管理者 (Admin)</option>
                <option value="company_admin">申請公司管理者 (Company Admin)</option>
                <option value="user">一般使用者 (User)</option>
              </select>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
              共篩選出 <strong>{filteredUsers.length}</strong> 位使用者
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #dfe9f5',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(15, 91, 211, 0.04)',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '16px 20px' }}>使用者 / 姓名</th>
                    <th style={{ padding: '16px 20px' }}>Email / 聯絡電話</th>
                    <th style={{ padding: '16px 20px' }}>目前身分與權限</th>
                    <th style={{ padding: '16px 20px' }}>公司 / 審核狀態</th>
                    <th style={{ padding: '16px 20px' }}>Email 驗證開通</th>
                    <th style={{ padding: '16px 20px' }}>帳號狀態</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>權限操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isCompany = u.role === 'company_admin';
                    const isAdmin = u.role === 'admin';

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s ease' }}>
                        {/* Name & Avatar */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isAdmin ? '#fee2e2' : isCompany ? '#e0e7ff' : '#d1fae5',
                              color: isAdmin ? '#dc2626' : isCompany ? '#4338ca' : '#059669',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}>
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.full_name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: {u.id.slice(0, 10)}...</div>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#0f172a', fontWeight: 500 }}>{u.email}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.phone || '未填寫電話'}</div>
                        </td>

                        {/* Role Select Dropdown */}
                        <td style={{ padding: '16px 20px' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              border: '1px solid #cbd5e1',
                              background: isAdmin ? '#fef2f2' : isCompany ? '#eef2ff' : '#f0fdf4',
                              color: isAdmin ? '#991b1b' : isCompany ? '#3730a3' : '#166534',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="admin">👑 最高管理者</option>
                            <option value="company_admin">🏢 申請公司管理者</option>
                            <option value="user">👤 一般使用者</option>
                          </select>
                        </td>

                        {/* Company / Approval */}
                        <td style={{ padding: '16px 20px' }}>
                          {isCompany ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.company_name || '未填寫公司'}</div>
                              {u.company_tax_id && (
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>統編: {u.company_tax_id}</div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleCompanyApproval(u.id)}
                                style={{
                                  marginTop: '4px',
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: u.is_approved ? '#dcfce7' : '#fed7aa',
                                  color: u.is_approved ? '#15803d' : '#c2410c',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                {u.is_approved ? '✓ 資格已通過審核' : '⏳ 待審核（點擊開通）'}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>- 個人會員 -</span>
                          )}
                        </td>

                        {/* Email Verification */}
                        <td style={{ padding: '16px 20px' }}>
                          {u.email_confirmed ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                            }}>
                              ✓ 已驗證開通
                            </span>
                          ) : (
                            <div>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}>
                                ⏳ 待信箱開通
                              </span>
                              <button
                                type="button"
                                onClick={() => handleForceVerifyEmail(u.id)}
                                style={{
                                  display: 'block',
                                  marginTop: '4px',
                                  fontSize: '0.72rem',
                                  color: '#0f5bd3',
                                  background: 'none',
                                  border: 'none',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                }}
                              >
                                管理員手動開通
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Account Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: u.status === 'active' ? '#f1f5f9' : '#fee2e2',
                            color: u.status === 'active' ? '#475569' : '#b91c1c',
                          }}>
                            {u.status === 'active' ? '正常使用' : '已停權凍結'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              border: '1px solid #cbd5e1',
                              background: u.status === 'active' ? 'white' : '#fee2e2',
                              color: u.status === 'active' ? '#dc2626' : '#15803d',
                              cursor: 'pointer',
                            }}
                          >
                            {u.status === 'active' ? '停權帳號' : '恢復啟用'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </AuthGuard>
  );
}
