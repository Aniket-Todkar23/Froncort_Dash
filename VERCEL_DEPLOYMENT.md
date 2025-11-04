# Froncort - Vercel Deployment Guide

This guide explains how to deploy Froncort to Vercel with full Socket.io collaboration support.

## Key Points

✅ **Collaboration Features**: The socket server runs directly in Next.js API routes - fully compatible with Vercel
✅ **No External Server Needed**: Everything runs on Vercel's edge network
✅ **Real-time Sync**: Document collaboration, cursor tracking, and typing indicators all work seamlessly

## Step 1: Push to GitHub

```bash
git push origin main
```

## Step 2: Deploy on Vercel

### Option A: CLI (Recommended)
```bash
npm install -g vercel
vercel
```

### Option B: Web Dashboard
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Click "Import"

## Step 3: Environment Variables

Add these to your Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

**Optional** (leave blank to use default):
```
NEXT_PUBLIC_SOCKET_URL=  # Leave empty for Vercel (auto-uses /api/socket)
```

## Step 4: Configure Supabase

In your Supabase Dashboard → Authentication → URL Configuration:

Add this Redirect URL:
```
https://your-project.vercel.app/auth/callback
```

## Step 5: Deploy

```bash
vercel --prod
```

Your app is now live! 🎉

## How It Works

### Socket.io on Vercel
- The socket server runs in `pages/api/socket.ts`
- Next.js auto-initializes the server on first request
- All collaboration events (document changes, cursor updates, typing) flow through this endpoint
- Vercel's Edge Runtime handles the persistent connections

### Collaboration Features Supported
✅ Real-time document editing  
✅ Multi-cursor tracking  
✅ Active user presence  
✅ Typing indicators  
✅ Version control  
✅ Auto-save on disconnect  

## Local Development

### With External Socket Server
```bash
npm run server  # Terminal 1: Socket server on :8080
npm run dev    # Terminal 2: Next.js on :3000
```

Add to `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

### With API Endpoint (Like Vercel)
```bash
npm run dev
```

Leave `NEXT_PUBLIC_SOCKET_URL` empty in `.env.local`

## Troubleshooting

### "Socket connection failed"
- Check if `NEXT_PUBLIC_SOCKET_URL` is correctly set
- On Vercel, it should be empty (uses `/api/socket` by default)
- On local, use `http://localhost:3000` (not 8080)

### "Collaboration not working"
1. Verify WebSocket support: Check browser DevTools → Network → WS
2. Check Vercel logs: `vercel logs`
3. Ensure `pages/api/socket.ts` exists and has no errors

### "Typing indicators don't show"
- This is expected on first page load
- They activate after the first document change

## Performance

- Document sync is optimized for real-time updates
- Inactive rooms are cleaned up automatically when all users disconnect
- Supports unlimited concurrent collaborations

## Notes

- Document state is stored in memory on each Vercel instance
- For production use with load balancing, implement Redis for shared state
- Collaboration survives page refreshes for 5+ minutes
