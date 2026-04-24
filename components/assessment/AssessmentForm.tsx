"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Answer = "yes" | "no" | "partial" | "na";
interface Question { id: string; category: string; question_text: string; weight: number; order_index: number; }
interface Props { assessmentId: string; questions: Question[]; initial?: Record<string, { answer: Answer; notes?: string }>; }

const CATEGORIES = ["network", "access", "data", "compliance", "incident"] as const;

export function AssessmentForm({ assessmentId, questions, initial = {} }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, { answer: Answer; notes?: string }>>(initial);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);
  const lastSaved = useRef<string>("");

  const grouped = CATEGORIES.map((c) => ({
    category: c,
    items: questions.filter((q) => q.category === c).sort((a, b) => a.order_index - b.order_index),
  }));

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = (answered / total) * 100;

  // Autosave every 30s when dirty
  useEffect(() => {
    const t = setInterval(async () => {
      const snapshot = JSON.stringify(answers);
      if (snapshot === lastSaved.current) return;
      await save();
      lastSaved.current = snapshot;
    }, 30000);
    return () => clearInterval(t);
  }, [answers]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/assessments/${assessmentId}/responses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: Object.entries(answers).map(([question_id, v]) => ({ question_id, ...v })),
        }),
      });
    } finally { setSaving(false); }
  }

  async function submit() {
    setScoring(true);
    await save();
    const res = await fetch(`/api/assessments/${assessmentId}/score`, { method: "POST" });
    setScoring(false);
    if (res.ok) router.push(`/reports/${assessmentId}`);
    else alert("Failed to score. Please try again.");
  }

  const current = grouped[step];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{current.category} — Step {step + 1} of {CATEGORIES.length}</CardTitle>
            <span className="text-xs text-muted-foreground">{answered}/{total} answered {saving && "• saving…"}</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {current.items.map((q) => (
            <div key={q.id} className="p-4 border rounded-md space-y-2">
              <div className="flex gap-2 items-start">
                <Badge>w {q.weight}</Badge>
                <p className="font-medium">{q.question_text}</p>
              </div>
              <div className="flex gap-2">
                {(["yes", "no", "partial", "na"] as Answer[]).map((a) => (
                  <Button key={a} type="button"
                    variant={answers[q.id]?.answer === a ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: { ...prev[q.id], answer: a } }))}>
                    {a.toUpperCase()}
                  </Button>
                ))}
              </div>
              <textarea
                placeholder="Optional notes…"
                className="w-full text-sm p-2 border rounded-md bg-background"
                rows={2}
                value={answers[q.id]?.notes || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: { ...(prev[q.id] || { answer: "na" }), notes: e.target.value } }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < CATEGORIES.length - 1 ? (
          <Button onClick={async () => { await save(); setStep((s) => s + 1); }}>Save & Continue</Button>
        ) : (
          <Button onClick={submit} disabled={scoring || answered < total * 0.5}>
            {scoring ? "Analyzing with AI…" : "Submit for AI Analysis"}
          </Button>
        )}
      </div>
    </div>
  );
}
