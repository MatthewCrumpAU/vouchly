import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CampaignForm } from "@/components/dashboard/campaign-form";
import { toggleCampaign } from "../actions";
import { NOTIFICATION_LABELS } from "@/lib/types";

export default async function CampaignsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: websites }, { data: campaigns }] = await Promise.all([
    supabase.from("websites").select("id, name").eq("user_id", user!.id).order("created_at"),
    supabase.from("campaigns").select("*, websites(name)").eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
      </div>

      <CampaignForm websites={websites ?? []} />

      {!campaigns || campaigns.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-slate-400">No campaigns yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c: any) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-slate-500">
                    {c.websites?.name} · {NOTIFICATION_LABELS[c.notification_type as keyof typeof NOTIFICATION_LABELS]}
                  </p>
                </div>
                <form action={toggleCampaign}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="next" value={c.status === "active" ? "inactive" : "active"} />
                  <button className={`rounded-full px-3 py-1 text-xs font-medium ${
                    c.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>{c.status}</button>
                </form>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5">{c.position}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">delay {c.delay_seconds}s</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">show {c.duration_seconds}s</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">every {c.interval_seconds}s</span>
                <Link href={`/campaigns/${c.id}`} className="ml-auto inline-flex items-center font-medium text-brand-600 hover:underline">Customize →</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
