"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { createManualEvent, type ActivityState } from "@/app/(dashboard)/activity/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { NOTIFICATION_LABELS, type NotificationType } from "@/lib/types";

type WebsiteOption = { id: string; name: string };

export function WebsiteSelector({ websites, selected }: { websites: WebsiteOption[]; selected: string }) {
  const router = useRouter();
  return (
    <select
      value={selected}
      onChange={(e) => router.push(`/activity?w=${e.target.value}`)}
      className="input max-w-xs"
    >
      {websites.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
    </select>
  );
}

const PERSON_TYPES: NotificationType[] = ["recent_purchase", "recent_signup", "recent_download", "review"];
const COUNT_TYPES: NotificationType[] = ["live_visitors", "low_stock", "page_visits"];
const MESSAGE_TYPES: NotificationType[] = ["announcement", "custom"];

const initial: ActivityState = {};

export function AddActivityForm({ websiteId }: { websiteId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<NotificationType>("recent_purchase");
  const [state, action] = useFormState(createManualEvent, initial);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
        Add activity
      </button>
    );
  }

  const showPerson = PERSON_TYPES.includes(type);
  const showCount = COUNT_TYPES.includes(type);
  const showMessage = MESSAGE_TYPES.includes(type);

  return (
    <div className="card max-w-2xl">
      <h3 className="mb-3 font-semibold">Add a manual activity</h3>
      <p className="mb-3 text-sm text-slate-500">
        Seed starter notifications while real events build up. These show in the widget like any real event.
      </p>
      <form action={action} className="space-y-3">
        <Alert kind="error">{state.error}</Alert>
        <Alert kind="success">{state.success}</Alert>
        <input type="hidden" name="website_id" value={websiteId} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="event_type">Type</label>
            <select
              id="event_type" name="event_type" value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="input"
            >
              {Object.entries(NOTIFICATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="minutes_ago">Shown as (minutes ago)</label>
            <input id="minutes_ago" name="minutes_ago" type="number" defaultValue={2} min={0} className="input" />
          </div>

          {showPerson && (
            <>
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input id="name" name="name" className="input" placeholder="Sarah" />
              </div>
              <div>
                <label className="label" htmlFor="city">City</label>
                <input id="city" name="city" className="input" placeholder="Sydney" />
              </div>
              {type !== "review" && (
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="product">Product / action</label>
                  <input id="product" name="product" className="input" placeholder="Content Creator Elite" />
                </div>
              )}
            </>
          )}

          {showCount && (
            <div>
              <label className="label" htmlFor="count">Count</label>
              <input id="count" name="count" type="number" className="input" placeholder="24" min={0} />
            </div>
          )}

          {showMessage && (
            <div className="sm:col-span-2">
              <label className="label" htmlFor="message">Message</label>
              <input id="message" name="message" className="input" placeholder="New features just launched" />
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="is_active" defaultChecked /> Active
        </label>

        <div className="flex gap-2 pt-1">
          <SubmitButton>Add activity</SubmitButton>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
