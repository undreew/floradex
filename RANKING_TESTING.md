# Ranking System Testing Guide

## Quick Verification Checklist

### ✅ What Was Implemented

1. **User Profile with Rank Tracking**
   - Profiles automatically initialized for new users
   - Default rank: Novice
   - Tracks total quizzes passed
   - Stored in SecureStore (encrypted local storage)

2. **Clerk Metadata Sync**
   - Rank and quiz data synced to Clerk
   - Survives app reinstalls
   - Works across devices
   - Falls back gracefully if sync fails

3. **Quiz Completion Tracking**
   - Only counts passed quizzes (≥60% score)
   - Automatically increments quiz counter
   - Triggers rank progression checks
   - Shows rank-up notifications

4. **Rank Progression Logic**
   - Novice → Intermediate (2 quizzes)
   - Intermediate → Expert (5 total quizzes)
   - Properly tracks progress in each tier

5. **UI Components**
   - Beautiful gradient rank cards
   - Progress bars showing advancement
   - Real-time updates (polls every 2 seconds)
   - Debug section in development mode

## How to Test

### Test 1: New User Flow

```bash
# Reset the app to test as a new user
```

1. Open the app
2. Go to Profile tab
3. **Expected**: See Novice rank, 0 quizzes passed

### Test 2: First Quiz Pass

1. Scan 5 plants
2. Take the quiz
3. Score at least 60% (3/5 correct)
4. Complete the quiz
5. Go to Profile tab
6. **Expected**: See Novice rank, 1 quiz passed

### Test 3: Rank Up to Intermediate

1. Pass one more quiz (2nd total)
2. **Expected**:
   - "🎖️ Rank Up!" notification appears
   - Profile shows Intermediate rank
   - Shows 2 quizzes passed
   - Progress bar shows 0/3 to Expert

### Test 4: Rank Up to Expert

1. Pass 3 more quizzes (5 total)
2. On the 5th quiz completion:
3. **Expected**:
   - "🎖️ Rank Up!" notification appears
   - Profile shows Expert rank
   - Shows 5 quizzes passed
   - "Maximum Rank Achieved" message

### Test 5: Failed Quiz (No Credit)

1. Scan 5 plants
2. Take the quiz
3. Score below 60% (0-2 correct answers)
4. Go to Profile tab
5. **Expected**: Quiz count does NOT increase

### Test 6: Data Persistence

1. Pass a quiz
2. Note your rank and quiz count
3. Close the app completely
4. Reopen the app
5. Go to Profile tab
6. **Expected**: Same rank and quiz count as before

### Test 7: Development Debug Mode

1. Run app in development mode
2. Go to Profile tab
3. Scroll down to Account Information
4. **Expected**: See "🔧 Debug Info" section showing:
   - Current Rank
   - Total Quizzes Passed
   - Rank Progress

## Key Files to Review

### Services

- `services/userProfile.ts` - Core ranking logic

### Screens

- `app/(tabs)/profile.tsx` - Profile UI with rank display
- `app/(tabs)/quiz.tsx` - Quiz completion tracking

### Components

- `components/rank-display.tsx` - Rank visualization

## Console Logs to Watch

When testing, look for these console logs:

### Profile Initialization

```
✅ Profile initialized with default rank: novice
```

### Quiz Completion

```
✅ Quiz recorded! Total passed: X, Rank: [rank]
```

### Rank Progression

```
🎖️ RANK UP: Novice → Intermediate
✅ Synced rank data with Clerk
```

### Clerk Sync

```
✅ Synced rank data from Clerk: intermediate, 3 quizzes
```

## Troubleshooting Commands

### Check Current Profile Data

```javascript
// In React Native debugger console
await userProfileService.getProfile();
```

### Check Rank

```javascript
await userProfileService.getRank();
```

### Check Quiz Count

```javascript
await userProfileService.getQuizzesPassed();
```

### Force Sync from Clerk

```javascript
// Pass the user object from Clerk
await userProfileService.syncFromClerk(user);
```

## Expected Behavior Summary

| Quizzes Passed | Expected Rank | Progress to Next |
| -------------- | ------------- | ---------------- |
| 0              | Novice        | 0/2              |
| 1              | Novice        | 1/2              |
| 2              | Intermediate  | 0/3              |
| 3              | Intermediate  | 1/3              |
| 4              | Intermediate  | 2/3              |
| 5+             | Expert        | Max Rank         |

## Common Issues & Solutions

### Issue: "Profile not found" error

**Solution**: Profile should auto-initialize. Check that `ensureProfileExists` is being called.

### Issue: Rank doesn't update after quiz

**Solution**:

- Verify quiz was passed (≥60%)
- Check console for errors
- Refresh profile tab

### Issue: Data lost after restart

**Solution**:

- Check SecureStore permissions
- Verify Clerk connection
- Review sync logs

### Issue: Rank up notification doesn't appear

**Solution**:

- Verify `recordQuizPassed(user)` is called with user object
- Check that quiz was passed, not just completed
- Review alert permissions

## Next Steps for Production

1. **Analytics**: Add tracking for rank achievements
2. **Notifications**: Push notifications for rank ups
3. **Social**: Share rank on social media
4. **Rewards**: Add badges or benefits for each rank
5. **Leaderboard**: Compare ranks with other users

## Manual Test Checklist

- [ ] New user sees Novice rank
- [ ] Passing 2 quizzes → Intermediate rank
- [ ] Passing 5 quizzes → Expert rank
- [ ] Failed quiz doesn't count
- [ ] Rank persists after app restart
- [ ] Progress bar shows correct values
- [ ] Rank up notification appears
- [ ] Debug section visible in dev mode
- [ ] Clerk metadata syncs properly
- [ ] Profile initializes automatically
