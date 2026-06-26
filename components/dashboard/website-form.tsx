"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { createWebsite, type FormState } from "@/app/(dashboard)/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initial: FormState = {};

export function WebsiteForm() {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState(createWebsite, initial);

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Add website</Button>;
  }

  return (
    <div className="card max-w-lg">
      <h3 className="mb-3 font-semibold">Add a website</h3>
      <form action={action} className="space-y-3">
        <Alert kind="error">{state.error}</Alert>
        <Alert kind="success">{state.success}</Alert>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" className="input" placeholder="My Store" required />
        </div>
        <div>
          <label className="label" htmlFor="domain">Domain</label>
          <input id="domain" name="domain" className="input" placeholder="mystore.com" required />
        </div>
        <div className="flex gap-2">
          <SubmitButton>Save website</SubmitButton>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
