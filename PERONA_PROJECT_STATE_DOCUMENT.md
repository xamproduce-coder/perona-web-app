# PERONA — Project State Document
## Lead Strategic Brain Onboarding Brief
**Compiled:** 2026-04-05 | **Classification:** Internal Architecture Reference


---

## PILLAR 1: THE CHRONOLOGICAL JOURNEY (D1 TO PRESENT)

### Phase 0: Business Ideation (Pre-Build)
- **Business Model:** Manu (engineer alias "Perona" / brand name "MAXM Studio") is a Brighton-based mixing and mastering engineer targeting independent and underground rap/electronic artists.
- **Offer Stack:** Master Only (£40) · Mix & Master (£150) · Recording Session (£225) · flagship "Debut Tape" EP partnership (£2,000 baseline).
- **Original Goal:** Build a brand site on **Framer** (no-code). Rapidly abandoned when the client portal complexity (authenticated uploads, real-time order status, in-browser audio) exceeded what Framer could deliver.

### Phase 1: The Framer Era (Abandoned)
- A Framer API token was obtained and explored. Determined to be insufficient for the client portal.
- **The Pivot:** Shifted entirely to **React + Vite + Firebase** — a full SPA with a real back-end.

### Phase 2: "New Website V3" — Foundation Build
- **Directory:** `c:\Users\manum\OneDrive\Desktop\Perona\new website v3`
- **Stack locked in:** React 19, Vite 8, TailwindCSS v4, Firebase (Auth + Firestore + Storage), Howler.js, Framer Motion, React Router v7, Lucide React.
- **Key output:** `ARCHITECT.md` created as the "project constitution" — a law file specifying folder structure, data models, order status flow, and coding rules.
- **Firestore schema defined:**
  - `users/{uid}` — profile, role ('artist' | 'admin')
  - `orders/{orderId}` — project metadata, status, file URLs
  - `revisions/{revisionId}` — timestamped notes tied to orders
  - `assets/{assetId}` — independent stems uploaded to the vault

### Phase 3: The Design System — "MindWave x SSL Analogue"
- Early attempts used generic Tailwind styling. A deliberate design language was established after studying MixedByEl and other premium audio engineering brands.
- `src/styles/index.css` written as a comprehensive design token file: MindWave glassmorphism, SSL console button, typography hierarchy, color palette, ambient noise SVG background.
- **Milestone:** `Home.jsx` completed with MindWave hero, feature grid, and service card previews.

### Phase 4: The Dashboard Architecture Wars
- **Original architecture:** A 3-tier layout was attempted (triple sidebar: Nav | Content | Inspector). This was the hardest phase.
- **Why it failed:** Cascading z-index conflicts; Howler.js audio state colliding with Framer Motion `AnimatePresence`; dashboard component ballooned causing Vite build errors and ESLint timeouts (`lint_dashboard.txt` reached 77KB of output — a major red flag).
- **The Pivot (Final Architecture):** Simplified to a **2-tier layout**: Left sidebar (Projects + Upload tab toggle) + Right workspace (Session View). Inspector/third panel eliminated entirely.
- **Milestone:** `Dashboard.jsx` — 787 lines — fully functional in demo mode with mock data.

### Phase 5: Demo Mode & Auth Bypass
- Firebase Auth was bypassed entirely with `BYPASS_AUTH = true` in `AuthContext.jsx`. `ProtectedRoute` in `App.jsx` was stubbed to unconditionally `return children`.
- **Why:** Needed to demo the client portal without requiring login credentials.

### Key Milestones Hit
- [x] Full tech stack locked and running (`npm run dev` active)
- [x] Design system (`index.css`) complete — MindWave x SSL Analogue
- [x] `ARCHITECT.md` constitution established
- [x] Homepage (`Home.jsx`) complete
- [x] Services page (`Services.jsx`) complete with Debut Tape hero block
- [x] Dashboard (`Dashboard.jsx`) — 2-tier architecture complete, mock data working
- [x] Audio player (Howler.js) integrated and functional via CustomEvent bus
- [x] Revision capture system with timestamp pinning (local state)
- [x] `useRealtimeOrders`, `useRealtimeAssets`, `useRealtimeRevisions` hooks — all written
- [x] Firestore security rules written and structured
- [x] Admin portal (`Admin.jsx`) — fully built for order management and master delivery
- [ ] Real Firebase upload pipeline (drag-and-drop UI exists; upload is **stubbed**)
- [ ] Email notifications on status change
- [ ] Stripe payment integration
- [ ] Production deployment to Firebase Hosting

---

## PILLAR 2: THE TECHNICAL ARCHITECTURE & STACK

### The Stack (LOCKED)

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.2.4 |
| Build Tool | Vite | 8.0.1 |
| Styling | TailwindCSS v4 (via `@tailwindcss/vite`) | 4.2.2 |
| Routing | React Router DOM | 7.13.1 |
| Animation | Framer Motion | 12.38.0 |
| Audio Engine | Howler.js | 2.2.4 |
| Icon Library | Lucide React | 0.577.0 |
| Auth | Firebase Auth | 12.11.0 |
| Database | Firebase Firestore | 12.11.0 |
| File Storage | Firebase Cloud Storage | 12.11.0 |
| AI Integration | Google AI (Gemini) | v1beta |


### Folder Structure & Component Logic

```
src/
├── main.jsx              ← React root mount. Renders <App />.
├── App.jsx               ← BrowserRouter + AuthProvider wrapper.
│                           Defines ProtectedRoute (currently bypassed).
│                           Renders Navbar on all routes.
│                           Maps URL paths → page components.
├── styles/
│   └── index.css         ← The entire design system. TailwindCSS v4 directives +
│                           custom classes (.mindwave-glass, .btn-ssl, .btn-champagne,
│                           CSS custom properties, keyframe animations).
├── lib/
│   ├── firebase.js       ← Single Firebase init. Exports: auth, db, storage,
│                           googleProvider, COLLECTIONS (string constants).
│   ├── db.js             ← Data Access Layer. All Firestore CRUD abstractions.
│                           Functions: createOrUpdateUser, getUserAssets, submitOrder,
│                           getUserOrders, submitRevision, getOrderRevisions,
│                           getAllOrders, updateOrder, saveAssetMetadata.
│   └── storage.js        ← Firebase Storage helpers (listStems, etc.)
├── context/
│   └── AuthContext.jsx   ← Global auth state. Provides: user, profile, loading,
│                           isAdmin, signOut. Currently hardcoded to bypass auth.
├── hooks/
│   ├── useRealtimeOrders.js     ← Firestore onSnapshot for user's orders.
│   ├── useRealtimeAssets.js     ← Firestore onSnapshot for user's assets.
│   └── useRealtimeRevisions.js  ← Firestore onSnapshot for order revisions.
├── pages/
│   ├── Home.jsx          ← Landing page. MindWave hero + feature grid + service cards.
│   ├── Services.jsx      ← Full services page. Debut Tape hero + À la carte grid.
│   ├── Dashboard.jsx     ← Artist command center (787 lines). THE CORE PRODUCT.
│   ├── UploadHub.jsx     ← Standalone file vault/uploader page.
│   ├── Admin.jsx         ← Admin-only order management portal (NOT ROUTED).
│   ├── Account.jsx       ← Artist account settings page.
│   ├── Login.jsx         ← Firebase auth login form.
│   ├── Register.jsx      ← Firebase auth registration form.
│   ├── Order.jsx         ← Manual order submission form (NOT ROUTED).
│   ├── MixMyTrack.jsx    ← Standalone mix order flow (NOT ROUTED).
│   ├── Photography.jsx   ← Stub page (NOT ROUTED).
│   └── Record.jsx        ← Stub — 237 bytes, effectively empty (NOT ROUTED).
└── components/
    ├── layout/
    │   ├── Navbar.jsx    ← Sticky top navigation bar.
    │   └── Footer.jsx    ← Footer component.
    ├── upload/
    │   └── StemUploader.jsx  ← Drag-and-drop upload component. Used in UploadHub.
    ├── audio/            ← Folder exists; may contain legacy AudioPlayer.jsx.
    └── booking/          ← Folder exists; contains booking form component.
```

### Route Map (App.jsx) — Currently Active Routes

| URL | Component | Guard Status |
|---|---|---|
| `/` | `Home.jsx` | None |
| `/services` | `Services.jsx` | None |
| `/login` | `Login.jsx` | None |
| `/register` | `Register.jsx` | None |
| `/dashboard` | `Dashboard.jsx` | ProtectedRoute (bypassed — open to all) |
| `/account` | `Account.jsx` | None |
| `/upload-hub` | `UploadHub.jsx` | ProtectedRoute (bypassed) |
| `*` | Redirect to `/` | — |

> **CRITICAL:** `Admin.jsx`, `Order.jsx`, `MixMyTrack.jsx`, `Photography.jsx`, `Record.jsx` are all **orphaned** — built but have no routes and are completely inaccessible through the UI.

### Data Flow

**Project selection + audio playback:**
```
User clicks ProjectCard in sidebar
  → Dashboard.jsx: setActiveOrder(order)
  → SessionView renders with order prop
  → Howler.js: new Howl({ src: [order.masterUrl] })
  → Transport bar fires window.dispatchEvent(new CustomEvent('togglePlay'))
  → SessionView useEffect listener: playerRef.current.play()
  → requestAnimationFrame loop: setSeek(playerRef.current.seek()) every frame
  → seek state displayed in transport bar seekbar
```

**Real-time order data:**
```
Firebase Firestore (orders collection)
  → onSnapshot listener
  → useRealtimeOrders(user.uid) hook
  → Dashboard.jsx: const { orders: realOrders } = useRealtimeOrders(...)
  → if realOrders.length > 0: use Firebase data
  → else: use mockOrders array (demo fallback, always works)
  → filteredOrders → rendered as ProjectCards in sidebar
```

**Revision submission:**
```
User types note in textarea → presses Enter (no Shift)
  → auto-prepends [timestamp] from current seek position
  → onRevisionAdded(): local state push (optimistic, instant UI update)
  → if real order (non-mock ID):
      submitRevision() → db.js → addDoc to Firestore revisions
      + setDoc merge to increment order.revisionCount
  → if mock order (ID starts with 'm'):
      local state only — never persisted to Firestore
```

### Third-Party Integrations

| Service | Configuration | Status |
|---|---|---|
| Firebase Auth | VITE_ prefixed keys in `.env.local` | Connected; bypassed in dev |
| Firebase Firestore | Same `.env.local` config | Connected; security rules written |
| Firebase Storage | Same `.env.local` config | Connected; upload partially wired |
| Howler.js | Inline instantiation in `SessionView` | Working |
| Framer Motion | Entry animations + AnimatePresence | Working |
| Google Fonts | Playfair Display + Onest via CSS @import | Working |

---

## PILLAR 3: DESIGN, LAYOUT & USER EXPERIENCE

### The Visual Language — "MindWave x SSL Analogue"

**Mood:** Dark, premium, studio-grade. Designed to feel like being inside a $50,000 SSL mixing console in a blackout recording studio.

**Color System:**

| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#000000` | Base canvas |
| `--color-bg-secondary` | `#0A0A0A` | Alternate section backgrounds |
| `--color-bg-card` | `rgba(21,21,21,0.8)` | Glass card base |
| `--color-accent-navy` | `#1E3A8A` | Navy glow, focus rings, secondary accent |
| `--color-accent-champagne` | `#FDE047` | **PRIMARY ACCENT** — champagne yellow. Status dots, CTAs, brand logo |
| `--color-ssl-orange` | `#F97316` | SSL console secondary accent (rarely used) |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | All thin borders site-wide |

**Ambient Background:**
Three-layer CSS `background-image` on the `body`:
1. Radial navy glow from top-center (depth/atmosphere)
2. Secondary left-edge navy glow
3. Inline SVG `fractalNoise` filter at 5% `soft-light` blend mode — analogue tape grain texture
This gives the dark canvas a non-generic "dead room acoustic" quality.

**Typography:**

| Font | Role | CSS Variable |
|---|---|---|
| `Playfair Display` (serif) | Display headings H1-H3, large editorial type | `--font-display` |
| `Onest` / `Inter` (sans-serif) | Body text, UI labels, all buttons | `--font-body` |

- Headings: `letter-spacing: -0.02em` (tighter than default — editorial feel)
- Micro-labels: `tracking-[0.2em]` to `tracking-[0.5em]` (extremely wide — mimics hardware console label tape)
- `H1: clamp(3rem, 8vw, 5rem)` — fluid, responsive, never breaks layout

**Core CSS Component Classes (`index.css`):**

| Class | What it is |
|---|---|
| `.mindwave-glass` | Glassmorphism card. `backdrop-filter: blur(10px) saturate(150%)`, hover lifts +2px, border brightens |
| `.btn-ssl` | THE SITE'S SIGNATURE ELEMENT. Mimics a physical SSL console button. Inset bevel shadows, dark gray body, `@keyframes flicker` inner `#FDE047` glow on hover, text transitions gray→black as "backlight activates" |
| `.btn-champagne` | Alternative pill CTA. Inner top-edge shimmer `inset 0 1px 0 rgba(255,255,255,0.1)`, hover champagne glow |
| `.mindwave-feature-card` | Service/feature grid card. `border-radius: 32px`, hover lifts + border opacity increases |
| `.mindwave-badge` | Hero pill/tag element. Transparent, 999px border-radius, subtle border |
| `.mindwave-nav` | Navbar. `backdrop-filter: blur(20px)`, sticky top, 64px height |

### The User Journey (Conversion Flow)

```
1. Landing Page (/)
   ├── Hero: "The step between Boiler Room sets and your first hit"
   ├── CTA [PRIMARY]: "START PROJECT" → /services
   ├── CTA [SECONDARY]: "Hear The Work" → /portfolio  ⚠️ DEAD LINK
   ├── Hero image mockup (studio-hero.png)  ⚠️ FILE MISSING — shows placeholder
   ├── Logo social proof row (Spotify, Apple Music, SoundCloud, Boiler Room, NTS)
   ├── Engineer bio section ("The Engineer" — Manu's personal story)
   └── 3-column service preview grid

2. Services Page (/services)
   ├── "Debut Tape" flagship hero block (£2,000, champagne glow)
   │   └── "Book A Consultation" → /contact  ⚠️ DEAD LINK
   └── À la carte grid:
       ├── Master Only (£40)     → "Order Now" → /login
       ├── Mix & Master (£150)   → "Order Now" → /login
       └── Recording (£225)      → "Request Consultation" → /contact  ⚠️ DEAD LINK

3. Auth (/login, /register)
   └── Firebase Auth → on success → /dashboard

4. Dashboard (/dashboard)  ← THE PRIMARY PRODUCT EXPERIENCE
   ├── Left Sidebar: Project list | Upload stems
   ├── Main Workspace: Session View OR Empty Vault state
   └── Bottom Transport Bar: Persistent playback controls

5. Upload Hub (/upload-hub)
   └── Gate: profile.hasPaidMixMaster  ⚠️ FLAG NEVER SET — permanently locked
```

### Dashboard Anatomy — The 2-Tier Studio Command Center

Design rationale: Artists are comfortable inside DAWs (Pro Tools, Ableton). Making the portal feel like a DAW reduces the perceived complexity of the workflow and increases trust.

**Left Sidebar (`w-80`, `bg-[#080A0F]`, fixed width, desktop only):**
- Brand header: Yellow "M" square logomark + "Studio / Command Center" wordmark + green pulsing "Live" dot
- Tab toggle: "Projects" | "Upload" — switches content via `sidebarView` state + AnimatePresence transition
- **Projects view:** Search bar → "Active" section → "Completed" section. Each `ProjectCard`: music icon, project name, status color dot + label. Click → sets `activeOrder`
- **Upload view:** `DropZonePanel` (accepts WAV/AIFF/ZIP/FLAC/MP3) + "The Manual" rules card
- **Account section:** Fixed to bottom. Avatar + display name + role badge → popover (Settings → `/account`, Services → `/services`, Sign Out)

**Main Workspace (flex-1, `bg-black`):**
- **Top header bar (h-16):** Status/BPM/key metadata (left) · Calendar, Messages, "+ New Project" (right)
- **Workspace canvas:** Empty Vault state (no order selected) OR `SessionView` (order selected)
- **Transport Bar (h-20, always visible):** Track info · Playback controls (fire CustomEvents) · Seek bar · Volume/Messages/Download

**SessionView (the workspace when an order is active):**
- Project name: 4xl-5xl `font-display uppercase`
- BPM + Key metadata
- **Revision Capture textarea:** Auto-prepends `[timestamp]` on first keystroke; `Enter` pins note; cap at 2 revisions → monetization gate ("Book Strategy Session" CTA)
- **"Send to Revisions" `.btn-ssl`:** Fires `openFinalizeModal` CustomEvent → confirmation modal → `confirmFinalize()`
- **Pinned Notes list:** Clickable timestamps (seeks player), inline editing (double-click), delete (hover-reveal)

**The Audio CustomEvent Bus:**
Transport bar buttons fire `window.dispatchEvent(new CustomEvent('togglePlay'))`. SessionView attaches listeners in `useEffect`. Events: `togglePlay`, `skipForward`, `skipBack`, `seekTo`. Decouples transport UI from player but creates global namespace risk.

### Design Pattern Classification

| Pattern | Application |
|---|---|
| Glassmorphism | Hero mockup, feature cards, modals, sidebar, navbar |
| SSL Console Brutalism | `.btn-ssl` — bevel, press effect, flicker animation — the site's signature |
| Editorial Typography | Playfair Display, tight letter-spacing, clamp fluid H1 |
| Micro-animation | Framer Motion entrance, AnimatePresence sidebar switch, spinning Disc3 |
| Monochrome + Single Pop | Near-total black/white + one accent: `#FDE047` champagne |
| Ambient Grain Texture | Inline SVG fractalNoise filter at 5% — analogue tape feel |

---

## PILLAR 4: THE FRICTION LOG (BOTTLENECKS & TECHNICAL DEBT)

### The Bottlenecks

1. **The Triple-Sidebar Collapse** — The hardest failure. The 3-tier dashboard caused irresolvable z-index conflicts, Howler.js state management failures, and Framer Motion exit animation conflicts on concurrent panels. Build failure artifacts: `berr.txt` (4.4KB), `build_err.txt` (6.2KB), `build_err2.txt` (198B). Solution: architectural elimination of the third panel.

2. **Firebase Composite Index Requirement** — All queries using `where()` + `orderBy()` require composite indexes deployed to Firestore. To avoid this friction, all data is sorted **in-memory** after a flat `where()` fetch. See `db.js`: `// Sort in-memory to avoid composite index requirement`. This is a performance hack — will fail at scale (100+ orders per user).

3. **77KB ESLint Output on Dashboard** — `lint_dashboard.txt` is 77,448 bytes. Indicates deep unresolved ESLint issues in `Dashboard.jsx` (stale useEffect dependency arrays, missing listener cleanup, likely prop-type violations). Dev server runs fine; `vite build` may fail in CI.

4. **Admin Page Orphaned** — `Admin.jsx` is a complete, functional 300-line admin portal. It is not in the `App.jsx` route table. Completely inaccessible.

---

### The Hacks — Active Landmines (Read Before Touching Anything)

**HACK #1 — AUTH BYPASS [CRITICAL]**
- `src/context/AuthContext.jsx` line 26: `const BYPASS_AUTH = true;`
- Hardcodes user as `uid: 'admin-maxm-123'`, `role: 'admin'`. Firebase `onAuthStateChanged` never runs.
- `App.jsx` line 18-19: `ProtectedRoute` returns `children` unconditionally.
- **If deployed:** ANY visitor gets full admin access with zero authentication.
- Code flag: `// TODO: REINSTATE NORMAL LOGIN BEFORE DEPLOYMENT`

**HACK #2 — MOCK DATA SHOWN TO REAL USERS [HIGH]**
- `Dashboard.jsx` lines 47-53: If `realOrders.length === 0`, renders hardcoded mockOrders (LUNAR ECLIPSE, NEON NIGHTS, SUBTERRANEAN) with `soundhelix.com` audio URLs.
- A real paying artist with no orders sees fake project data they can interact with.

**HACK #3 — UPLOAD LOGIC STUBBED [HIGH]**
- `Dashboard.jsx` DropZonePanel line 556: Files are accepted but not uploaded anywhere.
- `UploadHub.jsx` uses `StemUploader` but the access gate (`profile.hasPaidMixMaster`) is **never set anywhere** in the codebase. The UploadHub is permanently locked for 100% of real users.

**HACK #4 — WINDOW EVENT BUS FOR AUDIO [MEDIUM]**
- `window.dispatchEvent(new CustomEvent('togglePlay'))` as audio control bridge.
- Risks: global namespace pollution; stale closure capturing wrong `playing` boolean in useEffect; silent crash if Howl fails to load and `playerRef.current` is null when the event fires.

**HACK #5 — REVISION COUNT FRAGILITY [MEDIUM]**
- `db.js` line 94: `revisionCount: revisionData.newRevisionCount || 1`
- Caller must compute and pass `newRevisionCount`. If omitted, count always resets to 1.

**HACK #6 — ADMIN.JSX HAS LIGHT MODE CSS [LOW]**
- `Admin.jsx` uses `bg-white`, `text-black`, `border-black` throughout. Completely different visual design from MindWave system. Would look jarring if routed.

**HACK #7 — useRealtimeRevisions HOOK UNUSED [LOW]**
- `useRealtimeRevisions.js` exists and provides live Firestore updates. But `Dashboard.jsx` uses `getOrderRevisions()` (one-time fetch). Revision list does not update in real time when admin resolves a revision.

---

### The Unsolved Problems

| Problem | Impact |
|---|---|
| Dead link `/portfolio` in `Home.jsx` line 60 | "Hear The Work" CTA 404s — breaks conversion |
| Dead link `/contact` throughout `Services.jsx` | Debut Tape and Recording CTAs 404 |
| `studio-hero.png` missing from `/public` | Hero section shows placeholder text to all visitors |
| Drag-and-drop accepts files but uploads nothing | Client cannot submit stems from Dashboard |
| `profile.hasPaidMixMaster` never set | UploadHub permanently locked for all users |
| `Admin.jsx` has no route | Admin portal inaccessible in live app |
| Mobile dashboard shows empty canvas | Sidebar is `hidden md:flex` — no mobile navigation |
| No payment flow (Stripe) | Cannot collect payment online; manual invoicing only |
| No email notification system | Artist has no alert when admin delivers their master |
| 77KB lint errors on Dashboard | Build instability risk |

---

## PILLAR 5: CURRENT STATE & IMMEDIATE NEXT STEPS

### Where We Are Right Now (2026-04-05, 19:50 BST)

**Server:** `npm run dev` is running (active for 44m+). App is accessible locally.

**Working right now:**
- Homepage, Services page — fully rendering with MindWave design
- Dashboard loads with 3 mock projects, audio plays from soundhelix.com
- Transport controls (play/pause/seek/skip) work via CustomEvent bus
- Revision textarea captures notes with auto-timestamp, cap works, monetization gate renders
- "Send to Revisions" modal opens and confirms
- Download button triggers file download
- Account menu popup works
- All Framer Motion animations functional
- **Google AI (Gemini) API successfully configured in `.env.local`**


**Broken/missing right now:**
- Auth bypassed — everyone is admin with no login required
- Upload shows toast but doesn't upload
- `/portfolio`, `/contact`, `/admin` routes don't exist
- Studio hero image missing
- UploadHub permanently locked; Admin portal inaccessible

---

### Immediate Next Steps (Prioritized)

**P0 — 5-minute fixes that unlock major existing features:**

1. **Add `/admin` route to `App.jsx`**
   - Import `Admin` from `./pages/Admin`
   - Add `<Route path="/admin" element={<Admin />} />` to the Routes
   - Fully built feature, just needs a route

2. **Fix dead CTAs**
   - `/portfolio` → change to `/services` or create a portfolio stub
   - `/contact` → create a simple contact page or link to an external booking form

**P1 — Core functionality gaps:**

3. **Wire actual file upload in DropZonePanel**
   - Replace `addToast('upload logic pending')` with Firebase Storage upload
   - `storage.js` lib already exists — use `uploadBytes()` + `saveAssetMetadata()`

4. **Make `hasPaidMixMaster` settable**
   - Admin panel should write `hasPaidMixMaster: true` to the user's Firestore document
   - Alternatively, grant all registered users access initially and gate later

5. **Add studio hero image**
   - Generate or source a professional studio/equipment image for `public/studio-hero.png`

**P2 — Pre-launch hardening (before showing to any paying client):**

6. **Reinstate authentication**
   - `AuthContext.jsx`: `BYPASS_AUTH = false`
   - `App.jsx`: Uncomment `const { user } = useAuth()` in `ProtectedRoute`
   - Test full login → dashboard → revision flow end-to-end

7. **Swap to real-time revisions in Dashboard**
   - Replace `getOrderRevisions()` one-time fetch with `useRealtimeRevisions` hook

8. **Fix revision count in `db.js`**
   - Atomically read + increment current count from Firestore, not rely on caller computation

---

### Risk Register

| Risk | Severity | Current Mitigation |
|---|---|---|
| Auth bypass shipped to production | CRITICAL | `TODO` comment only — no safety net |
| Mock data shown to paying artists | HIGH | Acceptable in demo; must fix pre-launch |
| Admin portal unreachable by owner | HIGH | 5-minute route fix available |
| Upload never wired — clients can't submit stems | HIGH | UI creates false confidence |
| Mobile users see broken/empty dashboard | MEDIUM | Desktop-only; limits acquisition |
| No payment flow — no online revenue | MEDIUM | Manual invoicing as bridge |
| 77KB lint errors — build instability | MEDIUM | Dev runs fine; `vite build` unverified |
| Dead CTAs break conversion flow | MEDIUM | Trivial href fixes |
| useRealtimeRevisions hook unused | LOW | Revisions stale until page refresh |

---

## APPENDIX: ENVIRONMENT & SECRETS

- **Firebase credentials:** Stored in `.env.local` at project root. All keys use `VITE_` prefix. Excluded from git via `.gitignore`.
- **Collections:** `users`, `orders`, `revisions`, `assets` — always referenced via `COLLECTIONS` constants in `firebase.js`. Never use raw strings.
- **Storage bucket paths:** `orders/{orderId}/stems/` for dry stems · `orders/{orderId}/master/` for delivered masters.
- **Firestore security rules:** Written correctly. `isAdmin()` checks `users/{uid}.role === 'admin'`. With auth bypassed, mock UID `admin-maxm-123` has no real Firestore document — all Firestore reads fail silently and fall back to mock data. This is why the app still works in demo mode.

---
*End of Project State Document*
*Compiled from full static code analysis of `new website v3/src/` and synthesis of 11 prior conversation sessions.*
