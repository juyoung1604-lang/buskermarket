// app/admin/faq/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';
import { useAdmin } from '../layout';

const FaqAdminPage = () => {
  const { can } = useAdmin();
  const { toast } = useToast();
  const canManage = can('system_settings');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    const data = await DB.getFaqs();
    setFaqs(data || []);
    setLoading(false);
  };

  const handleEdit = (faq: any) => {
    setEditingId(faq.id);
    setFormData({ question: faq.question, answer: faq.answer });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    if (!formData.question || !formData.answer) {
      toast('질문과 답변을 모두 입력해주세요.', 'rose');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await DB.updateFaq(editingId, formData);
        toast('수정되었습니다.', 'jade');
      } else {
        await DB.createFaq(formData);
        toast('등록되었습니다.', 'jade');
      }
      handleCancel();
      fetchFaqs();
    } catch (err: any) {
      toast('오류 발생: ' + err.message, 'rose');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await DB.deleteFaq(id);
    toast('삭제되었습니다.', 'sky');
    fetchFaqs();
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!canManage) return;
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    setFaqs(newFaqs);
    await DB.reorderFaqs(newFaqs.map(f => f.id));
    toast('순서가 변경되었습니다.', 'jade');
  };

  return (
    <div className="space-y-6">
      {/* 등록/수정 폼 — 시스템설정 권한자만 */}
      {canManage && (
        <div className="card">
          <div className="card-h">
            <span className="card-title">{editingId ? 'FAQ 수정' : '새 FAQ 등록'}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="fg">
                <label>질문 (Question)</label>
                <input
                  className="fi"
                  placeholder="질문을 입력하세요"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                />
              </div>
              <div className="fg">
                <label>답변 (Answer)</label>
                <textarea
                  className="fta"
                  style={{ height: '120px' }}
                  placeholder="답변을 입력하세요"
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-jade" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : <><i className="fa-solid fa-save"></i> {editingId ? '수정 완료' : '등록하기'}</>}
                </button>
                {editingId && (
                  <button type="button" className="btn" onClick={handleCancel}>취소</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="card">
        <div className="card-h">
          <span className="card-title">FAQ 목록 ({faqs.length})</span>
          <p className="text-xs text-muted">화면에 표시되는 순서대로 나열됩니다.</p>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: 'var(--ink3)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.75rem' }}>순서</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.75rem' }}>질문 / 답변</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '.75rem' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && faqs.length === 0 ? (
                <tr><td colSpan={3} className="p-10 text-center"><span className="spinner"></span></td></tr>
              ) : faqs.length === 0 ? (
                <tr><td colSpan={3} className="p-10 text-center text-muted">등록된 FAQ가 없습니다.</td></tr>
              ) : faqs.map((f, idx) => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    {canManage && (
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="ico-btn" style={{ opacity: idx === 0 ? 0.2 : 1 }}><i className="fa-solid fa-chevron-up"></i></button>
                        <button onClick={() => moveItem(idx, 'down')} disabled={idx === faqs.length - 1} className="ico-btn" style={{ opacity: idx === faqs.length - 1 ? 0.2 : 1 }}><i className="fa-solid fa-chevron-down"></i></button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--head)', marginBottom: '6px' }}>Q. {f.question}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>A. {f.answer}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', verticalAlign: 'top' }}>
                    {canManage && (
                      <div className="flex gap-2 justify-end">
                        <button className="ico-btn" onClick={() => handleEdit(f)}><i className="fa-solid fa-pen-to-square"></i></button>
                        <button className="ico-btn reject" onClick={() => handleDelete(f.id)}><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FaqAdminPage;
