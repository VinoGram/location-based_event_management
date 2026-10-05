# Profile Edit Fix - Testing Guide

## Problem
When clicking "Save" after editing profile, the error "Cannot coerce the result to a single JSON object" appears.

## Root Cause
The error occurs because:
1. The backend was trying to update and select in a single query with `.single()`
2. Field name mismatches between frontend (firstName) and database (first_name)
3. Missing database columns (bio, notification_preferences)
4. Improper handling of FormData when uploading avatars

## Solution Applied

### 1. Backend Route Fix (`backend/routes/users.js`)
- Separated update and select operations
- Added proper field name transformation
- Added support for avatar uploads with multer
- Added proper error handling and logging
- Added missing routes (stats, account deletion)

### 2. Database Schema Fix (`fix_profile_schema.sql`)
- Ensured all required columns exist
- Added default values for notification_preferences
- Fixed location column type to JSONB
- Added proper constraints and defaults

## Testing Steps

1. **Run the database fix:**
   ```sql
   -- Execute the fix_profile_schema.sql in your database
   ```

2. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Test profile editing:**
   - Go to profile page
   - Click "Edit Profile"
   - Make changes to any field
   - Click "Save Profile"
   - Should see success message instead of error

4. **Test avatar upload:**
   - Click "Change Avatar" 
   - Select an image file
   - Save profile
   - Avatar should update successfully

## Key Changes Made

### Backend (`users.js`)
- Added multer for file uploads
- Separated update/select operations
- Added field transformation (firstName ↔ first_name)
- Added avatar upload to Supabase Storage
- Added proper error logging

### Database Schema
- Added `bio` column
- Added `notification_preferences` JSONB column
- Ensured `location` is JSONB type
- Added default values

## Expected Behavior After Fix
- Profile saves successfully without errors
- Avatar uploads work properly
- All form fields persist correctly
- Notification preferences save properly
- No more "Cannot coerce the result to a single JSON object" error

## Additional Notes
- Make sure Supabase Storage bucket 'avatars' exists
- Ensure proper RLS policies for avatar uploads
- Check that all environment variables are set correctly