import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { analyzeRisk } from "@/lib/anthropic/analyzeRisk";
import { checkRateLimit } from "@/lib/anthropic/rateLimit";
import { sendReportReady } from "@/lib/email/resend";

export const maxDuration = 60;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();

    const rl = checkRateLimit(user.id);
    if (!rl.ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { data: assessment } = await supabase.from("assessments").select("*").eq("id", params.id).eq("user_id", user.id).single();
    if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    const { data: responses } = await supabase
      .from("responses")
      .select("answer, notes, question:questions(category, question_text, weight)")
      .eq("assessment_id", params.id);

    if (!responses?.length) return NextResponse.json({ error: "No responses" }, { status: 400 });

    const report = await analyzeRisk({
      company: { name: profile?.company_name, industry: assessment.industry, size: assessment.company_size },
      responses: responses.map((r: any) => ({
        category: r.question.category,
        question: r.question.question_text,
        answer: r.answer,
        notes: r.notes,
        weight: r.question.weight,
      })),
    });

    // Persist (admin bypass to guarantee write even if RLS semantics change)
    await supabaseAdmin.from("ai_reports").upsert({
      assessment_id: params.id,
      summary: report.executive_summary,
      recommendations: report.top_risks,
      quick_wins: report.quick_wins,
      priority_matrix: report.priority_matrix,
      generated_at: new Date().toISOString(),
    }, { onConflict: "assessment_id" });

    await supabaseAdmin.from("assessments").update({
      status: "scored",
      risk_score: report.risk_score,
      risk_level: report.risk_level,
    }).eq("id", params.id);

    await supabaseAdmin.rpc("increment_usage", { p_user: user.id }).catch(() => {
      // Fallback if RPC not present: raw update
      return supabaseAdmin
        .from("profiles")
        .update({ assessments_used_this_month: (profile?.assessments_used_this_month ?? 0) + 1 })
        .eq("id", user.id);
    });

    if (profile?.email) await sendReportReady(profile.email, params.id);

    return NextResponse.json({ report });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
