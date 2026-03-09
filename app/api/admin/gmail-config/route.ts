import { NextResponse } from 'next/server';
import { getServerAppSetting, saveServerAppSetting } from '@/lib/server-supabase';

const DEFAULT_GMAIL_CONFIG = {
  email: '',
  appPassword: '',
  isConnected: false,
};

export async function GET() {
  const config = await getServerAppSetting('gmail_config', DEFAULT_GMAIL_CONFIG);
  return NextResponse.json({ config });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = {
      email: String(body?.email || '').trim(),
      appPassword: String(body?.appPassword || '').trim(),
      isConnected: Boolean(body?.isConnected),
    };

    if (config.isConnected && (!config.email || !config.appPassword)) {
      return NextResponse.json({ error: 'Gmail 계정과 앱 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    const result = await saveServerAppSetting('gmail_config', config);
    if ((result as any)?.error) {
      return NextResponse.json(
        { error: (result as any).error.message || 'Gmail 설정 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gmail 설정 저장에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE() {
  const result = await saveServerAppSetting('gmail_config', DEFAULT_GMAIL_CONFIG);
  if ((result as any)?.error) {
    return NextResponse.json(
      { error: (result as any).error.message || 'Gmail 설정 해제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, config: DEFAULT_GMAIL_CONFIG });
}
