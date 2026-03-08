// app/admin/pool/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';
import DetailModal from '@/components/admin/DetailModal';
import AddModal from '@/components/admin/AddModal';
import { useAdmin } from '@/app/admin/layout';

const parseNote = (note: string) => {
  if (!note) return { message: '', links: [] as string[] };
  const parts = note.split('[SNS/링크]');
  const message = parts[0].replace('[문의]', '').trim();
  const links = parts[1]
    ? parts[1].trim().split('\n').map(l => l.trim()).filter(Boolean)
    : [];
  return { message, links };
};

const PoolPage = () => {
  const { toast } = useToast();
  const { role, can } = useAdmin();

  // 권한 정의
  // - 마스터관리자 / 슈퍼관리자: 삭제 가능
  // - 관리자: 등록·수정 가능, 삭제 불가
  // - 운영자: 조회만 가능
  const canDelete = role === 'master_admin' || role === 'super_admin';
  const canEdit = can('edit');
  const canCreate = can('create');

  const [tab, setTab] = useState<'busker' | 'seller'>('busker');
  const [pool, setPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchPool();
    setSelectedIds([]); // 탭 변경 시 선택 초기화
  }, [tab]);

  const fetchPool = async () => {
    setLoading(true);
    const data = await DB.getPool(tab === 'busker' ? 'busker_pool' : 'seller_pool');
    setPool(data || []);
    setLoading(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (!confirm('인력 풀에서 영구히 삭제하시겠습니까? (이력 데이터가 사라집니다)')) return;
    const table = tab === 'busker' ? 'busker_pool' : 'seller_pool';
    const { error } = await DB.deletePool(table, id);
    if (!error) {
      toast('삭제되었습니다.', 'sky');
      fetchPool();
    } else {
      toast('삭제 실패: ' + error.message, 'rose');
    }
  };

  const handleBulkDelete = async () => {
    if (!canDelete) return;
    if (!confirm(`선택한 ${selectedIds.length}명을 풀에서 삭제하시겠습니까?`)) return;
    const table = tab === 'busker' ? 'busker_pool' : 'seller_pool';
    setLoading(true);
    for (const id of selectedIds) {
      await DB.deletePool(table, id);
    }
    toast('일괄 삭제 완료', 'jade');
    setSelectedIds([]);
    fetchPool();
  };

  const filteredData = pool.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.phone || '').includes(search) ||
    (p.team || '').toLowerCase().includes(search.toLowerCase())
  );

  // 컬럼 수 (삭제 권한 있을 때 체크박스 컬럼 추가)
  const colSpanCount = canDelete ? 7 : 6;

  return (
    <div className="space-y-6">
      {/* 일괄 삭제 플로팅 바 — 삭제 권한자만 표시 */}
      {canDelete && selectedIds.length > 0 && (
        <div style={{ position: 'sticky', top: '0', zIndex: 40, background: 'var(--ink2)', color: 'var(--head)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--line)', marginBottom: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: '.85rem', marginRight: 'auto' }}><i className="fa-solid fa-check-double"></i> {selectedIds.length}명 선택됨</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" style={{ background: 'rgba(255,0,0,0.05)', color: '#d00', fontWeight: 700, fontSize: '.75rem' }} onClick={handleBulkDelete}>선택 삭제</button>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--line)', margin: '0 4px' }}></div>
          <button className="btn btn-ghost" style={{ fontSize: '.75rem', fontWeight: 700 }} onClick={() => setSelectedIds([])}>취소</button>
        </div>
      )}

      <div className="tbl-toolbar">
        <div className="ftabs">
          <button className={`ftab ${tab === 'busker' ? 'on' : ''}`} onClick={() => setTab('busker')}>버스커 풀</button>
          <button className={`ftab ${tab === 'seller' ? 'on' : ''}`} onClick={() => setTab('seller')}>셀러 풀</button>
        </div>
        <div className="search-box" style={{ width: '250px' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="이름, 연락처, 팀명 검색…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {/* 직접 등록 — 관리자 이상만 표시 */}
        {canCreate && (
          <button className="btn btn-jade" onClick={() => setAddingItem(true)}>
            <i className="fa-solid fa-user-plus"></i> 직접 등록
          </button>
        )}
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              {/* 체크박스 컬럼 — 삭제 권한자만 표시 */}
              {canDelete && (
                <th style={{ width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredData.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th>이름</th>
              <th>{tab === 'busker' ? '팀명/장르' : '카테고리'}</th>
              <th>연락처/이메일</th>
              <th style={{ textAlign: 'center' }}>누적 신청</th>
              <th>최근 활동일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colSpanCount} style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={colSpanCount} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>저장된 데이터가 없습니다.</td></tr>
            ) : filteredData.map(p => (
              <tr key={p.id} style={{ background: selectedIds.includes(p.id) ? 'var(--ink3)' : 'transparent' }}>
                {/* 체크박스 — 삭제 권한자만 */}
                {canDelete && (
                  <td>
                    <input
                      type="checkbox"
                      className="rc"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => handleSelectOne(p.id)}
                    />
                  </td>
                )}
                <td className="td-main">{p.name}</td>
                <td>
                  {tab === 'busker' ? (
                    <div className="flex flex-col">
                      <span className="font-bold">{p.team || '솔로'}</span>
                      <span className="text-xs text-muted" style={{ color: 'var(--dim)' }}>{p.genre}</span>
                    </div>
                  ) : p.category}
                </td>
                <td>
                  <div className="flex flex-col text-xs font-mono">
                    <span>{p.phone}</span>
                    <span style={{ color: 'var(--muted)' }}>{p.email}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge b-approved" style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--jade-bg)', color: 'var(--jade)' }}>{p.app_count || 1}회</span>
                </td>
                <td className="td-mono">{p.last_applied_at?.split('T')[0] || '-'}</td>
                <td>
                  <div className="td-acts">
                    {/* 조회 — 전체 */}
                    <button className="ico-btn" title="상세보기" onClick={() => setSelectedItem(p)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    {/* 수정 — 관리자 이상 */}
                    {canEdit && (
                      <button className="ico-btn" title="수정" onClick={() => setEditingItem(p)}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    )}
                    {/* 삭제 — 슈퍼관리자 이상 */}
                    {canDelete && (
                      <button className="ico-btn reject" title="삭제" onClick={() => handleDelete(p.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 보기 모달 */}
      {selectedItem && (() => {
        const { message, links } = parseNote(selectedItem.note);
        return (
          <DetailModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            title={`${tab === 'busker' ? '버스커' : '셀러'} 풀 상세 — ${selectedItem.name}`}
            data={[
              { label: '이름', value: selectedItem.name },
              { label: '생년월일', value: selectedItem.birth_date || '—' },
              { label: '연락처', value: selectedItem.phone },
              { label: '이메일', value: selectedItem.email },
              { label: '소속', value: selectedItem.organization || '—' },
              { label: tab === 'busker' ? '팀명' : '카테고리', value: tab === 'busker' ? (selectedItem.team || '솔로') : selectedItem.category },
              ...(tab === 'busker' ? [{ label: '장르', value: selectedItem.genre || '—' }] : []),
              { label: '연락처', value: selectedItem.phone },
              { label: '이메일', value: selectedItem.email },
              { label: '누적 신청 횟수', value: `${selectedItem.app_count}회` },
              { label: '최초 등록일', value: selectedItem.created_at?.replace('T', ' ').slice(0, 16) },
              { label: '최근 활동일', value: selectedItem.last_applied_at?.replace('T', ' ').slice(0, 16) },
              { label: '문의 내용', value: message || '—' },
              {
                label: 'SNS / 링크',
                value: links.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--jade)', wordBreak: 'break-all', fontSize: '.8rem' }}
                      >
                        <i className="ri-link" style={{ marginRight: '4px' }}></i>{link}
                      </a>
                    ))}
                  </div>
                ) : '—',
              },
            ]}
          />
        );
      })()}

      {/* 직접 등록 모달 — 관리자 이상 */}
      {canCreate && (
        <AddModal
          type={tab as any}
          isOpen={addingItem}
          onClose={() => setAddingItem(false)}
          onSuccess={() => { setAddingItem(false); fetchPool(); }}
          mode="pool"
        />
      )}

      {/* 수정 모달 — 관리자 이상 */}
      {canEdit && (
        <AddModal
          type={tab as any}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => { setEditingItem(null); fetchPool(); }}
          initialData={editingItem}
          mode="pool"
        />
      )}
    </div>
  );
};

export default PoolPage;
