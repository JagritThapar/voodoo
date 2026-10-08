import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { BottomTabs, Sidebar } from "@/components/nav";
import { Logo, LogoutIcon } from "@/components/icons";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy-950 p-4 lg:flex">
        <Link href="/dashboard" className="mb-8 px-2 pt-2"><Logo className="text-white" /></Link>
        <Sidebar isAdmin={user.role === "admin"} />
        <div className="mt-auto flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sun-400 text-sm font-bold text-navy-950">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.first_name} {user.last_name}</p>
            <p className="truncate text-xs text-navy-100">{user.email}</p>
          </div>
          <form action={logout}>
            <button className="rounded-lg p-1.5 text-navy-100 hover:bg-white/10 hover:text-white" title="Sign out" aria-label="Sign out"><LogoutIcon /></button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] backdrop-blur lg:hidden">
        <Link href="/dashboard"><Logo className="text-navy-950" /></Link>
        <Link href="/profile" aria-label="Profile" className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">{initials}</Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-10">{children}</main>
      <BottomTabs />
    </div>
  );
}
