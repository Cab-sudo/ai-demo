"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/stripe/plans";

interface Props {
  userPlan: Plan;
  requiredPlan: "pro" | "business";
  children: ReactNode;
  label?: string;
}

const RANK: Record<Plan, number> = { free: 0, pro: 1, business: 2 };

export function GateFeature({ userPlan, requiredPlan, children, label }: Props) {
  const allowed = RANK[userPlan] >= RANK[requiredPlan];
  const [open, setOpen] = useState(false);

  if (allowed) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 space-y-3">
          <Lock className="w-8 h-8 mx-auto text-primary" />
          <p className="font-semibold">{label || `Available on ${requiredPlan === "pro" ? "Pro" : "Business"}`}</p>
          <Link href="/pricing">
            <Button>Upgrade to {requiredPlan === "pro" ? "Pro" : "Business"}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
