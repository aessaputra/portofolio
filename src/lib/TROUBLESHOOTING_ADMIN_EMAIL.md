# Troubleshooting Admin Email Verification Issues

This guide provides steps to diagnose and resolve issues with admin email verification in the authentication flow.

## Common Issues and Solutions

### 1. Email Not Recognized as Admin

**Symptom**: Error message "User is not admin. Emails checked: ['your-email@example.com']"

**Possible Causes**:
- Email not added to `ADMIN_EMAIL_ALLOWLIST` environment variable
- Typo in email address
- Case sensitivity issue
- Extra spaces in environment variable

**Troubleshooting Steps**:

1. **Check Environment Variable Configuration**:
   - Verify that `ADMIN_EMAIL_ALLOWLIST` is set in your `.env.local` file
   - Ensure the email is included in the comma-separated list
   - Example: `ADMIN_EMAIL_ALLOWLIST=admin@example.com,another-admin@example.com`

2. **Verify Email Format**:
   - No spaces around commas: `admin1@example.com,admin2@example.com` ✓
   - Not: `admin1@example.com, admin2@example.com` ✗

3. **Check for Typos**:
   - Ensure the email is spelled correctly
   - Verify the domain name is correct

4. **Case Sensitivity**:
   - The system normalizes emails to lowercase, so case should not be an issue
   - But ensure there are no unexpected uppercase letters

### 2. Multiple Account Issues

**Symptom**: Admin verification fails after logging in with a different email address

**Possible Causes**:
- A previous session stored for a non-admin email address
- Browser caching old session data
- Multiple accounts with different emails

**Troubleshooting Steps**:

1. **Clear Browser Data**:
   - Clear browser cookies and local storage
   - This removes any stale session tokens

2. **Sign Out Completely**:
   - Use the sign-out functionality to clear the current session
   - Verify that NextAuth cookies are removed (`next-auth.session-token`)

3. **Check Browser Console**:
   - Look for detailed logging information that shows which email is being checked
   - Check for any error messages related to session management

### 3. Environment Variable Not Loading

**Symptom**: "No admin emails configured in ADMIN_EMAIL_ALLOWLIST" error

**Possible Causes**:
- Environment variable not set correctly
- Variable name misspelled
- Server not restarted after adding environment variable

**Troubleshooting Steps**:

1. **Verify Variable Name**:
   - Ensure the variable is named exactly `ADMIN_EMAIL_ALLOWLIST`

2. **Restart Development Server**:
   - After changing environment variables, restart the development server
   - Environment variables are only loaded at server startup

3. **Check Variable Loading**:
   - The debug logs will show the value of the environment variable
   - Verify that it matches what you expect

### 4. Debug Logging

The system now includes comprehensive debug logging to help identify issues:

1. **Client-Side Logging**:
   - Check the browser console for logs prefixed with `[AdminSignInWithCheck]`
   - These logs show the admin verification process on the client side

2. **Server-Side Logging**:
   - Check the server console for logs prefixed with `[check-admin-email API]`
   - These logs show the admin verification process on the server side

3. **Detailed Debug Information**:
   - The system now logs detailed information about:
     - Original and normalized email addresses
     - Configured admin emails
     - Whether the email is found in the admin set
     - Possible issues if the email is not found

### 5. Testing Admin Email Verification

To test if an email is properly configured as an admin:

1. **Using the Debug Utility**:
   - The `debugAdminEmailCheck` function in `src/lib/debugAdminCheck.ts` can be used to test email verification
   - This function returns detailed information about why an email may or may not be recognized as an admin

2. **Manual Verification**:
   - Check the `ADMIN_EMAIL_ALLOWLIST` environment variable
   - Normalize the email (trim and convert to lowercase)
   - Verify it exists in the comma-separated list

## Getting Help

If you continue to experience issues after following these troubleshooting steps:

1. Check the browser and server console logs for detailed error information
2. Verify that the email is correctly added to the `ADMIN_EMAIL_ALLOWLIST` environment variable
3. Ensure there are no typos or formatting issues in the environment variable
4. Try clearing browser data and signing out completely before attempting to sign in again
