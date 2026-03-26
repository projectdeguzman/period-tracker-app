import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/components/auth-form";
import {
  getAuthenticatedUser,
  isAuthenticatedProfileComplete,
} from "@/lib/supabase/server";

export default async function SignInPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    const isProfileComplete = await isAuthenticatedProfileComplete();
    redirect(isProfileComplete ? "/" : "/onboarding");
  }

  return <AuthForm mode="sign-in" />;
}
