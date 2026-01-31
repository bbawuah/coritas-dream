# Refactoring Plan: Remove Auth & Add Random Avatars

## Goal
Remove all Supabase authentication and database logic. Users will enter the experience directly without sign-in, and each user will be assigned a random character model from a predefined set of GLB files.

---

## Phase 1: Move Avatar Files

### Task 1.1: Create avatars directory and move GLB files
- Create `/public/avatars/` directory
- Move the 3 character GLB files from project root:
  - `697e08be08538cb8aaa4de55.glb` → `/public/avatars/character-1.glb`
  - `697e08e6ea77ff02ff753718.glb` → `/public/avatars/character-2.glb`
  - `697e094947a75ab0c8d153bb.glb` → `/public/avatars/character-3.glb`

---

## Phase 2: Create Avatar Selection Logic

### Task 2.1: Create avatar constants file
- Create `/shared/avatars.ts` with:
  ```typescript
  export const AVATAR_MODELS = [
    '/avatars/character-1.glb',
    '/avatars/character-2.glb',
    '/avatars/character-3.glb',
  ];

  export function getRandomAvatar(): string {
    return AVATAR_MODELS[Math.floor(Math.random() * AVATAR_MODELS.length)];
  }
  ```

### Task 2.2: Update Player schema to include avatar URL
- Modify `/server/player/player.ts`:
  - Add `@type('string') avatar` field to store the assigned avatar URL
  - Assign random avatar in constructor using `getRandomAvatar()`

### Task 2.3: Update Colyseus room to broadcast avatar
- The avatar URL will be part of the player state, automatically synced to clients

---

## Phase 3: Update Client-Side Avatar Loading

### Task 3.1: Update userModel.tsx
- No changes needed (already accepts GLB URL)

### Task 3.2: Update canvas.tsx
- Remove Supabase profile fetching logic
- Get avatar URL from Colyseus player state instead of database

### Task 3.3: Update NonPlayableCharacters.tsx
- Remove Supabase profile query
- Load avatar directly from player's `avatar` field in Colyseus state

### Task 3.4: Update Zustand store
- Add `avatar` field to `IPlayerNetworkData` interface

---

## Phase 4: Simplify Entry Flow

### Task 4.1: Update dream.tsx
- Remove session/auth checks
- Remove Ready Player Me iframe logic
- Remove profile existence check
- Go directly to 3D experience on page load

### Task 4.2: Update useColyseus.tsx
- Remove `user.id` from room join options (no longer needed)
- Generate a random guest ID or use session ID only

---

## Phase 5: Remove Supabase & Auth Code

### Task 5.1: Remove auth-related files
- Delete `/utils/supabase.ts`
- Delete `/context/authContext.tsx`
- Delete `/hooks/useAuth.tsx`
- Delete `/pages/signin.tsx`
- Delete `/pages/api/[...supabase].ts`
- Delete `/styles/signin/` directory

### Task 5.2: Update _app.tsx
- Remove Supabase `Provider` wrapper
- Remove `AuthProvider` wrapper

### Task 5.3: Update index.tsx (home page)
- Remove sign-out logic
- Update to link directly to `/dream`

### Task 5.4: Clean up components
- Remove Supabase imports from any remaining components
- Update settings menu to remove sign-out functionality

---

## Phase 6: Remove Supabase Dependencies

### Task 6.1: Uninstall packages
```bash
npm uninstall @supabase/supabase-auth-helpers @supabase/supabase-js react-supabase
```

### Task 6.2: Clean up environment variables
- Remove Supabase-related vars from `.env.local` (optional, won't break anything)

---

## Phase 7: Update Player UUID Logic

### Task 7.1: Generate client-side guest ID
- In `useColyseus.tsx`, generate a random UUID for each user session
- Store in localStorage for session persistence (optional)

### Task 7.2: Update server player creation
- Remove expectation of Supabase UUID
- Use session ID or generated guest ID

---

## Files to Modify

| File | Action |
|------|--------|
| `/public/avatars/` | Create directory |
| `*.glb` (root) | Move to `/public/avatars/` |
| `/shared/avatars.ts` | Create new |
| `/server/player/player.ts` | Add avatar field |
| `/server/room/room.ts` | Minor updates |
| `/store/store.ts` | Add avatar to interface |
| `/pages/dream.tsx` | Simplify (remove auth) |
| `/pages/index.tsx` | Remove sign-out |
| `/pages/_app.tsx` | Remove providers |
| `/hooks/useColyseus.tsx` | Remove user.id |
| `/components/experience/canvas/canvas.tsx` | Remove Supabase |
| `/components/experience/users/NonPlayableCharacters/` | Remove Supabase query |
| `/components/core/headers/settingsMenu/` | Remove sign-out |

## Files to Delete

| File |
|------|
| `/utils/supabase.ts` |
| `/context/authContext.tsx` |
| `/hooks/useAuth.tsx` |
| `/pages/signin.tsx` |
| `/pages/api/[...supabase].ts` |
| `/styles/signin/SignIn.module.scss` |
| `/styles/signin/SignIn.module.scss.d.ts` |

---

## Testing Checklist

- [ ] GLB files load correctly from `/public/avatars/`
- [ ] Each new user gets a random avatar
- [ ] Avatar syncs correctly to other players
- [ ] No authentication prompts appear
- [ ] Home page links directly to experience
- [ ] Multiple users can join and see each other's avatars
- [ ] Animations work with new avatar models
