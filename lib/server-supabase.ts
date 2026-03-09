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
export const APP_SETTINGS_FALLBACK_TABLE = 'admin_logs';

type ServerSupabaseConfig = {
  url?: string;
  key?: string;
};

const isMissingTableError = (error: any, table: string) => {
  if (!error?.message) return false;
  const message = String(error.message).toLowerCase();
  const normalizedTable = table.toLowerCase();

  return (
    (message.includes(`relation "${normalizedTable}" does not exist`) ||
      message.includes(`could not find the table "${normalizedTable}"`) ||
      message.includes(`'${normalizedTable}'`) ||
      message.includes(normalizedTable)) &&
    (message.includes('relation') || message.includes('schema cache') || message.includes('table'))
  );
};

const resolveServerSupabaseClient = (config?: ServerSupabaseConfig) => {
  if (serverSupabase) return serverSupabase;

  const fallbackUrl = String(config?.url || '').trim();
  const fallbackKey = String(config?.key || '').trim();

  if (!fallbackUrl || !fallbackKey) return null;
  return createClient(fallbackUrl, fallbackKey);
};

const getFallbackSettingId = (name: string) => `setting:${name}`;

async function getFallbackServerAppSetting<T>(client: any, name: string, fallback: T) {
  try {
    const { data, error } = await (client as any)
      .from(APP_SETTINGS_FALLBACK_TABLE)
      .select('desc')
      .eq('id', getFallbackSettingId(name))
      .maybeSingle();

    if (error) {
      console.error(error);
      return fallback;
    }

    const row = data as { desc?: string } | null;
    if (!row?.desc) return fallback;

    try {
      return JSON.parse(row.desc) as T;
    } catch {
      return fallback;
    }
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

async function saveFallbackServerAppSetting(
  client: any,
  name: string,
  value: any
) {
  try {
    return await (client as any).from(APP_SETTINGS_FALLBACK_TABLE).upsert(
      [
        {
          id: getFallbackSettingId(name),
          type: 'system_setting',
          color: 'var(--jade)',
          title: `setting:${name}`,
          desc: JSON.stringify(value),
          created_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );
  } catch (error: any) {
    console.error(error);
    return { error };
  }
}

export async function getServerAppSetting<T>(
  name: string,
  fallback: T,
  config?: ServerSupabaseConfig
): Promise<T> {
  const client = resolveServerSupabaseClient(config);
  if (!client) return fallback;
  try {
    const { data, error } = await client
      .from(APP_SETTINGS_TABLE)
      .select('value')
      .eq('key', name)
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error, APP_SETTINGS_TABLE)) {
        return await getFallbackServerAppSetting(client, name, fallback);
      }
      console.error(error);
      return fallback;
    }
    return (data?.value as T) ?? fallback;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export async function saveServerAppSetting(name: string, value: any, config?: ServerSupabaseConfig) {
  const client = resolveServerSupabaseClient(config);
  if (!client) {
    return { error: { message: 'Server Supabase client is not configured.' } };
  }

  try {
    const result = await client.from(APP_SETTINGS_TABLE).upsert(
      [
        {
          key: name,
          value,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'key' }
    );
    if (!(result as any)?.error) return result;
    if (!isMissingTableError((result as any).error, APP_SETTINGS_TABLE)) {
      return result;
    }
    return await saveFallbackServerAppSetting(client, name, value);
  } catch (error: any) {
    if (!isMissingTableError(error, APP_SETTINGS_TABLE)) {
      console.error(error);
      return { error };
    }
    return await saveFallbackServerAppSetting(client, name, value);
  }
}
