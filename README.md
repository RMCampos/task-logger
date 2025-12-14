# Check-In Tracker

A Progressive Web App for tracking daily activities with timestamped check-ins. Built with vanilla JavaScript and Vite.

## Features

- Quick check-in buttons for common activities
- Custom activity tracking
- 7-day history view
- Offline support (PWA)
- Installable on mobile and desktop
- Dark mode interface

## Development

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions

1. Go to your repository settings on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push your changes to the `main` branch

The workflow will automatically:
- Build the app on every push to `main`
- Deploy to GitHub Pages
- Make it available at `https://[username].github.io/task-logger/`

### Manual Deployment

If you prefer to deploy manually:

```bash
npm run build
# Then commit and push the dist folder, or use gh-pages branch
```

## Tech Stack

- Vite - Build tool
- vite-plugin-pwa - PWA support
- Vanilla JavaScript (ES6+)
- CSS (iOS-inspired design)