"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { createCampaign, type FormState } from "@/app/(dashboard)/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_LABELS } from "@/lib/types";

const initial: FormState = {};
type WebsiteOption = { id: string; name: string };

export function CampaignForm({ websites }: { websites: WebsiteOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState(createCampaign, initial);

  if (websites.length === 0) {
    return <p className="text-sm text-slate-500">Add a website first to create a campaign.</p>;
  }
  if (!open) return <Button onClick={() => setOpen(true)}>New campaign</Button>;

  return (
    <div className="card max-w-2xl">
      <h3 className="mb-3 font-semibold">Create a campaign</h3>
      <form action={action} className="space-y-3">
        <Alert kind="error">{state.error}</Alert>
        <Alert kind="success">{state.success}</Alert>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Campaign name</label>
            <input id="name" name="name" className="input" placeholder="Recent sales" required />
          </div>
          <div>
            <label className="label" htmlFor="website_id">Website</label>
            <select id="website_id" name="website_id" className="input" required>
              {websites.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="notification_type">Notification type</label>
            <select id="notification_type" name="notification_type" className="input">
              {Object.entries(NOTIFICATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="position">Position</label>
            <select id="position" name="position" className="input">
              <option value="bottom-left">Bottom left</option>
              <option value="bottom-right">Bottom right</option>
              <option value="top-left">Top left</option>
              <option value="top-right">Top right</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="delay_seconds">Delay (s)</label>
            <input id="delay_seconds" name="delay_seconds" type="number" defaultValue={3} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="duration_seconds">Duration (s)</label>
            <input id="duration_seconds" name="duration_seconds" type="number" defaultValue={6} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="interval_seconds">Interval (s)</label>
            <input id="interval_seconds" name="interval_seconds" type="number" defaultValue={8} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="max_per_session">Max / session</label>
            <input id="max_per_session" name="max_per_session" type="number" defaultValue={20} className="input" />
          </div>
        </div>

        <div className="flex gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="show_desktop" defaultChecked /> Desktop
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="show_mobile" defaultChecked /> Mobile
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <SubmitButton>Create campaign</SubmitButton>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
