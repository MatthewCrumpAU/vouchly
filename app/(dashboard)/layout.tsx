import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PLANS } from "@/lib/plans";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, plan, is_admin")
    .eq("id", user.id)
    .single();

  const planLabel = PLANS[(profile?.plan ?? "free") as keyof typeof PLANS].label;

  return (
    <div className="flex min-h-screen bg-[#f7f7fb]">
      <Sidebar isAdmin={!!profile?.is_admin} plan={(profile?.plan ?? "free") as any} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">
            {profile?.full_name || profile?.email}
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {planLabel} plan
          </span>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
