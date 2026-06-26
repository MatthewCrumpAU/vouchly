"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { signupAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export default function SignupPage() {
  const [state, action] = useFormState(signupAction, initial);
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Start adding social proof in minutes.</p>
      <form action={action} className="mt-5 space-y-4">
        <Alert kind="error">{state.error}</Alert>
        <Alert kind="success">{state.success}</Alert>
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" className="input" placeholder="Jane Doe" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" placeholder="you@company.com" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" placeholder="At least 8 characters" required />
        </div>
        <SubmitButton className="w-full">Create account</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
      </p>
    </>
  );
}
