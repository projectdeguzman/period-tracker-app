import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

type ProfileRecord = {
  avg_cycle_length: number | null;
  created_at: string;
  date_of_birth: string | null;
  display_name: string | null;
  id: string;
  name: string | null;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot persist cookies directly.
        }
      },
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function ensureAuthenticatedProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const displayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name.trim() || null
      : null;

  const { data: existingProfile, error: loadError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (loadError) {
    console.error("Failed to load authenticated profile before bootstrap:", loadError);
    return user;
  }

  if (existingProfile) {
    return user;
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
  });

  if (error) {
    console.error("Failed to ensure authenticated profile:", error);
  }

  return user;
}

export async function getAuthenticatedProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, created_at, display_name, name, date_of_birth, avg_cycle_length")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load authenticated profile:", error);
    return null;
  }

  return data as ProfileRecord | null;
}

export async function isAuthenticatedProfileComplete() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return false;
  }

  return Boolean(profile.name?.trim() && profile.date_of_birth);
}
