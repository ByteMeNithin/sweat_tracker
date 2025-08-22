import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, refreshIfNeeded, stravaGet } from "@/utils/strava";

// Query params:
//   after: ISO date (inclusive) → converted to epoch seconds
//   before: ISO date (exclusive)
//   club_id: number (optional) — fetches club activities instead of athlete activities
export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const afterIso = url.searchParams.get("after");
  const beforeIso = url.searchParams.get("before");
  const clubId = url.searchParams.get("club_id");

  const after = afterIso ? Math.floor(new Date(afterIso).getTime() / 1000) : undefined;
  const before = beforeIso ? Math.floor(new Date(beforeIso).getTime() / 1000) : undefined;

  const tokenRow = await refreshIfNeeded(user.id);
  if (!tokenRow) return NextResponse.json({ error: "strava not connected" }, { status: 400 });

  if (clubId) {
    // Club feed — latest ~200 activities; filter here
    const list = await stravaGet(`https://www.strava.com/api/v3/clubs/${clubId}/activities?per_page=200`, tokenRow.access_token);
    const filtered = list.filter((a: any) => {
      const t = Math.floor(new Date(a.start_date).getTime() / 1000);
      if (after && t < after) return false;
      if (before && t >= before) return false;
      return true;
    });
    return NextResponse.json(filtered);
  } else {
    const qs = new URLSearchParams({ per_page: "100" });
    if (after) qs.set("after", String(after));
    if (before) qs.set("before", String(before));
    const list = await stravaGet(`https://www.strava.com/api/v3/athlete/activities?${qs.toString()}`, tokenRow.access_token);
    return NextResponse.json(list);
  }
}
