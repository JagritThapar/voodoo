import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Logo } from "@/components/icons";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getUser()) redirect("/dashboard");
  return (
    <div className="min-h-dvh bg-gradient-to-b from-navy-950 to-navy-800 px-4 py-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-8 inline-block"><Logo className="text-white" /></Link>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
