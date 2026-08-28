import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response =
            NextResponse.next({
              request,
            });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  // IMPORTANT:
  // Refresh / validate the Supabase session.
  //
  // Do not use getSession() here for authorization.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(
    "PROXY AUTH USER:",
    user?.email ?? null
  );

  // =====================================================
  // PROTECTED ROUTES
  // =====================================================

  const pathname =
    request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/chat") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith(
      "/api/conversations"
    ) ||
    pathname.startsWith(
      "/api/test"
    );

  // =====================================================
  // API AUTH FAILURE
  // =====================================================

  if (
    isProtectedRoute &&
    !user
  ) {
    if (
      pathname.startsWith("/api/")
    ) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error:
            "You must be logged in to use this service.",
        },
        {
          status: 401,
        }
      );
    }

    // For pages, redirect to login
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  // =====================================================
  // RETURN RESPONSE WITH REFRESHED COOKIES
  // =====================================================

  return response;
}


// =======================================================
// MATCHER
// =======================================================

export const config = {
  matcher: [
    /*
     * Run middleware/proxy on:
     * - chat page
     * - API routes
     *
     * Skip static files and Next internals.
     */
    "/chat/:path*",
    "/api/:path*",
  ],
};