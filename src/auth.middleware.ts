import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { pathname } = req.nextUrl;

  // Public routes (no auth needed)
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes (auth required)
  const protectedPaths = ["/dashboard", "/todos", "/admin", "/api"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Allow public auth APIs (if you still have them)
  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];
  if (publicApiRoutes.includes(pathname)) {
    return res;
  }

  // IMPORTANT: this refreshes session if needed (Vercel fix)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If route is protected & user not logged in -> block
  if (isProtected && !user) {
    // API routes -> 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Pages -> redirect to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in & tries to visit login/register -> redirect
  if (user && isPublicRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/todos/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
