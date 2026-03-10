# Testing FaceSmash App

## Local Dev Server
- Run `npm run dev` from repo root to start Vite dev server
- Default port is 5173, but it auto-increments if ports are in use (8080, 8081, 8082, etc.)
- The app connects to the production API at `https://api.facesmash.app`
- Sentry is disabled in dev mode (`enabled: import.meta.env.PROD`) — cannot verify Sentry event delivery locally

## Testing Face Recognition Pipeline

### What CAN be verified on headless VMs (no webcam):
- FaceAPI model loading: look for `FaceAPI models loaded — tensors: 368` in console
- TF.js backend initialization: `TF.js backend: cpu` (or `webgl` on GPU machines)
- Model warmup: `Model warmup complete in Xms` — confirms shader pre-compilation works
- Login page UI rendering: "Sign in with your face" heading + camera prompt
- Registration page UI: form fields, terms checkbox, camera capture step
- Dashboard: profile data loading from API

### What CANNOT be tested on headless VMs:
- Full face detection/tracking pipeline (requires webcam)
- Liveness detection (requires real face movement)
- Descriptor extraction and API matching
- TinyFaceDetector vs SSD MobileNet detection quality
- Camera permissions and media stream handling

### Expected Warnings on Headless VM (not bugs):
- `WebGL is not supported on this device` — falls back to CPU backend
- `wasm streaming compile failed` — WASM MIME type issue in dev, works in production
- `Camera initialization error: NotFoundError: Requested device not found` — no webcam
- `401` on `/api/auth/verify` — not logged in, expected

## Key Console Logs to Check
When verifying face recognition pipeline initialization:
1. `Starting global Face API initialization...`
2. `TF.js backend: cpu` (or `webgl`)
3. `FaceAPI models loaded — tensors: 368`
4. `Model warmup complete in Xms`
5. `Global Face API initialization completed successfully`

## Important: face-api Promise Chains
face-api's chained detection methods (e.g. `detectSingleFace().withFaceLandmarks().withFaceDescriptor()`) return task objects that support `await` but NOT `.catch()`. Always use try/catch blocks instead of `.catch()` chains when working with these methods.

## CI/CD
- GitHub Actions workflow at `.github/workflows/deploy.yml`
- CI checks: Build, Redirect rules, Header rules
- Deploy job deploys to Netlify (requires NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID secrets)
- Netlify site ID: `ee5748c1-ab9a-44b0-8dd5-22742c42b4cd`
