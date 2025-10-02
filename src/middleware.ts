import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/sign-in/[[...sign-in]]', '/admin/sign-in', '/admin/login', '/sign-in']);

export default clerkMiddleware(async (auth, req) => {
  // Allow auth routes to proceed to avoid redirect loops
  if (isAuthRoute(req)) {
    return;
  }

  // Require authentication for /admin
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    
    // If user is not authenticated, redirect to sign-in page
    if (!userId) {
      const signInUrl = new URL('/admin/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // For admin routes other than sign-in, check if user is an admin
    if (!req.nextUrl.pathname.startsWith('/admin/sign-in')) {
      const { userId } = await auth();
      
      // Get user information to check admin status
      // Note: In middleware, we don't have direct access to the user's email
      // The actual admin check will be done in the requireAdmin function
      // This middleware just ensures authentication
      if (!userId) {
        const signInUrl = new URL('/admin/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Ensure middleware runs for admin routes
    '/(admin)(.*)',
  ],
};