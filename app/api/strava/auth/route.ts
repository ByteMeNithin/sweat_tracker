import { NextResponse } from "next/server";

export async function GET() {
  const client_id = process.env.STRAVA_CLIENT_ID!;
  const redirect_uri = process.env.STRAVA_REDIRECT_URI!;
  const scope = "read,activity:read_all,profile:read_all"; // adjust as needed
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", client_id);
  url.searchParams.set("redirect_uri", redirect_uri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", scope);
  return NextResponse.redirect(url);
}
