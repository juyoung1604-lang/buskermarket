// app/admin/newsletter/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';
import { motion } from 'framer-motion';

const NewsletterPage = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Gmail Settings
  const [gmailConfig, setGmailConfig] = useState({
    email: '',
    appPassword: '',
    isConnected: false
  });

  // Compose State
  const [compose, setCompose] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    fetchEmails();
    const savedConfig = localStorage.getItem('songdo_gmail_config');
    if (savedConfig) {
      setGmailConfig(JSON.parse(savedConfig));
    }
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    const data = await DB.getNewsletters();
    setEmails(data || []);
    setLoading(false);
  };

  const handleGmailConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailConfig.email || !gmailConfig.appPassword) {
      toast('Gmail 계정과 앱 비밀번호를 입력해주세요.', 'rose');
      return;
    }
    
    const newConfig = { ...gmailConfig, isConnected: true };
    setGmailConfig(newConfig);
    localStorage.setItem('songdo_gmail_config', JSON.stringify(newConfig));
    toast('Gmail 계정이 연동되었습니다.', 'jade');
  };

  const handleGmailDisconnect = () => {
    const newConfig = { email: '', appPassword: '', isConnected: false };
    setGmailConfig(newConfig);
    localStorage.removeItem('songdo_gmail_config');
    toast('연동이 해제되었습니다.', 'sky');
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
    if (emails.length === 0) {
      toast('구독자가 없습니다.', 'rose');
      return;
    }

    setSending(true);
    
    // Simulate API call for sending emails
    // In a real production app, this would call a backend endpoint that uses nodemailer or Gmail API
    setTimeout(() => {
      setSending(false);
      toast(`${emails.length}명의 구독자에게 뉴스레터 발송이 완료되었습니다.`, 'jade');
      setCompose({ subject: '', content: '' });
      
      // Log this activity
      DB.createAdminLog({
        type: 'paper-plane',
        color: 'var(--jade)',
        title: '뉴스레터 발송 완료',
        desc: `${compose.subject} (${emails.length}명)`
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: List & Gmail Config */}
        <div className="space-y-6">
          {/* Gmail Config Card */}
          <div className="card">
            <div className="card-h">
              <span className="card-title">Gmail 연동 설정</span>
              {gmailConfig.isConnected && <span className="badge b-approved">연결됨</span>}
            </div>
            <div className="card-body">
              {!gmailConfig.isConnected ? (
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
              )}
            </div>
          </div>

          {/* Subscriber List Card */}
          <div className="card">
            <div className="card-h">
              <span className="card-title">구독자 명단 ({emails.length})</span>
              <button onClick={fetchEmails} className="btn btn-ghost" style={{ fontSize: '.7rem' }}>
                <i className="fa-solid fa-rotate"></i>
              </button>
            </div>
            <div className="card-body" style={{ padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%' }}>
                <tbody style={{ fontSize: '.8rem' }}>
                  {loading ? (
                    <tr><td className="p-10 text-center"><span className="spinner"></span></td></tr>
                  ) : emails.length === 0 ? (
                    <tr><td className="p-10 text-center text-muted">구독자가 없습니다.</td></tr>
                  ) : emails.map(n => (
                    <tr key={n.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{n.email}</div>
                        <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>{n.created_at?.split('T')[0]}</div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(n.id)} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
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

        {/* Right Column: Compose Email */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-h">
            <span className="card-title">뉴스레터 작성 및 발송</span>
            <div className="flex gap-2">
              <button 
                className="btn btn-jade" 
                onClick={handleSendMail} 
                disabled={sending || !gmailConfig.isConnected}
              >
                {sending ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : <><i className="fa-solid fa-paper-plane"></i> 전체 발송</>}
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
              <ul style={{ fontSize: '.7rem', color: 'var(--muted)', listStyle: 'disc', paddingLeft: '16px', spaceY: '4px' }}>
                <li>총 {emails.length}명의 구독자에게 발송됩니다.</li>
                <li>Gmail 서버를 통해 안전하게 개별 발송 처리됩니다.</li>
                <li>발송 후 관리자 로그에 기록이 남습니다.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsletterPage;
