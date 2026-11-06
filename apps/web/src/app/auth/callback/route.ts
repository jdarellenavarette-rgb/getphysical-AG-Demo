import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "../../../lib/supabase/server";

/** OAuth (Google / Apple) return URL: exchange the PKCE code for a session cookie. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const destination = request.nextUrl.clone();
  destination.search = "";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      destination.pathname = next.startsWith("/") && !next.startsWith("//") ? next : "/";
      return NextResponse.redirect(destination);
    }
  }
  destination.pathname = "/login";
  destination.searchParams.set("error", "oauth_failed");
  return NextResponse.redirect(destination);
}
