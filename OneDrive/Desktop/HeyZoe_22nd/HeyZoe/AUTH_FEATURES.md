# Hey Zoe - Authentication & Partner Sharing Features

## Overview

I've implemented a complete authentication system with optional partner linking. Users can:
- Sign up with email/password
- Sign in to access their account
- Continue as a guest (without authentication)
- Link their partner to create a shared couple dashboard
- Sync data to cloud (Firestore) when logged in

## Features Implemented

### 1. **Three Authentication Modes**

#### Guest Mode
- Users can try the app without creating an account
- Data is stored locally in browser
- No email or password required
- Perfect for first-time exploration
- Shows "Guest mode" in Profile

#### Email/Password Sign Up
- Create account with email and password
- Password visibility toggle (eye icon)
- Show/hide password for security
- Automatic login after signup
- Account data synced to Firestore

#### Email/Password Sign In
- Sign in with existing email and password
- Persistent login (survives browser refresh)
- Automatic session recovery
- Shows user email in Profile

### 2. **Profile Screen Updates**

The Profile screen now includes:
- **Auth Status Display**: Shows current login state
  - Logged in: displays email with logout button
  - Guest mode: shows "Guest mode" label
  - Not logged in: shows "Sign up or sign in" button
- **All Original Features**: Goals, stats, badges, expert features all still work
- **Partner Share Option** (when in couple mode and logged in)

### 3. **Partner Linking System**

#### How It Works:
1. **Generate Share Code**
   - Both partners go to Profile > "Share partner code"
   - Click "Generate" to create a unique 6-character code
   - Example: `ABC123`

2. **Exchange Codes**
   - Partner A generates a code and shares it with Partner B
   - Partner B enters the code in the "Link partner" modal
   - System verifies the code and automatically links both accounts

3. **Shared Couple Dashboard**
   - Once linked, both partners see each other's goals
   - Couple mode is enabled
   - "Us — shared dashboard" tab appears in Profile
   - Data syncs between both accounts

#### Share Options:
- **Share Code Method**: Text-based 6-character code (easy to share via message/call)
- **Works Anywhere**: Mobile, tablet, desktop - any device

### 4. **Data Persistence**

#### Local Storage (Always Active)
- Data saved to browser localStorage
- Works offline
- Persists across browser refreshes
- No account needed

#### Cloud Sync (When Logged In)
- Data automatically syncs to Firestore
- Backup in the cloud
- Accessible from any device (once set up)
- Real-time updates (when configured)

### 5. **Auth Modal Screens**

#### Sign In Screen
- Email input
- Password input with visibility toggle
- "Sign in" button
- "Don't have an account? Sign up" link
- "Continue as guest" option

#### Sign Up Screen
- Email input
- Password input with visibility toggle
- "Create account" button
- "Already have an account? Sign in" link

#### Partner Link Screen
- Your generated share code display
- "Generate" button to create new codes
- Partner code input field
- "Link partner" button
- Error messages for invalid codes

## User Experience

### First Time Users
1. App loads in welcome screen
2. Complete onboarding (mode, horizon, categories, first goal)
3. On Profile tab, can:
   - Continue as guest (data saved locally)
   - Sign up (data synced to cloud)
   - Sign in (if already have account)

### Returning Guest Users
1. Data automatically loads from localStorage
2. Can convert to account anytime by going to Profile

### Returning Logged-In Users
1. Auto-login on app load (session persists)
2. Data loads from Firestore
3. Seamless experience across devices

### Couples Setup
1. Both partners sign up separately
2. One generates a share code
3. Other enters the code
4. Couple dashboard automatically created
5. Can toggle between individual and couple modes

## Setup Instructions

### For Development (Guest Mode Only)
1. App works immediately without Firebase setup
2. Use "Continue as guest" to try all features
3. Data saves locally

### For Full Features (Sign Up/Login/Cloud Sync)
1. Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Configure Firebase project
3. Update `src/firebase.js` with your config
4. Enable Email/Password auth
5. Create Firestore database

## Technical Details

### Files Modified
- **HeyZoe (1).jsx** - Main component with auth logic
  - Added Firebase imports
  - Auth state management
  - Auth functions (signup, login, logout, guest)
  - Partner linking logic
  - AuthModal component
  - ProfileScreen updates

### Files Created
- **src/firebase.js** - Firebase configuration
- **FIREBASE_SETUP.md** - Setup guide
- **AUTH_FEATURES.md** - This documentation

### Dependencies Added
- `firebase` - Auth, Firestore, real-time database

### State Management
- `user` - Current Firebase user object
- `isGuest` - Guest mode flag
- `authLoading` - Loading state during auth check
- `showAuthModal` - Modal visibility
- `authMode` - Which modal to show (login/signup/share-partner)
- `shareCode` - User's generated share code
- `partnerId` - Linked partner's user ID

## Security Considerations

### Current (Test Mode)
- Firebase in "Test mode" allows reads/writes from anyone
- Suitable for development and testing

### Production (Recommended Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### Best Practices
- Never commit Firebase config with real API keys to public repos
- Use environment variables for production
- Implement rate limiting for auth attempts
- Add password reset functionality (can be added later)
- Enable email verification (can be added later)

## Future Enhancements

Potential features that could be added:
1. **Password Reset** - Email-based password recovery
2. **Email Verification** - Verify email on signup
3. **Google Sign-In** - One-click signup with Google
4. **Social Sharing** - Share progress on social media
5. **Real-Time Sync** - Live updates between partner devices
6. **Offline Sync** - Queue changes offline, sync when online
7. **Data Export** - Download all data as JSON
8. **Account Deletion** - Purge all user data
9. **Multiple Profiles** - Manage multiple planning horizons
10. **Profile Picture** - Upload custom avatar

## Testing Checklist

- [x] Guest mode works without Firebase
- [x] Auth modal displays correctly
- [x] Profile shows auth status
- [x] All existing features still work
- [x] Data persists locally
- [ ] Firebase sign up works (requires Firebase setup)
- [ ] Firebase sign in works (requires Firebase setup)
- [ ] Partner linking works (requires Firebase setup)
- [ ] Cloud sync works (requires Firebase setup)

