// app/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import KpiRow from '@/components/admin/KpiRow';
import { DB } from '@/lib/supabase';

const QUICK_LINKS = [
  {
    title: '홈페이지 관리',
    desc: '팝업 공지 및 시각적 안내 관리',
    icon: 'fa-window-restore',
    color: 'var(--lav)',
    path: '/admin/popups'
  },
  {
    title: '버스커 관리',
    desc: '신청 승인과 상태 변경을 빠르게 처리합니다.',
    icon: 'fa-microphone',
    color: 'var(--jade)',
    path: '/admin/buskers'
  },
  {
    title: '셀러 관리',
    desc: '부스 신청과 결제 상태를 확인합니다.',
    icon: 'fa-store',
    color: 'var(--gold)',
    path: '/admin/sellers'
  },
  {
    title: '행사 일정',
    desc: '캘린더 기준으로 주간 운영 일정을 관리합니다.',
    icon: 'fa-calendar-check',
    color: 'var(--sky)',
    path: '/admin/calendar'
  }
];

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pendingBuskers: 0,
    pendingSellers: 0,
    buskers: 0,
    sellers: 0,
    revenue: 0,
    nextEventDays: '—',
    nextEventDate: '—'
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [opStats, setOpStats] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const [buskers, sellers, events] = await Promise.all([
      DB.getBuskers(),
      DB.getSellers(),
      DB.getEvents()
    ]);

    const pb = buskers.filter((x: any) => x.status === 'pending').length;
    const ps = sellers.filter((x: any) => x.status === 'pending').length;
    
    // 이번 달 기준 필터링
    const now = new Date();
    const curM = now.getMonth();
    const curY = now.getFullYear();

    const paidSellersRev = sellers
      .filter((s: any) => {
        const d = new Date(s.applied_at || s.created_at);
        return s.status === 'paid' && d.getMonth() === curM && d.getFullYear() === curY;
      })
      .reduce((sum: number, s: any) => sum + (s.fee || 30000), 0);

    const approvedBuskersRev = buskers
      .filter((b: any) => {
        const d = new Date(b.applied_at || b.created_at);
        return b.status === 'approved' && d.getMonth() === curM && d.getFullYear() === curY;
      })
      .reduce((sum: number, b: any) => sum + (b.fee || 50000), 0);

    const paidRev = paidSellersRev + approvedBuskersRev;
    
    const today = new Date();
    const nextEvent = events.filter((e: any) => new Date(e.event_date) >= today)
      .sort((a: any, b: any) => a.event_date.localeCompare(b.event_date))[0];
    
    let daysDiff = '—';
    if (nextEvent) {
      const diffTime = new Date(nextEvent.event_date).getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysDiff = diffDays <= 0 ? '오늘' : `${diffDays}일`;
    }

    setStats({
      total: buskers.length + sellers.length,
      pending: pb + ps,
      pendingBuskers: pb,
      pendingSellers: ps,
      buskers: buskers.length,
      sellers: sellers.length,
      revenue: Math.floor(paidRev / 1000) / 10,
      nextEventDays: daysDiff,
      nextEventDate: nextEvent?.event_date || '—'
    });

    const weeks: any[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i * 7));
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      const label = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
      const buskerCount = buskers.filter((b: any) => {
        const date = new Date(b.applied_at || b.created_at);
        return date >= startOfWeek && date < endOfWeek;
      }).length;
      const sellerCount = sellers.filter((s: any) => {
        const date = new Date(s.applied_at || s.created_at);
        return date >= startOfWeek && date < endOfWeek;
      }).length;
      weeks.push({ label, busker: buskerCount, seller: sellerCount });
    }
    setWeeklyTrend(weeks);

    const buskerApprovalRate = buskers.length > 0 
      ? Math.round((buskers.filter((b: any) => b.status === 'approved').length / buskers.length) * 100) 
      : 0;
    const sellerBoothFulfillment = nextEvent && nextEvent.seller_count > 0
      ? Math.min(100, Math.round((sellers.filter((s: any) => s.event_date === nextEvent.event_date && s.status !== 'rejected').length / nextEvent.seller_count) * 100))
      : 0;
    const paymentCompletionRate = sellers.filter((s: any) => s.status === 'approved' || s.status === 'paid').length > 0
      ? Math.round((sellers.filter((s: any) => s.status === 'paid').length / sellers.filter((s: any) => s.status === 'approved' || s.status === 'paid').length) * 100) 
      : 0;

    setOpStats([
      { label: '버스커 승인율', value: buskerApprovalRate, color: 'var(--jade)' },
      { label: '셀러 부스 충족', value: sellerBoothFulfillment, color: 'var(--gold)' },
      { label: '결제 완료율', value: paymentCompletionRate, color: 'var(--sky)' },
      { label: '전체 진행률', value: Math.round(((buskerApprovalRate + sellerBoothFulfillment + paymentCompletionRate) / 3)), color: 'var(--lav)' }
    ]);

    const recentBuskers = [...buskers].sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || '')).slice(0, 2);
    const newActivities = [];
    if (pb + ps > 0) {
      newActivities.push({ type: 'file-pen', color: 'var(--jade)', title: '신규 신청 확인', desc: `대기 중인 신청이 총 ${pb + ps}건 있습니다.`, time: '방금 전' });
    }
    recentBuskers.forEach((b: any) => {
      if (b.status === 'approved') {
        newActivities.push({ type: 'check', color: 'var(--jade)', title: '버스커 승인', desc: `${b.name} (${b.team}) 팀 승인됨`, time: '최근' });
      }
    });
    if (paidRev > 0) {
      newActivities.push({ type: 'credit-card', color: 'var(--sky)', title: '매출 합계', desc: `총 ₩${paidRev.toLocaleString()} 결제 완료`, time: '현재' });
    }
    setActivities(newActivities.length > 0 ? newActivities : [
      { type: 'info-circle', color: 'var(--muted)', title: '활동 없음', desc: '최근 활동 내역이 없습니다.', time: '-' }
    ]);
  };

  return (
    <div className="space-y-6">
      <KpiRow stats={stats} />

      <div className="card">
        <div className="card-h">
          <span className="card-title">빠른 작업</span>
          <button className="btn btn-ghost" style={{ fontSize: '.7rem' }} onClick={fetchDashboardData}>
            <i className="fa-solid fa-rotate"></i> 새로고침
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.path}
                className="dashboard-quick-link"
                onClick={() => router.push(link.path)}
                style={{ ['--quick-accent' as any]: link.color }}
              >
                <span className="dashboard-quick-icon">
                  <i className={`fa-solid ${link.icon}`}></i>
                </span>
                <span className="dashboard-quick-copy">
                  <span className="dashboard-quick-title">{link.title}</span>
                  <span className="dashboard-quick-desc">
                    {link.path === '/admin/buskers' ? `${stats.buskers}건 신청 접수` :
                      link.path === '/admin/sellers' ? `${stats.sellers}건 신청 접수` :
                      link.path === '/admin/calendar' ? `${stats.nextEventDate} 일정 예정` :
                      link.desc}
                  </span>
                </span>
                <i className="fa-solid fa-arrow-right dashboard-quick-arrow"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, .9fr) minmax(280px, .95fr)', gap: '14px' }}>
        <div className="card">
          <div className="card-h">
            <span className="card-title">주간 신청 추이</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '.65rem', color: 'var(--jade)' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--jade)', borderRadius: '50%' }}></span>버스커
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '.65rem', color: 'var(--gold)' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%' }}></span>셀러
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="bar-chart" style={{ height: '160px' }}>
              {weeklyTrend.map((d, i) => {
                const maxVal = Math.max(...weeklyTrend.map(w => Math.max(w.busker, w.seller, 1)), 10);
                return (
                  <div key={i} className="bc-col">
                    <div style={{ width: '100%', display: 'flex', gap: '3px', alignItems: 'flex-end', flex: 1 }}>
                      <motion.div 
                        className="bc-bar" 
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.busker / maxVal) * 120}px` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ background: 'linear-gradient(to top, var(--jade), rgba(0,212,160,.2))' }}
                      />
                      <motion.div 
                        className="bc-bar" 
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.seller / maxVal) * 120}px` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                        style={{ background: 'linear-gradient(to top, var(--gold), rgba(240,165,0,.2))' }}
                      />
                    </div>
                    <div className="bc-lbl">{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <span className="card-title">운영 현황</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div className="dashboard-mini-stat">
                <span className="dashboard-mini-label">대기 신청</span>
                <strong className="dashboard-mini-value">{stats.pending}건</strong>
                <span className="dashboard-mini-sub">버스커 {stats.pendingBuskers} / 셀러 {stats.pendingSellers}</span>
              </div>
              <div className="dashboard-mini-stat">
                <span className="dashboard-mini-label">다음 행사</span>
                <strong className="dashboard-mini-value">{stats.nextEventDays}</strong>
                <span className="dashboard-mini-sub">{stats.nextEventDate}</span>
              </div>
            </div>
            <div className="stat-bar-wrap">
              {opStats.map((s, i) => (
                <div key={i} className="stat-bar">
                  <div className="stat-bar-top">
                    <span className="stat-bar-label">{s.label}</span>
                    <span className="stat-bar-val">{s.value}%</span>
                  </div>
                  <div className="stat-bar-track">
                    <motion.div 
                      className="stat-bar-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <span className="card-title">최근 활동</span>
            <button className="btn btn-ghost" style={{ fontSize: '.7rem' }} onClick={fetchDashboardData}>
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
          <div className="card-body" style={{ padding: 0, minHeight: '276px', maxHeight: '336px', overflowY: 'auto' }}>
            {activities.map((act, idx) => (
              <div 
                key={idx} 
                className="activity-item"
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px', 
                  padding: '10px 14px', 
                  borderBottom: '1px solid var(--line)',
                  transition: 'background 0.14s',
                  cursor: 'default'
                }}
              >
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '10px', 
                  background: `${act.color}18`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: act.color, 
                  fontSize: '.75rem', 
                  flexShrink: 0 
                }}>
                  <i className={`fa-solid fa-${act.type}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.78rem', color: 'var(--head)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '3px', lineHeight: 1.5 }}>{act.desc}</div>
                </div>
                <div style={{ fontSize: '.62rem', color: 'var(--dim)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{act.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
