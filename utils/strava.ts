import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function exchangeToken(code: string) {
  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
  });
  const r = await fetch("https://www.strava.com/oauth/token", { method: "POST", body });
  if (!r.ok) throw new Error("Failed to exchange token");
  return r.json();
}

export async function refreshIfNeeded(user_id: string) {
  const supabase = await getServerSupabase();
  const { data: row } = await supabase.from("strava_tokens").select("* ").eq("user_id", user_id).maybeSingle();
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000) + 60; // 1 min skew
  if (row.expires_at > now) return row;
  // refresh
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: row.refresh_token,
  });
  const r = await fetch("https://www.strava.com/oauth/token", { method: "POST", body: params });
  if (!r.ok) throw new Error("Failed to refresh token");
  const json = await r.json();
  const updated = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
    athlete_id: json.athlete?.id ?? row.athlete_id,
  };
  await supabase.from("strava_tokens").upsert({ user_id, ...updated });
  return { ...row, ...updated };
}

export async function stravaGet(url: string, access_token: string) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!r.ok) throw new Error(`Strava GET failed: ${r.status}`);
  return r.json();
}
