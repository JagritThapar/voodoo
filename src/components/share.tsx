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
      <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-100 px-4 py-3">
        <span className="font-mono text-xl font-bold tracking-wider text-ink-900">{code}</span>
        <button type="button" onClick={() => copy(link, "link")} className="btn-ghost shrink-0 px-3 py-2">
          <CopyIcon width={16} height={16} /> {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <button type="button" onClick={share} className="btn-volt w-full py-3"><ShareIcon width={16} height={16} /> Share</button>
    </div>
  );
}
