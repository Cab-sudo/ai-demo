import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RiskScoreCard({ score, level }: { score: number; level: "low" | "medium" | "high" | "critical" }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = level === "critical" ? "#dc2626" : level === "high" ? "#ea580c" : level === "medium" ? "#eab308" : "#16a34a";

  return (
    <Card>
      <CardHeader><CardTitle>Overall Risk Score</CardTitle></CardHeader>
      <CardContent className="flex items-center gap-8">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 70 70)" />
          <text x="70" y="78" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#111">{score}</text>
        </svg>
        <div>
          <Badge variant={level}>{level.toUpperCase()}</Badge>
          <p className="mt-2 text-sm text-muted-foreground">Higher is better. 100 = excellent posture.</p>
        </div>
      </CardContent>
    </Card>
  );
}
