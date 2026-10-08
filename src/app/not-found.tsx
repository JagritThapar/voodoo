import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { Logo } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="grain flex min-h-dvh flex-col justify-between bg-ink-900 p-6 text-white sm:p-10">
      <Link href="/" aria-label="Home"><Logo reverse className="h-12" /></Link>
      <div className="max-w-2xl">
        <p className="eyebrow text-volt-400">Error 404</p>
        <h1 className="display mt-3 text-6xl sm:text-8xl">
          Wrong roof.
          <span className="block text-lime-400">Nothing here.</span>
        </h1>
        <p className="mt-5 max-w-md text-ink-300">That page doesn&apos;t exist or has moved. Head back home, or give the team a call on {COMPANY.phone}.</p>
        <Link href="/dashboard" className="btn-volt mt-8">Back to home</Link>
      </div>
      <p className="text-xs text-ink-400">{COMPANY.name} · {COMPANY.address}</p>
    </main>
  );
}
