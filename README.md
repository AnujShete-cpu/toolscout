# ToolScout — AI Tools Directory

The intent-first AI tools directory. 200+ curated AI tools, fully static, zero backend.

## ⚡ Quick Start (Local)

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🚀 Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
npm install
vercel
```

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite** (auto-detected)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click **Deploy** ✅

No environment variables needed.

## 🏗️ Tech Stack

- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS v3**
- **React Router v6**
- **localStorage** for bookmarks + reviews (no database needed)

## 📁 What Was Removed vs Original

| Original | This Version |
|----------|-------------|
| Firebase Auth (login wall) | Removed — site is fully open |
| Firestore database | localStorage for reviews/bookmarks |
| Admin page | Removed |
| Gemini AI service | Removed |
| Express server + API routes | Removed |

All 200+ tools, all pages, and 100% of the UI are identical.
