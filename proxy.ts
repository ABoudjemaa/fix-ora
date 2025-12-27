import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ["/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Route de login
  const isLoginRoute = pathname === "/login"

  // Si l'utilisateur est connecté et essaie d'accéder à /login, rediriger vers /dashboard
  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée, rediriger vers /login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

