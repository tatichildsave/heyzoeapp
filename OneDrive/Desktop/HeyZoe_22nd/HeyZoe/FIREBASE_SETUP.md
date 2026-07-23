# Firebase Setup Guide

To enable authentication and cloud data sync, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter a project name (e.g., "Hey Zoe")
4. Enable Google Analytics (optional)
5. Create the project

## 2. Register Web App

1. In your Firebase project, click the web icon (`</> `) to register a web app
2. Enter app name "Hey Zoe"
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy your Firebase config

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill all `VITE_FIREBASE_*` values from Firebase Console -> Project Settings -> Web app config
3. Config is read by `src/services/firebase/index.js`

## 4. Enable Authentication

1. In Firebase Console, go to **Authentication** (in left menu under "Build")
2. Click on "Sign-up method"
3. Enable "Email/Password"
4. Also enable **"Anonymous"** — every user is silently signed in anonymously on first load (no UI, no extra step) so that `askZoe` (the AI proxy function) has a UID to check. Without this enabled, Zoe's AI calls will fail and the app will silently fall back to the offline goal template.

## 5. Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Start in "Test mode" (for development)
4. Choose your region
5. Click "Create"

## 6. Set Firestore Security Rules (Required for Production)

This repo includes `firestore.rules` with authenticated user and partner-link constraints.

Deploy rules with Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

If you do not deploy secure rules, Firestore access may fail or be over-permissive.

## 7. Test the Auth System

1. Go to the app
2. Navigate to Profile
3. Click "Sign up or sign in"
4. Try creating an account or signing up with guest mode

## Features

- **Email/Password Auth**: Create account and sign in
- **Guest Mode**: Try the app without creating an account
- **Cloud Sync**: Your data syncs to Firestore (when logged in)
- **Partner Linking**: Share a code with your partner to create a couple dashboard
- **Auto-Login**: Your session persists across browser refreshes

## 8. Enable Push Notifications (goal check-in reminders)

Optional — the app works without this, the "Goal check-in reminders" toggle
in You just won't do anything until it's set up.

1. In Firebase Console, go to **Project Settings -> Cloud Messaging**
2. Under "Web configuration", click **"Generate key pair"** to create a VAPID key
3. Copy it into `.env` as `VITE_FIREBASE_VAPID_KEY`
4. Deploy the scheduled function: `firebase deploy --only functions:sendGoalReminders`
5. **Requires the Blaze (pay-as-you-go) plan** — scheduled functions run on
   Cloud Scheduler, which the free Spark plan doesn't support. In practice
   this stays well within Firebase's free monthly quota for a small number
   of users; you're only billed if you exceed it.
6. The first time Cloud Scheduler is used on a project, Firebase may prompt
   you to enable the Cloud Scheduler API in Google Cloud Console — accept
   that prompt if you see it.

Once enabled, `functions/sendGoalReminders` runs hourly and sends at most
one notification per user per 6-hour window, only between 6am-9pm in that
user's own timezone, and only if they haven't opened the app more recently
than that same window.

## 9. Enable Analytics (know if anyone's using the app)

Optional — the app works without it, you just fly blind on usage.

1. In Firebase Console, go to **Project Settings -> Your apps** (or **Analytics** in the left menu, if it offers to set it up)
2. If prompted, link (or create) a Google Analytics account for the project
3. Back in **Project Settings -> Your apps -> SDK setup and configuration**, find the **Measurement ID** (starts with `G-`)
4. Copy it into `.env` as `VITE_FIREBASE_MEASUREMENT_ID`

That's it — no redeploy of functions needed, this is client-only. Every
meaningful action (goal created, check-in, milestone completed, habit
checked in, sprint started/completed, level up, badge earned, couple
linked, expert booked, Life Report generated, app installed, reminders
enabled) is already instrumented (see `src/services/analytics`) and starts
flowing the moment this env var is set and the app is rebuilt/redeployed.

View it in Firebase Console -> Analytics, or the linked Google Analytics
(GA4) property for the fuller report set — funnels, retention, per-event
breakdowns. Data typically takes a few hours to first appear.

## Troubleshooting

If you get CORS errors or auth issues:

1. Check your Firebase config values are correct
2. Ensure "Email/Password" is enabled in Authentication methods
3. Verify Firestore database is in "Test mode" or has correct security rules
4. Check browser console for detailed error messages

