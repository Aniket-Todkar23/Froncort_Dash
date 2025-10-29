# Froncort - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### 3. Login with Test Credentials

**User 1:**
- Email: `alice@example.com`
- Password: `alice123`

**User 2:**
- Email: `bob@example.com`
- Password: `bob123`

---

## 📦 Dependencies Installed

### Core Framework
- **Next.js 14** - React framework with file-based routing
- **React 18** - UI library
- **TypeScript** - Static typing for JavaScript

### State Management
- **Zustand** - Lightweight state management
- **Sonner** - Toast notifications

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built, accessible components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

### Editor & Collaboration
- **Tiptap** - Rich text editor (v2.1.0)
- **@tiptap/starter-kit** - Tiptap extensions
- **@tiptap/extension-mention** - @mentions support
- **@tiptap/extension-link** - Link support
- **@tiptap/extension-image** - Image support
- **Yjs** - Collaborative editing framework
- **y-websocket** - WebSocket provider for Yjs

### Drag & Drop
- **@dnd-kit/core** - Drag and drop library
- **@dnd-kit/sortable** - Sortable functionality
- **@dnd-kit/utilities** - Helper utilities

### Database & Backend
- **Supabase** - PostgreSQL + authentication
  - @supabase/supabase-js (v2.38.0)
  - @supabase/ssr (v0.0.10)

### WebSocket
- **Socket.io** - Real-time communication
- **ws** - WebSocket library

### Export & Document Utilities
- **html2pdf.js** - Export to PDF
- **docx** - Generate Word documents
- **Mammoth** - Word document parsing

### Utilities
- **date-fns** - Date formatting and manipulation
- **axios** - HTTP client
- **class-variance-authority** - CSS utility merging
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes

### Animation
- **Lottie React** - Lottie animations
- **@lottiefiles/dotlottie-react** - DotLottie support

### Theme
- **next-themes** - Dark/light mode support

---

## 🎯 Available Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000

# Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking

# Collaboration Server (Optional)
npm run server          # Start collaboration server
npm run dev:all         # Run dev server + collaboration server concurrently

# Database Seeding (Optional)
npm run seed            # Seed database with sample data
```

---

## 🔧 Environment Setup (Optional)

Create a `.env.local` file if using Supabase:

```env
# Supabase (optional for real-time features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
COLLABORATION_SERVER_URL=http://localhost:8080
COLLABORATION_SERVER_PORT=8080
```

---

## 📁 Project Structure

```
froncort/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard layout
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── editor/             # Tiptap editor components
│   ├── navigation/         # Sidebar, header, etc.
│   ├── Loaders/            # Loading states
│   ├── ui/                 # shadcn/ui components
│   └── providers/          # Context providers
├── hooks/                  # Custom React hooks
├── lib/
│   ├── stores/            # Zustand state stores
│   ├── supabase/          # Supabase client & schema
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── constants/         # Seed data
├── pages/
│   └── api/               # API routes
├── public/                # Static assets
└── scripts/               # Build scripts
```

---

## ✨ Features

### Implemented
- ✅ Authentication (Mock)
- ✅ Dashboard with project overview
- ✅ Dark/Light theme toggle
- ✅ Responsive sidebar navigation
- ✅ Role-based permissions (Owner, Admin, Editor, Viewer)
- ✅ Project management
- ✅ Real-time state management with Zustand

### In Progress
- 🔄 Collaborative editor with Tiptap
- 🔄 Kanban board with drag-and-drop
- 🔄 Version control system
- 🔄 Activity feed

---

## 🔐 Test Credentials

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | alice123 | Admin |
| bob@example.com | bob123 | Editor |

---

## 💡 Development Tips

1. **Type Safety**: Run `npm run typecheck` frequently to catch errors
2. **Code Quality**: Run `npm run lint` before committing
3. **Dark Mode**: Toggle with moon icon in header
4. **Responsive**: Test on mobile with browser DevTools
5. **Hot Reload**: Changes auto-reload; if not working, restart dev server

---

## 🚨 Troubleshooting

### Port 3000 in use?
```powershell
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

### Module not found?
```bash
rm -r node_modules .next
npm install
npm run dev
```

### TypeScript errors?
```bash
npm run typecheck
```

---

## 📞 Support

Refer to official documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [Tiptap Docs](https://tiptap.dev)
- [dnd-kit Docs](https://docs.dndkit.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
