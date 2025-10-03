import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/admin/sign-in(.*)',
  '/admin/login(.*)',
  '/api(.*)',
]);

// Define admin routes that require authentication
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Handle upload route separately to disable transformations
  if (req.nextUrl.pathname.startsWith('/api/upload')) {
    const response = NextResponse.next();
    
    // Add headers to disable transformations
    response.headers.set('Cache-Control', 'no-store, no-transform');
    response.headers.set('Content-Disposition', 'attachment');
    
    return response;
  }
  
  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return;
  }
  
  // If it's an admin route, protect it
  if (isAdminRoute(req)) {
    // Check if user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      // Redirect to admin sign-in if not authenticated
      const signInUrl = new URL('/admin/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Additional admin check can be added here if needed
    // For now, we just ensure the user is authenticated
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};