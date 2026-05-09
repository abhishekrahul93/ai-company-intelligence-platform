import { NextResponse } from "next/server";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code || !isSupabaseServerConfigured()) {
    return NextResponse.redirect(new URL("/dashboard?auth=not-configured", request.url));
  }

  const supabase = await createClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL(next, request.url));
}
