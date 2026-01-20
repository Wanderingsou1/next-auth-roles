import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip middleware if not protected path
  const protectedPaths = ["/api", "/dashboard", "/todos", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();


  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];

  if(publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }


  const token = req.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api"))
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const {payload} = await jwtVerify(token, secret);

    const userId = payload.id as string;
    if(!userId) throw new Error("Invalid token payload");


    const headers = new Headers(req.headers);
    headers.set("x-user-id", userId);

    return NextResponse.next({ request: { headers } });
  } catch (error) {
    const res = pathname.startsWith("/api")
      ? NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));

    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/todos/:path*",
    "/admin/:path*",
  ],
};
