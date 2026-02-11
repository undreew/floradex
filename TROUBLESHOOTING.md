# Troubleshooting Guide

## Camera Analysis Failures

If you're experiencing "analysis failed" errors when scanning plants with the camera, follow these steps:

### 1. Check API Key Configuration

**Problem:** Missing or invalid Plant.id API key

**Solution:**

1. Make sure you have a `.env` file in the project root (copy from `.env.example`)
2. Add your Plant.id API key:
   ```
   EXPO_PUBLIC_PLANT_ID_KEY=your_actual_api_key_here
   ```
3. Get a free API key from: https://admin.kindwise.com/
4. Restart the Expo development server after changing `.env`

**How to verify:**

- Check Metro bundler logs for: `"Plant.id API key is not configured"`
- Check device logs for: `"Invalid API key. Please check your EXPO_PUBLIC_PLANT_ID_KEY"`

### 2. Check Network Connection

**Problem:** No internet connection or API timeout

**Solution:**

- Ensure your device has internet access
- Try on WiFi instead of mobile data (or vice versa)
- Check if you can access https://plant.id/ from your device's browser

**How to verify:**

- Look for: `"Request timed out"` in logs
- API requests timeout after 30 seconds

### 3. Image Size Issues

**Problem:** Images are too large, causing memory or upload issues

**Solution:**

- The app now uses `quality: 0.7` for camera captures (was `1.0`)
- This reduces file sizes while maintaining good quality
- If issues persist, you can lower it further to `0.5`

**How to verify:**

- Check logs for file size warnings: `"Large file detected"`
- Base64 conversion logs will show character length
- Files over 5MB will show warnings

### 4. API Rate Limits

**Problem:** Too many requests to Plant.id API

**Solution:**

- Free tier has limited requests per month/day
- Wait a few minutes between scan attempts
- Consider upgrading your API plan at https://admin.kindwise.com/

**How to verify:**

- Look for: `"API rate limit exceeded"` in logs
- HTTP status 429 in response

### 5. Invalid Image Format

**Problem:** Camera URI not compatible or image corrupted

**Solution:**

- Captured images are now compressed (quality 0.7)
- Ensure good lighting when taking photos
- Try retaking if theblur or very dark

**How to verify:**

- Check logs for: `"File does not exist at URI"`
- Base64 conversion errors
- HTTP status 400: "Invalid request"

## Viewing Debug Logs

### On Android (via USB):

```bash
npx react-native log-android
```

or

```bash
adb logcat | grep "identifyPlant\|imageToBase64"
```

### On iOS (via USB):

```bash
npx react-native log-ios
```

### In Expo Go:

- Shake device to open developer menu
- Select "Show Dev Menu" → "Debug Remote JS"
- Open browser console for logs

## Enhanced Logging

The app now includes detailed logging with `[identifyPlant]` and `[imageToBase64]` prefixes:

1. **Image URI**: Shows the file path being analyzed
2. **File Info**: Size, existence check
3. **Base64 Length**: Character count after conversion
4. **Request Details**: URL, body size
5. **Response Status**: HTTP status codes
6. **Error Details**: Specific error messages with solutions

## Common Error Messages and Solutions

| Error Message                          | Cause                         | Solution                                     |
| -------------------------------------- | ----------------------------- | -------------------------------------------- |
| `"Plant.id API key is not configured"` | No `.env` file or missing key | Add `EXPO_PUBLIC_PLANT_ID_KEY` to `.env`     |
| `"Invalid API key"`                    | Wrong or expired key          | Get new key from https://admin.kindwise.com/ |
| `"API rate limit exceeded"`            | Too many requests             | Wait or upgrade plan                         |
| `"Request timed out"`                  | Network slow/down             | Check internet connection                    |
| `"File does not exist"`                | Invalid URI from camera       | Restart app, check permissions               |
| `"Failed to convert image to base64"`  | Memory/file access issue      | Lower image quality, restart app             |
| `"Invalid request"`                    | Image too large/corrupted     | Image now compressed automatically           |

## Testing Checklist

- [ ] `.env` file exists with valid `EXPO_PUBLIC_PLANT_ID_KEY`
- [ ] Device has internet connection (WiFi or data)
- [ ] Camera permissions granted
- [ ] Good lighting when taking photos
- [ ] Photos are of actual plants (not blur/darkness)
- [ ] Not hitting API rate limits (space out tests)
- [ ] Expo development server restarted after `.env` changes
- [ ] App rebuilt after installing dependencies

## Still Having Issues?

1. Clear Expo cache:

   ```bash
   npx expo start -c
   ```

2. Rebuild the app:

   ```bash
   # For Android
   cd android && ./gradlew clean && cd ..
   npx expo run:android

   # For iOS
   cd ios && pod install && cd ..
   npx expo run:ios
   ```

3. Check the full error logs:
   - Look for `[identifyPlant]` and `[imageToBase64]` prefixes
   - Note the exact error message
   - Check HTTP status codes

4. Verify API key is working:
   - Test your API key with a curl request:
   ```bash
   curl -X POST "https://plant.id/api/v3/identification" \
     -H "Content-Type: application/json" \
     -H "Api-Key: YOUR_API_KEY" \
     -d '{"images":["data:image/jpeg;base64,BASE64_STRING_HERE"]}'
   ```

## Need More Help?

Include these details when asking for help:

- Device (Android/iOS, model)
- Error message from logs (with `[identifyPlant]` prefix)
- HTTP status code (if API error)
- Image size from logs
- Network type (WiFi/mobile data)
