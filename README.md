# Sankalpam Calculator PWA

A Progressive Web App for calculating daily Sankalpam mantras based on the Tamil/South Indian Hindu calendar tradition.

## Features

- 🙏 Complete Panchang calculation (Tithi, Nakshatra, Yoga, Karana, etc.)
- 📜 Output in Sanskrit (Devanagari), Tamil, and English
- ⏰ Start and end times for Tithi and Nakshatra
- 🌍 Multiple timezone support
- 📱 Works offline (PWA)
- 📲 Installable on mobile devices

## Deployment to GitHub Pages

1. Create a new GitHub repository (e.g., `sankalpam`)

2. Push these files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sankalpam.git
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Click Save

4. Your app will be available at:
   `https://YOUR_USERNAME.github.io/sankalpam/`

## Installing on Mobile

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen" or "Install app"

## Files

- `index.html` - Main application UI
- `panchang.js` - Calculation engine (JavaScript port)
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline support
- `icon-*.png` - App icons

## Accuracy

The JavaScript implementation uses simplified astronomical algorithms suitable for Panchang calculations. For most practical purposes, the results match standard Panchangams within a few minutes for timing calculations.

## License

MIT License - Feel free to use and modify.
