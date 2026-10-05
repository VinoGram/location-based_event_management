# OAuth Setup Guide

## Supabase OAuth Configuration

### 1. Enable OAuth Providers in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable the providers you want to use:

#### Google OAuth
- Enable Google provider
- Add your Google OAuth credentials:
  - Client ID: `your-google-client-id`
  - Client Secret: `your-google-client-secret`
- Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

#### Facebook OAuth
- Enable Facebook provider
- Add your Facebook App credentials:
  - App ID: `your-facebook-app-id`
  - App Secret: `your-facebook-app-secret`

#### Apple OAuth (iOS/macOS)
- Enable Apple provider
- Add your Apple credentials:
  - Client ID: `your-apple-client-id`
  - Client Secret: `your-apple-client-secret`

### 2. Configure Redirect URLs

In your Supabase dashboard under **Authentication** > **URL Configuration**:

- Site URL: `http://localhost:3000` (development) or your production URL
- Redirect URLs: 
  - `http://localhost:3000/auth/callback` (development)
  - `https://yourdomain.com/auth/callback` (production)

### 3. Update Environment Variables

Make sure your `.env` files have the correct Supabase credentials:

**Backend (.env):**
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
```

**Frontend (.env):**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000
```

### 4. Database Schema

Run the updated `setup-db.sql` to add OAuth support columns:

```sql
-- OAuth support columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

### 5. Testing OAuth

1. Start your backend server: `npm start`
2. Start your frontend: `npm run dev`
3. Click on Google/Facebook/Apple login buttons
4. You should be redirected to the provider's login page
5. After successful authentication, you'll be redirected back to `/auth/callback`
6. The app will create a user account and log you in

### 6. Production Deployment

For production:
1. Update redirect URLs in Supabase dashboard to your production domain
2. Update `VITE_API_URL` in frontend `.env` to your production backend URL
3. Ensure HTTPS is enabled for OAuth to work properly

## Troubleshooting

- **OAuth redirect not working**: Check that redirect URLs match exactly in Supabase dashboard
- **User creation fails**: Verify database schema has OAuth columns
- **Token issues**: Ensure JWT_SECRET is set in backend environment
- **CORS errors**: Check that your frontend URL is in the CORS configuration