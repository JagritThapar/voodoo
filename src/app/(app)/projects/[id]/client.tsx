"use client";

import { useState } from "react";
import { submitReview, uploadPaperwork } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { StarIcon, UploadIcon } from "@/components/icons";

export function UploadForm({ paperworkId, label = "Upload" }: { paperworkId: number; label?: string }) {
  const [name, setName] = useState("");
  return (
    <ActionForm action={uploadPaperwork} className="mt-3 space-y-2">
      <input type="hidden" name="paperwork_id" value={paperworkId} />
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn-ghost cursor-pointer px-3 py-2">
          <UploadIcon width={16} height={16} /> {name ? "Change file" : "Choose file"}
          <input
            type="file"
            name="file"
            accept=".pdf,image/*"
            className="sr-only"
            onChange={(e) => setName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
        {name && <span className="max-w-[12rem] truncate text-xs text-slate-600">{name}</span>}
        {name && <SubmitButton className="btn-primary px-3 py-2" pendingText="Uploading…">{label}</SubmitButton>}
      </div>
    </ActionForm>
  );
}

function Stars({ name, label }: { name: string; label: string }) {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={value || ""} />
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setValue(n)}
            onMouseEnter={() => setHover(n)}
            className="p-0.5 text-sun-400 transition active:scale-90"
          >
            <StarIcon width={32} height={32} filled={n <= (hover || value)} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ projectId }: { projectId: number }) {
  return (
    <ActionForm action={submitReview} resetOnSuccess={false}>
      <input type="hidden" name="project_id" value={projectId} />
      <Stars name="rating" label="Overall experience" />
      <Stars name="installer_rating" label="Your installer (optional)" />
      <label className="block">
        <span className="label">Headline</span>
        <input className="input" name="title" maxLength={100} placeholder="e.g. Tidy install, great communication" />
      </label>
      <label className="block">
        <span className="label">Tell us more</span>
        <textarea className="input min-h-28" name="body" maxLength={2000} placeholder="How was the quote, install day and your system so far?" />
      </label>
      <SubmitButton className="btn-sun" pendingText="Posting…">Submit review</SubmitButton>
    </ActionForm>
  );
}
