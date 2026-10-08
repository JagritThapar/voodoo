import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { STATES } from "@/lib/catalog";
import { COMPANY } from "@/lib/constants";
import { logout, updateProfile } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { Card, Field, PageHeader } from "@/components/ui";
import { LogoutIcon, ShieldIcon } from "@/components/icons";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader eyebrow="Profile" title={`${user.first_name} ${user.last_name}`} subtitle={user.email} />
      <Card>
        <ActionForm action={updateProfile} resetOnSuccess={false}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"><input className="input" name="first_name" defaultValue={user.first_name} required /></Field>
            <Field label="Last name"><input className="input" name="last_name" defaultValue={user.last_name} required /></Field>
          </div>
          <Field label="Mobile"><input className="input" name="phone" type="tel" defaultValue={user.phone ?? ""} /></Field>
          <Field label="Street address"><input className="input" name="address" defaultValue={user.address ?? ""} autoComplete="street-address" /></Field>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3">
            <Field label="Suburb"><input className="input" name="suburb" defaultValue={user.suburb ?? ""} /></Field>
            <Field label="State">
              <select className="input" name="state" defaultValue={user.state ?? "NSW"}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Postcode"><input className="input w-24" name="postcode" maxLength={4} inputMode="numeric" defaultValue={user.postcode ?? ""} /></Field>
          </div>
          <Field label="New password" hint="Leave blank to keep your current password.">
            <input className="input" name="new_password" type="password" autoComplete="new-password" />
          </Field>
          <SubmitButton>Save changes</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="Need help?">
        <p className="text-sm text-ink-600">
          Call <a className="font-semibold text-leaf-700" href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a> or email{" "}
          <a className="font-semibold text-leaf-700" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
        <a className="mt-2 inline-block text-sm font-semibold text-leaf-700 underline" href={COMPANY.website} target="_blank" rel="noreferrer">Visit our website</a>
      </Card>

      <div className="flex flex-wrap gap-2">
        {user.role === "admin" && <Link href="/admin" className="btn-ghost"><ShieldIcon width={16} height={16} /> Admin console</Link>}
        <form action={logout}><button className="btn-danger"><LogoutIcon width={16} height={16} /> Sign out</button></form>
      </div>
    </div>
  );
}
