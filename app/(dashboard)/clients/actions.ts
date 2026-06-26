"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { planFor, type PlanTier } from "@/lib/plans";

async function requireAgency() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (!planFor((profile?.plan ?? "free") as PlanTier).clientAccounts) throw new Error("Agency plan required");
  return { supabase, user };
}

export async function createClientAccount(formData: FormData): Promise<void> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const { supabase, user } = await requireAgency();
  await supabase.from("clients").insert({ agency_user_id: user.id, name });
  revalidatePath("/clients");
}

export async function deleteClientAccount(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const { supabase } = await requireAgency();
  await supabase.from("clients").delete().eq("id", id);
  revalidatePath("/clients");
}

export async function assignWebsite(formData: FormData): Promise<void> {
  const website_id = String(formData.get("website_id"));
  const client_id = String(formData.get("client_id")) || null;
  const { supabase } = await requireAgency();
  await supabase.from("websites").update({ client_id }).eq("id", website_id);
  revalidatePath("/clients");
}
