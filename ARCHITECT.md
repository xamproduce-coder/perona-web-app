# ARCHITECT.md — Project Directive File
# Mixing & Mastering Service Platform
# Last Updated: 2026-03-22

---

## LAYER 1: PHYSICAL STORAGE HIERARCHY (THE LAW)

The agent MUST write files to the following locations ONLY. No improvisation.

```
web v2/
├── ARCHITECT.md          ← THIS FILE. The project constitution.
├── .env.local            ← Firebase credentials (NEVER commit to git)
├── vite.config.js        ← Vite + Tailwind configuration
├── src/
│   ├── main.jsx          ← App entry point
│   ├── App.jsx           ← Root router and layout shell
│   ├── lib/
│   │   └── firebase.js   ← Firebase SDK initialization (single source of truth)
│   ├── context/
│   │   └── AuthContext.jsx ← Global Firebase Auth state provider
│   ├── hooks/
│   │   └── useAuth.js    ← Custom hook to consume AuthContext
│   ├── pages/
│   │   ├── Home.jsx      ← Landing page (portfolio + services)
│   │   ├── Order.jsx     ← Order form (file upload + notes)
│   │   ├── Dashboard.jsx ← Artist dashboard (status + revisions + downloads)
│   │   ├── Admin.jsx     ← Admin portal (order management + file delivery)
│   │   ├── Login.jsx     ← Auth page
│   │   └── Register.jsx  ← Registration page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Modal.jsx
│   │   └── audio/
│   │       ├── AudioPlayer.jsx   ← Howler.js powered player
│   │       └── RevisionMarker.jsx ← Timestamped comment capture
│   ├── styles/
│   │   └── index.css     ← Global Tailwind directives + custom CSS tokens
│   └── assets/
│       └── images/       ← Static images and brand assets
```

---

## LAYER 2: COGNITIVE FRAMEWORK (HOW THE AGENT THINKS)

### Core Value Proposition
A professional Mixing & Mastering service platform. Artists submit their stems, receive a mixed/mastered track, and provide timestamped revision feedback via an in-browser audio player.

### Target User
Independent recording artists seeking studio-quality mixing and mastering.

### Tech Stack (LOCKED — do not deviate)
| Layer        | Technology           |
|--------------|----------------------|
| Frontend     | React 18 (Vite)      |
| Styling      | Tailwind CSS v4      |
| Auth         | Firebase Auth        |
| Database     | Firebase Firestore   |
| File Storage | Firebase Storage     |
| Audio Engine | Howler.js            |
| Routing      | React Router v6      |
| Deployment   | Firebase Hosting     |

### Data Models (Firestore Collections)
- `users/{uid}` — artistName, email, role ('artist' | 'admin'), createdAt
- `orders/{orderId}` — userId, serviceName, price, status, stemsUrl, masterUrl, createdAt
- `revisions/{revisionId}` — orderId, userId, timestamp, note, createdAt

### Order Status Flow (LOCKED)
`queued` → `in_progress` → `review` → `revision_requested` → `finalized`

---

## LAYER 3: EXECUTION RULES (HOW THE AGENT CODES)

1. **Firebase Init**: Always import from `src/lib/firebase.js`. Never re-initialize.
2. **Auth State**: Always consume from `AuthContext`. Never call `onAuthStateChanged` directly in a component.
3. **Routing**: Protected routes wrap components in an `<AuthGuard>` that redirects to `/login` if unauthenticated.
4. **File Upload**: All stem files are uploaded to `Firebase Storage` under `orders/{orderId}/stems/`. Masters under `orders/{orderId}/master/`.
5. **Styling**: Use Tailwind utility classes. Custom tokens are defined in `src/styles/index.css`. Do not use inline styles.
6. **No Magic Constants**: All Firebase collection names are defined as constants in `src/lib/firebase.js`.
7. **Environment Variables**: All Firebase config keys use the `VITE_` prefix and are stored in `.env.local`.
