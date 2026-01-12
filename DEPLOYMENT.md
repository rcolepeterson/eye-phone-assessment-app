# Deployment Guide

## Deploy to Vercel (Recommended)

### Option 1: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `ALLOWED_ORIGIN`: Your frontend URL (e.g., `https://yourdomain.com`)
   - Click "Deploy"

3. **Note Your API URL**
   - After deployment, Vercel gives you a URL like: `https://your-project.vercel.app`
   - Use this URL in your Vite app as `VITE_EYEPHONE_API_URL`

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add ALLOWED_ORIGIN
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

### Development (.env.local)
```env
OPENAI_API_KEY=sk-...
ALLOWED_ORIGIN=http://localhost:5173
```

### Production (Vercel Dashboard)

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add:
   - `OPENAI_API_KEY`: Your production OpenAI key
   - `ALLOWED_ORIGIN`: Your production frontend domain

## Post-Deployment

### 1. Test the API

```bash
curl https://your-api.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "EyePhone API Service",
  "version": "1.0.0"
}
```

### 2. Update Your Vite App

In your Vite app's `.env`:
```env
VITE_EYEPHONE_API_URL=https://your-api.vercel.app
```

### 3. Test from Frontend

Make a test API call from your Vite app to verify the integration works.

## Troubleshooting

### CORS Errors
- Verify `ALLOWED_ORIGIN` includes your frontend domain
- Check browser console for specific CORS error messages

### API Key Errors
- Confirm `OPENAI_API_KEY` is set in Vercel environment variables
- Verify the key is valid and has available credits

### 500 Errors
- Check Vercel function logs in the dashboard
- Verify all dependencies are installed correctly

## Monitoring

- View logs in Vercel Dashboard → Your Project → Deployments → [Latest] → Logs
- Monitor API usage in OpenAI dashboard
- Set up Vercel Analytics for request tracking

## Updating the API

1. Make changes locally
2. Test locally: `npm run dev`
3. Push to GitHub (if using GitHub integration)
4. Vercel automatically deploys changes
5. Verify deployment in Vercel dashboard

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `ALLOWED_ORIGIN` if needed
6. Update `VITE_EYEPHONE_API_URL` in your frontend
