"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function InstallSnippet({ siteKey, appUrl }: { siteKey: string; appUrl: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${appUrl}/widget.js" data-site-key="${siteKey}"></script>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 pr-10 text-xs text-slate-100">{snippet}</pre>
      <button onClick={copy} className="absolute right-2 top-2 rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white" aria-label="Copy snippet">
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
