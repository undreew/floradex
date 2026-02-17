# Icon Generation for Floradex

## What Was Done

We've created a modern, gradient-based plant icon for your Floradex application that matches your app's color scheme.

### Features of the New Icon

- **Modern Design**: Clean, minimalist plant/leaf design with a gradient background
- **Color Scheme**: Uses your app's purple-to-pink gradient (`#667eea` → `#764ba2` → `#f093fb`)
- **Multiple Formats**: Generated all required icon variants for Android
  - Main app icon (1024x1024)
  - Adaptive icon foreground (1024x1024)
  - Adaptive icon background (1024x1024)
  - Monochrome icon for themed icons (1024x1024)
  - Favicon (48x48)
  - Splash screen icon (512x512)

## Generated Files

All icons are located in `assets/images/`:

- `icon.png` - Main app icon with rounded corners and gradient background
- `android-icon-foreground.png` - Foreground layer for Android adaptive icons
- `android-icon-background.png` - Background gradient for Android adaptive icons
- `android-icon-monochrome.png` - White monochrome version for themed icons
- `favicon.png` - Web favicon
- `splash-icon.png` - Splash screen icon

### SVG Source Files

SVG source files are preserved in `assets/generated-icons/` for future modifications.

## Scripts Created

Two utility scripts were added to `scripts/`:

1. **`generate-icon.js`** - Generates SVG icons with your app's design
2. **`convert-icons-to-png.js`** - Converts SVG icons to PNG using Sharp

## Customizing the Icons

If you want to modify the icon design:

1. Edit `scripts/generate-icon.js` to change colors, shapes, or layout
2. Run `node scripts/generate-icon.js` to regenerate SVGs
3. Run `node scripts/convert-icons-to-png.js` to convert to PNG
4. Run `npx expo prebuild --clean --platform android` to rebuild
5. Build your app: `npx expo run:android --variant release`

## Technical Details

- Icons use SVG for scalability and easy modifications
- Sharp library handles high-quality PNG conversion
- Android adaptive icons use separate foreground and background layers
- Monochrome icon supports Android 13+ themed icons
