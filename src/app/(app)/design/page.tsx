import { requireUser } from "@/lib/auth";
import { DEFAULT_DESIGN, normaliseDesign } from "@/lib/catalog";
import { PageHeader } from "@/components/ui";
import { Designer } from "./designer";

export const metadata = { title: "Design & quote" };

export default async function DesignPage() {
  const user = await requireUser();
  const initial = normaliseDesign({ ...DEFAULT_DESIGN, state: user.state ?? DEFAULT_DESIGN.state, postcode: user.postcode ?? "" });
  return (
    <>
      <PageHeader eyebrow="Design & quote" title="Sized to your home." accent="Priced on the spot." subtitle="Pick your products and see an estimate after rebates. We confirm a fixed written price after a quick check of your roof and switchboard." />
      <Designer initial={initial} />
    </>
  );
}
