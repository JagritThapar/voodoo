import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { COMPANY } from "@/lib/constants";
import { Logo } from "@/components/icons";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getUser()) redirect("/dashboard");
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-ink-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/photos/crew-panel.jpg" alt="Two Aussie Energy Savers installers carrying a solar panel across a roof" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-900 via-ink-900/50 to-ink-900/30" />
        <Link href="/"><Logo reverse className="h-16" /></Link>
        <div>
          <h2 className="display text-6xl xl:text-7xl">
            One team.
            <span className="block text-lime-400">First visit to final rebate.</span>
          </h2>
          <p className="mt-6 text-sm font-semibold text-ink-300">
            Licensed electricians · Solar Victoria approved retailer · {COMPANY.phone}
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <div className="bg-ink-900 px-4 pb-10 pt-6 lg:hidden">
          <Link href="/"><Logo reverse className="h-12" /></Link>
          <p className="display mt-8 text-4xl text-white">
            Smart energy.<span className="block text-lime-400">Made easy.</span>
          </p>
        </div>
        <div className="flex flex-1 items-start justify-center px-4 lg:items-center lg:px-12">
          <div className="-mt-6 w-full max-w-md rounded-brand bg-white p-6 shadow-card sm:p-8 lg:mt-0 lg:bg-transparent lg:p-0 lg:shadow-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
