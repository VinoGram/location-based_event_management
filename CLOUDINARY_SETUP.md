# Cloudinary Setup Guide

## 1. Create Cloudinary Account
- Go to https://cloudinary.com/
- Sign up for a free account
- Get your credentials from the dashboard

## 2. Update Environment Variables
Replace the placeholder values in `.env`:

```
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 3. Install Dependencies
```bash
cd backend
npm install cloudinary sharp
```

## 4. What Changed
- Event flyers now upload to Cloudinary instead of Supabase
- Profile pictures now upload to Cloudinary instead of Supabase
- Image URLs are stored in Supabase database
- Images are automatically optimized and compressed

## 5. Benefits
- Better image optimization
- CDN delivery worldwide
- Automatic format conversion
- Image transformations on-the-fly
- Better performance