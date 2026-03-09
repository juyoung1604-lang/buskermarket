'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';

const getSupabaseConfig = () => {
  const config = DB.getConnectionConfig();
  return { supabaseUrl: config?.url || '', supabaseKey: config?.key || '' };
};


type HomepagePopup = {
  id: string;
  title: string;
  image_url: string;
  content?: string;
  link_url?: string;
  button_label?: string;
  start_date?: string;
  end_date?: string;
  popup_size?: 'sm' | 'md' | 'lg';
  popup_width_px?: number | null;
  popup_height_px?: number | null;
  is_active: boolean;
  open_in_new_tab?: boolean;
  created_at?: string;
  updated_at?: string;
};

const POPUP_SIZE_OPTIONS = [
  { value: 'sm', label: '작게' },
  { value: 'md', label: '보통' },
  { value: 'lg', label: '크게' },
] as const;

const POPUP_WIDTHS = {
  sm: 'min(88vw, 420px)',
  md: 'min(92vw, 560px)',
  lg: 'min(94vw, 720px)',
} as const;

const PopupPreviewModal = ({
  data,
  onClose,
}: {
  data: Partial<HomepagePopup>;
  onClose: () => void;
}) => {
  const popupWidth =
    data.popup_width_px && data.popup_width_px > 0
      ? `min(96vw, ${Math.min(1200, Math.max(240, data.popup_width_px))}px)`
      : POPUP_WIDTHS[data.popup_size || 'md'];
  const popupHeight =
    data.popup_height_px && data.popup_height_px > 0
      ? `min(92vh, ${Math.min(1400, Math.max(240, data.popup_height_px))}px)`
      : undefined;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: popupWidth,
          height: popupHeight,
          maxHeight: '92vh',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: popupHeight ? undefined : '4 / 5',
            background: '#f8fafc',
            flex: popupHeight ? '1 1 auto' : undefined,
            minHeight: popupHeight ? '180px' : undefined,
          }}
        >
          {data.image_url ? (
            <img src={data.image_url} alt={data.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '.9rem' }}>
              이미지 URL을 입력하세요
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 닫기"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '999px',
              border: 0,
              background: 'rgba(15, 23, 42, 0.72)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ×
          </button>
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.6)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
            미리보기
          </div>
        </div>

        <div style={{ padding: '20px', overflowY: popupHeight ? 'auto' : undefined }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{data.title || '(제목 없음)'}</div>
          {data.content && (
            <div style={{ fontSize: '.92rem', color: '#475569', lineHeight: 1.6, marginTop: '10px', whiteSpace: 'pre-line' }}>
              {data.content}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
            {data.link_url && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  background: '#0f766e',
                  color: '#fff',
                  fontSize: '.85rem',
                  fontWeight: 700,
                }}
              >
                {data.button_label || '자세히 보기'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '.82rem',
                fontWeight: 600,
                cursor: 'default',
                whiteSpace: 'nowrap',
              }}
            >
              일주일간 닫기
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155',
                fontSize: '.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomepagePopupManager = () => {
  const { toast } = useToast();
  const [popups, setPopups] = useState<HomepagePopup[]>([]);
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Partial<HomepagePopup> | null>(null);
  const [popupForm, setPopupForm] = useState<Partial<HomepagePopup>>({
    title: '',
    image_url: '',
    content: '',
    link_url: '',
    button_label: '자세히 보기',
    start_date: '',
    end_date: '',
    popup_size: 'md',
    popup_width_px: null,
    popup_height_px: null,
    is_active: true,
    open_in_new_tab: false,
  });

  const fetchPopups = async () => {
    try {
      const { supabaseUrl, supabaseKey } = getSupabaseConfig();
      const params = new URLSearchParams({ supabaseUrl, supabaseKey, admin: '1' });
      const res = await fetch(`/api/popups?${params}`, { cache: 'no-store' });
      const data = await res.json();
      setPopups((data.popups as HomepagePopup[]) || []);
    } catch {
      const fallback = await DB.getHomepagePopups();
      setPopups((fallback as HomepagePopup[]) || []);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const resetPopupForm = () => {
    setEditingPopupId(null);
    setPopupForm({
      title: '',
      image_url: '',
      content: '',
      link_url: '',
      button_label: '자세히 보기',
      start_date: '',
      end_date: '',
      popup_size: 'md',
      popup_width_px: null,
      popup_height_px: null,
      is_active: true,
      open_in_new_tab: false,
    });
  };

  const handleEditPopup = (popup: HomepagePopup) => {
    setEditingPopupId(popup.id);
    setPopupForm({
      title: popup.title || '',
      image_url: popup.image_url || '',
      content: popup.content || '',
      link_url: popup.link_url || '',
      button_label: popup.button_label || '자세히 보기',
      start_date: popup.start_date || '',
      end_date: popup.end_date || '',
      popup_size: popup.popup_size || 'md',
      popup_width_px: popup.popup_width_px ?? null,
      popup_height_px: popup.popup_height_px ?? null,
      is_active: popup.is_active,
      open_in_new_tab: !!popup.open_in_new_tab,
    });
  };

  const handleSavePopup = async () => {
    if (!popupForm.title?.trim()) {
      toast('팝업 제목을 입력하세요.', 'rose');
      return;
    }
    if (!popupForm.image_url?.trim()) {
      toast('팝업 이미지를 입력하세요.', 'rose');
      return;
    }

    const payload = {
      title: popupForm.title?.trim(),
      image_url: popupForm.image_url?.trim(),
      content: popupForm.content?.trim() || '',
      link_url: popupForm.link_url?.trim() || '',
      button_label: popupForm.button_label?.trim() || '자세히 보기',
      start_date: popupForm.start_date || null,
      end_date: popupForm.end_date || null,
      popup_size: popupForm.popup_size || 'md',
      popup_width_px:
        popupForm.popup_width_px && Number(popupForm.popup_width_px) > 0
          ? Math.min(1200, Math.max(240, Number(popupForm.popup_width_px)))
          : null,
      popup_height_px:
        popupForm.popup_height_px && Number(popupForm.popup_height_px) > 0
          ? Math.min(1400, Math.max(240, Number(popupForm.popup_height_px)))
          : null,
      is_active: !!popupForm.is_active,
      open_in_new_tab: !!popupForm.open_in_new_tab,
    };

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    let res: Response;
    if (editingPopupId) {
      res = await fetch(`/api/popups/${editingPopupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, supabaseUrl, supabaseKey }),
      });
    } else {
      res = await fetch('/api/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, supabaseUrl, supabaseKey }),
      });
    }

    const result = await res.json();
    if (!res.ok) {
      toast('팝업 저장 실패: ' + (result.error || '알 수 없는 오류'), 'rose');
      return;
    }

    toast(editingPopupId ? '홈페이지 팝업이 수정되었습니다.' : '홈페이지 팝업이 등록되었습니다.', 'jade');
    resetPopupForm();
    fetchPopups();
  };

  const handleDeletePopup = async (id: string) => {
    if (!confirm('이 팝업을 삭제하시겠습니까?')) return;
    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    const res = await fetch(`/api/popups/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseUrl, supabaseKey }),
    });
    const result = await res.json();
    if (!res.ok) {
      toast('팝업 삭제 실패: ' + (result.error || '알 수 없는 오류'), 'rose');
      return;
    }
    if (editingPopupId === id) resetPopupForm();
    toast('홈페이지 팝업이 삭제되었습니다.', 'jade');
    fetchPopups();
  };

  const togglePopupActive = async (popup: HomepagePopup) => {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    const res = await fetch(`/api/popups/${popup.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !popup.is_active, supabaseUrl, supabaseKey }),
    });
    const result = await res.json();
    if (!res.ok) {
      toast('상태 변경 실패: ' + (result.error || '알 수 없는 오류'), 'rose');
      return;
    }
    toast(popup.is_active ? '팝업 노출이 중지되었습니다.' : '팝업이 활성화되었습니다.', 'jade');
    fetchPopups();
  };

  return (
    <>
    {previewData && <PopupPreviewModal data={previewData} onClose={() => setPreviewData(null)} />}
    <div className="card">
      <div className="card-h" style={{ background: 'var(--ink3)' }}>
        <span className="card-title">
          <i className="fa-solid fa-window-maximize" style={{ marginRight: '8px', color: 'var(--gold)' }} />
          홈페이지 팝업 관리
        </span>
      </div>

      <div className="card-body space-y-4">
        <div className="popup-mgr-grid">
          <div className="pm-form" style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>팝업 제목</label>
                <input className="fi" value={popupForm.title || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="예: 이번 주말 플리마켓 안내" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>팝업 이미지 URL</label>
                <input className="fi" value={popupForm.image_url || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>노출 시작일</label>
                <input className="fi" type="date" value={popupForm.start_date || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>노출 종료일</label>
                <input className="fi" type="date" value={popupForm.end_date || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, end_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>연결 링크</label>
                <input className="fi" value={popupForm.link_url || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, link_url: e.target.value }))} placeholder="https:// 또는 /status" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>버튼 문구</label>
                <input className="fi" value={popupForm.button_label || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, button_label: e.target.value }))} placeholder="자세히 보기" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>수동 가로(px)</label>
                <input
                  className="fi"
                  type="number"
                  min={240}
                  max={1200}
                  value={popupForm.popup_width_px ?? ''}
                  onChange={(e) =>
                    setPopupForm((prev) => ({
                      ...prev,
                      popup_width_px: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="예: 640"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>수동 세로(px)</label>
                <input
                  className="fi"
                  type="number"
                  min={240}
                  max={1400}
                  value={popupForm.popup_height_px ?? ''}
                  onChange={(e) =>
                    setPopupForm((prev) => ({
                      ...prev,
                      popup_height_px: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="예: 880"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>자동 크기</label>
                <select className="fi" value={popupForm.popup_size || 'md'} onChange={(e) => setPopupForm((prev) => ({ ...prev, popup_size: e.target.value as 'sm' | 'md' | 'lg' }))}>
                  {POPUP_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>팝업 설명</label>
                <textarea className="fi" rows={4} value={popupForm.content || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="팝업에 함께 노출할 안내 문구" style={{ resize: 'vertical', minHeight: '100px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input id="popup-active" type="checkbox" checked={!!popupForm.is_active} onChange={(e) => setPopupForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
                <label htmlFor="popup-active" style={{ fontSize: '.78rem', color: 'var(--soft)' }}>즉시 노출 가능 상태</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input id="popup-new-tab" type="checkbox" checked={!!popupForm.open_in_new_tab} onChange={(e) => setPopupForm((prev) => ({ ...prev, open_in_new_tab: e.target.checked }))} />
                <label htmlFor="popup-new-tab" style={{ fontSize: '.78rem', color: 'var(--soft)' }}>링크 새 창 열기</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <button className="btn btn-jade" onClick={handleSavePopup}>
                <i className="fa-solid fa-floppy-disk" /> {editingPopupId ? '팝업 수정' : '팝업 등록'}
              </button>
              <button className="btn" onClick={() => setPreviewData(popupForm)}>
                <i className="fa-solid fa-eye" /> 미리보기
              </button>
              <button className="btn" onClick={resetPopupForm}>
                <i className="fa-solid fa-xmark" /> 초기화
              </button>
            </div>
          </div>

          <div className="pm-list" style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '.88rem', color: 'var(--head)' }}>등록된 팝업</strong>
              <span className="badge b-approved">{popups.length}건</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {popups.length > 0 ? (
                popups.map((popup) => (
                  <div key={popup.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', background: 'var(--ink3)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '84px', height: '84px', borderRadius: '10px', overflow: 'hidden', background: 'var(--ink2)', flexShrink: 0 }}>
                        <img src={popup.image_url} alt={popup.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '.82rem', fontWeight: 800, color: 'var(--head)' }}>{popup.title}</div>
                            <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                              {popup.start_date || '즉시'} ~ {popup.end_date || '상시'}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                              크기: {POPUP_SIZE_OPTIONS.find((option) => option.value === (popup.popup_size || 'md'))?.label || '보통'}
                            </div>
                            {popup.popup_width_px ? (
                              <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                                수동 크기: {popup.popup_width_px}px x {popup.popup_height_px || '-'}px
                              </div>
                            ) : null}
                          </div>
                          <span className={`badge ${popup.is_active ? 'b-approved' : ''}`} style={!popup.is_active ? { background: 'var(--ink2)', color: 'var(--muted)' } : undefined}>
                            {popup.is_active ? '노출중' : '중지'}
                          </span>
                        </div>
                        {popup.content && (
                          <div style={{ fontSize: '.72rem', color: 'var(--soft)', marginTop: '8px', lineHeight: 1.5 }}>
                            {popup.content}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                          <button className="btn" style={{ fontSize: '.68rem' }} onClick={() => setPreviewData(popup)}>
                            <i className="fa-solid fa-eye" /> 미리보기
                          </button>
                          <button className="btn" style={{ fontSize: '.68rem' }} onClick={() => handleEditPopup(popup)}>
                            <i className="fa-solid fa-pen-to-square" /> 수정
                          </button>
                          <button className="btn" style={{ fontSize: '.68rem' }} onClick={() => togglePopupActive(popup)}>
                            <i className={`fa-solid ${popup.is_active ? 'fa-eye-slash' : 'fa-eye'}`} /> {popup.is_active ? '중지' : '활성'}
                          </button>
                          <button className="btn btn-rose" style={{ fontSize: '.68rem' }} onClick={() => handleDeletePopup(popup.id)}>
                            <i className="fa-solid fa-trash" /> 삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>등록된 홈페이지 팝업이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HomepagePopupManager;
