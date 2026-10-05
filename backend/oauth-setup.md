# OAuth Setup Guide

## 1. Enable OAuth in Supabase
1. Go to your Supabase dashboard
2. Navigate to Authentication → Providers
3. Enable Google, Facebook, and Apple

## 2. Configure OAuth Providers

### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://jlnqzfvzlrscwutavbmw.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

### Facebook OAuth
1. Go to Facebook Developers
2. Create app and get App ID/Secret
3. Add redirect URI: `https://jlnqzfvzlrscwutavbmw.supabase.co/auth/v1/callback`
4. Copy credentials to Supabase

### Apple OAuth
1. Go to Apple Developer Console
2. Create Sign in with Apple service
3. Configure redirect URI
4. Copy credentials to Supabase

## 3. Test
Social login buttons are now available in the sign-in form!