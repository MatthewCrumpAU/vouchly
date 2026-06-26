"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createClientAccount, deleteClientAccount, assignWebsite } from "@/app/(dashboard)/clients/actions";
import { Trash2, Plus, Users } from "lucide-react";

type Client = { id: string; name: string };
type Website = { id: string; name: string; client_id: string | null };

function AssignSelect({ website, clients }: { website: Website; clients: Client[] }) {
  return (
    <form action={assignWebsite}>
      <input type="hidden" name="website_id" value={website.id} />
      <select name="client_id" defaultValue={website.client_id ?? ""} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="input max-w-[200px] py-1.5 text-sm">
        <option value="">Unassigned</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </form>
  );
}

function CreateButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"><Plus className="h-4 w-4" /> Add client</button>;
}

export function ClientsManager({ clients, websites }: { clients: Client[]; websites: Website[] }) {
  const [name, setName] = useState("");
  const count = (cid: string) => websites.filter((w) => w.client_id === cid).length;

  return (
    <div className="space-y-6">
      <form action={createClientAccount} className="flex max-w-md gap-2">
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New client name" className="input" />
        <CreateButton />
      </form>

      {clients.length === 0 ? (
        <div className="card"><p className="py-8 text-center text-sm text-slate-400">No clients yet. Create a workspace to group websites for a client.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700"><Users className="h-4 w-4" /></div>
                  <div><h3 className="font-semibold">{c.name}</h3><p className="text-xs text-slate-400">{count(c.id)} website{count(c.id) === 1 ? "" : "s"}</p></div>
                </div>
                <form action={deleteClientAccount}><input type="hidden" name="id" value={c.id} /><button className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 className="mb-3 font-semibold">Assign websites</h2>
        {websites.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No websites yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {websites.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-700">{w.name}</span>
                <AssignSelect website={w} clients={clients} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
