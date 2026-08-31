import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname;

  // --- Route Detection ---
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';
  const isPublicRoute = !isAdminRoute && 
    !pathname.startsWith('/account') && 
    !pathname.startsWith('/checkout') &&
    !pathname.startsWith('/cart') &&
    !pathname.startsWith('/api/user');

  // --- SEO Redirects ---
  // Evaluate active SEO redirects ONLY for storefront public pages (skip for admin, account, checkout, api)
  if (isPublicRoute && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    try {
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return []; },
            setAll() { },
          }
        }
      );

      const { data: redirectRule } = await supabaseAdmin
        .from('seo_redirects')
        .select('to_url, type')
        .eq('from_url', pathname)
        .eq('is_active', true)
        .maybeSingle();

      if (redirectRule && redirectRule.to_url) {
        return NextResponse.redirect(
          new URL(redirectRule.to_url, request.url),
          redirectRule.type === 301 ? 308 : 307
        );
      }
    } catch (error) {
      console.error('[Middleware] SEO Redirect Check Error:', error);
    }
  }

  // Fast path for public routes
  if (isPublicRoute) {
    return supabaseResponse;
  }

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
      // Logged in: Check role (First check metadata if set, otherwise fetch profile)
      const roleFromMeta = user.app_metadata?.role || user.user_metadata?.role;
      let isAdmin = roleFromMeta === 'admin';

      if (!isAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        isAdmin = profile?.role === 'admin';
      }

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
      const isCheckoutRoute = pathname.startsWith('/checkout');
      const isAccountRoute = pathname.startsWith('/account');
      if (isCheckoutRoute || isAccountRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
