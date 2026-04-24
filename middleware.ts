import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, o) => { res.cookies.set({ name: n, value: v, ...o }); },
        remove: (n, o) => { res.cookies.set({ name: n, value: "", ...o }); },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const protectedPath = req.nextUrl.pathname.startsWith("/dashboard") ||
                        req.nextUrl.pathname.startsWith("/assessments") ||
                        req.nextUrl.pathname.startsWith("/reports") ||
                        req.nextUrl.pathname.startsWith("/settings");

  if (protectedPath && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)"],
};
