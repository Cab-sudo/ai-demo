import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe/plans";

export async function POST(req: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { title, industry, company_size } = await req.json();

    const { data: profile } = await supabase.from("profiles").select("plan, assessments_used_this_month").eq("id", user.id).single();
    const quota = PLANS[(profile?.plan || "free") as keyof typeof PLANS].assessmentsPerMonth;
    if ((profile?.assessments_used_this_month ?? 0) >= quota) {
      return NextResponse.json({ error: "QUOTA_EXCEEDED", quota }, { status: 402 });
    }

    const { data, error } = await supabase.from("assessments").insert({
      user_id: user.id,
      title: title || "Untitled Assessment",
      industry, company_size,
      status: "draft",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ assessment: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
