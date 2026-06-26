"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { websiteSchema, campaignSchema, campaignUpdateSchema } from "@/lib/validations";
import { canAddWebsite, canAddCampaign, type PlanTier } from "@/lib/plans";

export type FormState = { error?: string; success?: string };

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function createWebsite(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = websiteSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
    status: formData.get("status") || "active",
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { supabase, user } = await requireUser();

  // Enforce plan limit
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase.from("websites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const plan = (profile?.plan ?? "free") as PlanTier;
  if (!canAddWebsite(plan, count ?? 0)) {
    return { error: "You've reached your plan's website limit. Upgrade to add more." };
  }

  const { error } = await supabase.from("websites").insert({
    user_id: user.id,
    name: parsed.data.name,
    domain: parsed.data.domain,
    status: parsed.data.status,
  });
  if (error) return { error: error.message };

  revalidatePath("/websites");
  revalidatePath("/dashboard");
  return { success: "Website added." };
}

export async function deleteWebsite(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const { supabase } = await requireUser();
  await supabase.from("websites").delete().eq("id", id);
  revalidatePath("/websites");
}

export async function createCampaign(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = campaignSchema.safeParse({
    website_id: formData.get("website_id"),
    name: formData.get("name"),
    notification_type: formData.get("notification_type"),
    status: formData.get("status") || "active",
    position: formData.get("position"),
    delay_seconds: formData.get("delay_seconds"),
    duration_seconds: formData.get("duration_seconds"),
    interval_seconds: formData.get("interval_seconds"),
    max_per_session: formData.get("max_per_session"),
    show_desktop: formData.get("show_desktop") === "on",
    show_mobile: formData.get("show_mobile") === "on",
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { supabase, user } = await requireUser();

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const plan = (profile?.plan ?? "free") as PlanTier;
  if (!canAddCampaign(plan, count ?? 0)) {
    return { error: "You've reached your plan's campaign limit. Upgrade to add more." };
  }

  const { error } = await supabase.from("campaigns").insert({
    ...parsed.data,
    user_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  return { success: "Campaign created." };
}

export async function toggleCampaign(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const next = String(formData.get("next"));
  const { supabase } = await requireUser();
  await supabase.from("campaigns").update({ status: next }).eq("id", id);
  revalidatePath("/campaigns");
}

export async function updateCampaign(_: FormState, formData: FormData): Promise<FormState> {
  let payload: unknown;
  try { payload = JSON.parse(String(formData.get("payload") || "{}")); }
  catch { return { error: "Could not read the form." }; }

  const parsed = campaignUpdateSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { supabase } = await requireUser();
  const { id, ...fields } = parsed.data;
  const { error } = await supabase.from("campaigns").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  return { success: "Saved." };
}
