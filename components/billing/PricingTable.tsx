"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";

export function PricingTable({ currentPlan = "free" }: { currentPlan?: "free" | "pro" | "business" }) {
  async function subscribe(priceId: string | null) {
    if (!priceId) return;
    const res = await fetch("/api/stripe/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url, error } = await res.json();
    if (error) return alert(error);
    window.location.href = url;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.values(PLANS).map((p) => (
        <Card key={p.id} className={p.id === "pro" ? "border-primary border-2" : ""}>
          <CardHeader>
            <CardTitle>{p.name}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">${p.price}</span>
              <span className="text-muted-foreground">/mo</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Button className="w-full"
              disabled={currentPlan === p.id || p.id === "free"}
              onClick={() => subscribe(p.priceId)}>
              {currentPlan === p.id ? "Current plan" : p.id === "free" ? "Default" : `Upgrade to ${p.name}`}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
