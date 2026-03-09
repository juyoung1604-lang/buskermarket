// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerAppSetting } from '@/lib/server-supabase';

export async function POST(request: Request) {
  try {
    const { recipients, subject, content, supabaseUrl, supabaseKey } = await request.json();

    // Env vars take priority — persistent across all deployments
    let gmailUser = (process.env.GMAIL_USER || '').trim();
    let gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

    // Fall back to Supabase-stored config if env vars not set
    if (!gmailUser || !gmailPass) {
      const gmailConfig = await getServerAppSetting('gmail_config', {
        email: '',
        appPassword: '',
        isConnected: false,
      }, {
        url: String(supabaseUrl || '').trim(),
        key: String(supabaseKey || '').trim(),
      });
      gmailUser = gmailUser || (gmailConfig?.email || '').trim();
      // Remove spaces — Google displays App Passwords as "xxxx xxxx xxxx xxxx"
      gmailPass = gmailPass || (gmailConfig?.appPassword || '').replace(/\s+/g, '').trim();
    }

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({
        error: 'Gmail 계정이 설정되지 않았습니다. 관리자 > 뉴스레터에서 Gmail 연동을 완료하거나 서버 환경변수(GMAIL_USER, GMAIL_APP_PASSWORD)를 설정하세요.',
      }, { status: 400 });
    }

    if (!recipients?.length || !subject || !content) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Exclude sender from BCC list to avoid duplicate receipt
    const bccList = (recipients as string[]).filter(
      (r) => r.trim().toLowerCase() !== gmailUser.toLowerCase()
    );

    const mailOptions = {
      from: `송도 버스킹 마켓 <${gmailUser}>`,
      to: gmailUser, // sender receives as primary (delivery receipt)
      bcc: bccList.join(', '),
      subject: subject,
      html: `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; borderRadius: 15px;">
          <h2 style="color: #FF8B5A; border-bottom: 2px solid #FF8B5A; padding-bottom: 10px;">송도 버스킹 마켓 뉴스레터</h2>
          <div style="padding: 20px 0; line-height: 1.6; color: #333;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
            본 메일은 송도 버스킹 마켓 뉴스레터 구독자분들께 발송되었습니다.<br/>
            © 2026 송도 버스킹 마켓. All rights reserved.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email send error:', error);
    let errorMsg = error.message || '메일 발송에 실패했습니다.';
    if (error.responseCode === 535 || errorMsg.includes('BadCredentials') || errorMsg.includes('Username and Password not accepted')) {
      errorMsg = 'Gmail 인증 실패: 앱 비밀번호가 올바르지 않습니다. Google 계정 > 보안 > 2단계 인증 활성화 후 앱 비밀번호를 발급받아 입력하세요.';
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
