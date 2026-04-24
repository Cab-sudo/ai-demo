export type Plan = "free" | "pro" | "business";

export const PLANS = {
  free: {
    id: "free" as const,
    name: "Free",
    price: 0,
    priceId: null,
    assessmentsPerMonth: 1,
    features: ["1 assessment / month", "Basic risk score", "Email support"],
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    assessmentsPerMonth: 10,
    features: ["10 assessments / month", "AI recommendations", "PDF + CSV export", "Priority support"],
  },
  business: {
    id: "business" as const,
    name: "Business",
    price: 99,
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
    assessmentsPerMonth: Infinity,
    features: ["Unlimited assessments", "Team seats", "API access", "Dedicated support"],
  },
};

export function priceToPlan(priceId: string | null | undefined): Plan {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS_MONTHLY) return "business";
  return "free";
}
