import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { setUserDisabled } from "./actions";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user!.id).single();

  if (!me?.is_admin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <Card>
          <p className="py-10 text-center text-sm text-slate-500">
            You don't have admin access. Set <code className="rounded bg-slate-100 px-1">is_admin = true</code> on your profile row to view this page.
          </p>
        </Card>
      </div>
    );
  }

  const admin = createAdminClient();
  const [profiles, websites, campaigns, impressions, sites] = await Promise.all([
    admin.from("profiles").select("id, email, full_name, plan, is_disabled, created_at").order("created_at", { ascending: false }),
    admin.from("websites").select("id", { count: "exact", head: true }),
    admin.from("campaigns").select("id", { count: "exact", head: true }),
    admin.from("analytics_impressions").select("id", { count: "exact", head: true }),
    admin.from("websites").select("user_id"),
  ]);

  const siteCount: Record<string, number> = {};
  (sites.data ?? []).forEach((s) => { siteCount[s.user_id] = (siteCount[s.user_id] || 0) + 1; });

  const stats = [
    { label: "Users", value: formatNumber((profiles.data ?? []).length) },
    { label: "Websites", value: formatNumber(websites.count ?? 0) },
    { label: "Campaigns", value: formatNumber(campaigns.count ?? 0) },
    { label: "Impressions", value: formatNumber(impressions.count ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}><p className="text-sm text-slate-500">{s.label}</p><p className="mt-1 text-2xl font-bold">{s.value}</p></Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2">User</th><th className="pb-2">Plan</th><th className="pb-2 text-right">Sites</th><th className="pb-2">Status</th><th className="pb-2 text-right">Action</th>
            </tr></thead>
            <tbody>
              {(profiles.data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2"><div className="font-medium">{p.full_name || "—"}</div><div className="text-xs text-slate-400">{p.email}</div></td>
                  <td className="py-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">{p.plan}</span></td>
                  <td className="py-2 text-right tabular-nums">{siteCount[p.id] || 0}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_disabled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {p.is_disabled ? "disabled" : "active"}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <form action={setUserDisabled}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={(!p.is_disabled).toString()} />
                      <button className={`rounded-lg border px-3 py-1 text-xs font-medium ${p.is_disabled ? "border-green-300 text-green-700 hover:bg-green-50" : "border-red-300 text-red-700 hover:bg-red-50"}`}>
                        {p.is_disabled ? "Enable" : "Disable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">Disabling an account immediately stops its widgets from serving (the config endpoint checks this flag).</p>
      </Card>
    </div>
  );
}
