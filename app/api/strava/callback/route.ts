import { NextRequest, NextResponse } from "next/server";
import { exchangeToken, getServerSupabase } from "@/utils/strava";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", req.url));

  const json = await exchangeToken(code);

  await supabase.from("strava_tokens").upsert({
    user_id: user.id,
    athlete_id: json.athlete?.id ?? null,
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
  });

  return NextResponse.redirect(new URL("/dashboard?connected=strava", req.url));
}
