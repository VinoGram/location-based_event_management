# Deployment Guide

## Backend Deployment

### 1. Environment Setup
Create `.env` file in backend directory:
```
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
JWT_SECRET=your_secure_jwt_secret_here
```

### 2. Deploy Backend
Options:
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Connect GitHub repo, set build command `npm install`, start command `npm start`
- **Heroku**: `git push heroku main`
- **DigitalOcean App Platform**: Connect GitHub repo

### 3. Update CORS
In `backend/app.js`, update the CORS origin to your frontend domain:
```javascript
origin: ['https://your-frontend-domain.com']
```

## Frontend Deployment

### 1. Update Environment
Update `.env.production`:
```
VITE_API_URL=https://your-backend-domain.com
```

### 2. Build & Deploy
```bash
cd Frontend
npm run build
```

Deploy `dist` folder to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist` folder or connect GitHub
- **GitHub Pages**: Upload `dist` contents
- **Firebase Hosting**: `firebase deploy`

## Quick Deploy Commands

### Vercel (Recommended for Frontend)
```bash
npm install -g vercel
cd Frontend
vercel --prod
```

### Railway (Recommended for Backend)
```bash
npm install -g @railway/cli
cd backend
railway login
railway deploy
```

## Domain Configuration

1. **Backend**: Update CORS origins in `app.js`
2. **Frontend**: Update `VITE_API_URL` in `.env.production`
3. **DNS**: Point your domain to deployment URLs

## Environment Variables Checklist

### Backend (.env)
- [ ] PORT
- [ ] NODE_ENV=production
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] JWT_SECRET

### Frontend (.env.production)
- [ ] VITE_API_URL=https://your-backend-domain.com

## Post-Deployment

1. Test authentication flow
2. Test event discovery
3. Test premium features
4. Verify CORS is working
5. Check all API endpoints