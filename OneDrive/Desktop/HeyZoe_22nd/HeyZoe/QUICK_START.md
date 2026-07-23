# Hey Zoe - Quick Start Guide

This reflects the simplified app (3-step onboarding, 3-tab nav). See git
history / the old `HeyZoe (1).jsx` reference if you need the original,
more feature-dense version this was simplified from.

## 🚀 Getting started

Every visitor is silently signed in anonymously the moment the app loads —
no signup screen, no setup required. Onboarding is just: Welcome → pick
one focus area → Zoe drafts your first goal. That's it, you're on Home.

Your data (goals, XP, streak) is saved to this browser via localStorage.
It survives reloads, but not clearing browser data — see "Save your
account" below to fix that.

## 📲 Install

On Chrome, Edge, or Android, **You → Install → "Install Hey Zoe"** adds it
to your home screen/app list as a standalone app (its own window, its own
icon, no browser chrome). On iOS Safari there's no such prompt — the same
section instead shows how to do it manually (Share icon → "Add to Home
Screen"), since Apple doesn't let sites trigger that themselves.

Once installed, the app also works offline for anything you've already
loaded — it won't fetch new data without a connection, but it won't show
a blank white screen either.

## 🧭 Navigation

Three tabs: **Home** (today's step + check-in), **Goals** (your full
list), **You** (progress, badges, and everything below under "More").

## ❄️ Streak freezes

Missing exactly one day no longer resets your streak to zero. Everyone
starts with 1 freeze; you earn one back every 7-day streak (capped at 3
banked at once). Miss two or more days in a row, or have zero freezes
left, and the streak does reset — freezes cover a single bad day, not an
extended break.

## 🔐 Save your account (recommended)

Anonymous accounts work fine day-to-day, but they don't survive clearing
your browser. From **You → More → "Save your account"**, add an email +
password. This *upgrades* your existing anonymous account in place
(`linkWithCredential`) — same data, same goals, same couple link or
expert listing if you have one, now durable.

Signing in with an *existing* email account on a new device is a
separate action (different flow, different uid) — use the "Already have
an account? Sign in" link inside that same modal.

## 👥 Couple mode

From **You → More → Couple mode**:
1. Tap "Get my code" to generate your share code.
2. Send it to your partner (text, call, whatever).
3. They open the same screen and enter your code under "Have a code?".
4. Both accounts link automatically — no separate confirmation step.

Once linked, **Us** replaces the setup screen: shows goals either of you
marked "share with partner" while creating them. Nothing else about your
goals is ever visible to your partner — sharing is opt-in per goal.

Both partners should ideally save their account first (see above) — an
anonymous link can break if either side clears their browser.

## 🎓 Expert marketplace

**You → More → "Find an expert"** to browse and book (opens the expert's
Calendly). **"List yourself as an expert"** publishes your own profile to
the public directory — needs a saved account, same reasoning as couple
mode: an anonymous listing that disappears when someone clears their
browser isn't much of a marketplace.

## 📊 Life Report

**You → More → Life Report** — generates an AI synthesis of your goals
and sprint history. Persists until you tap Regenerate.
