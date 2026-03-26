import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import {
  ensureAuthenticatedProfile,
  getAuthenticatedProfile,
  getAuthenticatedUser,
} from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  await ensureAuthenticatedProfile();
  const profile = await getAuthenticatedProfile();

  if (profile?.name?.trim() && profile.date_of_birth) {
    redirect("/");
  }

  return (
    <OnboardingForm
      initialCycleLength={profile?.avg_cycle_length}
      initialDateOfBirth={profile?.date_of_birth}
      initialName={profile?.name ?? profile?.display_name ?? null}
    />
  );
}
