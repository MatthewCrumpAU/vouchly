"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS, isStripeConfigured } from "@/lib/stripe";
import { planFor, type PlanTier } from "@/lib/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function startCheckout(formData: FormData): Promise<void> {
  const plan = String(formData.get("plan")) as PlanTier;
  const price = PRICE_IDS[plan];
  if (!isStripeConfigured() || !price) {
    redirect("/settings?billing=unconfigured");
  }

  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles").select("email, stripe_customer_id").eq("id", user.id).single();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer: profile?.stripe_customer_id || undefined,
    customer_email: profile?.stripe_customer_id ? undefined : profile?.email || undefined,
    success_url: `${APP_URL}/settings?billing=success`,
    cancel_url: `${APP_URL}/settings?billing=cancel`,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
  });

  redirect(session.url!);
}

export async function openPortal(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles").select("stripe_customer_id").eq("id", user.id).single();
  if (!isStripeConfigured() || !profile?.stripe_customer_id) {
    redirect("/settings?billing=unconfigured");
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: profile!.stripe_customer_id!,
    return_url: `${APP_URL}/settings`,
  });
  redirect(session.url);
}

export async function saveWhiteLabel(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (!planFor((profile?.plan ?? "free") as PlanTier).whiteLabel) {
    redirect("/settings?wl=locked");
  }
  await supabase.from("profiles").update({
    brand_name: String(formData.get("brand_name") || "").slice(0, 60) || null,
    brand_color: String(formData.get("brand_color") || "#4f46e5"),
    white_label: formData.get("white_label") === "on",
  }).eq("id", user.id);
  revalidatePath("/settings");
}
