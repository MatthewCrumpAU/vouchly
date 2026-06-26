import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { WebsiteForm } from "@/components/dashboard/website-form";
import { InstallSnippet } from "@/components/dashboard/install-snippet";
import { deleteWebsite } from "../actions";
import { Trash2 } from "lucide-react";

export default async function WebsitesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: websites } = await supabase
    .from("websites")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Websites</h1>
        <WebsiteForm />
      </div>

      {!websites || websites.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-slate-400">
            No websites yet. Add one to get your install snippet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {websites.map((w) => (
            <Card key={w.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{w.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      w.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>{w.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">{w.domain}</p>
                </div>
                <form action={deleteWebsite}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <div className="mt-4">
                <p className="label">Install snippet</p>
                <InstallSnippet siteKey={w.site_key} appUrl={appUrl} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
