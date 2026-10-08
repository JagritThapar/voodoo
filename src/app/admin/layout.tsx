import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/actions";
import { AdminNav } from "@/components/nav";
import { Logo } from "@/components/icons";

export const metadata = { title: { default: "Admin", template: "%s · AES Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh">
      <header className="bg-navy-950 px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3 pb-3">
            <Link href="/admin" className="flex items-center gap-3">
              <Logo className="text-white" />
              <span className="rounded-md bg-sun-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-navy-950">Admin</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link href="/dashboard" className="hidden text-navy-100 hover:text-white sm:inline">Customer view</Link>
              <form action={logout}><button className="rounded-lg px-3 py-1.5 text-navy-100 hover:bg-white/10 hover:text-white">Sign out</button></form>
            </div>
          </div>
          <div className="pb-2"><AdminNav /></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
