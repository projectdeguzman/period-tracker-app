"use client";

import { useParams } from "next/navigation";
import { CycleEntryDetail } from "@/features/cycle/components/cycle-entry-detail";

export default function CycleEntryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-6 sm:px-6">
      <CycleEntryDetail id={id} />
    </main>
  );
}
