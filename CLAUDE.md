# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple check-in tracker web application that allows users to log daily activities with timestamps. It's a client-side only application with no build process or backend - all data is stored in browser localStorage.

## Architecture

**Single-page application** built with vanilla JavaScript, HTML, and CSS. The entire app consists of three files:

- `index.html` - Main UI structure with preset activity buttons, custom input, and history display
- `index.js` - All application logic (data persistence, rendering, date formatting)
- `style.css` - Styling with iOS-inspired design system

**Data Model**: Check-ins are stored as an array of objects in localStorage under the key `checkIns`. Each check-in has:
- `activity` (string) - The activity description
- `timestamp` (ISO string) - When the check-in occurred

**Key Functions**:
- `quickCheckIn()` - Handles preset activity buttons
- `customCheckIn()` - Handles custom activity input
- `renderHistory()` - Filters last 7 days, groups by day, sorts, and displays check-ins
- `loadCheckIns()`/`saveCheckIns()` - localStorage persistence layer

## Development

**No build process required.** Simply open `index.html` in a browser to run the application.

To test locally, use any HTTP server:
```bash
python -m http.server 8000
# or
npx serve
```

**Testing changes**: Refresh the browser. Use browser DevTools > Application > Local Storage to inspect or clear the `checkIns` data.

## Code Style

- Pure vanilla JavaScript (ES6+) - no frameworks or dependencies
- Direct DOM manipulation using `getElementById` and `innerHTML`
- Mobile-first responsive design
- iOS-inspired visual design language (colors, spacing, interactions)
