import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-bold text-white">V</div>
          <span className="text-xl font-bold text-slate-900">Vouch</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
