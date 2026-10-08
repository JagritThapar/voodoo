"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoltIcon, ClipboardIcon, HomeIcon, NetworkIcon, NewsIcon, ShieldIcon, SunIcon, UserIcon, UsersIcon, WalletIcon } from "./icons";

const MAIN = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/projects", label: "My projects", icon: ClipboardIcon },
  { href: "/design", label: "Design & quote", icon: SunIcon },
  { href: "/referrals", label: "Refer friends", icon: UsersIcon },
  { href: "/network", label: "My network", icon: NetworkIcon },
  { href: "/earnings", label: "Earnings", icon: WalletIcon },
  { href: "/news", label: "News & offers", icon: NewsIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const isActive = (path: string, href: string) => path === href || path.startsWith(href + "/");

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="space-y-0.5">
      {MAIN.map(({ href, label, icon: Icon }) => {
        const active = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition duration-200 ${
              active ? "bg-white/[.07] text-white" : "text-ink-300 hover:bg-white/[.04] hover:text-white"
            }`}
          >
            {active && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-lime-400" />}
            <Icon className={`transition ${active ? "text-lime-400" : "text-ink-400 group-hover:text-white"}`} />
            {label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link href="/admin" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-volt-400 transition hover:bg-white/[.04]">
          <ShieldIcon /> Admin console
        </Link>
      )}
    </nav>
  );
}

const TABS = [
  { href: "/dashboard", label: "Home", icon: HomeIcon, match: ["/dashboard"] },
  { href: "/projects", label: "Projects", icon: ClipboardIcon, match: ["/projects"] },
  { href: "/design", label: "Quote", icon: BoltIcon, match: ["/design"], primary: true },
  { href: "/referrals", label: "Refer", icon: UsersIcon, match: ["/referrals", "/network", "/earnings"] },
  { href: "/news", label: "News", icon: NewsIcon, match: ["/news"] },
];

export function BottomTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 bg-ink-900 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match, primary }) => {
          const active = match.some((m) => isActive(path, m));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wide"
            >
              {primary ? (
                <span className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-volt-400 text-ink-900 shadow-[0_6px_20px_rgba(252,205,1,.35)] ring-4 ring-ink-900 transition active:scale-95">
                  <Icon width={24} height={24} strokeWidth={2.2} />
                </span>
              ) : (
                <Icon className={active ? "text-lime-400" : "text-ink-400"} />
              )}
              <span className={active ? "text-white" : "text-ink-400"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SubTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <div className="mb-6 flex gap-1 rounded-full bg-ink-900 p-1">
      {tabs.map((t) => {
        const active = isActive(path, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 rounded-full px-3 py-2 text-center text-sm font-bold transition duration-200 ${
              active ? "bg-volt-400 text-ink-900" : "text-ink-300 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

const ADMIN = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/news", label: "News & offers" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {ADMIN.map((t) => {
        const active = t.href === "/admin" ? path === "/admin" : isActive(path, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-volt-400 text-ink-900" : "text-ink-300 hover:text-white"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
