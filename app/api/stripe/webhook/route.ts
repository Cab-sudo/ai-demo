import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { priceToPlan } from "@/lib/stripe/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSub(userId, sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string);
        const userId = (customer as Stripe.Customer).metadata?.user_id;
        if (userId) await upsertSub(userId, sub);
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("webhook error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function upsertSub(userId: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id;
  const plan = sub.status === "active" || sub.status === "trialing" ? priceToPlan(priceId) : "free";

  await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer: sub.customer as string,
    stripe_subscription: sub.id,
    plan,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });

  await supabaseAdmin.from("profiles").update({
    plan,
    stripe_customer_id: sub.customer as string,
    stripe_subscription_id: sub.id,
  }).eq("id", userId);
}
