import { NextResponse } from 'next/server';
import { getServerAppSetting, saveServerAppSetting } from '@/lib/server-supabase';

const DEFAULT_GMAIL_CONFIG = {
  email: '',
  appPassword: '',
  isConnected: false,
};

const getSupabaseConfigFromUrl = (request: Request) => {
  const { searchParams } = new URL(request.url);
  return {
    url: searchParams.get('supabaseUrl') || '',
    key: searchParams.get('supabaseKey') || '',
  };
};

const getSupabaseConfigFromBody = (body: any) => ({
  url: String(body?.supabaseUrl || '').trim(),
  key: String(body?.supabaseKey || '').trim(),
});

export async function GET(request: Request) {
  const config = await getServerAppSetting('gmail_config', DEFAULT_GMAIL_CONFIG, getSupabaseConfigFromUrl(request));
  return NextResponse.json({ config });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabaseConfig = getSupabaseConfigFromBody(body);
    const config = {
      email: String(body?.email || '').trim(),
      appPassword: String(body?.appPassword || '').trim(),
      isConnected: Boolean(body?.isConnected),
    };

    if (config.isConnected && (!config.email || !config.appPassword)) {
      return NextResponse.json({ error: 'Gmail 계정과 앱 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    const result = await saveServerAppSetting('gmail_config', config, supabaseConfig);
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

export async function DELETE(request: Request) {
  let supabaseConfig = { url: '', key: '' };
  try {
    supabaseConfig = getSupabaseConfigFromBody(await request.json());
  } catch {}

  const result = await saveServerAppSetting('gmail_config', DEFAULT_GMAIL_CONFIG, supabaseConfig);
  if ((result as any)?.error) {
    return NextResponse.json(
      { error: (result as any).error.message || 'Gmail 설정 해제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, config: DEFAULT_GMAIL_CONFIG });
}
