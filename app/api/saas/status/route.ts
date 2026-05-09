import { NextResponse } from "next/server";
import { getSaasStatus } from "@/lib/saas";

export async function GET() {
  return NextResponse.json(getSaasStatus());
}
