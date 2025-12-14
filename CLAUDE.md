# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Progressive Web App (PWA) check-in tracker that allows users to log daily activities with timestamps. It's a client-side only application with no backend - all data is stored in browser localStorage. The app can be installed on devices and works offline.

## Architecture

**Progressive Web App** built with:
- **Build tool**: Vite with vite-plugin-pwa
- **Language**: Vanilla JavaScript (ES6+ modules)
- **Styling**: Plain CSS with iOS-inspired design
- **PWA features**: Service worker for offline support, installable via manifest

**Project Structure**:
- `index.html` - Main UI structure (root level for Vite)
- `src/main.js` - All application logic (data persistence, rendering, date formatting)
- `src/style.css` - Styling with iOS-inspired design system
- `vite.config.js` - Vite and PWA plugin configuration
- `public/` - Static assets (icons, etc.)

**Data Model**: Check-ins are stored as an array of objects in localStorage under the key `checkIns`. Each check-in has:
- `activity` (string) - The activity description
- `timestamp` (ISO string) - When the check-in occurred

**Key Functions** (in src/main.js):
- `quickCheckIn()` - Handles preset activity buttons
- `customCheckIn()` - Handles custom activity input
- `renderHistory()` - Filters last 7 days, groups by day, sorts, and displays check-ins
- `loadCheckIns()`/`saveCheckIns()` - localStorage persistence layer

## Development

Install dependencies:
```bash
npm install
```

Run development server with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

**Testing changes**: The dev server has hot module replacement. Use browser DevTools > Application > Local Storage to inspect or clear the `checkIns` data. To test PWA features (service worker, installation), use the production build with `npm run build && npm run preview`.

## PWA Configuration

The PWA manifest and service worker are configured in `vite.config.js`:
- **App name**: "Check-In Tracker"
- **Theme color**: #007aff (iOS blue)
- **Display mode**: standalone (fullscreen app experience)
- **Offline support**: Service worker caches all app assets
- **Auto-update**: Service worker automatically updates when new version is deployed

The placeholder icon at `public/icon.svg` should be replaced with proper app icons for production.

## Code Style

- Pure vanilla JavaScript (ES6+ modules) - no frameworks or dependencies
- Direct DOM manipulation using `getElementById` and `innerHTML`
- Mobile-first responsive design
- iOS-inspired visual design language (colors, spacing, interactions)
