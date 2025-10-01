# Clerk Authentication Setup Guide

## 1. Fix Clock Skew Issue

The clock skew error occurs when your system clock is not synchronized correctly. This causes JWT validation issues because the token's "issued at" (iat) time appears to be in the future.

### Solution:

#### For Linux/macOS:
```bash
# Stop NTP service if running
sudo systemctl stop ntp
sudo systemctl stop ntpd

# Force sync time with NTP servers
sudo ntpdate -s time.nist.gov

# Start NTP service again
sudo systemctl start ntp
sudo systemctl start ntpd

# Verify time sync
timedatectl status
```

#### For Windows:
1. Right-click on the clock in the taskbar
2. Select "Adjust date/time"
3. Turn on "Set time automatically"
4. Click "Additional date, time & regional settings"
5. Click "Additional clocks"
6. Go to "Internet Time" tab
7. Click "Change settings..."
8. Check "Synchronize with an Internet time server"
9. Select "time.windows.com" or "time.nist.gov"
10. Click "Update now" and then "OK"

#### For Docker/Containerized Environments:
If you're running in Docker, ensure your host machine's time is synchronized and consider adding time synchronization to your container:

```dockerfile
# In your Dockerfile
RUN apt-get update && apt-get install -y ntp
```

## 2. Clerk Environment Variables Configuration

### Required Environment Variables:

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk Authentication (get these from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Admin Role-Based Access Control
# Comma-separated list of email addresses allowed to access the admin panel
ALLOWED_ADMIN_EMAILS=admin@example.com,anotheradmin@example.com
```

### How to Get Clerk Keys:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to "API Keys" section
4. Copy the "Publishable key" and "Secret key"
5. Paste them into your `.env.local` file

### Important Notes:

- Never commit your `.env.local` file to version control
- Make sure your `.env.local` file is in your project root directory
- Restart your development server after making changes to environment variables

## 3. Middleware Configuration

The middleware has been updated to:
- Skip authentication routes to prevent redirect loops
- Use session claims to get user email for admin verification
- Properly redirect unauthenticated users to sign-in
- Restrict admin routes to only allowed email addresses

## 4. Troubleshooting

### Infinite Redirect Loop:
- Ensure your Clerk keys are correctly configured in `.env.local`
- Make sure the middleware is properly excluding auth routes
- Check that your sign-in URL matches `NEXT_PUBLIC_CLERK_SIGN_IN_URL`

### Clock Skew Warnings:
- Follow the clock synchronization steps above
- If using a VM, ensure host time synchronization is enabled
- Consider using a reliable NTP server like `time.nist.gov`

### Admin Access Issues:
- Verify `ALLOWED_ADMIN_EMAILS` is correctly set in `.env.local`
- Ensure the email addresses are in lowercase
- Check that the user is signed in with the correct email address

## 5. Testing Your Setup

After making these changes:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try signing in with an admin email address

3. Attempt to access an admin route

4. Verify that non-admin users are redirected to the home page

5. Check that unauthenticated users are redirected to the sign-in page

## 6. Disabling Sign-Up for Admin-Only Authentication

To ensure that only existing users can sign in (and no new users can register), you need to configure your Clerk application settings:

### Steps to Disable Sign-Up:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to the "User & Authentication" section
4. Click on "Authentication" in the sidebar
5. Under the "Sign-up" section, disable the following:
   - Disable "Email addresses" if you want to prevent email sign-ups
   - Disable "Phone numbers" if you want to prevent phone sign-ups
   - Disable all social connection providers (Google, Facebook, etc.)
6. Under the "Sign-in" section, ensure only the following are enabled:
   - "Email addresses" (for email OTP)
   - Disable "Phone numbers"
   - Disable Password, Passkeys, and all Social providers so only Email code is available
7. Save your changes

### Adding Users Manually:

Since sign-up is disabled, you'll need to add users manually through the Clerk Dashboard:

1. Go to the "Users" section in your Clerk Dashboard
2. Click "Add user" or "Create user"
3. Enter the user's email address and/or phone number
4. Assign appropriate roles if needed
5. Save the user

### Important Notes:

- Make sure all admin users are added to the `ALLOWED_ADMIN_EMAILS` environment variable
- Users added manually will need to use the OTP-based sign-in flow we've implemented
- Test with your admin users to ensure they can successfully authenticate

If you still encounter issues, check the browser console for any error messages and verify your environment variables are correctly set.