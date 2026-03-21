import Link from "next/link";
import { IntimacyEntryForm } from "@/features/intimacy/components/intimacy-entry-form";

export default function NewIntimacyLogPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-surface-muted"
        >
          Back
        </Link>
      </div>

      <IntimacyEntryForm />
    </main>
  );
}
