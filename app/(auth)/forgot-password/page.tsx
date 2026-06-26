"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { forgotPasswordAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, action] = useFormState(forgotPasswordAction, initial);
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">We'll email you a reset link.</p>
      <form action={action} className="mt-5 space-y-4">
        <Alert kind="error">{state.error}</Alert>
        <Alert kind="success">{state.success}</Alert>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <SubmitButton className="w-full">Send reset link</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-600 hover:underline">Back to login</Link>
      </p>
    </>
  );
}
