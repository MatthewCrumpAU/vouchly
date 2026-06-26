"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function connectIntegration(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider"));
  const website_id = String(formData.get("website_id"));
  if (!provider || !website_id) return;
  const { supabase, user } = await requireUser();
  await supabase.from("integrations").insert({ user_id: user.id, website_id, provider, status: "active" });
  revalidatePath("/integrations");
}

export async function disconnectIntegration(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const { supabase } = await requireUser();
  await supabase.from("integrations").delete().eq("id", id);
  revalidatePath("/integrations");
}
