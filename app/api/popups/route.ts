// app/api/popups/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/server-supabase';

const resolveClient = (url: string, key: string) =>
  serverSupabase || (url && key ? createClient(url, key) : null);

// GET: fetch popups (public: active only, admin?admin=1: all)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = resolveClient(
      searchParams.get('supabaseUrl') || '',
      searchParams.get('supabaseKey') || '',
    );

    if (!client) return NextResponse.json({ popups: [] });

    const isAdmin = searchParams.get('admin') === '1';
    let query = client
      .from('homepage_popups')
      .select('*')
      .order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('is_active', true);
    const { data, error } = await query;

    if (error) {
      console.error('Popup fetch error:', error.message);
      return NextResponse.json({ popups: [] });
    }

    return NextResponse.json({ popups: data || [] });
  } catch (e: any) {
    console.error('Popup API error:', e.message);
    return NextResponse.json({ popups: [] });
  }
}

// POST: create new popup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supabaseUrl, supabaseKey, ...payload } = body;
    const client = resolveClient(supabaseUrl || '', supabaseKey || '');

    if (!client) return NextResponse.json({ error: 'DB 연결 없음' }, { status: 503 });

    const { data, error } = await client
      .from('homepage_popups')
      .insert([payload])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ popup: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
