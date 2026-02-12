# Plant.id Integration Setup

This guide will help you set up the Plant.id API integration in your Floradex app.

## Prerequisites

All required dependencies are already installed:

- ✅ `expo-file-system` - for image handling
- ✅ `expo-constants` - for environment variables
- ✅ `expo-camera` - for taking photos

## Setup Steps

### 1. Get Your Plant.id API Key

1. Visit [https://admin.kindwise.com/](https://admin.kindwise.com/)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

### 2. Configure Environment Variables

Open your `.env` file in the root directory and add your API key:

```env
EXPO_PUBLIC_PLANT_ID_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your actual API key from Plant.id.

### 3. Restart Your Development Server

After adding the API key, restart your Expo development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
# or
npx expo start
```

## How It Works

### 1. **Take a Photo**

- Open the Scanner tab
- Tap "Open Camera"
- Take a picture of a plant
- Review the captured image

### 2. **Analyze the Plant**

- Tap the "🔍 Analyze" button
- The app will:
  - Convert the image to base64
  - Send it to Plant.id API
  - Display a loading indicator

### 3. **View Results**

The results screen will show:

- ✨ **Plant Name**: Scientific name of the identified plant
- 🎯 **Match Confidence**: Percentage of identification accuracy
- 🌸 **Common Names**: Popular names for the plant
- 📖 **Description**: Information about the plant from Wikipedia
- 🏷️ **Taxonomy**: Family, genus, and other classification info
- 🖼️ **Similar Images**: Reference images of the plant
- 🔗 **Learn More**: Link to detailed Wikipedia article
- 🌿 **Other Possibilities**: Alternative plant suggestions

### 4. **Health Assessment** (Optional)

To enable plant health assessment, modify the service call in [scan.tsx](<app/(tabs)/scan.tsx>):

```tsx
// Change from:
const result = await identifyPlantSimple(photo);

// To:
const result = await identifyPlantWithHealth(photo);
```

This will also detect:

- ⚠️ Plant diseases
- 🐛 Pests and vermins
- 💧 Watering issues
- 🌡️ Environmental problems
- 💊 Treatment recommendations

## API Features Used

### Basic Identification

```typescript
identifyPlantSimple(imageUri, location?)
```

- Plant species identification
- Common names
- Taxonomy
- Description
- Similar images

### Health Assessment

```typescript
identifyPlantWithHealth(imageUri, location?)
```

- Everything from basic identification
- Health status
- Disease detection
- Treatment recommendations

### Advanced Options

```typescript
identifyPlant({
  imageUri: string,
  latitude?: number,
  longitude?: number,
  similarImages?: boolean,
  includeHealth?: boolean,
  language?: string,
  details?: string[]
})
```

## Available Details

You can request additional information by adding to the `details` array:

- `common_names` - Local, non-scientific names
- `taxonomy` - Scientific classification
- `url` - Wikipedia link
- `description` - Plant description
- `image` - Representative image
- `synonyms` - Alternative names
- `edible_parts` - Edible/medicinal uses
- `propagation_methods` - How to propagate
- `watering` - Watering requirements
- `treatment` - Disease treatment (with health assessment)

## Supported Languages

- English (`en`) - default
- German (`de`)
- Spanish (`es`)
- French (`fr`)
- Italian (`it`)
- Dutch (`nl`)
- Polish (`pl`)
- Swedish (`sv`)
- Chinese Simplified (`zh`)
- Chinese Traditional (`zh-hant`)
- And more...

## API Limits

### Free Tier

- Limited API calls per month
- Check your usage at [https://admin.kindwise.com/](https://admin.kindwise.com/)

### Paid Plans

- Start from $29/month for more API calls
- View pricing at [https://kindwise.com/plant-id](https://kindwise.com/plant-id)

## Troubleshooting

### Error: "API key is not configured"

- Make sure you added the API key to `.env`
- Ensure the variable name is exactly: `EXPO_PUBLIC_PLANT_ID_API_KEY`
- Restart your development server

### Error: "Failed to convert image to base64"

- Check camera permissions are granted
- Verify the image was captured successfully
- Try taking a new photo

### Error: "Plant.id API error: 401"

- Your API key is invalid or expired
- Get a new API key from [https://admin.kindwise.com/](https://admin.kindwise.com/)

### Error: "Plant.id API error: 429"

- You've exceeded your API rate limit
- Wait for the limit to reset or upgrade your plan

### "Not a Plant Detected"

- Make sure the image clearly shows a plant
- Ensure good lighting and focus
- Try different angles or closer shots

## Files Structure

```
floradex/
├── .env                           # Your API key (don't commit!)
├── .env.example                   # Template for API key
├── services/
│   └── plantId.ts                # Plant.id API service
├── components/
│   └── plant-result.tsx          # Results display component
└── app/
    └── (tabs)/
        └── scan.tsx              # Scanner screen with integration
```

## Next Steps

1. **Add Location Data**: Use `expo-location` to get GPS coordinates for better accuracy
2. **Save History**: Store identified plants in a local database
3. **Share Results**: Add sharing functionality for identified plants
4. **Offline Mode**: Cache previous results for offline viewing
5. **Plant Collection**: Create a personal plant collection feature

## Resources

- [Plant.id API Documentation](https://documenter.getpostman.com/view/24599534/2s93z5A4v2)
- [Plant.id Website](https://kindwise.com/plant-id)
- [GitHub Examples](https://github.com/flowerchecker/plant-id-examples)
- [Expo Documentation](https://docs.expo.dev/)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your API key is valid
3. Check the console logs for detailed error messages
4. Contact Plant.id support at [https://kindwise.com/](https://kindwise.com/)
