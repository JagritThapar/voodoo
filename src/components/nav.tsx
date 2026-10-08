"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardIcon, HomeIcon, NetworkIcon, NewsIcon, PlusIcon, ShieldIcon, SunIcon, UserIcon, UsersIcon, WalletIcon } from "./icons";

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
    <nav className="space-y-1">
      {MAIN.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive(path, href) ? "bg-white/10 text-white" : "text-navy-100 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon className={isActive(path, href) ? "text-sun-400" : ""} />
          {label}
        </Link>
      ))}
      {isAdmin && (
        <Link href="/admin" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sun-300 hover:bg-white/5">
          <ShieldIcon /> Admin console
        </Link>
      )}
    </nav>
  );
}

const TABS = [
  { href: "/dashboard", label: "Home", icon: HomeIcon, match: ["/dashboard"] },
  { href: "/projects", label: "Projects", icon: ClipboardIcon, match: ["/projects"] },
  { href: "/design", label: "Quote", icon: PlusIcon, match: ["/design"], primary: true },
  { href: "/referrals", label: "Refer", icon: UsersIcon, match: ["/referrals", "/network", "/earnings"] },
  { href: "/news", label: "News", icon: NewsIcon, match: ["/news"] },
];

export function BottomTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match, primary }) => {
          const active = match.some((m) => isActive(path, m));
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium">
              {primary ? (
                <span className="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-sun-400 text-navy-950 shadow-lg ring-4 ring-white">
                  <Icon width={22} height={22} strokeWidth={2.2} />
                </span>
              ) : (
                <Icon className={active ? "text-navy-900" : "text-slate-400"} />
              )}
              <span className={active ? "text-navy-900" : "text-slate-500"}>{label}</span>
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
    <div className="mb-5 flex gap-1 rounded-xl bg-slate-200/70 p-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
            isActive(path, t.href) ? "bg-white text-navy-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t.label}
        </Link>
      ))}
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
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {ADMIN.map((t) => {
        const active = t.href === "/admin" ? path === "/admin" : isActive(path, t.href);
        return (
          <Link key={t.href} href={t.href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-white/10 text-white" : "text-navy-100 hover:text-white"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
