"use client";

import { useParams } from "next/navigation";
import { IntimacyEntryDetail } from "@/features/intimacy/components/intimacy-entry-detail";

export default function IntimacyEntryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-6 sm:px-6">
      <IntimacyEntryDetail id={id} />
    </main>
  );
}
