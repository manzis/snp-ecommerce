import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  
  const isProtectedAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAuthRoute = pathname === '/admin/login';
  const isProtectedApiRoute = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  // Check role if user exists and it's an admin route
  let role = 'user';
  if (user && (isProtectedAdminRoute || isProtectedApiRoute || isAuthRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      role = profile.role || 'user';
    }
  }

  // Admin Route Protection
  if (isProtectedAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // Redirect non-admins to home
      return NextResponse.redirect(url)
    }
  }

  if (isProtectedApiRoute && (!user || role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  // Already logged in as Admin? Redirect away from login page
  if (isAuthRoute && user && role === 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
