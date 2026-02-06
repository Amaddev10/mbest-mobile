# Fix: App Icon Not Showing

## The Problem
The app icon needs to be in **Android system folders**, not in `src/assets/images/`. The `logo.png` file is for the app logo component, not the launcher icon.

## Quick Fix Steps

### Step 1: Generate MB Icon (Choose One Method)

**Method A: Online Tool (Recommended - Fastest)**
1. Go to: https://www.appicon.co/
2. Create/upload a 1024x1024 PNG with:
   - Green background (#00C853)
   - White "MB" text, bold, centered
3. Download **Android** icon pack
4. Extract the zip file

**Method B: HTML Tool**
1. Open `scripts/create-mb-icon.html` in your browser
2. Click "Generate All Icons"
3. Right-click each icon and save:
   - Save as `ic_launcher.png` for each size

### Step 2: Replace Android Icons

**Copy the generated icons to these exact paths:**

```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png (192x192)
```

**Important:** 
- File names must be EXACTLY `ic_launcher.png` (case-sensitive)
- Replace BOTH regular and round icons
- Make sure you're replacing files, not adding new ones

### Step 3: Clean Build

```bash
# Navigate to android folder
cd android

# Clean build
./gradlew clean

# Go back
cd ..

# Uninstall old app from device/emulator
adb uninstall com.mynewproject

# Rebuild
npm run android
```

### Step 4: Verify

1. Check icon files are replaced (right-click → Properties → check date/size)
2. App should be completely uninstalled
3. After rebuild, check home screen - should show "MB" icon

## Still Not Working?

**Check these:**
- ✅ Files actually replaced? (Check modification date)
- ✅ File names correct? (`ic_launcher.png` not `ic_launcher.PNG`)
- ✅ App completely uninstalled?
- ✅ Device/emulator restarted?
- ✅ Build completed successfully?

**Nuclear Option:**
```bash
# Delete all build folders
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/build

# Clean
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

## Quick Test

To verify icons are in place:
```bash
# Check if files exist
ls android/app/src/main/res/mipmap-*/ic_launcher.png
```

All 5 folders should show `ic_launcher.png` files.
