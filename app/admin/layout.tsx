// app/admin/layout.tsx
'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { ToastProvider } from '@/components/admin/Toast';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, DB } from '@/lib/supabase';
import './admin.css';

// ══════════════════════════════════════════════════
// RBAC — Roles & Permissions Configuration
// ══════════════════════════════════════════════════
export const ROLES: { [key: string]: any } = {
  master_admin: {
    key: 'master_admin', label: '마스터관리자', color: 'var(--coral)', icon: 'fa-user-tie',
    perms: { view_all: true, approve: true, reject: true, create: true, edit: true, delete: true, account_access: true, manage_accounts: true, view_revenue: true, system_settings: true, data_management: true, create_super_admin: true, supabase_access: true }
  },
  super_admin: {
    key: 'super_admin', label: '슈퍼관리자', color: 'var(--jade)', icon: 'fa-crown',
    perms: { view_all: true, approve: true, reject: true, create: true, edit: true, delete: true, account_access: true, manage_accounts: true, view_revenue: true, system_settings: true, data_management: true, create_super_admin: false, supabase_access: false }
  },
  admin: {
    key: 'admin', label: '관리자', color: 'var(--sky)', icon: 'fa-user-shield',
    perms: { view_all: true, approve: true, reject: true, create: true, edit: true, delete: true, account_access: true, manage_accounts: false, view_revenue: true, system_settings: true, data_management: false, create_super_admin: false, supabase_access: false }
  },
  operator: {
    key: 'operator', label: '운영자', color: 'var(--lav)', icon: 'fa-user-check',
    perms: { view_all: true, approve: true, reject: true, create: false, edit: false, delete: false, account_access: true, manage_accounts: false, view_revenue: false, system_settings: false, data_management: false, create_super_admin: false, supabase_access: false }
  },
};

export const PERM_LABELS: { [key: string]: string } = {
  view_all: '조회', approve: '승인', reject: '거절', create: '등록', edit: '수정', delete: '삭제',
  account_access: '계정페이지접근', manage_accounts: '계정관리', view_revenue: '매출조회', system_settings: '설정', data_management: '데이터관리', create_super_admin: '슈퍼관리자생성', supabase_access: 'Supabase연동'
};

const AdminContext = createContext<{
  user: any;
  role: string;
  can: (perm: string) => boolean;
  dynamicRoles: any;
  updateRolePerms: (roleKey: string, permKey: string, value: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}>({
  user: null,
  role: 'operator',
  can: () => false,
  dynamicRoles: ROLES,
  updateRolePerms: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export const useAdmin = () => useContext(AdminContext);

const mergeRoleConfig = (savedRoles: any) => {
  const merged: any = { ...ROLES };

  Object.entries(savedRoles || {}).forEach(([roleKey, roleValue]: [string, any]) => {
    merged[roleKey] = {
      ...(ROLES[roleKey] || {}),
      ...roleValue,
      perms: {
        ...(ROLES[roleKey]?.perms || {}),
        ...(roleValue?.perms || {})
      }
    };
  });

  return merged;
};

const PermissionBanner = ({ role, roles }: { role: string, roles: any }) => {
  const r = roles[role] || roles.operator;
  return (
    <div className="info-strip perm-banner-bar">
      <div className="info-strip-content">
        <div className="perm-banner-dots" style={{ display: 'flex', gap: '3px' }}>
          {Object.keys(PERM_LABELS).map(k => (
            <div 
              key={k} 
              className="pb-dot" 
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: r.perms[k] ? r.color : 'var(--line2)', boxShadow: r.perms[k] ? `0 0 5px ${r.color}` : 'none' }}
              title={PERM_LABELS[k]}
            />
          ))}
        </div>
        <span id="perm-banner-text">
          <b style={{ color: r.color }}>{r.label}</b>로 접속 중 |
          <span className="perm-banner-list" style={{ color: r.color, marginLeft: '5px' }}>✓ {Object.entries(r.perms).filter(([_, v]) => v).map(([k]) => PERM_LABELS[k]).join(' · ')}</span>
        </span>
      </div>
    </div>
  );
};

const SupabaseStatusBar = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'offline'>('disconnected');
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      if (typeof window === 'undefined') return;
      
      const isConfigured = DB.isConfigured();
      setQueueCount(DB.getQueue().length);

      if (!window.navigator.onLine) {
        setStatus('offline');
        return;
      }

      if (!isConfigured) {
        setStatus('disconnected');
        return;
      }

      try {
        // Simple ping to check connection
        const { error } = await supabase.from('admin_logs').select('id').limit(1);
        if (error) throw error;
        setStatus('connected');
      } catch (e) {
        setStatus('disconnected');
      }
    };

    checkStatus();
    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = () => {
    if (status === 'connected') return 'var(--jade)';
    if (status === 'offline') return 'var(--rose)';
    return 'var(--gold)';
  };

  const getStatusText = () => {
    if (status === 'connected') return '연결됨';
    if (status === 'offline') return '오프라인';
    return '미연결';
  };

  return (
    <div className="info-strip supa-bar">
      <div className="info-strip-content">
        <div className="supa-logo" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--soft)' }}>
          <i className="fa-solid fa-database" style={{ color: status === 'connected' ? '#3ECF8E' : 'var(--muted)' }}></i> Supabase
        </div>
        <div className="dot-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: getStatusColor(), boxShadow: `0 0 6px ${getStatusColor()}` }}></div>
        <span className="supa-status-text" style={{ color: 'var(--soft)', fontFamily: 'var(--font-mono)' }}>{getStatusText()}</span>
        {queueCount > 0 && <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>(미동기화 {queueCount}건)</span>}
      </div>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('operator');
  const [permOverrides, setPermOverrides] = useState<Record<string, boolean>>({});
  const [dynamicRoles, setDynamicRoles] = useState<any>(ROLES);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Close sidebar on route change for mobile
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    DB.getRoleConfig().then((savedRoles) => {
      const mergedRoles = mergeRoleConfig(savedRoles);
      setDynamicRoles(mergedRoles);
    });
  }, []);

  const updateRolePerms = (roleKey: string, permKey: string, value: boolean) => {
    const updated = {
      ...dynamicRoles,
      [roleKey]: {
        ...dynamicRoles[roleKey],
        perms: {
          ...dynamicRoles[roleKey].perms,
          [permKey]: value
        }
      }
    };
    setDynamicRoles(updated);
    DB.saveRoleConfig(updated);
  };

  const can = (perm: string) => {
    const currentRole = dynamicRoles[role] || ROLES[role] || ROLES.operator;
    if (typeof permOverrides?.[perm] === 'boolean') return permOverrides[perm] === true;
    return currentRole?.perms[perm] === true;
  };

  useEffect(() => {
    const checkAuth = async () => {
      let sessionData = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        sessionData = session;
      } catch (e) {
        console.warn('Supabase session check failed, checking fallback');
      }
      
      // Fallback for demo login
      if (!sessionData && typeof window !== 'undefined') {
        const savedUser = sessionStorage.getItem('demo_user');
        if (savedUser) {
          sessionData = { user: JSON.parse(savedUser) };
        }
      }

      if (!sessionData) {
        setUser(null);
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } else {
        setUser(sessionData.user);
        // Load role from profile
        const profiles = await DB.getAdminProfiles();
        const myProfile = Array.isArray(profiles) ? profiles.find((p: any) => p.id === sessionData.user.id || p.email === sessionData.user.email) : null;
        setRole(myProfile?.role || sessionData.user.user_metadata?.role || 'super_admin');
        setPermOverrides(myProfile?.perm_overrides || {});
        
        if (pathname === '/admin/login') {
          router.replace('/admin');
        }
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (typeof window !== 'undefined' && !sessionStorage.getItem('demo_user')) {
          setUser(null);
          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          }
        }
      } else if (session) {
        setUser(session.user);
        if (pathname === '/admin/login') {
          router.replace('/admin');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner spinner-lg"></span>
      </div>
    );
  }

  const isLoginPage = pathname === '/admin/login';

  // If no user and not on login page, show spinner while redirecting
  if (!user && !isLoginPage) {
    return (
      <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner spinner-lg"></span>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Permission guards
  const guardEntries: Array<[string, string]> = [
    ['/admin/revenue', 'view_revenue'],
    ['/admin/accounts', 'account_access'],
    ['/admin/settings', 'system_settings'],
    ['/admin/supabase', 'supabase_access'],
    ['/admin/faq', 'system_settings'],
    ['/admin/newsletter', 'system_settings'],
    ['/admin/popups', 'system_settings'],
  ];
  const matchedGuard = guardEntries.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'));

  if (matchedGuard && !can(matchedGuard[1])) {
    return (
      <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--head)' }}>접근 권한이 없습니다</h2>
          <p style={{ color: 'var(--muted)' }}>이 메뉴에 접근하려면 적절한 권한이 필요합니다.</p>
        </div>
        <button className="btn btn-jade" onClick={() => router.push('/admin')}>대시보드 돌아가기</button>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user, role, can, dynamicRoles, updateRolePerms, sidebarOpen, setSidebarOpen }}>
      <ToastProvider>
        <div className={`admin-shell ${sidebarOpen ? 'sb-open' : ''}`}>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
          
          <Sidebar />
          {sidebarOpen && <div className="sb-overlay" onClick={() => setSidebarOpen(false)}></div>}
          <div className="admin-main">
            <SupabaseStatusBar />
            <PermissionBanner role={role} roles={dynamicRoles} />
            <Topbar />
            <main className="admin-content">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminContext.Provider>
  );
}
