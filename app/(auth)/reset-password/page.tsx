"use client";
import { useFormState } from "react-dom";
import { resetPasswordAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export default function ResetPasswordPage() {
  const [state, action] = useFormState(resetPasswordAction, initial);
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Choose a new password</h1>
      <form action={action} className="mt-5 space-y-4">
        <Alert kind="error">{state.error}</Alert>
        <div>
          <label className="label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" className="input" placeholder="At least 8 characters" required />
        </div>
        <SubmitButton className="w-full">Update password</SubmitButton>
      </form>
    </>
  );
}
