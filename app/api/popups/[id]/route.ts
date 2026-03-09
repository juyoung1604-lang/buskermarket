// app/api/popups/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/server-supabase';

const resolveClient = (body: any) => {
  const url = String(body?.supabaseUrl || '').trim();
  const key = String(body?.supabaseKey || '').trim();
  return serverSupabase || (url && key ? createClient(url, key) : null);
};

// PUT: update popup
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = resolveClient(body);
    if (!client) return NextResponse.json({ error: 'DB 연결 없음' }, { status: 503 });

    const { supabaseUrl, supabaseKey, ...payload } = body;
    const { data, error } = await client
      .from('homepage_popups')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ popup: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: delete popup
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const client = resolveClient(body);
    if (!client) return NextResponse.json({ error: 'DB 연결 없음' }, { status: 503 });

    const { error } = await client.from('homepage_popups').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
