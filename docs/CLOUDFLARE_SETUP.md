# Cloudflare R2 Custom Domain Setup Guide

This guide provides step-by-step instructions for setting up a custom domain with Cloudflare R2 for production environments.

## Prerequisites

- Cloudflare account with R2 enabled
- Domain managed by Cloudflare
- Access to domain DNS settings

## Step 1: Create R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to R2 under "Storage" section
3. Click "Create bucket"
4. Enter a bucket name (e.g., `my-portofolio`)
5. Click "Create bucket"

## Step 2: Configure Bucket Permissions

1. Select your newly created bucket
2. Go to "Settings" tab
3. Under "Bucket Permissions", ensure the bucket is set to public access
4. If needed, configure CORS rules for your domain:

```json
[
  {
    "allowed_origins": ["https://yourdomain.com"],
    "allowed_methods": ["GET", "HEAD"],
    "allowed_headers": ["*"]
  }
]
```

## Step 3: Set Up Custom Domain

1. In your bucket settings, go to "Custom Domains"
2. Click "Add custom domain"
3. Enter your custom domain (e.g., `cdn.yourdomain.com`)
4. Click "Add custom domain"

## Step 4: Configure DNS

1. Go to Cloudflare DNS dashboard
2. Add a CNAME record for your custom domain:

```
Type: CNAME
Name: cdn
Content: your-bucket-name.your-account-id.r2.dev
TTL: Auto
Proxy status: Proxied
```

Replace:
- `your-bucket-name` with your actual bucket name
- `your-account-id` with your Cloudflare account ID

## Step 5: Verify Custom Domain

1. Wait for DNS propagation (usually takes a few minutes)
2. Verify the custom domain is working:
   ```bash
   curl -I https://cdn.yourdomain.com
   ```
3. You should see a response from Cloudflare

## Step 6: Update Environment Variables

Update your `.env.local` file with the custom domain:

```bash
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.yourdomain.com
```

Also ensure you have all required variables:

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
```

## Step 7: Test the Implementation

1. Run the test script to verify URL construction:
   ```bash
   node scripts/test-r2-simple-implementation.js
   ```

2. Check if images are accessible:
   ```bash
   node scripts/check-r2-images.js
   ```

3. Test URL accessibility:
   ```bash
   curl -I "https://cdn.yourdomain.com/your-bucket-name/test-image.jpg"
   ```

## Troubleshooting

### Custom Domain Not Working

1. **Check DNS Configuration**
   - Verify CNAME record is correctly set
   - Wait for DNS propagation (can take up to 24 hours)
   - Use `dig cdn.yourdomain.com` to check DNS resolution

2. **Check SSL Certificate**
   - Cloudflare should automatically provision SSL certificate
   - Check SSL/TLS settings in Cloudflare dashboard

3. **Check Bucket Permissions**
   - Ensure bucket is set to public access
   - Verify CORS settings if needed

### Images Not Loading

1. **Check URL Construction**
   - Run the test script to verify URLs are built correctly
   - Check environment variables are set correctly

2. **Check File Existence**
   - Use the check-r2-images.js script to verify files exist in R2
   - Check R2 dashboard for uploaded files

3. **Check Browser Console**
   - Look for mixed content errors
   - Check for CORS errors
   - Verify all URLs use HTTPS

### Upload Failures

1. **Check Credentials**
   - Verify R2 access keys are correct
   - Ensure keys have necessary permissions

2. **Check File Validation**
   - Verify file size is within limits (10MB)
   - Check file type is supported (JPEG, PNG, WebP, GIF)

3. **Check Network Issues**
   - Verify firewall settings
   - Check for any network restrictions

## Best Practices

### Security

1. **Use Restricted Access Keys**
   - Create separate access keys for production and development
   - Limit permissions to only what's needed
   - Regularly rotate access keys

2. **Configure CORS Properly**
   - Only allow your domain in CORS settings
   - Use specific HTTP methods instead of wildcard
   - Regularly review CORS settings

3. **Monitor Usage**
   - Set up usage alerts in Cloudflare dashboard
   - Monitor for unusual activity
   - Regularly review access logs

### Performance

1. **Use Appropriate Cache Headers**
   - Set long cache times for static assets
   - Use cache-control headers effectively
   - Implement cache invalidation when needed

2. **Optimize Images**
   - Use appropriate image formats
   - Compress images before upload
   - Use responsive images where possible

3. **Use CDN Caching**
   - Enable Cloudflare caching
   - Set appropriate cache rules
   - Use cache everything for static assets

### Reliability

1. **Implement Fallback URLs**
   - Use the enhanced R2 implementation with fallback mechanisms
   - Test all URL formats regularly
   - Monitor URL accessibility

2. **Handle Errors Gracefully**
   - Implement proper error handling
   - Show user-friendly error messages
   - Log errors for debugging

3. **Monitor Service Health**
   - Set up health checks for R2 service
   - Monitor response times
   - Set up alerts for service issues

## Migration from Existing Setup

If you're migrating from an existing setup:

1. **Backup Existing Data**
   - Export all existing data from current storage
   - Verify backup integrity
   - Keep backup until migration is complete

2. **Update Configuration**
   - Update environment variables
   - Test new configuration in staging
   - Verify all functionality works

3. **Migrate Data**
   - Upload all existing files to R2
   - Verify all files are accessible
   - Update any hardcoded URLs

4. **Switch Over**
   - Update DNS settings
   - Monitor for any issues
   - Have rollback plan ready

## Support

If you encounter any issues during setup:

1. Check Cloudflare R2 documentation
2. Review Cloudflare status page for service issues
3. Check community forums for similar issues
4. Contact Cloudflare support if needed