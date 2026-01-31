# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Immersive Stedelijk is a multiplayer VR/web gallery experience built with Next.js, React Three Fiber, and Colyseus. Users can create avatars using Ready Player Me and explore a 3D museum space together in real-time, with support for both desktop browsers and WebXR (VR headsets).

## Development Commands

### Running the Application

```bash
# Development mode (recommended)
npm run dev
# - Runs Next.js on port 3000
# - Runs Colyseus game server on port 8080
# - Includes nodemon for auto-restart on server changes
# - Simulates 200ms latency between server and client

# Production build and start
npm run build      # Builds both Next.js and server
npm start         # Runs on single port 3000
```

### Build Commands

```bash
npm run build:next     # Build Next.js frontend only
npm run build:server   # Compile TypeScript server to dist/
npm run build          # Build both (runs build:next then build:server)
```

### Code Quality

```bash
npm run lint    # Run ESLint (Next.js + Prettier config)
```

## Architecture

### Server-Client Communication

The application uses a **dual-architecture pattern**:

1. **Next.js Server** (port 3000 in dev): Handles page rendering, authentication, and API routes
2. **Colyseus WebSocket Server** (port 8080 in dev, merged with 3000 in production): Manages real-time multiplayer state

Key files:
- `server/server.ts` - Entry point that initializes both servers
- `server/room/room.ts` - Gallery room logic (max 30 clients, 100ms patch rate)
- `server/state/state.ts` - Colyseus state schema (players map)
- `hooks/useColyseus.tsx` - Client-side Colyseus connection hook

### State Management

**Zustand** (`store/store.ts`) manages client-side state:
- `controls`: Keyboard input state (forward, backward, left, right)
- `players`: IPlayerType record of all connected players
- `animationName`: Current player animation state (idle, walking, praying, fist)
- `isMuted`: Microphone state
- `focusImage`: Currently focused painting metadata

State uses `subscribeWithSelector` middleware for fine-grained reactivity.

### Player System

Players have both **client** and **server** representations:

**Server** (`server/player/player.ts`):
- Colyseus Schema with `@type` decorators for sync
- Physics body using cannon-es (sphere collider)
- Position (x, y, z) and rotation (rx, ry, rz)
- Animation state and mute status
- Movement handled by `handleUserDirection(angle)`

**Client** (components/experience/users/):
- `user.tsx` - Individual player component
- `userModel.tsx` - 3D avatar loaded from Ready Player Me
- `instancedUsers.tsx` - Optimized rendering for multiple users
- `NonPlayableCharacters/` - Static NPCs

### Physics System

`shared/physics/physics.ts` provides a cannon-es wrapper:
- Shared between server and client (in `/shared` directory)
- Gravity: -9.82 on Y axis
- Collision groups: GROUP1 (players), GROUP2 (environment)
- Special trigger areas: heartArea, justiceArea, hopeArea
- `createPlayerPhysics()` - Sphere collider for players
- `createPhysics()` - Trimesh colliders for environment
- Updates at 60 FPS via `updatePhysics(dt)`

### 3D Rendering

**React Three Fiber** setup in `components/experience/canvas/`:
- `canvas.tsx` - Standard WebGL canvas
- `xrCanvas.tsx` - WebXR-enabled canvas for VR
- Dynamic import with `ssr: false` in `pages/dream.tsx`

VR features (`components/experience/vr/`):
- `teleport.tsx` - VR locomotion system
- `navigationLine.ts` - Teleport arc visualization
- WebXR session detection in dream.tsx

### Authentication

**Supabase Auth** integration:
- Provider wraps app in `pages/_app.tsx`
- `context/authContext.tsx` - Auth context provider
- `hooks/useAuth.tsx` - Auth hook
- `pages/api/[...supabase].ts` - Supabase API routes
- User profiles stored in Supabase (avatar URL, user ID)

### Ready Player Me Integration

Avatar creation flow in `pages/dream.tsx`:
1. Check if user has profile in Supabase
2. If not, show Ready Player Me iframe (`https://demo.readyplayer.me/avatar?frameApi`)
3. Listen for `v1.avatar.exported` event
4. Store avatar GLB URL in Supabase profiles table
5. Load avatar in 3D scene via `userModel.tsx`

### Peer-to-Peer Voice

WebRTC voice chat using **simple-peer**:
- Signaling handled through Colyseus messages:
  - `sending signal` / `user joined` - Initiate connection
  - `returning signal` / `receiving returned signal` - Complete handshake
  - `mute` / `unmute request` - Control audio state
- Mute state synced to player schema
- Call requests stored in Zustand store

## TypeScript Configuration

Two tsconfig files:
- `tsconfig.json` - Frontend (Next.js, ESNext, no emit)
- `tsconfig.server.json` - Server (CommonJS, outputs to dist/, ES2017)

Both use `experimentalDecorators: true` for Colyseus schemas.

## Environment Variables

Required in `.env.local`:
- Supabase configuration (client credentials)
- PORT (optional, defaults to 3000)

## Key Patterns

1. **Colyseus Messages**: Use `room.send()` client-side, `room.onMessage()` and `this.broadcast()` server-side
2. **State Updates**: Server is authoritative - clients send actions, server updates state, broadcasts to all
3. **Physics Sync**: Physics runs on server, positions synced to clients at patch rate (100ms)
4. **Asset Loading**: Use next/dynamic with ssr: false for Three.js components
5. **Session Management**: Session ID from Colyseus used as player key in state map

## Important Notes

- **Development**: Game server and Next.js run on separate ports (8080 and 3000)
- **Production**: Colyseus WebSocket transport attaches to same HTTP server as Next.js (port 3000)
- **Latency Simulation**: 200ms simulated in dev mode (see server/server.ts:41)
- **Max Clients**: Room limited to 30 concurrent users (see server/room/room.ts:11)
- **React Strict Mode**: Disabled in next.config.js (reactStrictMode: false)
