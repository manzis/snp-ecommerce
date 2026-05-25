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

  // --- Route Detection ---
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';
  const isPublicRoute = !isAdminRoute && 
    !request.nextUrl.pathname.startsWith('/account') && 
    !request.nextUrl.pathname.startsWith('/checkout') &&
    !request.nextUrl.pathname.startsWith('/cart') &&
    !request.nextUrl.pathname.startsWith('/api/user');

  // --- SEO Redirects ---
  // Evaluate active SEO redirects from the database before proceeding
  try {
    const { data: redirectRule } = await supabase
      .from('seo_redirects')
      .select('to_url, type')
      .eq('from_url', request.nextUrl.pathname)
      .eq('is_active', true)
      .maybeSingle();

    if (redirectRule && redirectRule.to_url) {
      // Use 308 for Permanent (301) to preserve HTTP method, 307 for Temporary (302)
      return NextResponse.redirect(
        new URL(redirectRule.to_url, request.url),
        redirectRule.type === 301 ? 308 : 307
      );
    }
  } catch (error) {
    console.error('[Middleware] SEO Redirect Check Error:', error);
  }

  // If it's a public route and NOT an admin route, we can skip the heavy auth.getUser() check
  // for the initial response. Supabase will still handle session persistence via cookies.
  // We only run getUser for Admin routes or Account routes to keep the storefront lightning fast.
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // IMPORTANT: Do NOT remove auth.getUser() for protected routes — it refreshes the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
  } else {
    // Storefront routes: Redirect unauthenticated users trying to access checkout or account
    if (!user) {
      const isCheckoutRoute = request.nextUrl.pathname.startsWith('/checkout');
      const isAccountRoute = request.nextUrl.pathname.startsWith('/account');
      if (isCheckoutRoute || isAccountRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
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
