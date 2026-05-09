import { NextResponse } from "next/server";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

async function getUser() {
  if (!isSupabaseServerConfigured()) {
    return { supabase: null, user: null, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null, error: "Sign in to save resumes." };
  }

  return { supabase, user: data.user, error: "" };
}

export async function GET() {
  const { supabase, user, error } = await getUser();

  if (!supabase || !user) {
    return NextResponse.json({ error, resumes: [] }, { status: error.includes("configured") ? 503 : 401 });
  }

  const { data, error: queryError } = await supabase
    .from("resumes")
    .select("id,name,template,resume,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message, resumes: [] }, { status: 500 });
  }

  return NextResponse.json({ resumes: data || [] });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getUser();

  if (!supabase || !user) {
    return NextResponse.json({ error }, { status: error.includes("configured") ? 503 : 401 });
  }

  const payload = await request.json();
  const { data, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      name: payload.name || "Untitled Resume",
      template: payload.template || "ats",
      resume: payload.resume
    })
    .select("id,name,template,resume,created_at,updated_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ resume: data });
}
