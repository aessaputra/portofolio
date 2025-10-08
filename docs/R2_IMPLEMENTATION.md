# Enhanced Cloudflare R2 Implementation

This document describes the enhanced Cloudflare R2 implementation with custom domain support and S3 API compatibility for production environments.

## Overview

The enhanced R2 implementation provides:
- Multiple URL construction strategies (custom domain, direct R2, R2 dev domain)
- Intelligent fallback mechanisms
- Enhanced error handling and logging
- Production-optimized configuration
- S3 API compatibility

## Architecture

### Core Components

1. **r2Client.ts** - R2 client configuration with production optimizations
2. **r2UrlManager.ts** - URL construction and management with multiple strategies
3. **r2Storage.ts** - Enhanced storage operations with error handling
4. **storage.ts** - Legacy compatibility layer

### URL Construction Strategies

The implementation supports three URL construction strategies:

1. **Custom Domain URL** (Primary for production)
   - Format: `https://cdn.example.com/bucket/object-key`
   - Used when custom domain is configured and accessible

2. **Direct R2 URL** (Fallback)
   - Format: `https://account-id.r2.cloudflarestorage.com/bucket/object-key`
   - Direct access to R2 without custom domain

3. **R2 Dev Domain** (Development)
   - Format: `https://bucket.account-id.r2.dev/object-key`
   - Used for development and testing

## Configuration

### Environment Variables

```bash
# Required
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.example.com

# Optional
NODE_ENV=production
```

### Production vs Development Configuration

The implementation automatically adjusts configuration based on `NODE_ENV`:

**Production Environment:**
- Higher retry attempts (5 vs 3)
- Longer request timeout (30s vs 10s)
- Connection pooling enabled
- Custom domain URL prioritized

**Development Environment:**
- Standard retry attempts (3)
- Shorter request timeout (10s)
- No connection pooling
- R2 dev domain may be used

## Usage

### Basic Upload

```typescript
import { uploadImageToR2 } from "@/shared/lib/storage";

const result = await uploadImageToR2(
  fileBuffer,
  "image/jpeg",
  "profile-image.jpg"
);

if (result.success) {
  console.log("Upload successful:", result.url);
} else {
  console.error("Upload failed:", result.error);
}
```

### URL Resolution with Fallback

```typescript
import { resolveR2UrlWithFallback } from "@/shared/lib/storage";

// Get the best available URL with automatic fallback
const bestUrl = await resolveR2UrlWithFallback("profile-image.jpg");
```

### Check URL Accessibility

```typescript
import { checkUrlAccessibility } from "@/shared/lib/storage";

// Check all possible URLs for accessibility
const accessibility = await checkUrlAccessibility("profile-image.jpg");

console.log("Custom domain accessible:", accessibility.customDomain.accessible);
console.log("Direct R2 accessible:", accessibility.directR2.accessible);
console.log("R2 dev domain accessible:", accessibility.r2DevDomain.accessible);
```

## Custom Domain Setup

### Cloudflare Configuration

1. **Create R2 Bucket**
   ```bash
   # Using wrangler
   wrangler r2 bucket create your-bucket-name
   ```

2. **Configure Custom Domain**
   - Go to Cloudflare R2 dashboard
   - Select your bucket
   - Go to "Settings" → "Custom Domains"
   - Add your custom domain (e.g., `cdn.example.com`)
   - Follow the DNS verification steps

3. **Set Bucket Permissions**
   - Ensure bucket is set to public access
   - Configure CORS rules if needed

### DNS Configuration

Add a CNAME record for your custom domain:

```
Type: CNAME
Name: cdn
Content: your-bucket-name.your-account-id.r2.dev
TTL: Auto
```

## Best Practices

### Production Deployment

1. **Environment Variables**
   - Set all required environment variables in production
   - Use different access keys for production and development
   - Never commit secrets to version control

2. **Error Handling**
   - Always check the `success` property of upload results
   - Implement proper error logging and monitoring
   - Use fallback URLs when primary URLs fail

3. **Performance Optimization**
   - Use appropriate cache control headers
   - Implement CDN caching where possible
   - Monitor R2 usage and costs

4. **Security**
   - Use restricted access keys with minimal permissions
   - Implement proper CORS configuration
   - Regularly rotate access keys

### File Naming

Use the `generateUniqueFilename` function for consistent file naming:

```typescript
import { generateUniqueFilename } from "@/shared/lib/storage";

const filename = generateUniqueFilename("profile.jpg", "profile");
// Returns: "profile-1234567890-abc123.jpg"
```

### File Validation

Always validate files before upload:

```typescript
import { validateImageFile } from "@/shared/lib/storage";

const validation = validateImageFile(file);
if (!validation.valid) {
  console.error("Invalid file:", validation.error);
  return;
}
```

## Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Check if custom domain is properly configured
   - Verify DNS settings
   - Test all URL formats using the checkUrlAccessibility function

2. **Upload Failures**
   - Verify environment variables
   - Check bucket permissions
   - Ensure file size and type are within limits

3. **Mixed Content Errors**
   - Ensure all URLs use HTTPS
   - Check for protocol-relative URLs
   - Verify SSL certificate is valid

### Debug Scripts

Use the provided debug scripts to troubleshoot issues:

```bash
# Test URL construction
node scripts/test-r2-simple-implementation.js

# Check if images exist in R2
node scripts/check-r2-images.js

# Debug database and R2 configuration
node scripts/debug-production.js
```

## Migration Guide

### From Legacy Implementation

1. Update imports:
   ```typescript
   // Before
   import { uploadImageToR2 } from "@/shared/lib/storage";
   
   // After (no change needed, but new features available)
   import { uploadImageToR2, resolveR2UrlWithFallback } from "@/shared/lib/storage";
   ```

2. Use new features:
   ```typescript
   // Get best available URL with fallback
   const bestUrl = await resolveR2UrlWithFallback(objectKey);
   
   // Check URL accessibility
   const accessibility = await checkUrlAccessibility(objectKey);
   ```

3. Update error handling:
   ```typescript
   // Before
   try {
     const url = await uploadImageToR2(...);
   } catch (error) {
     console.error(error);
   }
   
   // After
   const result = await uploadImageToR2(...);
   if (!result.success) {
     console.error(result.error);
   }
   ```

## API Reference

### Types

```typescript
type UploadResult = {
  success: boolean;
  url?: string;
  directUrl?: string;
  customDomainUrl?: string;
  error?: string;
  objectKey?: string;
};

type ImageType = "profile" | "project" | "certification" | "about" | "general";

type PutObjectOptions = {
  cacheControl?: string;
  metadata?: Record<string, string>;
  contentDisposition?: string;
};
```

### Functions

#### uploadImageToR2(file, contentType, objectKey, options?)
Upload an image to R2 with enhanced error handling.

#### resolveR2UrlWithFallback(url)
Resolve an R2 URL with intelligent fallback to the best available URL.

#### checkUrlAccessibility(objectKey)
Check accessibility of all possible URLs for an object.

#### getBestAvailableUrl(objectKey)
Get the best available URL for an object based on accessibility.

#### validateImageFile(file)
Validate an image file against size and type restrictions.

#### generateUniqueFilename(originalName, type?)
Generate a unique filename with timestamp and random string.