import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/stripe";

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
    if (!profile?.stripe_customer_id)
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

    const session = await stripe.billing.sessions.create ? null : null; // placeholder guard
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
