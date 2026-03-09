# @facesmash/sdk

Passwordless facial recognition authentication for the web. Drop-in face login for any website.

[![npm](https://img.shields.io/npm/v/@facesmash/sdk)](https://www.npmjs.com/package/@facesmash/sdk)
[![license](https://img.shields.io/npm/l/@facesmash/sdk)](https://github.com/ever-just/facesmash.app/blob/main/LICENSE)

## What is FaceSmash?

FaceSmash replaces passwords with facial recognition. Users sign in by looking at their camera — no passwords, no SMS codes, no hardware tokens. Works on any device, any browser.

- **128-dimensional face vectors** — not photos
- **AES-256 encryption** at rest, TLS 1.3 in transit
- **Client-side ML** — face data never leaves the browser unencrypted
- **< 2 second** authentication
- **99.97%** recognition accuracy

## Installation

```bash
npm install @facesmash/sdk
```

## Quick Start (React)

```tsx
import { FaceSmashProvider, FaceLogin } from '@facesmash/sdk/react';

function App() {
  return (
    <FaceSmashProvider config={{ apiUrl: 'https://api.facesmash.app' }}>
      <FaceLogin
        onResult={(result) => {
          if (result.success) {
            console.log('Welcome back,', result.user.name);
          } else {
            console.error('Login failed:', result.error);
          }
        }}
      />
    </FaceSmashProvider>
  );
}
```

## Quick Start (Vanilla JS)

```js
import { createFaceSmash } from '@facesmash/sdk';

const client = createFaceSmash({
  apiUrl: 'https://api.facesmash.app',
});

// Load ML models (do this once on page load)
await client.init((progress) => {
  console.log(`Loading models: ${progress}%`);
});

// Login with camera images (base64 data URLs)
const result = await client.login(images);
if (result.success) {
  console.log('Authenticated:', result.user.name);
}
```

## API Reference

### `createFaceSmash(config?)`

Creates a new FaceSmash client instance.

```ts
const client = createFaceSmash({
  apiUrl: 'https://api.facesmash.app',  // FaceSmash API URL
  modelUrl: '...',                       // Custom model URL (default: jsdelivr CDN)
  matchThreshold: 0.45,                  // Similarity threshold (0-1)
  minQualityScore: 0.2,                  // Minimum face quality to accept
  minDetectionConfidence: 0.3,           // SSD MobileNet confidence
  maxTemplatesPerUser: 10,               // Max stored templates per user
  debug: false,                          // Enable console logging
});
```

### `client.init(onProgress?)`

Load face recognition ML models. Must be called before `login()` or `register()`.

```ts
await client.init((progress: number) => {
  // progress: 0-100
});
```

### `client.login(images: string[])`

Authenticate a user by matching face images against registered profiles.

```ts
const result = await client.login(images);
// result: { success: boolean, user?: UserProfile, similarity?: number, error?: string }
```

### `client.register(name, images, email?)`

Register a new user with their face.

```ts
const result = await client.register('John Doe', images, 'john@example.com');
// result: { success: boolean, user?: UserProfile, error?: string }
```

### `client.analyzeFace(imageData)`

Analyze a single face image for quality, lighting, head pose, etc.

```ts
const analysis = await client.analyzeFace(base64Image);
// analysis: { qualityScore, confidence, lightingScore, headPose, ... }
```

### `client.on(listener)`

Subscribe to SDK events.

```ts
const unsubscribe = client.on((event) => {
  switch (event.type) {
    case 'models-loaded': break;
    case 'login-success': console.log(event.user); break;
    case 'login-failed': console.error(event.error); break;
    // ...
  }
});
```

## React Components

### `<FaceSmashProvider>`

Context provider that initializes the SDK and loads models.

```tsx
<FaceSmashProvider
  config={{ apiUrl: 'https://api.facesmash.app' }}
  onReady={() => console.log('Ready!')}
  onError={(err) => console.error(err)}
  onEvent={(event) => console.log(event)}
>
  {children}
</FaceSmashProvider>
```

### `<FaceLogin>`

Drop-in login component with webcam, face detection, and authentication.

```tsx
<FaceLogin
  onResult={(result) => { /* LoginResult */ }}
  captureCount={3}
  captureDelay={500}
  autoStart={true}
  className="w-full h-80 rounded-xl overflow-hidden"
  overlay={<YourCustomOverlay />}
/>
```

### `<FaceRegister>`

Drop-in registration component.

```tsx
<FaceRegister
  name="John Doe"
  email="john@example.com"
  onResult={(result) => { /* RegisterResult */ }}
  captureCount={3}
  autoStart={true}
/>
```

### Hooks

```tsx
import { useFaceSmash, useFaceLogin, useFaceRegister, useFaceAnalysis } from '@facesmash/sdk/react';

// Access the client and loading state
const { client, isReady, isLoading, error } = useFaceSmash();

// Login hook
const { login, isScanning, result, reset } = useFaceLogin();

// Register hook  
const { register, isRegistering, result, reset } = useFaceRegister();

// Face analysis hook
const { analyze, analysis, isAnalyzing } = useFaceAnalysis();
```

## Events

| Event | Payload |
|-------|---------|
| `models-loading` | `{ progress: number }` |
| `models-loaded` | — |
| `models-error` | `{ error: string }` |
| `face-detected` | `{ analysis: FaceAnalysis }` |
| `face-lost` | — |
| `login-start` | — |
| `login-success` | `{ user: UserProfile, similarity: number }` |
| `login-failed` | `{ error: string, bestSimilarity?: number }` |
| `register-start` | — |
| `register-success` | `{ user: UserProfile }` |
| `register-failed` | `{ error: string }` |

## Backend

FaceSmash v2.0.0 uses a **Hono.js API + PostgreSQL 16 + pgvector 0.6.0** backend for server-side face matching. The SDK connects to the API at `api.facesmash.app`.

The backend stores:

- `user_profiles` — name, email, face_embedding (`vector(128)` pgvector type)
- `face_templates` — per-user face descriptor templates with quality scores
- `face_scans` — scan history with quality scores
- `sign_in_logs` — authentication logs with match scores

Face matching is performed server-side using pgvector cosine similarity (`<=>` operator) with HNSW indexes for fast approximate nearest neighbor search.

> **Note**: The SDK's `FaceSmashClient` class currently uses PocketBase internally for self-hosted/legacy setups. The hosted FaceSmash platform at `api.facesmash.app` runs the Hono API backend.

See the [full documentation](https://docs.facesmash.app) for setup instructions.

## Links

- **Website**: [facesmash.app](https://facesmash.app)
- **Docs**: [docs.facesmash.app](https://docs.facesmash.app)
- **GitHub**: [github.com/ever-just/facesmash.app](https://github.com/ever-just/facesmash.app)

## License

MIT © [EVERJUST COMPANY](https://facesmash.app)
