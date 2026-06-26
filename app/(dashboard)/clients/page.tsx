import { createClient } from "@/lib/supabase/server";
import { ClientsManager } from "@/components/dashboard/clients-manager";
import { planFor, type PlanTier } from "@/lib/plans";
import { Card } from "@/components/ui/card";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user!.id).single();
  const plan = (profile?.plan ?? "free") as PlanTier;

  if (!planFor(plan).clientAccounts) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Card><p className="py-8 text-center text-sm text-slate-500">Client accounts are an Agency-plan feature. Upgrade in Settings to manage client workspaces.</p></Card>
      </div>
    );
  }

  const [{ data: clients }, { data: websites }] = await Promise.all([
    supabase.from("clients").select("id, name").eq("agency_user_id", user!.id).order("created_at"),
    supabase.from("websites").select("id, name, client_id").eq("user_id", user!.id).order("created_at"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
      <p className="-mt-3 text-sm text-slate-500">Group websites into client workspaces for white-label reporting and management.</p>
      <ClientsManager clients={clients ?? []} websites={websites ?? []} />
    </div>
  );
}
