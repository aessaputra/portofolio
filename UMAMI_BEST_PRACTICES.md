# 🎯 Umami Analytics - Best Practices & Implementation Guide

## 📁 File Structure (Clean)

```
src/shared/ui/
├── umami-analytics.tsx     ← Main tracking component
├── umami-tracker.tsx       ← Hooks & utilities
└── umami-debug-dev.tsx     ← Debug (development only)
```

## 🚀 Best Practices

### 1. **Environment Configuration**

```bash
# .env.local
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id-here
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.yourdomain.com/script.js
```

**✅ Do:**
- Gunakan environment variables
- Set script URL untuk self-hosted
- Validasi di development

**❌ Don't:**
- Hardcode website ID
- Expose sensitive data
- Skip environment validation

### 2. **Event Tracking Strategy**

#### **Automatic Tracking (No Code Needed)**
- ✅ Page views
- ✅ Referrer data
- ✅ Browser info
- ✅ Geographic data

#### **Custom Event Tracking**

**✅ Good Examples:**
```javascript
// Simple events
umamiTrack("button-click", { button: "download-resume" });
umamiTrack("form-submit", { form: "contact" });

// With context
umamiTrack("navigation-click", { 
  link: "About", 
  location: "navbar" 
});
```

**❌ Avoid:**
```javascript
// Too much data
umamiTrack("user-action", { 
  userId: "123", 
  email: "user@example.com",  // ❌ Sensitive data
  fullUserData: {...}         // ❌ Too much info
});

// Inconsistent naming
umamiTrack("click");          // ❌ Too generic
umamiTrack("UserClickedBtn"); // ❌ Inconsistent case
```

### 3. **Event Naming Convention**

**✅ Consistent Pattern:**
```
[action]-[object]-[context]

Examples:
- navigation-click-navbar
- social-link-click-footer
- theme-toggle-header
- download-click-resume
- form-submit-contact
```

**✅ Event Data Structure:**
```javascript
{
  // Required: What happened
  action: "click" | "submit" | "toggle" | "download",
  
  // Required: What was clicked/submitted
  object: "button" | "link" | "form" | "download",
  
  // Optional: Where it happened
  location: "navbar" | "footer" | "hero" | "sidebar",
  
  // Optional: Additional context
  type?: "primary" | "secondary",
  platform?: "github" | "linkedin" | "twitter"
}
```

### 4. **Performance Best Practices**

**✅ Optimize Loading:**
```javascript
// UmamiAnalytics.tsx - Already optimized
<Script
  defer                    // ✅ Non-blocking
  strategy="afterInteractive" // ✅ Load after page interactive
  onError={handleError}    // ✅ Error handling
/>
```

**✅ Efficient Event Tracking:**
```javascript
// ✅ Use useCallback for performance
const { track } = useUmamiTracker();

const handleClick = useCallback(() => {
  track("button-click", { button: "cta" });
}, [track]);
```

### 5. **Privacy & Security**

**✅ Privacy-First Approach:**
- ✅ No personal data tracking
- ✅ No cookies used
- ✅ Anonymous analytics only
- ✅ GDPR compliant by default

**✅ Data Sanitization:**
```javascript
// Already implemented in umami-tracker.tsx
function sanitizeEventData(data) {
  // Only allow strings, numbers, booleans
  // Limit string length to 100 chars
  // Remove objects/arrays
}
```

### 6. **Error Handling**

**✅ Graceful Degradation:**
```javascript
// Already implemented
if (!window.umami) {
  // Silently fail in production
  // Log warning in development
  return;
}
```

### 7. **Development vs Production**

**✅ Development:**
- Debug panel visible
- Console logs enabled
- Error messages shown

**✅ Production:**
- No debug UI
- No console logs
- Silent error handling
- Optimized performance

## 🎯 Implementation Checklist

### Setup Phase
- [ ] Configure environment variables
- [ ] Set up Umami self-hosted instance
- [ ] Get website ID from dashboard
- [ ] Test script loading

### Development Phase
- [ ] Add event tracking to key interactions
- [ ] Use consistent naming convention
- [ ] Test events in debug panel
- [ ] Verify data in Umami dashboard

### Production Phase
- [ ] Remove debug components
- [ ] Verify no console logs
- [ ] Test error handling
- [ ] Monitor analytics data

## 📊 Recommended Events to Track

### **High Priority**
```javascript
// Navigation
umamiTrack("navigation-click", { link: "About", location: "navbar" });

// Contact
umamiTrack("contact-click", { location: "footer" });

// Downloads
umamiTrack("download-click", { file: "resume.pdf" });
```

### **Medium Priority**
```javascript
// Social Media
umamiTrack("social-link-click", { platform: "github", location: "navbar" });

// Theme
umamiTrack("theme-toggle", { from: "light", to: "dark" });

// Mobile Menu
umamiTrack("mobile-menu-toggle", { action: "open" });
```

### **Low Priority**
```javascript
// Scroll tracking (if needed)
umamiTrack("scroll-depth", { percentage: "50" });

// Time on page (if needed)
umamiTrack("page-time", { duration: "30s" });
```

## 🔧 Troubleshooting

### Common Issues

**Script not loading:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_UMAMI_WEBSITE_ID
echo $NEXT_PUBLIC_UMAMI_SCRIPT_URL
```

**Events not tracking:**
```javascript
// Check if Umami is loaded
console.log("Umami loaded:", typeof window.umami !== "undefined");
```

**CORS errors:**
- Ensure Umami instance allows your domain
- Check script URL is correct
- Verify HTTPS in production

## 📈 Analytics Insights

### Key Metrics to Monitor
- **Page Views**: Most visited pages
- **Navigation**: Popular menu items
- **Social Links**: Which platforms get clicks
- **Contact**: Conversion from contact links
- **Downloads**: Popular downloadable content

### Dashboard Setup
1. Create custom events in Umami dashboard
2. Set up filters for different event types
3. Create reports for key metrics
4. Set up alerts for unusual activity

## 🎉 Summary

**✅ What's Implemented:**
- Production-ready Umami integration
- Comprehensive event tracking
- Privacy-compliant analytics
- Performance optimized
- Error handling
- Development debugging tools

**✅ Ready for Production:**
- Clean codebase
- No unused files
- Best practices followed
- Comprehensive documentation
- Easy to maintain and extend
