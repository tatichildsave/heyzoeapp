# Design System

A reusable, minimal design foundation inspired by Apple + Notion + Linear + Arc aesthetics.

Principles
- Minimal and calm visual hierarchy
- Premium spacing and typography rhythm
- Reduced borders and low-noise surfaces
- High consistency with token-driven styles

## Tokens
- Colors: `src/design-system/tokens/colors.js`
- Typography: `src/design-system/tokens/typography.js`
- Spacing: `src/design-system/tokens/spacing.js`
- Radius: `src/design-system/tokens/radius.js`
- Shadows: `src/design-system/tokens/shadows.js`

## Components
- Buttons: `Button`
- Cards: `Card`
- Inputs: `Input`
- Badges: `Badge`
- Chips: `Chip`
- Dialogs: `Dialog`
- Empty states: `EmptyState`
- Loading skeletons: `Skeleton`, `SkeletonText`

## Usage
```jsx
import { Button, Card, Input, Badge, Chip, Dialog, EmptyState, Skeleton } from "../design-system";
```

## Notes
- Global baseline styles are in `src/design-system/globals.css`.
- Existing app compatibility is preserved via `src/theme/index.js` and `src/components/common/Primitives.jsx`.
