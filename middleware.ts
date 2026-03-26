import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = new Set(["/sign-in", "/sign-up"]);
const onboardingRoute = "/onboarding";

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);
  const isOnboarding = pathname === onboardingRoute;

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, date_of_birth")
      .eq("id", user.id)
      .maybeSingle();

    const isProfileComplete = Boolean(profile?.name?.trim() && profile?.date_of_birth);

    if (!isProfileComplete && !isOnboarding) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = onboardingRoute;
      return NextResponse.redirect(redirectUrl);
    }

    if (isProfileComplete && isOnboarding) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isPublic) {
    const redirectUrl = request.nextUrl.clone();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, date_of_birth")
      .eq("id", user.id)
      .maybeSingle();
    const isProfileComplete = Boolean(profile?.name?.trim() && profile?.date_of_birth);

    redirectUrl.pathname = isProfileComplete ? "/" : onboardingRoute;
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
