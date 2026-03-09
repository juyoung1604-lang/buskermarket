// app/admin/newsletter/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';
import { motion } from 'framer-motion';
import { useAdmin } from '../layout';

const NewsletterPage = () => {
  const { toast } = useToast();
  const { can } = useAdmin();
  const canManageGmail = can('supabase_access');
  const [emails, setEmails] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  
  // Selection & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Gmail Settings
  const [gmailConfig, setGmailConfig] = useState({
    email: '',
    appPassword: '',
    isConnected: false
  });
  const [gmailSource, setGmailSource] = useState<'env' | 'supabase' | null>(null);

  // Compose State
  const [compose, setCompose] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    fetchEmails();
    fetchTemplates();
    fetchGmailConfig();
  }, []);

  const getSupabaseConfigPayload = () => {
    const config = DB.getConnectionConfig();
    return {
      supabaseUrl: config?.url || '',
      supabaseKey: config?.key || '',
    };
  };

  const fetchGmailConfig = async () => {
    try {
      const params = new URLSearchParams(getSupabaseConfigPayload());
      const response = await fetch(`/api/admin/gmail-config?${params.toString()}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gmail 설정 조회 실패');
      setGmailConfig(result.config || { email: '', appPassword: '', isConnected: false });
      setGmailSource(result.source || null);
    } catch (error: any) {
      toast('Gmail 설정 조회 실패: ' + error.message, 'rose');
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    const data = await DB.getNewsletters();
    const list = data || [];
    setEmails(list);
    // Initially select all
    setSelectedIds(new Set(list.map((n: any) => n.id)));
    setLoading(false);
  };

  const toggleSelectAll = () => {
    const filtered = emails.filter(e => e.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length > 0 && filtered.every(f => selectedIds.has(f.id))) {
      const newSelected = new Set(selectedIds);
      filtered.forEach(f => newSelected.delete(f.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      filtered.forEach(f => newSelected.add(f.id));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const filteredEmails = emails.filter(e => 
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchTemplates = async () => {
    const data = await DB.getNewsletterTemplates();
    setTemplates(data || []);
  };

  const handleGmailConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageGmail) {
      toast('Gmail 연동 설정은 마스터관리자만 변경할 수 있습니다.', 'rose');
      return;
    }
    if (!gmailConfig.email || !gmailConfig.appPassword) {
      toast('Gmail 계정과 앱 비밀번호를 입력해주세요.', 'rose');
      return;
    }
    
    const newConfig = { ...gmailConfig, isConnected: true };
    const response = await fetch('/api/admin/gmail-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newConfig,
        ...getSupabaseConfigPayload(),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast('Gmail 설정 저장 실패: ' + (result.error || 'unknown error'), 'rose');
      return;
    }
    setGmailConfig(result.config);
    toast('Gmail 계정이 연동되었습니다.', 'jade');
  };

  const handleGmailDisconnect = async () => {
    if (!canManageGmail) {
      toast('Gmail 연동 설정은 마스터관리자만 변경할 수 있습니다.', 'rose');
      return;
    }
    const response = await fetch('/api/admin/gmail-config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getSupabaseConfigPayload()),
    });
    const result = await response.json();
    if (!response.ok) {
      toast('Gmail 설정 해제 실패: ' + (result.error || 'unknown error'), 'rose');
      return;
    }
    setGmailConfig(result.config);
    toast('연동이 해제되었습니다.', 'sky');
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateTitle) {
      toast('템플릿 이름을 입력해주세요.', 'rose');
      return;
    }
    if (!compose.subject || !compose.content) {
      toast('저장할 제목과 내용이 없습니다.', 'rose');
      return;
    }

    const { error } = await DB.createNewsletterTemplate({
      title: templateTitle,
      subject: compose.subject,
      content: compose.content
    });

    if (!error) {
      toast('템플릿이 저장되었습니다.', 'jade');
      setTemplateTitle('');
      setShowTemplateForm(false);
      fetchTemplates();
    }
  };

  const handleLoadTemplate = (temp: any) => {
    if (compose.subject || compose.content) {
      if (!confirm('현재 작성 중인 내용이 사라집니다. 불러오시겠습니까?')) return;
    }
    setCompose({
      subject: temp.subject,
      content: temp.content
    });
    toast(`'${temp.title}' 템플릿을 불러왔습니다.`, 'jade');
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('템플릿을 삭제하시겠습니까?')) return;
    const { error } = await DB.deleteNewsletterTemplate(id);
    if (!error) {
      toast('삭제되었습니다.', 'sky');
      fetchTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('구독 명단에서 삭제하시겠습니까?')) return;
    const { error } = await DB.deleteNewsletter(id);
    if (!error) {
      toast('삭제되었습니다.', 'sky');
      fetchEmails();
    }
  };

  const handleSendMail = async () => {
    if (!gmailConfig.isConnected) {
      toast('먼저 Gmail 계정을 연동해주세요.', 'rose');
      return;
    }
    if (!compose.subject || !compose.content) {
      toast('제목과 내용을 입력해주세요.', 'rose');
      return;
    }
    
    const recipients = emails
      .filter(e => selectedIds.has(e.id))
      .map(e => e.email);

    if (recipients.length === 0) {
      toast('발송할 대상을 선택해주세요.', 'rose');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients,
          subject: compose.subject,
          content: compose.content,
          ...getSupabaseConfigPayload(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast(`${recipients.length}명의 구독자에게 뉴스레터 발송이 완료되었습니다.`, 'jade');
        setCompose({ subject: '', content: '' });
        
        // Log this activity
        DB.createAdminLog({
          type: 'paper-plane',
          color: 'var(--jade)',
          title: '뉴스레터 발송 완료',
          desc: `${compose.subject} (${recipients.length}명)`
        });
      } else {
        throw new Error(result.error || '메일 발송 실패');
      }
    } catch (err: any) {
      toast('메일 발송 중 오류: ' + err.message, 'rose');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="newsletter-grid">
        <div className="nl-gmail card">
            <div className="card-h">
              <span className="card-title">Gmail 연동 설정</span>
              {gmailConfig.isConnected && gmailSource === 'env'
                ? <span className="badge b-approved">환경변수 고정</span>
                : gmailConfig.isConnected && <span className="badge b-approved">연결됨</span>}
            </div>
            <div className="card-body">
              {gmailSource === 'env' ? (
                <div className="space-y-3">
                  <div style={{ padding: '12px', background: 'var(--ink3)', borderRadius: '8px', border: '1px solid var(--jade)' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--jade)', marginBottom: '4px' }}>
                      <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>환경변수로 고정된 계정
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{gmailConfig.email}</div>
                  </div>
                  <p style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                    * 서버 환경변수 <code>GMAIL_USER</code> / <code>GMAIL_APP_PASSWORD</code>로 설정되어 재배포 후에도 유지됩니다.
                  </p>
                </div>
              ) : canManageGmail ? (
                !gmailConfig.isConnected ? (
                <form onSubmit={handleGmailConnect} className="space-y-3">
                  <div className="fg">
                    <label>발송 Gmail 주소</label>
                    <input
                      className="fi"
                      type="email"
                      placeholder="example@gmail.com"
                      value={gmailConfig.email}
                      onChange={(e) => setGmailConfig({...gmailConfig, email: e.target.value})}
                    />
                  </div>
                  <div className="fg">
                    <label>Gmail 앱 비밀번호</label>
                    <input
                      className="fi"
                      type="password"
                      placeholder="16자리 앱 비밀번호"
                      value={gmailConfig.appPassword}
                      onChange={(e) => setGmailConfig({...gmailConfig, appPassword: e.target.value})}
                    />
                    <p style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '4px' }}>
                      * 구글 계정 보안 설정에서 생성한 '앱 비밀번호'를 사용하세요.
                    </p>
                  </div>
                  <button type="submit" className="btn btn-jade" style={{ width: '100%' }}>
                    <i className="fa-brands fa-google"></i> Gmail 연동하기
                  </button>
                </form>
                ) : (
                <div className="space-y-4">
                  <div style={{ padding: '12px', background: 'var(--ink3)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>연동된 계정</div>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{gmailConfig.email}</div>
                  </div>
                  <button onClick={handleGmailDisconnect} className="btn" style={{ width: '100%', color: 'var(--rose)' }}>
                    <i className="fa-solid fa-link-slash"></i> 연동 해제
                  </button>
                </div>
                )
              ) : (
                <div style={{ padding: '12px', background: 'var(--ink3)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>연동된 계정</div>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                    {gmailConfig.isConnected && gmailConfig.email ? gmailConfig.email : '연동된 Gmail 계정 없음'}
                  </div>
                </div>
              )}
            </div>
        </div>

        <div className="nl-template card">
            <div className="card-h">
              <span className="card-title">뉴스레터 템플릿</span>
              <button 
                onClick={() => setShowTemplateForm(!showTemplateForm)} 
                className="btn btn-ghost" 
                style={{ fontSize: '.7rem', color: 'var(--jade)' }}
              >
                {showTemplateForm ? '취소' : '+ 새 템플릿'}
              </button>
            </div>
            <div className="card-body">
              {showTemplateForm && (
                <form onSubmit={handleSaveTemplate} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <div className="fg">
                    <label style={{ fontSize: '.7rem' }}>템플릿 명칭</label>
                    <input 
                      className="fi" 
                      style={{ padding: '8px 12px', fontSize: '.8rem' }}
                      placeholder="예: 3월 행사 안내" 
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-jade" style={{ width: '100%', fontSize: '.75rem', padding: '8px' }}>
                    현재 작성 내용 저장
                  </button>
                </form>
              )}

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="text-center text-muted py-4" style={{ fontSize: '.8rem' }}>저장된 템플릿이 없습니다.</p>
                ) : templates.map(t => (
                  <div 
                    key={t.id} 
                    className="group p-3 border border-gray-100 rounded-xl hover:border-jade/30 hover:bg-jade/5 transition-all cursor-pointer flex items-center justify-between"
                    onClick={() => handleLoadTemplate(t)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{t.title}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '2px' }}>{t.subject.slice(0, 20)}...</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-rose hover:bg-rose/10 rounded-lg transition-all"
                    >
                      <i className="fa-solid fa-trash-can" style={{ fontSize: '.75rem' }}></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </div>

        <div className="nl-compose card" style={{ height: 'fit-content' }}>
          <div className="card-h">
            <span className="card-title">뉴스레터 작성 및 발송</span>
            <div className="flex gap-2">
              <button 
                className="btn btn-jade" 
                onClick={handleSendMail} 
                disabled={sending || !gmailConfig.isConnected || selectedIds.size === 0}
              >
                {sending ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : <><i className="fa-solid fa-paper-plane"></i> {selectedIds.size === emails.length ? '전체 발송' : `${selectedIds.size}명에게 발송`}</>}
              </button>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="fg">
              <label>이메일 제목</label>
              <input 
                className="fi" 
                placeholder="[송도 버스킹 마켓] 이번 주말 소식을 전해드립니다!" 
                value={compose.subject}
                onChange={(e) => setCompose({...compose, subject: e.target.value})}
              />
            </div>
            <div className="fg">
              <label>이메일 본문 (HTML 지원)</label>
              <textarea 
                className="fta" 
                style={{ height: '400px', fontFamily: 'var(--font-mono)', fontSize: '.85rem' }}
                placeholder="안녕하세요! 이번 주말 송도 국제캠핑장에서 열리는 행사 안내입니다..."
                value={compose.content}
                onChange={(e) => setCompose({...compose, content: e.target.value})}
              />
            </div>
            
            <div style={{ padding: '14px', background: 'var(--ink3)', borderRadius: '12px', border: '1px dashed var(--line)' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--head)', marginBottom: '4px' }}>발송 정보 확인</div>
              <ul style={{ fontSize: '.7rem', color: 'var(--muted)', listStyle: 'disc', paddingLeft: '16px' }}>
                <li>총 {selectedIds.size}명의 선택된 구독자에게 발송됩니다.</li>
                <li>Gmail 서버를 통해 안전하게 개별 발송 처리됩니다.</li>
                <li>발송 후 관리자 로그에 기록이 남습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="nl-subscribers card">
            <div className="card-h">
              <span className="card-title">구독자 명단 ({filteredEmails.length})</span>
              <button onClick={fetchEmails} className="btn btn-ghost" style={{ fontSize: '.7rem' }}>
                <i className="fa-solid fa-rotate"></i>
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--ink3)' }}>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '.8rem' }}></i>
                  <input 
                    className="fi" 
                    style={{ paddingLeft: '34px', height: '36px', fontSize: '.8rem' }}
                    placeholder="구독자 이메일 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="nl-sub-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="nl-sub-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--ink3)', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
                    <tr>
                      <th style={{ padding: '10px 16px', width: '40px', textAlign: 'left' }}>
                        <input 
                          type="checkbox" 
                          checked={filteredEmails.length > 0 && filteredEmails.every(e => selectedIds.has(e.id))}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th style={{ padding: '10px 0', textAlign: 'left', fontSize: '.7rem', color: 'var(--muted)', fontWeight: 600 }}>이메일 주소</th>
                      <th style={{ padding: '10px 16px', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '.8rem' }}>
                    {loading ? (
                      <tr><td colSpan={3} className="p-10 text-center"><span className="spinner"></span></td></tr>
                    ) : filteredEmails.length === 0 ? (
                      <tr><td colSpan={3} className="p-10 text-center text-muted">구독자가 없습니다.</td></tr>
                    ) : filteredEmails.map(n => (
                      <tr key={n.id} style={{ borderBottom: '1px solid var(--line)', background: selectedIds.has(n.id) ? 'rgba(13, 148, 136, 0.03)' : 'transparent' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(n.id)}
                            onChange={() => toggleSelect(n.id)}
                          />
                        </td>
                        <td style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => toggleSelect(n.id)}>
                          <div style={{ fontWeight: 500 }}>{n.email}</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>{n.created_at?.split('T')[0]}</div>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPage;
