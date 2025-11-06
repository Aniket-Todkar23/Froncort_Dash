# Froncort

A modern, real-time collaborative document editor built with Next.js and WebSocket technology. Create, edit, and collaborate on documents seamlessly with instant synchronization and live user presence.

## Overview

Froncort is a full-stack web application that enables multiple users to edit documents simultaneously in real-time. The platform combines a responsive React frontend with a Node.js backend for seamless collaboration, powered by Supabase for authentication and data persistence.

## Features

✨ **Real-Time Collaboration**
- Live document editing with multiple simultaneous users
- Real-time cursor tracking and typing indicators
- Instant content synchronization using Socket.io
- Active user presence tracking with color-coded indicators

🎨 **Rich Text Editing**
- Full-featured rich text editor powered by Tiptap
- Support for bold, italic, code blocks, links, and images
- Markdown-compatible formatting
- Customizable styling and text manipulation

🔐 **Secure Authentication**
- User authentication via Supabase Auth
- JWT-based session management
- Row-level security (RLS) on database tables
- Secure credential management

📱 **Responsive Design**
- Mobile-friendly UI built with Tailwind CSS
- Dark/light theme support
- Accessible components using Radix UI primitives
- Optimized for all device sizes

🚀 **High Performance**
- Built with Next.js 14 App Router
- WebSocket and Socket.io for real-time messaging
- Efficient state management with Zustand
- Server-side rendering and static generation

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Next.js | 14.0.0 |
| **UI Library** | React | 18.2.0 |
| **Language** | TypeScript | 5.2.0 |
| **Styling** | Tailwind CSS | 3.3.0 |
| **UI Components** | Radix UI | Latest |
| **Rich Text Editor** | Tiptap | 2.1.0 |
| **Real-time Communication** | Socket.io | 4.8.1 |
| **WebSocket** | ws | 8.18.3 |
| **Backend** | Node.js | 18+ |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth | Latest |
| **State Management** | Zustand | 4.4.0 |
| **HTTP Client** | Axios | 1.6.0 |

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** for version control
- **Supabase Account** (free at https://supabase.com)

## Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd froncort
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Socket Server Configuration (Local Development)
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:8080
```

### 4. Supabase Setup

1. Create a new project on [Supabase Console](https://app.supabase.com)
2. Navigate to **Project Settings → API**
3. Copy and paste:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Start Development

**Option A: Frontend only**
```bash
npm run dev
```

**Option B: Frontend + Socket Server (Recommended)**
```bash
npm run dev:all
```

The application will run at:
- **Frontend**: http://localhost:3000
- **Socket Server**: http://localhost:8080

## Available Scripts

```bash
# Start development server (frontend only)
npm run dev

# Start Socket.io collaboration server
npm run server

# Start both frontend and server concurrently
npm run dev:all

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npm run typecheck
```

## Project Structure

```
froncort/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Main application
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Reusable components
│   ├── editor/              # Editor-related components
│   ├── ui/                  # Radix UI components
│   ├── auth/                # Authentication components
│   └── ...
├── lib/                     # Utility functions
│   ├── supabase.ts         # Supabase client
│   ├── utils.ts            # Helper functions
│   └── ...
├── server/                  # Backend servers
│   ├── socket-server.js    # Socket.io server
│   └── collaboration-server.js # WebSocket server
├── styles/                  # Global styles
├── public/                  # Static assets
├── .env.example            # Environment template
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## How We Deployed This Project

### Frontend Deployment

**Platform**: Vercel

The Next.js frontend is deployed on Vercel for optimal performance and seamless Next.js integration.

**Deployment Details**:
- Repository: Connected via GitHub
- Build Command: `npm run build`
- Start Command: `npm start`
- Node Version: 18.x

**Environment Variables** (set in Vercel Dashboard):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=https://froncort.vercel.app (or your custom domain)
NEXT_PUBLIC_SOCKET_SERVER_URL=https://froncort-dash.onrender.com
```

### Socket Server Deployment

**Platform**: Render

The Socket.io server is deployed on Render for WebSocket support and real-time collaboration.

**Deployment Details**:
- Service Type: Web Service
- Build Command: `npm install`
- Start Command: `node server/socket-server.js`
- Node Version: 18.x
- Environment: `PORT=8080` (Render assigns port dynamically)

**Environment Variables** (set in Render Dashboard):
```
PORT=8080
HOST=0.0.0.0
```

### Database Deployment

**Platform**: Supabase Cloud

The PostgreSQL database is hosted on Supabase, providing:
- Automatic backups
- Row-level security (RLS) policies
- Real-time subscriptions
- RESTful API generation
- Built-in authentication

**Deployment Details**:
- Region: Selected during project creation
- Backup frequency: Automatic daily
- SSL/TLS: Enabled by default

### Production Deployment Flow

```
GitHub Repository
    ↓
Vercel (Frontend) ←→ Render (Socket Server) → Supabase (Database)
    ↓
https://froncort.vercel.app
```

**URL Structure**:
- Frontend: `https://froncort.vercel.app`
- Socket Server: `https://froncort-dash.onrender.com`
- Database: Supabase Project URL

## Real-Time Communication Architecture

### Socket.io Events

**Client → Server Events**:

| Event | Payload |
|-------|---------|
| `join-collaboration` | `{ pageId, projectId, userId, userName, userEmail }` |
| `document-change` | `{ pageId, projectId, userId, content, version }` |
| `disconnect` | (automatic) |

**Server → Client Events**:

| Event | Payload |
|-------|---------|
| `document-state` | `{ content, version, activeUsers }` |
| `user-joined` | `{ userId, userName, activeUsers }` |
| `document-change` | `{ content, version, userId, timestamp }` |
| `user-left` | `{ userId, userName, activeUsers }` |

### Connection Flow

1. User authenticates via Supabase Auth
2. Frontend establishes Socket.io connection to Render server
3. User joins collaboration room by emitting `join-collaboration`
4. Server broadcasts `user-joined` event to room
5. Real-time events sync document changes across clients
6. On disconnect, server broadcasts `user-left` event

## Building for Production

### Local Build Test

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Optimization Checklist

- ✅ Type checking: `npm run typecheck`
- ✅ Linting: `npm run lint`
- ✅ Build verification: `npm run build`
- ✅ Environment variables configured
- ✅ API endpoints updated for production URLs

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Supabase project created and credentials added
- [ ] Frontend and backend repository prepared
- [ ] Vercel and Render accounts created
- [ ] GitHub repositories connected
- [ ] Build and start commands verified
- [ ] CORS settings configured for Socket.io
- [ ] SSL certificates verified (auto-handled by providers)

## Configuration

### Supabase Configuration

1. Create user authentication table
2. Set up Row-Level Security (RLS) policies
3. Configure API routes for real-time data
4. Enable JWT authentication

### Socket.io Configuration

Located in `server/socket-server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});
```

### Next.js Configuration

Configured in `next.config.js`:
- Image optimization for remote domains
- React strict mode enabled
- SWC minification enabled

## Monitoring & Performance

### What We Monitor

- **Frontend Performance**: Vercel Analytics provides real-time metrics
- **Real-time Events**: Socket.io connection count and message throughput
- **Database Queries**: Supabase dashboard shows query performance
- **Server Health**: Render provides uptime monitoring

### Key Metrics

- Page load time (target: < 2 seconds)
- Time to Interactive (TTI): < 3 seconds
- WebSocket latency: < 100ms
- Database query time: < 50ms

## Troubleshooting

### Socket Connection Issues in Production

**Issue**: WebSocket connection fails
**Solution**: Verify `NEXT_PUBLIC_SOCKET_SERVER_URL` matches Render deployment URL

### Supabase Authentication Issues

**Issue**: Login fails in production
**Solution**: Check Supabase project URL and API keys in environment variables

### CORS Errors

**Issue**: Cross-origin requests blocked
**Solution**: Verify Socket.io CORS settings and frontend origin URL

## Codebase Quality

- **Language**: TypeScript for type safety
- **Code Style**: ESLint configured and enforced
- **Component Structure**: Modular and reusable components
- **State Management**: Zustand for global state
- **Real-time**: Socket.io for WebSocket communication

## Key Implementation Details

### Collaboration Room Management

Document states are stored per room (`projectId:pageId`) on the Socket server:

```javascript
const documentStates = new Map();
const roomId = `${projectId}:${pageId}`;
documentStates.set(roomId, {
  content: '',
  version: 0,
  activeUsers: new Map(),
});
```

### User Presence Tracking

Active users tracked in real-time with color assignments for visual identification.

### Conflict Resolution

Document version tracking prevents conflicts in simultaneous edits with operational transformation.

## Performance Optimizations

- Next.js image optimization
- Code splitting and lazy loading
- WebSocket polling fallback for compatibility
- Efficient state updates with Zustand
- Database query optimization with indexes

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Socket.io Documentation**: https://socket.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

## Version History

### v0.1.0 (Current)
- Real-time collaborative editing with Socket.io
- Rich text editor with Tiptap
- Supabase authentication and database
- User presence tracking
- Responsive design with Tailwind CSS
- Deployed on Vercel, Render, and Supabase

---

**Project Status**: ✅ In Production

**Last Updated**: November 2025
