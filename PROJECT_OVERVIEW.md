# Corita's Dream - Project Overview

## 🎨 Project Description

**Corita's Dream** (also known as "Immersive Stedelijk") is a multiplayer, immersive 3D gallery experience that brings the art and ideals of Corita Kent to life. Users can explore a virtual museum space together, view artwork, interact with other visitors, and experience the powerful messages of love, hope, and justice through Corita's work.

The project is inspired by the exhibition "Everyday, Someday and Other Stories" at the Stedelijk Museum, showcasing visual art and design from the '50s to the '80s, with a focus on Corita Kent's increasingly political work from the '60s.

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **Next.js 12** - React framework with SSR/SSG
- **React 17** - UI library
- **React Three Fiber** - 3D rendering framework
- **Three.js** - 3D graphics library
- **Zustand** - State management
- **SCSS Modules** - Styling
- **Supabase** - Authentication and user profiles

**Backend:**
- **Colyseus** - Multiplayer game server
- **Express** - HTTP server
- **TypeScript** - Type safety

**3D & Physics:**
- **@react-three/drei** - Three.js helpers
- **@react-three/postprocessing** - Post-processing effects
- **@react-three/xr** - WebXR/VR support
- **cannon-es** - Physics engine
- **three-pathfinding** - Navigation mesh

**Real-time Communication:**
- **WebRTC** (simple-peer) - Peer-to-peer voice chat
- **WebSocket** (Colyseus) - Game state synchronization

### Dual-Server Architecture

The application uses a hybrid architecture:

1. **Next.js Server** (Port 3000)
   - Handles page rendering, authentication, and API routes
   - Serves the React application

2. **Colyseus Game Server**
   - **Development**: Runs on port 8080 (separate from Next.js)
   - **Production**: Attaches to the same HTTP server as Next.js (port 3000)
   - Manages real-time multiplayer state synchronization
   - Handles player movement, physics, and voice chat signaling

## 📁 Project Structure

```
coritas-dream/
├── components/          # React components
│   ├── core/           # Reusable UI components (buttons, headers, modals)
│   ├── domain/         # Feature-specific components (onboarding, voice calls)
│   ├── experience/       # 3D scene components (users, environment, VR)
│   └── landingPageCanvas/  # Landing page 3D canvas
├── pages/              # Next.js pages
│   ├── index.tsx       # Landing page
│   ├── signin.tsx      # Authentication page
│   ├── dream.tsx       # Main 3D experience page
│   └── api/            # API routes (Supabase)
├── server/             # Colyseus game server
│   ├── server.ts       # Server entry point
│   ├── room/           # Game room logic
│   ├── player/         # Player schema and logic
│   └── state/          # Colyseus state schema
├── shared/             # Code shared between client and server
│   └── physics/        # Physics system
├── store/              # Zustand state store
├── hooks/              # React hooks (auth, Colyseus, device detection)
├── context/            # React context providers
├── styles/             # SCSS stylesheets
├── utils/              # Utility functions
└── public/             # Static assets (models, textures, images)
```

## 🎮 Core Features

### 1. **Avatar System**
- **Ready Player Me Integration**: Users create custom 3D avatars
- Avatar GLB URLs stored in Supabase profiles table
- Avatars rendered in the 3D scene using React Three Fiber
- Support for multiple animation states: idle, walking, praying, fist

### 2. **Multiplayer Experience**
- Real-time synchronization of up to 30 concurrent players
- Server-authoritative movement and physics
- Player positions, rotations, and animations synced at 100ms patch rate
- Optimized rendering with instanced users for performance

### 3. **3D Environment**
- Immersive museum gallery space
- Interactive paintings organized by themes (love, hope, justice)
- Physics-based collision detection
- Special trigger areas for different themes
- Post-processing effects for visual enhancement

### 4. **WebXR/VR Support**
- Full WebXR compatibility for VR headsets
- VR teleportation system for locomotion
- Separate canvas rendering for VR vs. desktop
- Automatic detection of WebXR support

### 5. **Voice Communication**
- Peer-to-peer WebRTC voice chat
- Signaling handled through Colyseus messages
- Mute/unmute functionality
- Mute state synchronized across all players

### 6. **Authentication**
- Supabase authentication integration
- User profiles with avatar storage
- Protected routes requiring authentication

## 🔄 State Management

### Zustand Store (`store/store.ts`)

The application uses Zustand with `subscribeWithSelector` middleware for fine-grained reactivity:

- **`controls`**: Keyboard input state (forward, backward, left, right)
- **`players`**: Map of all connected players with their network data
- **`animationName`**: Current player animation state
- **`isMuted`**: Microphone mute state
- **`focusImage`**: Currently focused painting metadata
- **`callRequests`**: WebRTC call signaling data
- **`cursorState`**: UI cursor state (grab/pointer)

### Colyseus State (`server/state/state.ts`)

Server-side authoritative state:
- **`players`**: Map of Player instances with positions, rotations, animation states
- Synced to clients at 100ms intervals
- Physics bodies managed server-side

## 🎯 Key Components

### Pages

1. **`pages/index.tsx`** - Landing page
   - Introduction to Corita Kent and the experience
   - 3D animated canvas background
   - Entry point to sign in or start experience

2. **`pages/dream.tsx`** - Main experience page
   - Ready Player Me avatar creation flow
   - WebXR detection and setup
   - 3D canvas rendering (desktop or VR)

3. **`pages/signin.tsx`** - Authentication page
   - Supabase sign-in interface

### 3D Components

1. **`components/experience/canvas/`**
   - `canvas.tsx` - Standard WebGL canvas
   - `xrCanvas.tsx` - WebXR-enabled canvas

2. **`components/experience/users/`**
   - `user.tsx` - Individual player component
   - `userModel.tsx` - 3D avatar model loader
   - `instancedUsers.tsx` - Optimized multi-user rendering

3. **`components/experience/vr/`**
   - `teleport.tsx` - VR locomotion system
   - `navigationLine.ts` - Teleport arc visualization

### Server Components

1. **`server/room/room.ts`** - Gallery room
   - Max 30 clients
   - Handles player movement, teleportation, animations
   - Manages WebRTC signaling for voice chat
   - Broadcasts state updates to all clients

2. **`server/player/player.ts`** - Player schema
   - Colyseus Schema with position, rotation, animation state
   - Physics body (sphere collider)
   - Movement handling

3. **`shared/physics/physics.ts`** - Physics system
   - Cannon-es wrapper
   - Shared between client and server
   - Collision groups and trigger areas

## 🔌 Communication Patterns

### Colyseus Messages

**Client → Server:**
- `move` - Player position/rotation updates
- `teleport` - VR teleportation data
- `animationState` - Animation state changes
- `sending signal` / `returning signal` - WebRTC signaling
- `mute` / `unmute request` - Voice chat control

**Server → Client:**
- `spawnPlayer` - New player joined
- `removePlayer` - Player left
- `move` - Player position updates
- `mute state` - Mute state changes
- `user joined` / `user-disconnected` - Voice chat events

## 🚀 Development Workflow

### Running the Application

```bash
# Development mode (recommended)
npm run dev
# - Next.js on port 3000
# - Colyseus server on port 8080
# - Auto-restart with nodemon
# - 200ms simulated latency

# Production build
npm run build      # Builds both Next.js and server
npm start          # Runs on single port 3000
```

### Build Commands

```bash
npm run build:next     # Build Next.js frontend only
npm run build:server   # Compile TypeScript server to dist/
npm run build          # Build both
```

## 🔐 Environment Variables

Required in `.env.local`:
- Supabase client credentials (URL, anon key)
- `PORT` (optional, defaults to 3000)

## 📊 Performance Considerations

- **Instanced Rendering**: Multiple users rendered efficiently
- **Physics Optimization**: Server-side physics reduces client load
- **Patch Rate**: 100ms state synchronization balance
- **Dynamic Imports**: Three.js components loaded with `ssr: false`
- **React Strict Mode**: Disabled to prevent double-rendering issues with Three.js

## 🎨 Art Assets

The project includes:
- **Paintings**: Organized by themes (love, hope, justice) in `/public`
- **3D Models**: GLB animations (idle, walking, praying, fist)
- **Environment**: Transformed GLB model for the gallery space
- **Textures**: Various materials and normal maps
- **Fonts**: NeutralFace font family

## 🔮 Future Considerations

- Room capacity: Currently limited to 30 concurrent users
- Latency: 200ms simulated in development (removed in production)
- Optimization opportunities: Player spawn/remove broadcasts could be optimized to send only changed players
- Physics: Server-side physics simulation interval currently commented out

## 📝 Notes

- React Strict Mode is disabled in `next.config.js` to prevent issues with Three.js
- The project uses TypeScript with separate configs for frontend and server
- Colyseus schemas use experimental decorators
- WebXR support is automatically detected and enabled when available
- Avatar creation is a one-time process per user (stored in Supabase)

