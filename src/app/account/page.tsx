import { redirect } from "next/navigation";
import { AccountPreferencesForm } from "@/features/account/components/account-preferences-form";
import { BottomNav } from "@/features/shared/components/bottom-nav";
import { getAuthenticatedProfile, getAuthenticatedUser } from "@/lib/supabase/server";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  const profile = await getAuthenticatedProfile();
  const displayName =
    profile?.name?.trim() || profile?.display_name?.trim() || user.email || "Your account";

  return (
    <>
      <AccountPreferencesForm displayName={displayName} />
      <BottomNav />
    </>
  );
}
