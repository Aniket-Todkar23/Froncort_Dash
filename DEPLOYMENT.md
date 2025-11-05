# Deployment Guide

## Socket Server on Render

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Use these settings:
   - **Name**: `froncort-socket-server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/socket-server.js`
   - **Plan**: Free (or paid if needed)

6. After deployment, note your Render URL: `https://your-service-name.onrender.com`

### Step 2: Set Environment Variables on Render
Add these to Render dashboard → Environment:
```
NODE_ENV=production
PORT=8080
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_key>
```

---

## Frontend on Vercel

### Step 3: Update Vercel Environment Variables
Go to Vercel dashboard → Settings → Environment Variables

Add this variable:
```
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-service-name.onrender.com
```

Replace `your-service-name` with your actual Render service name.

### Step 4: Redeploy on Vercel
- Trigger a new deployment on Vercel (push to main or manual deploy)
- This will pick up the new socket server URL

---

## Local Development

For local development, you can still run both:
```bash
npm run dev:all
```

This will:
- Start the socket server on `http://localhost:8080`
- Start the Next.js dev server on `http://localhost:3000`

---

## Testing Connection

1. Open your Vercel app
2. Check browser console for connection logs
3. Should see: `Connected to collaboration server`

If connection fails:
- Check Render service is running
- Verify `NEXT_PUBLIC_SOCKET_SERVER_URL` is set correctly
- Check CORS is enabled on Render (it is by default in socket-server.js)

---

## Troubleshooting

### Connection timeout
- Make sure Render service is running (check Render dashboard)
- Verify URL is correct (no trailing slash)
- Check browser console for specific error

### CORS errors
- The socket server already has CORS enabled for all origins
- If issues persist, check Render logs

### Database persistence not working
- Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Render
- These are optional - collaboration works without them
