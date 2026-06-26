"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Verify the caller is an admin before any privileged (service-role) action.
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Not authorized");
  return user;
}

export async function setUserDisabled(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const admin = createAdminClient();
  await admin.from("profiles").update({ is_disabled: next }).eq("id", id);
  revalidatePath("/admin");
}
