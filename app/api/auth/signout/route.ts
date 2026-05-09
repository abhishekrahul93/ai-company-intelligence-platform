import { NextResponse } from "next/server";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function POST() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true, configured: true });
}
