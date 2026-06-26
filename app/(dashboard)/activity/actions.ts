"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { manualEventSchema } from "@/lib/validations";

export type ActivityState = { error?: string; success?: string };

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function createManualEvent(_: ActivityState, formData: FormData): Promise<ActivityState> {
  const parsed = manualEventSchema.safeParse({
    website_id: formData.get("website_id"),
    event_type: formData.get("event_type"),
    name: formData.get("name") || undefined,
    city: formData.get("city") || undefined,
    product: formData.get("product") || undefined,
    message: formData.get("message") || undefined,
    count: formData.get("count") || undefined,
    minutes_ago: formData.get("minutes_ago") || 2,
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { supabase } = await requireUser();
  const createdAt = new Date(Date.now() - parsed.data.minutes_ago * 60_000).toISOString();

  // RLS ("events via website") guarantees the website belongs to this user.
  const { error } = await supabase.from("events").insert({
    website_id: parsed.data.website_id,
    event_type: parsed.data.event_type,
    name: parsed.data.name ?? null,
    city: parsed.data.city ?? null,
    product: parsed.data.product ?? null,
    is_manual: true,
    is_active: parsed.data.is_active,
    created_at: createdAt,
    metadata: {
      ...(parsed.data.message ? { message: parsed.data.message } : {}),
      ...(parsed.data.count != null ? { count: parsed.data.count } : {}),
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/activity");
  revalidatePath("/dashboard");
  return { success: "Activity added." };
}

export async function toggleEventActive(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const { supabase } = await requireUser();
  await supabase.from("events").update({ is_active: next }).eq("id", id);
  revalidatePath("/activity");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const { supabase } = await requireUser();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/activity");
}
