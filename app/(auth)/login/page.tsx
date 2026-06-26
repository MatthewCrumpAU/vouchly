"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const [state, action] = useFormState(loginAction, initial);
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to your Vouch dashboard.</p>
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect" value={searchParams.redirect || "/dashboard"} />
        <Alert kind="error">{state.error}</Alert>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" placeholder="you@company.com" required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="mb-1.5 text-xs text-brand-600 hover:underline">Forgot?</Link>
          </div>
          <input id="password" name="password" type="password" className="input" required />
        </div>
        <SubmitButton className="w-full">Log in</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        New here? <Link href="/signup" className="font-medium text-brand-600 hover:underline">Create an account</Link>
      </p>
    </>
  );
}
