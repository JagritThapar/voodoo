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
      <PageHeader title="Design your system." accent="See your price." />
      <Designer initial={initial} />
    </>
  );
}
