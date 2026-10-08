"use client";

import { useState } from "react";
import { CopyIcon, ShareIcon } from "./icons";

export function ShareReferral({ code, link, firstName }: { code: string; link: string; firstName: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const message = `${firstName} here, I went solar with Aussie Energy Savers and they were great. Use my link to design your system and get a quote: ${link}`;

  const copy = async (text: string, what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Aussie Energy Savers", text: message, url: link });
      } catch {
        /* user cancelled */
      }
    } else void copy(link, "link");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl bg-navy-50 p-1.5 pl-4">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Code</span>
        <span className="flex-1 font-mono text-lg font-bold tracking-wider text-navy-950">{code}</span>
        <button type="button" onClick={() => copy(code, "code")} className="btn-ghost px-3 py-2">
          <CopyIcon width={16} height={16} /> {copied === "code" ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{link}</span>
        <button type="button" onClick={() => copy(link, "link")} className="btn-ghost px-3 py-2">
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <button type="button" onClick={share} className="btn-sun col-span-3 sm:col-span-1"><ShareIcon width={16} height={16} /> Share</button>
        <a className="btn-ghost" href={`sms:?&body=${encodeURIComponent(message)}`}>SMS</a>
        <a className="btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="btn-ghost" href={`mailto:?subject=${encodeURIComponent("Go solar with Aussie Energy Savers")}&body=${encodeURIComponent(message)}`}>Email</a>
      </div>
    </div>
  );
}
