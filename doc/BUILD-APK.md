# Build APK for M Best App

## Quick Build Commands

### Debug APK (For Testing)
```bash
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (For Distribution)
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Step-by-Step Guide

### 1. Clean Build (Recommended)
```bash
cd android
./gradlew clean
cd ..
```

### 2. Build Debug APK
```bash
cd android
./gradlew assembleDebug
```

### 3. Find Your APK
After build completes, find APK at:
- **Windows**: `android\app\build\outputs\apk\debug\app-debug.apk`
- **Mac/Linux**: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Install APK
```bash
# Connect your Android device via USB
# Enable USB Debugging in Developer Options
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Release APK (For Production)

### Option 1: Using Debug Keystore (Quick Testing)
```bash
cd android
./gradlew assembleRelease
```

### Option 2: Using Your Own Keystore (Production)

1. **Generate Keystore**:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Update android/app/build.gradle**:
```gradle
signingConfigs {
    release {
        storeFile file('my-release-key.keystore')
        storePassword 'your-password'
        keyAlias 'my-key-alias'
        keyPassword 'your-password'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

3. **Build Release APK**:
```bash
cd android
./gradlew assembleRelease
```

## Troubleshooting

### Build Fails?
- Make sure Android SDK is installed
- Check Java version (JDK 17+ recommended)
- Clean build: `cd android && ./gradlew clean`

### APK Too Large?
- Enable ProGuard: Set `enableProguardInReleaseBuilds = true` in `build.gradle`
- Build release APK instead of debug

### Can't Install APK?
- Enable "Install from Unknown Sources" in Android settings
- Or use: `adb install -r app-debug.apk` (force reinstall)

## APK Size Optimization

1. Enable ProGuard/R8
2. Use release build (smaller than debug)
3. Remove unused assets
4. Enable code splitting
