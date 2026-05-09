import { NextResponse } from "next/server";
import { isSupabaseServerConfigured, createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ configured: false, user: null });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ configured: true, user: null });
  }

  return NextResponse.json({ configured: true, user: data.user });
}
