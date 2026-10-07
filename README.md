# CUT/ROOM — Video Editing Portfolio (MERN)

Modern dark-mode portfolio for a video editor (short-form TikTok/Reels/Shorts + long-form YouTube/documentaries) with a full **JWT-protected admin dashboard**. Built with MongoDB, Express, React (Vite) and Node.js.

## ✨ Features

**Public site**

- Hero with video banner background + **custom play controls** (play/pause, scrubber, mute, timecode) and CTA buttons (*View Work*, *Hire Me*, *Download CV*)
- Interactive **JourneyTimeline** — career milestones, animated key-stat counters (views, projects, retention boost) and skill bars
- **PortfolioGrid** loaded live from MongoDB with filter tabs `All / Short-form / Long-form / VFX & Motion Graphics`, platform tags (YouTube, TikTok, Instagram, Vimeo), durations, hover video previews
- **ProjectModal** “Watch full video” player — React Player for YouTube/Vimeo/MP4, platform iframes for TikTok/Instagram/X, custom `embedCode` support
- **CV section** — digital résumé layout, interactive PDF viewer and a download button served by the API
- **Contact form** → `POST /api/contact` (stored in Mongo + optional Nodemailer SMTP), plus social links
- Fully responsive, Framer Motion animations, Lucide icons

**Admin dashboard** (`/admin`)

- Login with **JWT + bcrypt** (`protect` middleware guards every write route)
- Project CRUD: paste a link → **auto-parse** platform, embed code and thumbnail (oEmbed), manual fields (title, category, platform, description, thumbnail URL/upload, featured, order, tags, published)
- **Drag-and-drop re-ordering** with persisted order
- CV PDF upload / replace / delete (local storage by default, Cloudinary when configured)
- Message inbox (read/unread, reply, delete) and stats overview

## 🛠️ Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Lucide, React Player, React Router |
| Backend | Node.js + Express, Multer, Nodemailer, JWT, bcryptjs |
| Database | MongoDB (Mongoose) — `User`, `Project`, `Message`, `Setting` |
| Media | Direct social embeds, local `/uploads`, optional Cloudinary |

## 🚀 Getting started

```bash
npm run install:all      # installs root + server + client deps
cp server/.env.example server/.env   # then edit values
npm run dev              # API :5000  +  Web :5173
```

Optional helpers:

```bash
npm --prefix server run test   # 24 integration checks against a running API
node server/scripts/generate-sample-cv.mjs   # rebuild the demo CV PDF, then upload it from Dashboard → CV
```

> No MongoDB running? Leave `MONGODB_URI` empty and the API boots an **in-memory MongoDB** automatically (dev only).

Default admin (change in `server/.env`):

```
admin@portfolio.dev / ChangeMe123!
```

## 📡 API reference

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Health check |
| POST | `/api/auth/login` | – | Login → JWT |
| GET | `/api/auth/me` | JWT | Current user |
| PUT | `/api/auth/password` | JWT | Change password |
| GET | `/api/projects` | – | Public list (`?category=&featured=&q=`) |
| GET | `/api/projects/admin/all` | JWT | All incl. drafts |
| GET | `/api/projects/:id` | – | Single project |
| POST | `/api/projects/parse-link` | JWT | **Embed parser** — platform/embed/thumbnail |
| POST | `/api/projects` | JWT | Create (multipart `thumbnail` optional) |
| PUT | `/api/projects/:id` | JWT | Update |
| DELETE | `/api/projects/:id` | JWT | Delete |
| PATCH | `/api/projects/reorder` | JWT | `{ ids: [...] }` |
| POST | `/api/projects/thumbnail` | JWT | Image upload |
| GET | `/api/cv` · `/api/cv/file` · `/api/cv/download` | – | CV meta / view / download |
| POST · DELETE | `/api/cv` | JWT | Upload (PDF) / remove |
| POST | `/api/contact` | – | Contact form |
| GET · PATCH · DELETE | `/api/contact[/:id]` | JWT | Inbox management |
| GET | `/api/stats` | JWT | Dashboard stats |

## 🔌 Supported embed sources

`server/src/utils/embedParser.js` recognises:

- **YouTube** — `watch?v=`, `youtu.be`, `/shorts/`, `/embed/`, `/live/` → `youtube-nocookie` player + `i.ytimg.com` thumbnail
- **Vimeo** — `vimeo.com/123`, `player.vimeo.com` → Vimeo player
- **TikTok** — `@user/video/123` → `tiktok.com/embed/v2/123`
- **Instagram** — `/p/`, `/reel/`, `/reels/`, `/tv/` → embedded post
- **X / Twitter** — `status/123` → platform embed
- **Direct files** — `.mp4 .webm .mov …` → HTML5 `<video>` via React Player

oEmbed lookups (title/author/thumbnail) are best-effort with a 6s timeout and never block saving.

## 📁 Structure

```
server/src
├── config/db.js            # Mongo connect + in-memory fallback
├── models/                 # User, Project, Message, Setting
├── controllers/            # auth, project, cv, contact
├── middleware/             # auth (JWT), upload (multer), errors
├── routes/                 # /api/auth /api/projects /api/cv /api/contact /api/stats
├── utils/embedParser.js    # social link → embed + metadata
├── scripts/generate-sample-cv.mjs  # valid 1-page demo CV (PDF)
├── test/api.test.mjs       # integration tests (npm run test)
└── seed.js                 # admin user + 8 sample projects
client/src
├── components/             # Navbar, Hero, JourneyTimeline, PortfolioGrid, ProjectModal, CVSection, ContactSection, Footer
├── pages/                  # Home, AdminLogin, AdminDashboard
├── context/AuthContext.jsx
└── lib/api.js
```

## 🔐 Environment

See [server/.env.example](server/.env.example) — JWT secret, admin credentials, SMTP (Nodemailer), Cloudinary URL, CORS origin.

> ⚠️ Change `JWT_SECRET`, `ADMIN_PASSWORD` and the seed/demo credentials before deploying.
kidus-editor
