# Floradex Ranking System

## Overview

The Floradex app features a three-tier ranking system that rewards users for their learning progress through quizzes.

## Rank Tiers

### 🌱 Novice (Default)

- **Starting Rank**: All new users begin as Novice
- **Theme**: Green gradient
- **Requirements**: None
- **Progress**: Pass 2 quizzes to advance

### 🌿 Intermediate

- **Unlock Requirement**: Pass 2 successful quizzes as Novice
- **Theme**: Blue gradient
- **Progress**: Pass 3 more quizzes to advance (5 total)

### 🏆 Expert

- **Unlock Requirement**: Pass 5 successful quizzes total (2 as Novice + 3 as Intermediate)
- **Theme**: Gold gradient
- **Special**: Maximum rank achieved - users continue taking quizzes to expand knowledge

## Quiz Passing Requirements

- **Passing Score**: 60% or higher
- **Questions**: 5 questions per quiz (from scanned plants)
- **Required to Pass**: 3 out of 5 questions correct minimum

## How It Works

### 1. Profile Initialization

- When a user first opens the app, a profile is automatically created
- Default rank: Novice, Quizzes passed: 0
- Profile data is stored locally (SecureStore) and synced with Clerk metadata

### 2. Quiz Completion

- User scans 5 plants
- Takes quiz based on scanned plants
- If score ≥ 60%, quiz is marked as passed
- Profile is updated with +1 quiz passed
- Rank progression is checked

### 3. Rank Progression Logic

```typescript
// Novice → Intermediate
if (rank === "novice" && quizzesPassed >= 2) {
	rank = "intermediate";
}

// Intermediate → Expert
if (rank === "intermediate" && quizzesPassed >= 5) {
	rank = "expert";
}
```

### 4. Data Persistence

- **Local Storage**: Expo SecureStore (encrypted)
- **Cloud Sync**: Clerk user metadata
  - `userRank`: Current rank
  - `quizzesPassed`: Total quizzes passed
  - `lastRankUpdate`: Timestamp of last update

## UI Components

### Profile Display

- **Location**: Profile Tab
- **Shows**:
  - Current rank with themed gradient card
  - Total quizzes passed
  - Progress bar to next rank
  - Rank emoji and icon

### Rank Up Notification

- Displays when user achieves a new rank
- Modal alert with congratulations message
- Shown after quiz completion

## Technical Implementation

### Files Modified

1. **services/userProfile.ts**
   - Added rank tracking
   - Quiz completion recording
   - Clerk metadata sync
   - Profile initialization

2. **app/(tabs)/profile.tsx**
   - Displays ranking system
   - Auto-refreshes rank data
   - Initializes profile on mount

3. **app/(tabs)/quiz.tsx**
   - Records quiz passes
   - Triggers rank up notifications

4. **components/rank-display.tsx**
   - Visual rank display component
   - Progress tracking
   - Themed gradient cards

### Key Functions

#### `recordQuizPassed(user)`

Records a successful quiz completion and checks for rank progression.

```typescript
const result = await userProfileService.recordQuizPassed(user);
// Returns: { newRank?, quizzesPassed, currentRank }
```

#### `ensureProfileExists(userId)`

Initializes a user profile with default values if it doesn't exist.

#### `syncFromClerk(user)`

Syncs rank data from Clerk metadata to local storage (useful for cross-device sync).

#### `getRankProgress()`

Returns detailed progress information for the current rank.

## Testing

### Manual Testing Steps

1. **New User Flow**
   - Fresh install → should see Novice rank
   - Profile should show 0 quizzes passed

2. **First Rank Up**
   - Pass 2 quizzes
   - Should see "Rank Up" notification
   - Profile should show Intermediate rank

3. **Second Rank Up**
   - Pass 3 more quizzes (5 total)
   - Should see "Rank Up" notification
   - Profile should show Expert rank

4. **Data Persistence**
   - Complete quizzes
   - Close and reopen app
   - Rank and quiz count should persist

5. **Failed Quiz**
   - Score below 60%
   - Should NOT increment quiz counter
   - Rank should NOT change

## Future Enhancements

- [ ] Badge system for achievements
- [ ] Leaderboards
- [ ] Special rewards for Expert rank
- [ ] Rank-specific plant recommendations
- [ ] Streak tracking
- [ ] Social sharing of rank achievements

## Troubleshooting

### Issue: Rank not updating

- Check console logs for errors
- Verify quiz passes (must score ≥ 60%)
- Check that profile exists and is initialized

### Issue: Data not persisting

- Verify SecureStore is working
- Check Clerk connection
- Review sync logs

### Issue: Rank up notification not showing

- Verify quiz was passed (not just completed)
- Check that recordQuizPassed is being called
- Review Alert.alert permissions

## Analytics Events (Future)

Track these events for insights:

- `rank_achieved`: When user reaches a new rank
- `quiz_passed`: When quiz is completed successfully
- `quiz_failed`: When quiz score is below 60%
- `rank_progress_viewed`: When user views profile
