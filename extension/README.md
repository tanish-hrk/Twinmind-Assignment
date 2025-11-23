# TwinMind Extension Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Chrome browser
- Git

### Installation

1. **Clone and install dependencies:**

```bash
cd extension
npm install
```

2. **Build the extension:**

```bash
npm run build
```

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top-right)
   - Click **"Load unpacked"**
   - Select the `extension/dist` folder
   - The TwinMind extension should now appear in your extensions list

4. **Pin the extension:**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "TwinMind" and click the pin icon
   - The extension icon will appear in your toolbar

## 🛠️ Development Workflow

### Hot Reload Development

For active development with automatic reloading:

```bash
npm run dev
```

This starts Vite in watch mode. When you make changes:

1. Files are automatically rebuilt
2. Go to `chrome://extensions/`
3. Click the refresh icon on the TwinMind extension
4. Your changes are now live!

### Development Commands

```bash
# Build for development (with source maps)
npm run dev

# Build for production
npm run build

# Type checking only (no build)
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
extension/
├── src/
│   ├── background/          # Background service worker
│   │   └── index.ts
│   ├── content/             # Content scripts (runs in web pages)
│   │   └── index.ts
│   ├── popup/               # Extension popup UI
│   │   ├── App.tsx
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── index.css
│   ├── options/             # Options/settings page
│   │   ├── Options.tsx
│   │   ├── index.html
│   │   └── main.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── storage.ts
│       └── logger.ts
├── public/
│   └── icons/               # Extension icons
├── manifest.json            # Extension manifest
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔍 Testing the Extension

### Basic Functionality Test

1. **Click the extension icon** in your toolbar
2. You should see the popup with:
   - Header showing "TwinMind"
   - Quick stats (Tabs Tracked, Session Time)
   - Activity tab showing recent browsing
   - Toggle for "Context Capture"

3. **Browse some websites** and then reopen the popup
   - You should see your browsing activity captured
   - Tab count should increase

4. **Check the Options page:**
   - Click the settings icon in popup, or
   - Right-click extension icon → "Options"
   - Toggle various capture features
   - Click "Save Settings"

5. **Verify background worker:**
   - Go to `chrome://extensions/`
   - Find TwinMind → Click "service worker"
   - Check console for logs (look for "Background service worker initialized")

### Debugging

#### Popup Debugging

1. Right-click popup → "Inspect"
2. DevTools opens for popup
3. Check Console for errors/logs

#### Background Worker Debugging

1. Go to `chrome://extensions/`
2. Find TwinMind → Click "service worker" link
3. DevTools opens for background script
4. View logs and debug

#### Content Script Debugging

1. Open any webpage
2. Press F12 to open DevTools
3. Go to Console
4. Look for messages from content script (prefixed with `[TwinMind Content]`)

## 📊 Current Features (Week 1 Complete)

✅ **Core Extension Infrastructure**

- Manifest V3 configuration
- Background service worker
- Content script injection
- React-based popup UI
- Options page

✅ **Context Capture**

- Tab creation/update/close tracking
- Active tab monitoring
- URL and title capture
- Session management
- Chrome storage integration

✅ **User Interface**

- Modern, responsive popup (400x600px)
- Activity timeline view
- Quick stats dashboard
- Settings toggle
- Dark/light theme support

✅ **Settings & Privacy**

- Capture enable/disable
- Domain exclusion list
- Data retention settings
- Storage management

## 🎯 Next Steps (Week 2)

- [ ] Enhance context capture with time tracking
- [ ] Implement tab duration calculation
- [ ] Add search functionality in popup
- [ ] Create data export feature
- [ ] Set up automated testing

## 🐛 Common Issues

### Extension won't load

- Make sure you've run `npm run build`
- Check that you're loading the `dist` folder, not `src`
- Look for errors in `chrome://extensions/` (click "Errors" if shown)

### Changes not appearing

- Reload extension: Go to `chrome://extensions/` → Click refresh icon
- Hard refresh popup: Close and reopen it
- Check if background worker restarted: Look for new initialization log

### TypeScript errors

```bash
npm run type-check
```

### Build fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Development Tips

### Adding New Features

1. **New popup component:**
   - Add to `src/popup/components/`
   - Import in `App.tsx`

2. **New background logic:**
   - Modify `src/background/index.ts`
   - Use Logger for debugging
   - Use Storage for persistence

3. **New content script feature:**
   - Modify `src/content/index.ts`
   - Communicate with background via `chrome.runtime.sendMessage`

### Best Practices

- **Always use TypeScript types** - No `any` types
- **Log important events** - Use Logger utility
- **Handle errors gracefully** - Try/catch async operations
- **Keep popup performant** - It reloads every time it opens
- **Minimize storage usage** - Implement cleanup/retention
- **Test across Chrome versions** - Use latest Chrome for development

### Performance Monitoring

Check extension resource usage:

1. Open Chrome Task Manager (Shift+Esc)
2. Find "Extension: TwinMind"
3. Monitor Memory and CPU
4. Target: <50MB RAM, <5% CPU

## 🔐 Security Considerations

- Never capture password fields (already filtered)
- Exclude sensitive domains by default
- Encrypt before cloud sync (future feature)
- Request minimal permissions
- Clear explanation for each permission

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API Reference](https://developer.chrome.com/docs/extensions/reference/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 🆘 Getting Help

If you encounter issues:

1. Check console logs (popup, background, content)
2. Review error messages in DevTools
3. Verify manifest.json permissions
4. Check Chrome Extension documentation
5. Look for similar issues in Chrome extension samples

---

**Status:** Week 1 Complete ✅
**Next Milestone:** Week 2 - Advanced Context Capture
