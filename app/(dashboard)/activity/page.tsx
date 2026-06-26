import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { WebsiteSelector, AddActivityForm } from "@/components/dashboard/activity-manager";
import { toggleEventActive, deleteEvent } from "./actions";
import { buildNotice } from "@/lib/messages";
import { NOTIFICATION_LABELS } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default async function ActivityPage({ searchParams }: { searchParams: { w?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: websites } = await supabase
    .from("websites").select("id, name").eq("user_id", user!.id).order("created_at");

  if (!websites || websites.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Activity manager</h1>
        <Card>
          <p className="py-8 text-center text-sm text-slate-400">
            Add a website first, then seed manual activity here.
          </p>
        </Card>
      </div>
    );
  }

  const selected = websites.find((w) => w.id === searchParams.w)?.id ?? websites[0].id;

  const { data: events } = await supabase
    .from("events")
    .select("id, event_type, name, city, product, is_active, metadata, created_at")
    .eq("website_id", selected)
    .eq("is_manual", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Activity manager</h1>
        <div className="flex items-center gap-3">
          <WebsiteSelector websites={websites} selected={selected} />
          <AddActivityForm websiteId={selected} />
        </div>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-slate-400">
            No manual activity yet. Add a few starter notifications to give the widget something to show.
          </p>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {events.map((e: any) => {
              const meta = e.metadata || {};
              const preview = buildNotice(e.event_type, {
                event_type: e.event_type, name: e.name, city: e.city, product: e.product,
                message: meta.message, count: meta.count,
              });
              return (
                <li key={e.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-800">{preview || "—"}</p>
                    <p className="text-xs text-slate-400">
                      {NOTIFICATION_LABELS[e.event_type as keyof typeof NOTIFICATION_LABELS]} ·
                      {" "}shown as {timeAgo(e.created_at)} ·
                      <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">manual</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <form action={toggleEventActive}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="next" value={(!e.is_active).toString()} />
                      <button className={`rounded-full px-3 py-1 text-xs font-medium ${
                        e.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>{e.is_active ? "active" : "inactive"}</button>
                    </form>
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
