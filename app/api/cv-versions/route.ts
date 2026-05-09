import { NextResponse } from "next/server";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

async function getUser() {
  if (!isSupabaseServerConfigured()) {
    return { supabase: null, user: null, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null, error: "Sign in to save CV versions." };
  }

  return { supabase, user: data.user, error: "" };
}

export async function GET() {
  const { supabase, user, error } = await getUser();

  if (!supabase || !user) {
    return NextResponse.json({ error, versions: [] }, { status: error.includes("configured") ? 503 : 401 });
  }

  const { data, error: queryError } = await supabase
    .from("cv_versions")
    .select("id,resume_id,name,language,format,target_country,generated_content,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message, versions: [] }, { status: 500 });
  }

  return NextResponse.json({ versions: data || [] });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getUser();

  if (!supabase || !user) {
    return NextResponse.json({ error }, { status: error.includes("configured") ? 503 : 401 });
  }

  const payload = await request.json();
  const version = payload.version || {};
  const { data, error: insertError } = await supabase
    .from("cv_versions")
    .insert({
      user_id: user.id,
      resume_id: payload.resumeId || null,
      name: payload.name || "Generated CV Version",
      language: version.language || "English",
      format: version.format || "Global ATS Resume",
      target_country: version.targetCountry || "United States",
      generated_content: payload.generatedContent || payload.result || {}
    })
    .select("id,resume_id,name,language,format,target_country,generated_content,created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ version: data });
}
