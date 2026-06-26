import { NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// POST /api/stripe/webhook
// Verifies the signature, then keeps subscriptions + profiles.plan in sync.
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  const upsertPlan = async (userId: string, plan: string, fields: Record<string, unknown>) => {
    await admin.from("profiles").update({ plan, ...fields }).eq("id", userId);
    await admin.from("subscriptions").upsert({ user_id: userId, plan, ...fields, status: "active" }, { onConflict: "user_id" });
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.user_id;
      const plan = s.metadata?.plan || "free";
      if (userId) {
        await upsertPlan(userId, plan, {
          stripe_customer_id: s.customer as string,
        });
        await admin.from("subscriptions").update({
          stripe_subscription_id: s.subscription as string,
        }).eq("user_id", userId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = sub.customer as string;
      const { data: row } = await admin
        .from("subscriptions").select("user_id").eq("stripe_customer_id", customer).single();
      const userId = row?.user_id || (sub.metadata?.user_id as string | undefined);
      if (userId) {
        const active = sub.status === "active" || sub.status === "trialing";
        const plan = active ? planFromPriceId(sub.items.data[0]?.price?.id) : "free";
        await admin.from("profiles").update({ plan }).eq("id", userId);
        await admin.from("subscriptions").update({
          plan, status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("user_id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
