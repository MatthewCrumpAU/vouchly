"use client";

import { useState } from "react";
import { saveWhiteLabel } from "@/app/(dashboard)/settings/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function WhiteLabelForm({ locked, brandName, brandColor, enabled }: { locked: boolean; brandName: string; brandColor: string; enabled: boolean }) {
  const [color, setColor] = useState(brandColor || "#4f46e5");
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">White-label branding</h2>
        {locked && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Agency plan</span>}
      </div>
      <p className="mt-1 text-sm text-slate-500">Replace the “via Vouch” label in your widgets with your own brand.</p>
      {locked ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">Upgrade to Agency to unlock white-label branding.</p>
      ) : (
        <form action={saveWhiteLabel} className="mt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="white_label" defaultChecked={enabled} /> Enable white-label
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Brand name</label>
              <input name="brand_name" defaultValue={brandName} className="input" placeholder="Acme Agency" />
            </div>
            <div>
              <label className="label">Brand color</label>
              <input name="brand_color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-full rounded-lg border border-slate-300" />
            </div>
          </div>
          <SubmitButton>Save branding</SubmitButton>
        </form>
      )}
    </div>
  );
}
