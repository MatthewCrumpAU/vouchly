import { createClient } from "@/lib/supabase/server";
import { IntegrationsManager } from "@/components/dashboard/integrations-manager";
import { INTEGRATIONS } from "@/lib/integrations";
import { LIVE_PROVIDERS } from "@/lib/integrations/registry";
import { planFor, type PlanTier } from "@/lib/plans";
import { Card } from "@/components/ui/card";

export default async function IntegrationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: websites }, { data: integrations }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
    supabase.from("websites").select("id, name, site_key").eq("user_id", user!.id).order("created_at"),
    supabase.from("integrations").select("id, provider, website_id").eq("user_id", user!.id),
  ]);

  const plan = (profile?.plan ?? "free") as PlanTier;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
      <p className="-mt-3 text-sm text-slate-500">Pipe events from your tools into Vouch. Connected sources show in your widget like any other event.</p>

      {!planFor(plan).integrations ? (
        <Card>
          <p className="py-8 text-center text-sm text-slate-500">
            Integrations are available on Pro and Agency plans. Upgrade in Settings to connect Stripe, Zapier and webhooks.
          </p>
        </Card>
      ) : (
        <IntegrationsManager
          providers={[...INTEGRATIONS]}
          liveProviders={LIVE_PROVIDERS}
          websites={websites ?? []}
          integrations={integrations ?? []}
          appUrl={appUrl}
        />
      )}
    </div>
  );
}
