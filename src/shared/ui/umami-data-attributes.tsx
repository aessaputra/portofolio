/**
 * Umami Data Attributes Helper
 * 
 * Production-ready helper for creating Umami data attributes
 * Provides type-safe and consistent event tracking
 */

// Helper function to create Umami data attributes
export function createUmamiAttributes(
  eventName: string, 
  eventData?: Record<string, string | number | boolean>
): Record<string, string> {
  const attributes: Record<string, string> = {
    'data-umami-event': eventName,
  };

  if (eventData) {
    Object.entries(eventData).forEach(([key, value]) => {
      attributes[`data-umami-event-${key}`] = String(value);
    });
  }

  return attributes;
}

// Predefined event attributes for common interactions
export const umamiEvents = {
  // Resume link events
  resumeLinkClick: (location: string, url: string) => createUmamiAttributes('resume-link-click', { location, type: 'link', url }),
  
  // Contact events
  contactClick: (location: string, type: string) => createUmamiAttributes('contact-click', { location, type }),
  
  // Hire me events
  hireMeClick: (location: string, type: string) => createUmamiAttributes('hire-me-click', { location, type }),
  
  // Social media events
  socialClick: (platform: string, location: string) => createUmamiAttributes('social-link-click', { platform, location }),
  
  // Navigation events
  navClick: (link: string, location: string) => createUmamiAttributes('navigation-click', { link, location }),
  
  // Theme events
  themeToggle: (from: string, to: string, location: string) => createUmamiAttributes('theme-toggle', { from, to, location }),
  
  // Mobile menu events
  mobileMenuToggle: (action: string, location: string) => createUmamiAttributes('mobile-menu-toggle', { action, location }),
  
  // Project events
  projectLinkClick: (location: string, type: string, title: string, url: string) => createUmamiAttributes('project-link-click', { location, type, title, url }),
  
  // GitHub events
  githubLinkClick: (location: string, type: string, title: string, url: string) => createUmamiAttributes('github-link-click', { location, type, title, url }),
} as const;

// Type for Umami event data
export type UmamiEventData = Record<string, string | number | boolean>;

// Type for event names (for type safety)
export type UmamiEventName =
  | 'resume-link-click'
  | 'contact-click'
  | 'hire-me-click'
  | 'social-link-click'
  | 'navigation-click'
  | 'theme-toggle'
  | 'mobile-menu-toggle'
  | 'project-link-click'
  | 'github-link-click';
