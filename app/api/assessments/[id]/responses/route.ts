import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();
    const { responses } = await req.json() as {
      responses: Array<{ question_id: string; answer: string; notes?: string }>;
    };

    const { data: a } = await supabase.from("assessments").select("id").eq("id", params.id).eq("user_id", user.id).single();
    if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rows = responses.map((r) => ({
      assessment_id: params.id,
      question_id: r.question_id,
      answer: r.answer,
      notes: r.notes?.slice(0, 1000) ?? null,
    }));

    const { error } = await supabase.from("responses").upsert(rows, { onConflict: "assessment_id,question_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
