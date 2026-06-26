"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import {
  LayoutDashboard, Globe, Megaphone, Activity, BarChart3, Settings, Shield, LogOut, Plug, Users,
} from "lucide-react";
import { planFor, type PlanTier } from "@/lib/plans";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/websites", label: "Websites", icon: Globe },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Item({ href, label, Icon, active }: { href: string; label: string; Icon: any; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}>
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

export function Sidebar({ isAdmin, plan }: { isAdmin: boolean; plan: PlanTier }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const showClients = planFor(plan).clientAccounts;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">V</div>
        <span className="text-lg font-bold">Vouch</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => <Item key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />)}
        {showClients && <Item href="/clients" label="Clients" Icon={Users} active={isActive("/clients")} />}
        {isAdmin && <Item href="/admin" label="Admin" Icon={Shield} active={isActive("/admin")} />}
      </nav>
      <form action={logoutAction}>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </form>
    </aside>
  );
}
