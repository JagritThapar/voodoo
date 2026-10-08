import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { COMPANY } from "@/lib/constants";
import { logout } from "@/app/actions";
import { BottomTabs, Sidebar } from "@/components/nav";
import { Logo, LogoutIcon } from "@/components/icons";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-dvh lg:pl-72">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-volt-400 focus:px-4 focus:py-2 focus:font-bold focus:text-ink-900">
        Skip to content
      </a>

      <aside className="grain fixed inset-y-0 left-0 hidden w-72 flex-col bg-ink-900 p-5 lg:flex">
        <Link href="/dashboard" className="mb-10 px-2 pt-1"><Logo reverse className="h-14" /></Link>
        <Sidebar isAdmin={user.role === "admin"} />
        <div className="mt-auto space-y-4">
          <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="block rounded-xl px-3 text-ink-300 transition hover:text-white">
            <span className="eyebrow block text-ink-400">Talk to the team</span>
            <span className="stat-num mt-1 block text-2xl text-lime-400">{COMPANY.phone}</span>
          </a>
          <div className="flex items-center gap-3 rounded-2xl bg-white/[.06] p-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-volt-400 font-display text-sm font-black text-ink-900">{initials}</span>
            <Link href="/profile" className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user.first_name} {user.last_name}</p>
              <p className="truncate text-xs text-ink-400">{user.email}</p>
            </Link>
            <form action={logout}>
              <button className="rounded-lg p-2 text-ink-400 transition hover:bg-white/10 hover:text-white" title="Sign out" aria-label="Sign out"><LogoutIcon /></button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between bg-ink-900 px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] lg:hidden">
        <Link href="/dashboard" aria-label="Home"><Logo reverse className="h-10" /></Link>
        <Link href="/profile" aria-label="Profile" className="grid h-10 w-10 place-items-center rounded-xl bg-volt-400 font-display text-sm font-black text-ink-900">{initials}</Link>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-12">{children}</main>
      <BottomTabs />
    </div>
  );
}
