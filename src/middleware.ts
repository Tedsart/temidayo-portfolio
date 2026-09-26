import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/config";

/**
 * Route guard for the CMS.
 *
 * This is the first layer only: every admin page and server action re-checks
 * the session, and the database enforces the real boundary through RLS.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured) {
    // Without credentials there is no auth to check; the admin pages render a
    // setup notice instead. Login is allowed so the flow can be exercised once
    // env vars land without a redeploy.
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    const response = NextResponse.next();
    return refreshSession(request, response);
  }

  const response = NextResponse.next();
  const refreshed = await refreshSession(request, response);

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
            refreshed.cookies.set(name, value);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return refreshed;
}

async function refreshSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touches the session so the token is refreshed on activity.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
