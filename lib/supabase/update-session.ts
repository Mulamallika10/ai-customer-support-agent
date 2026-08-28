import {
  createServerClient,
} from "@supabase/ssr";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
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

            supabaseResponse =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                supabaseResponse.cookies.set(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } =
    request.nextUrl;

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================

  if (!user) {
    // Protected API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          authenticated: false,
        },
        {
          status: 401,
        }
      );
    }

    // Login is public
    if (pathname === "/login") {
      return supabaseResponse;
    }

    // Everything else requires login
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }

  // ==========================================
  // ALREADY AUTHENTICATED
  // ==========================================

  if (pathname === "/login") {
    return NextResponse.redirect(
      new URL(
        "/chat",
        request.url
      )
    );
  }

  return supabaseResponse;
}