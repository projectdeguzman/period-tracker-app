import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/components/auth-form";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default async function SignInPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/");
  }

  return <AuthForm mode="sign-in" />;
}
