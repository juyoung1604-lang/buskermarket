import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const serverSupabase =
  url && key ? createClient(url, key) : null;

export const APP_SETTINGS_TABLE = 'app_settings';

export async function getServerAppSetting<T>(name: string, fallback: T): Promise<T> {
  if (!serverSupabase) return fallback;
  try {
    const { data, error } = await serverSupabase
      .from(APP_SETTINGS_TABLE)
      .select('value')
      .eq('key', name)
      .maybeSingle();
    if (error) {
      console.error(error);
      return fallback;
    }
    return (data?.value as T) ?? fallback;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export async function saveServerAppSetting(name: string, value: any) {
  if (!serverSupabase) {
    return { error: { message: 'Server Supabase client is not configured.' } };
  }

  try {
    return await serverSupabase.from(APP_SETTINGS_TABLE).upsert(
      [
        {
          key: name,
          value,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'key' }
    );
  } catch (error: any) {
    console.error(error);
    return { error };
  }
}
