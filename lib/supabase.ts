import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function getConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof window !== "undefined") {
    const localUrl = window.localStorage.getItem("supabase_url");
    const localKey = window.localStorage.getItem("supabase_anon_key");
    return {
      url: envUrl || localUrl,
      key: envKey || localKey,
    };
  }

  return { url: envUrl, key: envKey };
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { url, key } = getConfig();

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or localStorage supabase_url / supabase_anon_key)."
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      return (getSupabaseClient() as any)[prop];
    },
  }
) as unknown as SupabaseClient;
