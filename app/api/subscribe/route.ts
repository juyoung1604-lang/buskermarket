// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/server-supabase';

export async function POST(request: Request) {
  try {
    const { email, supabaseUrl, supabaseKey } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
    }

    // Use server env vars first, then client-provided config
    const client =
      serverSupabase ||
      (supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null);

    if (!client) {
      return NextResponse.json({ error: 'DB가 연결되지 않았습니다. 관리자에게 문의하세요.' }, { status: 503 });
    }

    // Duplicate check
    const { data: existing } = await client
      .from('newsletter')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '이미 구독 중인 이메일입니다.' }, { status: 409 });
    }

    const { error } = await client.from('newsletter').insert([{ email }]);

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscribe API error:', error);
    return NextResponse.json({ error: error.message || '구독 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
