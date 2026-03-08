# FaceSmash Infrastructure & Architecture

> Last updated: March 8, 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Repositories](#2-repositories)
   - [2.1 Main App + Docs Monorepo](#21-main-app--docs-monorepo-ever-justfacesmashapp)
   - [2.2 Developer Portal](#22-developer-portal-ever-justfacesmash-dev-portal)
   - [2.3 API Gateway (in development)](#23-api-gateway-facesmash-api--in-development)
   - [2.4 Inactive / Legacy Directories](#24-inactive--legacy-directories)
3. [Services & Subdomains](#3-services--subdomains)
4. [Main App — facesmash.app](#4-main-app--facesmashapp)
5. [Documentation Site — docs.facesmash.app](#5-documentation-site--docsfacesmashapp)
6. [Developer Portal — developers.facesmash.app](#6-developer-portal--developersfacesmashapp)
7. [PocketBase API — api.facesmash.app](#7-pocketbase-api--apifacesmashapp)
8. [DNS & Domain Configuration](#8-dns--domain-configuration)
9. [Hosting & Deployment](#9-hosting--deployment)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Third-Party Services & Extensions](#11-third-party-services--extensions)
12. [Face Recognition Pipeline](#12-face-recognition-pipeline)
13. [Authentication Flows](#13-authentication-flows)
14. [Database Schemas](#14-database-schemas)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Security Notes](#16-security-notes)
17. [Local Development](#17-local-development)

---

## 1. System Overview

FaceSmash is a passwordless facial recognition authentication platform. The system is composed of four independently deployed services:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         facesmash.app                                │
│                    (GoDaddy domain, NS → domaincontrol.com)         │
├──────────────────┬──────────────────┬───────────────┬───────────────┤
│  facesmash.app   │docs.facesmash.app│developers.    │api.facesmash  │
│  (Main App)      │(Docs Site)       │facesmash.app  │.app (API)     │
│                  │                  │(Dev Portal)   │               │
│  Netlify         │Netlify           │Netlify        │DigitalOcean   │
│  React + Vite    │Next.js + Fumadocs│Next.js 15     │PocketBase     │
│  SPA             │Static Export     │SSR + PPR      │+ Caddy        │
└──────────────────┴──────────────────┴───────────────┴───────────────┘
```

---

## 2. Repositories

### Overview

| # | Repo | GitHub | Local Path | Status |
|---|---|---|---|---|
| 1 | **Main App + Docs** (monorepo) | `ever-just/facesmash.app` | `face-login-gateway/` | Active, deployed |
| 2 | **Developer Portal** | `ever-just/facesmash-dev-portal` (private) | `facesmash-dev-portal/` | Active, deployed |
| 3 | **API Gateway** | No GitHub repo yet | `facesmash-api/` | In development, not deployed |
| 4 | **Main App (backup)** | — | `face-login-gateway.old/` | Stale copy, not used |
| 5 | **FaceCard v1 (archived)** | — | `facecard-v1-16-2f3a0ede/` | Empty/abandoned predecessor |

> All local paths are relative to `/Users/cloudaistudio/Documents/EVERJUST PROJECTS/`.

### Git Notes

- GitHub auth uses keyring credentials for `ever-just` (not token-based).
- **Always run `unset GITHUB_TOKEN`** before any `git push` or `gh` command — the env var contains an invalid token that will cause auth failures.
- The main repo was originally named `face-login-gateway` and was renamed to `facesmash.app` on GitHub. The local directory still uses the old name.
- Homebrew git (`/opt/homebrew/bin/git` v2.53.0) is preferred over Apple git (`/usr/bin/git` v2.50.1).

---

### 2.1 Main App + Docs Monorepo (`ever-just/facesmash.app`)

**Purpose**: Contains the end-user-facing FaceSmash web app AND the documentation site in a single repo.

**GitHub**: https://github.com/ever-just/facesmash.app  
**Branch**: `main`  
**Local**: `/Users/cloudaistudio/Documents/EVERJUST PROJECTS/face-login-gateway/`

#### Top-Level Structure

```
face-login-gateway/
├── INFRASTRUCTURE.md          ← This file
├── README.md                  ← Project readme
├── index.html                 ← Vite SPA entry point
├── netlify.toml               ← Netlify deploy config for main app
├── package.json               ← npm dependencies (React, face-api, PocketBase, etc.)
├── vite.config.ts             ← Vite build config (React SWC, port 8080)
├── tailwind.config.ts         ← TailwindCSS configuration
├── tsconfig.json              ← TypeScript config
├── components.json            ← shadcn/ui component config
├── public/                    ← Static assets served at root
│   ├── facesmash-logo.png     ← Official logo
│   ├── facesmash-wordmark.png ← Wordmark logo
│   ├── landing-promo.mp4      ← Promo video for landing page
│   ├── facesmash-promo.mp4    ← Secondary promo video
│   ├── og-image.png           ← Open Graph social image
│   ├── favicon.svg            ← Favicon
│   ├── apple-touch-icon.png   ← iOS icon
│   ├── sitemap.xml            ← SEO sitemap
│   ├── robots.txt             ← Search engine directives
│   ├── llms.txt               ← LLM-readable site summary
│   ├── llms-full.txt          ← LLM-readable full content
│   ├── .well-known/           ← AI plugin manifest + OpenAPI spec
│   └── models/                ← (README only; models loaded from CDN)
├── src/                       ← React application source
│   ├── main.tsx               ← App entry point
│   ├── App.tsx                ← Router, providers, routes
│   ├── index.css              ← Global styles + Tailwind imports
│   ├── pages/                 ← Route-level page components
│   ├── components/            ← Shared UI components
│   ├── contexts/              ← React contexts
│   ├── hooks/                 ← Custom React hooks
│   ├── services/              ← Business logic (PocketBase CRUD)
│   ├── utils/                 ← Face recognition + utility functions
│   ├── integrations/          ← External service clients
│   ├── types/                 ← TypeScript type definitions
│   └── lib/                   ← Utility (cn helper)
└── docs/                      ← Documentation site (separate Next.js app)
    ├── netlify.toml           ← Netlify deploy config for docs site
    ├── package.json           ← Docs-specific dependencies (Fumadocs, Next.js 16)
    ├── next.config.mjs        ← Next.js config (static export)
    ├── source.config.ts       ← Fumadocs MDX config
    ├── content/docs/          ← MDX documentation content
    └── src/                   ← Docs site source (layouts, components)
```

#### `src/pages/` — Route Components

| File | Route | Purpose |
|---|---|---|
| `Index.tsx` | `/` | Landing page (hero, features, ecosystem, FAQ, mega-menu nav) |
| `Register.tsx` | `/register` | Face registration flow (webcam → capture → store) |
| `Login.tsx` | `/login` | Face login flow (webcam → match → authenticate) |
| `Dashboard.tsx` | `/dashboard` | User dashboard (after login) |
| `Status.tsx` | `/status` | System status page (API health, uptime metrics) |
| `Privacy.tsx` | `/privacy` | Privacy policy |
| `Terms.tsx` | `/terms` | Terms of service |
| `NotFound.tsx` | `*` | 404 page |

#### `src/components/` — Key Components

| File | Purpose |
|---|---|
| `GlobalLoadingScreen.tsx` | Full-screen overlay while face-api models load (~12.5 MB) |
| `StatusIndicator.tsx` | Live green/red dot in footer pinging API health |
| `AnnouncementBanner.tsx` | Dismissible top banner (localStorage-persisted) |
| `CookieConsentBanner.tsx` | Cookie consent UI |
| `SEOHead.tsx` | SEO metadata via react-helmet-async |
| `AutoFaceDetection.tsx` | Automatic face capture component (webcam + detection loop) |
| `dashboard/` | Dashboard sub-components (settings, security, feedback) |
| `ui/` | shadcn/ui primitives (40+ components: button, dialog, toast, etc.) |

#### `src/services/` — PocketBase Data Layer

| File | Purpose |
|---|---|
| `userProfileService.ts` | CRUD for `user_profiles` collection |
| `faceTemplateService.ts` | CRUD for `face_templates` collection |
| `faceScanService.ts` | Create `face_scans` audit entries |
| `signInLogService.ts` | Create `sign_in_logs` entries |
| `learningService.ts` | Adaptive template learning (updates embeddings on successful logins) |

#### `src/utils/` — Face Recognition Core

| File | Purpose |
|---|---|
| `faceRecognition.ts` | Model initialization, SSD/Tiny detection options, `extractFaceDescriptor()` |
| `enhancedFaceRecognition.ts` | `analyzeFaceQuality()`, `enhancedMatch()`, `multiTemplateMatch()` |
| `livenessDetection.ts` | Anti-spoofing: eye aspect ratio, head pose, quality checks |
| `storageTest.ts` | Browser storage capability detection |

#### `src/hooks/` — Custom Hooks

| File | Purpose |
|---|---|
| `useFaceTracking.ts` | Real-time face detection loop (300ms interval, SSD primary, busy guard) |
| `useLoginLogic.ts` | Login orchestration (capture → match → redirect) |
| `useCurrentUser.ts` | Current authenticated user state |
| `useSignOut.ts` | Sign-out logic |
| `useUserSettings.ts` | User preferences |

#### `src/contexts/` — React Contexts

| File | Purpose |
|---|---|
| `FaceAPIContext.tsx` | Manages face-api.js model loading state (`isLoading`, `loadProgress`, `error`) |
| `AuthContext.tsx` | Authentication state (current user, login/logout) |

#### `docs/content/docs/` — Documentation Content

```
docs/content/docs/
├── index.mdx                       ← Introduction (what is FaceSmash, architecture, SDK overview)
├── quickstart.mdx                  ← 5-minute quickstart guide
├── meta.json                       ← Top-level sidebar navigation order
├── sdk/
│   ├── index.mdx                   ← SDK overview (architecture, neural networks, exports)
│   ├── react-components.mdx        ← <FaceSmashProvider>, <FaceLogin>, <FaceRegister>, hooks
│   ├── vanilla-js.mdx              ← FaceSmashClient API, event system, Vue/Svelte/Angular
│   ├── configuration.mdx           ← Every option, threshold tuning, self-hosting
│   └── meta.json
├── api-reference/
│   ├── index.mdx                   ← API overview
│   ├── authentication.mdx          ← Auth endpoints
│   ├── faces.mdx                   ← Face detection/matching endpoints
│   ├── users.mdx                   ← User management endpoints
│   ├── webhooks.mdx                ← Webhook events
│   └── meta.json
├── guides/
│   ├── index.mdx                   ← Guides overview
│   ├── react-integration.mdx       ← Step-by-step React setup
│   ├── custom-ui.mdx               ← Build custom face login UI
│   ├── improving-accuracy.mdx      ← Threshold tuning, lighting, multi-template
│   ├── developer-portal.mdx        ← Developer Portal guide (NEW)
│   └── meta.json
└── security/
    ├── index.mdx                   ← Security overview
    ├── biometric-data.mdx          ← How biometric data is handled
    ├── compliance.mdx              ← Compliance & regulatory
    └── meta.json
```

#### `docs/src/` — Docs Site Source

```
docs/src/
├── app/
│   ├── layout.tsx                  ← Root layout (Fumadocs RootProvider, Banner, Inter font)
│   ├── global.css                  ← Global styles
│   ├── (home)/
│   │   ├── layout.tsx              ← Home page layout
│   │   └── page.tsx                ← Docs landing page
│   └── docs/
│       ├── layout.tsx              ← Docs sidebar layout
│       └── [[...slug]]/page.tsx    ← Dynamic MDX page renderer
├── components/ai/
│   └── page-actions.tsx            ← AI-related page actions
├── lib/
│   ├── layout.shared.tsx           ← Nav config (links to Docs, SDK, API, Guides, Portal, App, npm, GitHub)
│   ├── source.ts                   ← Fumadocs content source loader
│   └── cn.ts                       ← Tailwind class merge utility
└── mdx-components.tsx              ← Custom MDX component overrides
```

---

### 2.2 Developer Portal (`ever-just/facesmash-dev-portal`)

**Purpose**: Developer-facing dashboard for managing API keys, applications, billing, and usage analytics. This is where developers sign up and get credentials to integrate FaceSmash into their apps.

**GitHub**: https://github.com/ever-just/facesmash-dev-portal (private)  
**Branch**: `main`  
**Local**: `/Users/cloudaistudio/Documents/EVERJUST PROJECTS/facesmash-dev-portal/`  
**Forked from**: `nextjs/saas-starter` template (remote updated to own repo)

#### Structure

```
facesmash-dev-portal/
├── .env                        ← Environment variables (GITIGNORED — contains secrets)
├── .env.example                ← Template for .env
├── netlify.toml                ← Netlify deploy config (pnpm, @netlify/plugin-nextjs)
├── package.json                ← pnpm dependencies
├── next.config.ts              ← Next.js config (PPR, clientSegmentCache)
├── middleware.ts                ← Auth middleware (JWT session refresh, route protection)
├── drizzle.config.ts           ← Drizzle ORM config (PostgreSQL)
├── components.json             ← shadcn/ui config
├── public/
│   └── facesmash-logo.png      ← Official logo (copied from main app)
├── app/
│   ├── layout.tsx              ← Root layout (Manrope font, SWR provider)
│   ├── globals.css             ← Global styles
│   ├── not-found.tsx           ← 404 page
│   ├── (login)/                ← Auth routes (sign-in, sign-up)
│   │   ├── actions.ts          ← Server actions (signIn, signUp, signOut)
│   │   ├── login.tsx           ← Shared login/signup form component
│   │   ├── sign-in/page.tsx    ← Sign in page
│   │   └── sign-up/page.tsx    ← Sign up page
│   ├── (dashboard)/            ← Dashboard routes
│   │   ├── layout.tsx          ← Dashboard header (logo, Docs/App/GitHub links, user menu)
│   │   ├── page.tsx            ← Landing page (hero, features, ecosystem, promo video)
│   │   ├── pricing/page.tsx    ← Stripe pricing page
│   │   └── dashboard/          ← Authenticated dashboard
│   │       ├── layout.tsx      ← Sidebar nav (Overview, Apps, Keys, Usage, Billing, etc.)
│   │       ├── page.tsx        ← Dashboard index (redirects to overview)
│   │       ├── overview/       ← Welcome + quick actions + docs links
│   │       ├── apps/           ← Application registry (CRUD)
│   │       ├── keys/           ← API key management (via Unkey)
│   │       ├── usage/          ← Usage analytics
│   │       ├── billing/        ← Stripe subscription management
│   │       ├── general/        ← Team settings (name, members)
│   │       ├── activity/       ← Activity audit log
│   │       └── security/       ← Security settings
│   └── api/                    ← API routes
│       ├── user/route.ts       ← GET current user
│       ├── team/route.ts       ← GET current team
│       ├── apps/route.ts       ← GET/POST applications
│       ├── keys/route.ts       ← GET/POST API keys (delegates to Unkey)
│       ├── usage/route.ts      ← GET usage stats
│       └── stripe/
│           ├── checkout/route.ts  ← Stripe checkout session handler
│           └── webhook/route.ts   ← Stripe webhook handler
├── components/ui/              ← shadcn/ui primitives (avatar, button, card, dropdown, input, label, radio-group)
├── lib/
│   ├── auth/
│   │   ├── session.ts          ← JWT sign/verify, password hash/compare, cookie management
│   │   └── middleware.ts       ← Auth helper middleware
│   ├── db/
│   │   ├── drizzle.ts          ← Drizzle DB client
│   │   ├── schema.ts           ← All table definitions (users, teams, team_members, etc.)
│   │   ├── queries.ts          ← Database query functions
│   │   ├── seed.ts             ← Seed script (admin user + default team)
│   │   ├── setup.ts            ← DB setup script
│   │   └── migrations/         ← Drizzle migration files
│   ├── payments/
│   │   ├── stripe.ts           ← Stripe client, checkout, portal, webhook handlers
│   │   └── actions.ts          ← Payment server actions
│   ├── apps/
│   │   └── actions.ts          ← App CRUD server actions
│   ├── keys/
│   │   └── actions.ts          ← API key server actions (create/revoke via Unkey)
│   ├── unkey.ts                ← Unkey client initialization
│   └── utils.ts                ← Utility functions
└── tsconfig.json
```

---

### 2.3 API Gateway (`facesmash-api`) — IN DEVELOPMENT

**Purpose**: Public REST API gateway that sits in front of PocketBase. Provides authenticated API access for third-party developers with rate limiting, usage metering, and structured responses. This is what developers hit when they use the `@facesmash/sdk`.

**GitHub**: Not yet pushed (no `.git` directory)  
**Local**: `/Users/cloudaistudio/Documents/EVERJUST PROJECTS/facesmash-api/`  
**Status**: Code written, not deployed

#### Stack

- **Framework**: Hono ^4.7.0 (lightweight, edge-compatible web framework)
- **Server**: @hono/node-server (Node.js adapter)
- **OpenAPI**: @hono/zod-openapi (auto-generated API docs from Zod schemas)
- **Database**: PocketBase JS SDK ^0.26.8 (proxies to the existing PocketBase instance)
- **Build**: tsup (ESM output with DTS)
- **Runtime**: tsx (dev), Node.js 20+ (production)
- **Container**: Dockerfile (node:22-alpine, multi-stage build, port 3100)

#### Structure

```
facesmash-api/
├── .env.example                ← Env template (PocketBase URL, Stripe keys, rate limits)
├── Dockerfile                  ← Multi-stage Docker build (node:22-alpine → port 3100)
├── package.json                ← Dependencies (hono, pocketbase, zod, nanoid)
├── tsconfig.json
└── src/
    ├── index.ts                ← Hono app setup, route mounting, server start
    ├── config.ts               ← Environment config loader
    ├── types.ts                ← TypeScript types (API responses, requests)
    ├── middleware/
    │   ├── auth.ts             ← API key authentication middleware
    │   ├── rate-limit.ts       ← Per-plan rate limiting
    │   └── request-context.ts  ← Request ID, timing, context injection
    ├── routes/
    │   ├── health.ts           ← GET /health
    │   ├── face.ts             ← POST /v1/face/detect, /match, /register, /login, /analyze
    │   ├── keys.ts             ← POST/GET/DELETE /v1/keys
    │   ├── apps.ts             ← CRUD /v1/apps
    │   └── usage.ts            ← GET /v1/usage, /v1/usage/breakdown
    ├── lib/
    │   ├── pocketbase.ts       ← PocketBase client wrapper
    │   ├── api-keys.ts         ← API key creation, validation, hashing
    │   ├── usage.ts            ← Usage metering and tracking
    │   └── errors.ts           ← Structured error responses
    └── scripts/
        └── setup-collections.ts ← PocketBase collection setup script
```

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | API info |
| GET | `/health` | Public | Health check |
| POST | `/v1/face/detect` | API Key | Detect faces in an image |
| POST | `/v1/face/match` | API Key | Compare two face descriptors |
| POST | `/v1/face/register` | API Key | Register face templates for a user |
| POST | `/v1/face/login` | API Key | Authenticate via face matching |
| POST | `/v1/face/analyze` | API Key | Analyze face (age, gender, quality) |
| POST | `/v1/keys` | API Key | Create a new API key |
| GET | `/v1/keys` | API Key | List your API keys |
| DELETE | `/v1/keys/:id` | API Key | Revoke an API key |
| POST | `/v1/apps` | API Key | Create an application |
| GET | `/v1/apps` | API Key | List your applications |
| GET | `/v1/apps/:id` | API Key | Get application details |
| PATCH | `/v1/apps/:id` | API Key | Update an application |
| DELETE | `/v1/apps/:id` | API Key | Delete an application |
| GET | `/v1/usage` | API Key | Get usage summary |
| GET | `/v1/usage/breakdown` | API Key | Get per-endpoint breakdown |

#### Rate Limits

| Plan | Calls/Month | Apps |
|---|---|---|
| Free | 1,000 | 2 |
| Pro ($29/mo) | 50,000 | 10 |
| Enterprise | Unlimited | 100 |

#### TODO for this repo

- [ ] Create GitHub repo (`ever-just/facesmash-api`)
- [ ] Deploy to DigitalOcean droplet (Docker or systemd service)
- [ ] Wire up to Caddy reverse proxy on a new subdomain or path
- [ ] Connect to Unkey for API key validation
- [ ] Connect to the dev portal for usage reporting

---

### 2.4 Inactive / Legacy Directories

| Directory | Purpose | Status |
|---|---|---|
| `face-login-gateway.old/` | Backup copy of the main app before a major refactor | **Stale** — can be deleted. Contains the old `setup-pocketbase.cjs` that leaked credentials. |
| `facecard-v1-16-2f3a0ede/` | Empty git repo from an earlier prototype (pre-FaceSmash naming) | **Abandoned** — only contains `.git/`. Safe to delete. |

---

## 3. Services & Subdomains

| Subdomain | Purpose | Hosting | Stack |
|---|---|---|---|
| `facesmash.app` | End-user face login/register app | Netlify | React 18, Vite 5, TailwindCSS, framer-motion |
| `docs.facesmash.app` | Developer documentation | Netlify | Next.js 16, Fumadocs, MDX, static export |
| `developers.facesmash.app` | Developer portal (API keys, billing) | Netlify | Next.js 15.6 (canary), Turbopack, PPR, SSR |
| `api.facesmash.app` | REST API (face data, auth, user profiles) | DigitalOcean Droplet | PocketBase (Go binary), Caddy reverse proxy |

---

## 4. Main App — facesmash.app

### Stack

- **Framework**: React 18.3 + React Router DOM 6
- **Build tool**: Vite 5.4 with `@vitejs/plugin-react-swc`
- **Styling**: TailwindCSS 3.4, `tailwindcss-animate`, `tailwind-merge`
- **UI Components**: Radix UI primitives (accordion, dialog, dropdown, tooltip, etc.), shadcn/ui patterns
- **Animations**: framer-motion 12
- **Face Recognition**: `@vladmandic/face-api` ^1.7.15 (TensorFlow.js WebGL backend)
- **API Client**: PocketBase JS SDK ^0.26.8
- **Icons**: lucide-react ^0.462
- **Charts**: recharts ^2.12
- **Forms**: react-hook-form + zod + @hookform/resolvers

### Build & Output

```
Build command:  npm run build  →  vite build
Output dir:     dist/
Dev server:     npm run dev    →  vite (port 8080)
```

### Netlify Config (`netlify.toml`)

- **Build**: `npm run build` → publishes `dist/`
- **SPA fallback**: `/* → /index.html` (200 redirect)
- **Security headers**: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (camera=self)
- **Cache**: JS/CSS immutable (1yr), sitemap/robots (1hr), og-image/favicon immutable
- **SEO files**: `/llms.txt`, `/llms-full.txt`, `/.well-known/*`, `/sitemap.xml`, `/robots.txt`

### Netlify Site

- **Site name**: `facesmash1`
- **Site ID**: `ee5748c1-ab9a-44b0-8dd5-22742c42b4cd`
- **Admin**: https://app.netlify.com/projects/facesmash1
- **Custom domain**: `facesmash.app`
- **Auto-deploy**: NOT connected to GitHub — requires manual `netlify deploy --prod --dir=dist --site=ee5748c1-ab9a-44b0-8dd5-22742c42b4cd`

### Key Files

```
src/
├── pages/           # Route components (Index, Login, Register, Dashboard, Status, Privacy, Terms)
├── components/      # UI components (StatusIndicator, GlobalLoadingScreen, AnnouncementBanner, etc.)
├── contexts/        # FaceAPIContext (manages face-api.js model loading state)
├── integrations/
│   └── pocketbase/
│       └── client.ts    # PocketBase client configured to https://api.facesmash.app
├── services/        # Business logic (faceTemplateService, faceScanService, signInLogService, etc.)
├── utils/           # faceRecognition.ts, enhancedFaceRecognition.ts, livenessDetection.ts
└── hooks/           # useFaceTracking, custom hooks
```

---

## 5. Documentation Site — docs.facesmash.app

### Stack

- **Framework**: Next.js 16.1.6 (React 19)
- **Docs engine**: Fumadocs (fumadocs-core 16.6.10, fumadocs-mdx 14.2.9, fumadocs-ui 16.6.10)
- **Content**: MDX files in `docs/content/docs/`
- **Output**: Static export (`output: 'export'` in next.config.mjs)

### Build & Output

```
Build command:  npm run build  →  next build
Output dir:     out/          (static HTML export)
Dev server:     npm run dev   →  next dev
```

### Content Structure

```
docs/content/docs/
├── index.mdx              # Introduction
├── quickstart.mdx         # 5-minute quickstart
├── meta.json              # Top-level nav order
├── sdk/                   # SDK docs (overview, react-components, vanilla-js, configuration)
├── api-reference/         # REST API docs (authentication, face-detection, user-management, etc.)
├── guides/                # React integration, custom UI, improving accuracy, developer portal
└── security/              # Privacy, threat model, compliance
```

### Netlify Config (`docs/netlify.toml`)

- **Build**: `npm run build` → publishes `out/`
- **Fallback**: `/* → /404.html` (404)
- Docs site is deployed as a **separate Netlify site** with its own custom domain (`docs.facesmash.app`)

### Netlify Site

- **Site name**: `facesmash-docs`
- **Site ID**: `6ee68400-b428-44c9-9807-29f388cce919`
- **Admin**: https://app.netlify.com/projects/facesmash-docs
- **Custom domain**: `docs.facesmash.app` (CNAME → `facesmash-docs.netlify.app`)
- **Auto-deploy**: NOT connected to GitHub — requires manual `npx netlify-cli deploy --prod` from `docs/` dir
- **Search**: Orama (built-in Fumadocs search)

### Nav Links (layout.shared.tsx)

Documentation, SDK, API, Guides, Security, npm (external), Portal (external), App (external), GitHub

---

## 6. Developer Portal — developers.facesmash.app

### Stack

- **Framework**: Next.js 15.6.0-canary.59 (React 19.1, Turbopack)
- **Experimental features**: PPR (Partial Prerendering), clientSegmentCache
- **Package manager**: pnpm
- **Styling**: TailwindCSS 4.1.7, tw-animate-css
- **UI**: Radix UI (via `radix-ui` package), shadcn/ui patterns
- **ORM**: Drizzle ORM ^0.43 with drizzle-kit ^0.31
- **Database**: PostgreSQL (Neon or self-hosted on DigitalOcean droplet)
- **Auth**: Custom JWT sessions (jose ^6.0, bcryptjs ^3.0)
- **Payments**: Stripe ^18.1
- **API Key Management**: Unkey (@unkey/api ^2.3, @unkey/ratelimit ^2.1)
- **Charts**: recharts ^3.8
- **Netlify plugin**: @netlify/plugin-nextjs ^5.15.8

### Build & Output

```
Build command:  pnpm build   →  next build
Output dir:     .next/       (SSR, not static)
Dev server:     pnpm dev     →  next dev --turbopack (port 3000)
```

### Netlify Config (`netlify.toml`)

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Netlify Site

- **Site name**: `facesmash-developers`
- **Site ID**: `31682fc2-cc0f-4bf2-aad5-d9bcbc77eaa3`
- **Admin**: https://app.netlify.com/projects/facesmash-developers
- **Custom domain**: `developers.facesmash.app`

### Database Schema (Drizzle/PostgreSQL)

```
users            — id, name, email, password_hash, role, timestamps
teams            — id, name, stripe_customer_id, stripe_subscription_id, plan_name, subscription_status
team_members     — id, user_id → users, team_id → teams, role, joined_at
activity_logs    — id, team_id → teams, user_id → users, action, timestamp, ip_address
invitations      — id, team_id → teams, email, role, invited_by → users, status
developer_apps   — id, team_id → teams, name, description, allowed_origins, webhook_url, status
```

### Auth Flow

1. User signs up/in with email + password
2. Password hashed with `bcryptjs` (10 salt rounds)
3. JWT session token signed with `jose` (HS256, AUTH_SECRET env var)
4. Token stored as httpOnly secure cookie named `session` (24h expiry)
5. Middleware (`middleware.ts`) protects `/dashboard/*` routes, auto-refreshes session on GET requests

### Dashboard Pages

```
/                          — Landing page (public, hero + features + ecosystem)
/sign-in, /sign-up         — Auth pages
/pricing                   — Stripe plans
/dashboard/overview        — Welcome + quick actions + docs links
/dashboard/apps            — Application registry
/dashboard/keys            — API key management (via Unkey)
/dashboard/usage           — Usage analytics
/dashboard/billing         — Stripe subscription management
/dashboard/general         — Team settings
/dashboard/activity        — Activity log
/dashboard/security        — Security settings
```

---

## 7. PocketBase API — api.facesmash.app

### Server

- **Provider**: DigitalOcean Droplet
- **IP**: `142.93.78.220`
- **OS**: Ubuntu (standard DO droplet)
- **Runtime**: PocketBase (single Go binary)
- **Internal port**: `8096` (PocketBase listens here)
- **Fallback port**: `8097` (HTTP only, legacy)

### Caddy Reverse Proxy

Caddy handles HTTPS termination and reverse proxies to PocketBase:

```
api.facesmash.app {
    # Dynamic CORS — echoes back the requesting origin
    header Access-Control-Allow-Origin "{header.Origin}"
    header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization"
    header Access-Control-Allow-Credentials "true"

    # Preflight
    @options method OPTIONS
    handle @options {
        header Access-Control-Max-Age "86400"
        respond 204
    }

    # Proxy to PocketBase — strip PB's own CORS headers to avoid duplicates
    reverse_proxy 127.0.0.1:8096 {
        header_down -Access-Control-Allow-Origin
        header_down -Access-Control-Allow-Methods
        header_down -Access-Control-Allow-Headers
        header_down -Access-Control-Allow-Credentials
    }
}
```

- **TLS**: Auto HTTPS via Let's Encrypt (Caddy manages cert provisioning and renewal)
- **CORS**: Dynamic origin echo — supports both `https://facesmash.app` (production) and `http://localhost:*` (dev)

### PocketBase Collections

PocketBase stores face authentication data:

- `user_profiles` — name, email, face_embedding (128-D float array)
- `face_templates` — descriptor vectors, quality scores, linked to user_profiles
- `face_scans` — audit log of face detection events
- `sign_in_logs` — login history with match scores and timestamps

### Admin Access

- **Admin panel**: `https://api.facesmash.app/_/`
- **Auth endpoint**: `POST /api/collections/_superusers/auth-with-password`
- Credentials stored separately (not in this doc — see secure credential store)

### Health Endpoint

- `GET https://api.facesmash.app/api/health` — used by StatusIndicator component and /status page

---

## 8. DNS & Domain Configuration

### Registrar

- **Provider**: GoDaddy
- **Domain**: `facesmash.app`
- **Nameservers**: `ns77.domaincontrol.com`, `ns78.domaincontrol.com`

### DNS Records

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `api` | `142.93.78.220` | PocketBase API on DigitalOcean |
| CNAME | `@` | Netlify-managed (`facesmash1.netlify.app`) | Main app |
| CNAME | `docs` | `facesmash-docs.netlify.app` | Docs site |
| CNAME | `developers` | Netlify-managed (`facesmash-developers.netlify.app`) | Dev portal |

> Netlify manages the CNAME/ALIAS records for the three frontend sites. The only A record pointing to the droplet is `api.facesmash.app`.

---

## 9. Hosting & Deployment

### Netlify (3 sites)

| Site | Site Name | Site ID | Publish Dir | Build |
|---|---|---|---|---|
| Main App | `facesmash1` | `ee5748c1-ab9a-44b0-8dd5-22742c42b4cd` | `dist/` | `npm run build` (Vite) |
| Docs | `facesmash-docs` | `6ee68400-b428-44c9-9807-29f388cce919` | `out/` | `npm run build` (Next.js static) |
| Dev Portal | `facesmash-developers` | `31682fc2-cc0f-4bf2-aad5-d9bcbc77eaa3` | `.next/` | `pnpm build` (Next.js SSR) |

### DigitalOcean (1 droplet)

| Resource | Details |
|---|---|
| Droplet IP | `142.93.78.220` |
| Services | PocketBase (port 8096), Caddy (ports 80/443), PostgreSQL (port 5432) |
| Purpose | API server + dev portal database |

> Note: The dev portal's PostgreSQL database also runs on this same droplet (connection string points to `142.93.78.220:5432`).

---

## 10. CI/CD Pipeline

### Current State

There is **no automated CI/CD pipeline** (no GitHub Actions, no Netlify auto-deploy from GitHub).

All deployments are currently **manual**:

#### Main App

```bash
# Build locally
cd /Users/cloudaistudio/Documents/EVERJUST\ PROJECTS/face-login-gateway
npm run build

# Deploy to Netlify production
netlify deploy --prod --dir=dist --site=ee5748c1-ab9a-44b0-8dd5-22742c42b4cd
```

#### Docs Site

```bash
cd docs/
npm run build
# Deploy via Netlify CLI or Netlify dashboard
```

#### Dev Portal

```bash
cd /Users/cloudaistudio/Documents/EVERJUST\ PROJECTS/facesmash-dev-portal
pnpm build
# Deploy via Netlify CLI linked to facesmash-developers site
netlify deploy --prod
```

#### PocketBase API

- PocketBase binary runs directly on the droplet
- Updates require SSH into `142.93.78.220`, downloading the new binary, and restarting the service
- Caddy config changes: edit `/etc/caddy/Caddyfile`, then `systemctl reload caddy`

### Recommended CI/CD (not yet implemented)

- Connect GitHub repos to Netlify for auto-deploy on push to `main`
- Add GitHub Actions for lint + type-check on PRs
- Consider systemd service + watchtower or similar for PocketBase auto-updates

---

## 11. Third-Party Services & Extensions

### Unkey — API Key Management

- **Website**: https://unkey.dev
- **Purpose**: Creates, manages, rate-limits, and revokes API keys for the developer portal
- **Integration**: `@unkey/api` ^2.3.0, `@unkey/ratelimit` ^2.1.4
- **Config**: `UNKEY_ROOT_KEY` and `UNKEY_API_ID` env vars
- **Used in**: `lib/unkey.ts`, `lib/keys/actions.ts`, `app/api/keys/route.ts`
- **Key metadata**: Stores `teamId`, `userId`, `appName` per key

### Stripe — Payments & Subscriptions

- **Website**: https://stripe.com
- **Purpose**: Subscription billing for developer portal (Free, Pro, Enterprise plans)
- **Integration**: `stripe` ^18.1.0
- **API version**: `2025-04-30.basil`
- **Config**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` env vars
- **Features used**:
  - Checkout Sessions (subscription mode with 14-day trial)
  - Customer Portal (subscription management, cancellation)
  - Webhooks (subscription lifecycle events)
  - Promotion codes
- **Used in**: `lib/payments/stripe.ts`, `app/api/stripe/checkout/`, `app/api/stripe/webhook/`

### PocketBase — Backend-as-a-Service

- **Website**: https://pocketbase.io
- **Purpose**: REST API for the main app — stores user profiles, face templates, scan logs, sign-in logs
- **Integration**: `pocketbase` ^0.26.8 (JS SDK)
- **Client config**: `src/integrations/pocketbase/client.ts` → `https://api.facesmash.app`
- **Auto-cancellation**: Disabled to allow parallel requests

### Caddy — Reverse Proxy & TLS

- **Website**: https://caddyserver.com
- **Purpose**: HTTPS termination, reverse proxy to PocketBase, CORS handling
- **Config file**: `/etc/caddy/Caddyfile` on droplet `142.93.78.220`
- **TLS**: Automatic via Let's Encrypt (ACME)
- **CORS**: Dynamic origin echo (supports production + localhost dev)

### @vladmandic/face-api — Face Recognition

- **Website**: https://github.com/nickvladmandic/face-api
- **Purpose**: Client-side face detection, landmark extraction, descriptor extraction, expression analysis
- **Version**: ^1.7.15
- **Models loaded from CDN**: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model`
- **Models**:
  - SSD MobileNet v1 (primary face detector)
  - TinyFaceDetector (fallback detector)
  - FaceLandmark68Net (68-point landmark detection)
  - FaceRecognitionNet (128-D face descriptor extraction)
  - FaceExpressionNet (expression classification)
- **Total model size**: ~12.5 MB (cached by browser after first load)
- **Backend**: TensorFlow.js WebGL with CANVAS2D_WILL_READ_FREQUENTLY and WEBGL_EXP_CONV optimizations

### Fumadocs — Documentation Framework

- **Website**: https://fumadocs.dev
- **Purpose**: Powers the docs site with MDX content, search, sidebar navigation, API reference layouts
- **Packages**: fumadocs-core, fumadocs-mdx, fumadocs-ui (all v16.6.10 / 14.2.9)
- **Content source**: MDX files in `docs/content/docs/`
- **Config**: `docs/source.config.ts`

### Drizzle ORM — Database Toolkit

- **Website**: https://orm.drizzle.team
- **Purpose**: Type-safe PostgreSQL ORM for the dev portal
- **Packages**: `drizzle-orm` ^0.43.1, `drizzle-kit` ^0.31.1
- **Driver**: `postgres` ^3.4.5 (node-postgres)
- **Schema**: `lib/db/schema.ts`
- **Migrations**: `lib/db/migrations/`
- **Commands**:
  - `pnpm db:generate` — Generate migration from schema changes
  - `pnpm db:migrate` — Apply migrations
  - `pnpm db:seed` — Seed initial data
  - `pnpm db:studio` — Open Drizzle Studio GUI

### jose — JWT Library

- **Purpose**: Sign and verify JWT session tokens for dev portal auth
- **Algorithm**: HS256
- **Token expiry**: 24 hours

### bcryptjs — Password Hashing

- **Purpose**: Hash and compare passwords for dev portal user accounts
- **Salt rounds**: 10

### GoDaddy — Domain Registrar

- **Purpose**: DNS management for `facesmash.app` and all subdomains
- **API available**: Yes (used for programmatic DNS record management)

### jsDelivr CDN

- **Purpose**: Serves face-api.js neural network model files
- **URL pattern**: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/*`

### npm Registry

- **Package**: `@facesmash/sdk`
- **URL**: https://www.npmjs.com/package/@facesmash/sdk
- **Purpose**: Published SDK package for developers integrating FaceSmash

---

## 12. Face Recognition Pipeline

All face processing happens **client-side in the browser**. No raw face images are ever sent to the server.

### Registration Flow

```
User opens webcam
  → SDK captures 3+ frames
  → Each frame analyzed for quality (lighting, sharpness, face size)
  → Best frame selected
  → 128-D face descriptor extracted via FaceRecognitionNet
  → Duplicate check against all existing users (similarity ≥ 0.75 = duplicate)
  → New user_profiles record created in PocketBase
  → Initial face_templates record stored
  → face_scans audit log entry created
```

### Login Flow

```
User opens webcam
  → SDK captures 3+ frames
  → Best quality frame selected
  → Face descriptor extracted
  → All user_profiles fetched from PocketBase
  → For each user: enhancedMatch() with adaptive threshold
  → If user has templates: multiTemplateMatch() also evaluated
  → Best match above threshold wins
  → sign_in_logs entry created
  → If quality > 0.5: stored embedding updated (adaptive learning)
  → If quality > 0.6: new face_template stored (template learning)
```

### Detection Strategy

- **Primary**: SSD MobileNet v1 (min confidence 0.3)
- **Fallback**: TinyFaceDetector (if SSD fails)
- **Tracking interval**: 300ms between detection cycles
- **Busy guard**: Prevents overlapping detection calls

---

## 13. Authentication Flows

### Main App (Face Auth)

1. User navigates to `/register` or `/login`
2. `GlobalLoadingScreen` appears while face-api models load (~12.5 MB, cached after first load)
3. Camera activated, face detected and tracked in real-time
4. On registration: 3+ frames captured, best quality selected, descriptor stored in PocketBase
5. On login: descriptor compared against all stored profiles, best match returned

### Dev Portal (Email/Password Auth)

1. User navigates to `/sign-up` or `/sign-in`
2. Password hashed with bcryptjs (registration) or compared (login)
3. JWT session token created with jose (HS256, 24h expiry)
4. Token stored as httpOnly, secure, sameSite=lax cookie
5. Next.js middleware refreshes token on every GET request
6. Protected routes (`/dashboard/*`) redirect to `/sign-in` if no valid session

---

## 14. Database Schemas

### PocketBase (Main App — api.facesmash.app)

| Collection | Key Fields | Purpose |
|---|---|---|
| `user_profiles` | name, email, face_embedding (128-D float[]) | Registered users |
| `face_templates` | descriptor, quality, user_profile_id | Multi-template learning |
| `face_scans` | type, result, quality, user_profile_id | Audit log |
| `sign_in_logs` | match_score, threshold, user_profile_id | Login history |

### PostgreSQL (Dev Portal — 142.93.78.220:5432)

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | email, password_hash, role | Portal accounts |
| `teams` | name, stripe_customer_id, plan_name, subscription_status | Team/org billing |
| `team_members` | user_id, team_id, role | Team membership |
| `developer_apps` | name, allowed_origins, webhook_url, team_id | Registered applications |
| `activity_logs` | action, ip_address, team_id, user_id | Activity audit trail |
| `invitations` | email, role, status, team_id | Team invitations |

---

## 15. Environment Variables Reference

### Main App

No `.env` file required. All config is hardcoded:

| Config | Value | Location |
|---|---|---|
| PocketBase URL | `https://api.facesmash.app` | `src/integrations/pocketbase/client.ts` |
| Face-API Model URL | `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model` | `src/utils/faceRecognition.ts` |
| Dev server port | `8080` | `vite.config.ts` |

### Dev Portal (`.env`)

| Variable | Purpose | Example |
|---|---|---|
| `POSTGRES_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | JWT signing key (64-char hex) | `55d3ffc7...` |
| `BASE_URL` | Portal URL (for Stripe redirects) | `http://localhost:3000` or `https://developers.facesmash.app` |
| `STRIPE_SECRET_KEY` | Stripe API key | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `UNKEY_ROOT_KEY` | Unkey root API key | `unkey_...` |
| `UNKEY_API_ID` | Unkey API identifier | `api_...` |

---

## 16. Security Notes

- **Face data**: Raw images never leave the browser. Only 128-D numeric vectors (floats) are transmitted and stored.
- **PocketBase admin password**: Was rotated after a GitGuardian leak. Old credentials were scrubbed from git history using `git-filter-repo`.
- **Git history cleanup**: `setup-pocketbase.cjs`, `supabase-check.cjs`, and `src/integrations/supabase/client.ts` were permanently removed from all git history.
- **CORS**: Dynamic origin echo in Caddy — only the requesting origin is reflected back (no wildcard in production).
- **Dev portal passwords**: bcryptjs with 10 salt rounds.
- **Dev portal sessions**: JWT (HS256), httpOnly + secure + sameSite=lax cookies, 24h expiry with auto-refresh.
- **API keys**: Managed through Unkey — one-way hashed, rate-limited, revocable.
- **Camera permissions**: Locked to `self` via `Permissions-Policy: camera=(self)` header.
- **Sensitive files**: `.env` files must **never** be committed. The dev portal `.env` contains Stripe keys, Unkey keys, Postgres credentials, and the auth secret.

---

## 17. Local Development

### Main App

```bash
cd "/Users/cloudaistudio/Documents/EVERJUST PROJECTS/face-login-gateway"
npm install
npm run dev          # → http://localhost:8080
```

### Docs Site

```bash
cd "/Users/cloudaistudio/Documents/EVERJUST PROJECTS/face-login-gateway/docs"
npm install
npm run dev          # → http://localhost:3000
```

### Dev Portal

```bash
cd "/Users/cloudaistudio/Documents/EVERJUST PROJECTS/facesmash-dev-portal"
pnpm install
cp .env.example .env  # Fill in credentials
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Apply migrations
pnpm db:seed          # Seed initial admin user
pnpm dev              # → http://localhost:3000 (Turbopack)
```

### API Gateway (facesmash-api)

```bash
cd "/Users/cloudaistudio/Documents/EVERJUST PROJECTS/facesmash-api"
npm install
cp .env.example .env  # Fill in PocketBase URL, Stripe keys, rate limits
npm run dev            # → http://localhost:3100 (tsx watch)
```

### PocketBase API

The API runs on the DigitalOcean droplet. For local testing, you can run PocketBase locally:

```bash
# Download PocketBase binary from https://pocketbase.io/docs
./pocketbase serve --http=0.0.0.0:8096
```

Then update `src/integrations/pocketbase/client.ts` to point to `http://localhost:8096`.

---

*This document is the single source of truth for FaceSmash infrastructure. Update it whenever infrastructure changes are made.*
