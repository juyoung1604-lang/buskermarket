// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { gmailUser, gmailPass, recipients, subject, content } = await request.json();

    if (!gmailUser || !gmailPass || !recipients || !subject || !content) {
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

    // Send emails
    // For many recipients, it's better to use Bcc or send in chunks, but for simplicity:
    const mailOptions = {
      from: `송도 버스킹 마켓 <${gmailUser}>`,
      to: recipients.join(', '),
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
    return NextResponse.json({ error: error.message || '메일 발송에 실패했습니다.' }, { status: 500 });
  }
}
