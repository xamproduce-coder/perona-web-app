# PERONA — Full Project Scope (v2026.04.05)

## Overview
Perona is a premium music engineering and artist management platform (built for MAXM Studio) designed to streamline the mixing, mastering, and asset delivery workflow for underground artists.

## Technology Stack
- **Frontend:** React 19 + Vite 8
- **Styling:** TailwindCSS v4 + Dark Mode MindWave x SSL Analogue Design System
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Audio Engine:** Howler.js (with custom Event Bus for transport controls)
- **AI Integration:** Google AI (Gemini) — *Status: Configured in .env.local*

## Architecture Highlights
- **Dashboard:** 2-tier "Studio Command Center" (Sidebar + Workspace).
- **Security:** Firestore security rules written; Custom auth context with bypass for demo.
- **Components:** Modular design using glassmorphism and SSL hardware-inspired buttons.

## Current Project Health
- core UI ready and functional (Home, Services, Dashboard).
- Real-time data fetching for orders/revisions is wired but currently using mock data fallback for demoing.
- Audio player controls and revision capturing (with autotimestamping) are fully operational.

## GitHub Status
- **Local Repo:** Initialized.
- **Remote:** Ready for upload.
- **Action Required:** Provide repository URL and personal Access Token (PAT) for push.
