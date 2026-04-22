import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT remove auth.getUser() — it refreshes the session cookie
  // so that Server Actions and Server Components always see a valid session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- Admin Route Protection ---
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute) {
    if (!user) {
      // Not logged in: Redirect to login if trying to access dashboard
      if (!isLoginRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } else {
      // Logged in: Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      if (!isAdmin) {
        // Customer trying to access Admin Pages: Redirect to storefront
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isAdmin && isLoginRoute) {
        // Logged-in admin trying to access login page: Redirect to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
