import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface AnalysisInput {
  company: { name?: string; industry?: string; size?: string };
  responses: Array<{
    category: string;
    question: string;
    answer: "yes" | "no" | "partial" | "na";
    notes?: string;
    weight: number;
  }>;
}

export interface RiskReport {
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  executive_summary: string;
  top_risks: Array<{ title: string; severity: string; description: string; remediation: string }>;
  quick_wins: Array<{ action: string; effort: "low" | "medium" | "high"; impact: "low" | "medium" | "high" }>;
  priority_matrix: { critical: string[]; high: string[]; medium: string[]; low: string[] };
}

// Defensive sanitization — strip control chars, truncate
function sanitize(s: string | undefined, max = 500): string {
  if (!s) return "";
  return s.replace(/[\x00-\x1F\x7F]/g, " ").slice(0, max);
}

function buildPrompt(input: AnalysisInput): string {
  const ctx = `Company: ${sanitize(input.company.name) || "N/A"}
Industry: ${sanitize(input.company.industry) || "N/A"}
Size: ${sanitize(input.company.size) || "N/A"}`;

  const qa = input.responses.map((r, i) =>
    `${i + 1}. [${r.category}] (w=${r.weight}) ${sanitize(r.question, 300)}
   Answer: ${r.answer}${r.notes ? `  Notes: ${sanitize(r.notes, 300)}` : ""}`
  ).join("\n");

  return `You are a senior cybersecurity risk analyst. Analyze the following SMB/startup security assessment and produce a risk report.

${ctx}

Assessment Responses:
${qa}

Scoring rubric:
- Weight matters: 'no' on a high-weight item = major risk.
- 'partial' = half credit. 'na' = excluded from scoring.
- risk_score: 0 (worst) to 100 (perfect). Inverse of risk.
- risk_level: 0-24=critical, 25-49=high, 50-74=medium, 75-100=low.

Return ONLY valid minified JSON — no prose, no markdown, no code fences. Schema:
{"risk_score":int,"risk_level":"low|medium|high|critical","executive_summary":"3-4 sentences","top_risks":[{"title":"","severity":"critical|high|medium|low","description":"","remediation":""}],"quick_wins":[{"action":"","effort":"low|medium|high","impact":"low|medium|high"}],"priority_matrix":{"critical":[],"high":[],"medium":[],"low":[]}}

Include 3-7 top_risks, 3-5 quick_wins. priority_matrix arrays contain short risk titles.`;
}

function extractJson(text: string): any {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function analyzeRisk(input: AnalysisInput): Promise<RiskReport> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const text = msg.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const parsed = extractJson(text) as RiskReport;

  // Validate & clamp
  parsed.risk_score = Math.max(0, Math.min(100, Math.round(parsed.risk_score)));
  if (!["low", "medium", "high", "critical"].includes(parsed.risk_level)) {
    parsed.risk_level =
      parsed.risk_score >= 75 ? "low" :
      parsed.risk_score >= 50 ? "medium" :
      parsed.risk_score >= 25 ? "high" : "critical";
  }
  parsed.top_risks ||= [];
  parsed.quick_wins ||= [];
  parsed.priority_matrix ||= { critical: [], high: [], medium: [], low: [] };
  return parsed;
}
