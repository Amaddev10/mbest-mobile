# Quick Guide: How to See Your MB App Icon

## Step 1: Generate the MB Icon Files

### Option A: Use the HTML Tool (Easiest)
1. Open `scripts/create-mb-icon.html` in your web browser
2. Click "Generate All Icons" button
3. Right-click on each icon size and "Save Image As..."
4. Save them with these names:
   - For Android: `ic_launcher.png` (save each size separately)
   - For iOS: `icon-1024.png` (for App Store)

### Option B: Use Online Tool (Recommended)
1. Go to https://www.appicon.co/
2. Create a 1024x1024 PNG image with:
   - Green background (#00C853)
   - White "MB" text, bold, centered
3. Upload and download all icon sizes
4. Replace the existing icons

## Step 2: Replace Android Icons

Replace icons in these folders:
```
android/app/src/main/res/
  ├── mipmap-mdpi/ic_launcher.png (48x48)
  ├── mipmap-hdpi/ic_launcher.png (72x72)
  ├── mipmap-xhdpi/ic_launcher.png (96x96)
  ├── mipmap-xxhdpi/ic_launcher.png (144x144)
  └── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

Also replace `ic_launcher_round.png` in each folder (can use same image).

## Step 3: Replace iOS Icon

1. Open Xcode: `ios/MyNewProject.xcworkspace`
2. Go to `Images.xcassets` → `AppIcon`
3. Drag and drop your generated icons into the appropriate slots
4. Or manually replace files in `ios/MyNewProject/Images.xcassets/AppIcon.appiconset/`

## Step 4: Rebuild the App

### For Android:
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild and run
npm run android
```

**OR** manually:
1. Uninstall the app from your device/emulator
2. Run `npm run android` again

### For iOS:
```bash
# Clean build
cd ios
rm -rf build
cd ..

# Rebuild and run
npm run ios
```

**OR** in Xcode:
1. Product → Clean Build Folder (Shift + Cmd + K)
2. Product → Run (Cmd + R)

## Important Notes:

1. **You MUST rebuild** - Just restarting won't show new icons
2. **Uninstall first** (Android) - Sometimes cached icons persist
3. **Clear app data** if icon still doesn't update
4. **Wait a few seconds** - Icons may take a moment to refresh on home screen

## Troubleshooting:

- **Icon not updating?** Try:
  - Uninstall completely
  - Clear app data/cache
  - Restart device/emulator
  - Rebuild from scratch

- **Still seeing old icon?** Check:
  - Icon files are actually replaced
  - File names are correct (case-sensitive)
  - Rebuild completed successfully
