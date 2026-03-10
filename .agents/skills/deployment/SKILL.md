# Deployment & Verification — facesmash.app

## ALWAYS VERIFY DEPLOYMENT WAS SUCCESSFUL AND REVIEW DEPLOY LOGS

Every single deploy must be verified. No exceptions.

## Netlify Deployment (facesmash.app)

### How to Deploy

The repo has a GitHub Actions workflow (`.github/workflows/deploy.yml`) that auto-deploys on push to `main`. If that fails, deploy manually:

```bash
# 1. Build locally
cd ~/repos/facesmash.app && npm run build

# 2. Zip the dist folder
cd dist && zip -r /tmp/facesmash-deploy.zip . -q

# 3. Deploy via Netlify API
curl -s -X POST \
  -H "Authorization: Bearer $netlify" \
  -H "Content-Type: application/zip" \
  --data-binary @/tmp/facesmash-deploy.zip \
  "https://api.netlify.com/api/v1/sites/ee5748c1-ab9a-44b0-8dd5-22742c42b4cd/deploys" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'deploy_id={d.get(\"id\")}')
print(f'state={d.get(\"state\")}')
print(f'error={d.get(\"error_message\",\"None\")}')
"
```

### MANDATORY Post-Deploy Verification Steps

After EVERY deploy, run ALL of these checks:

```bash
# Step 1: Wait for deploy to finish (check state=ready)
curl -s -H "Authorization: Bearer $netlify" \
  "https://api.netlify.com/api/v1/sites/ee5748c1-ab9a-44b0-8dd5-22742c42b4cd/deploys?per_page=3" | python3 -c "
import sys,json
for d in json.load(sys.stdin)[:3]:
    print(f'id={d[\"id\"]} state={d[\"state\"]} created={d[\"created_at\"]} error={d.get(\"error_message\",\"None\")}')"

# Step 2: Verify all routes return 200
for route in / /login /register /dashboard /terms /privacy; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://facesmash.app${route}")
  echo "https://facesmash.app${route} -> $STATUS"
done

# Step 3: Verify API is healthy
curl -s https://api.facesmash.app/api/health | python3 -c "import sys,json; print(json.load(sys.stdin))"

# Step 4: Check for any deploy errors in Netlify logs
DEPLOY_ID="<latest_deploy_id>"
curl -s -H "Authorization: Bearer $netlify" \
  "https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'state: {d[\"state\"]}')
print(f'error: {d.get(\"error_message\",\"None\")}')
print(f'ssl_url: {d.get(\"ssl_url\",\"\")}')
print(f'deploy_ssl_url: {d.get(\"deploy_ssl_url\",\"\")}')
"
```

### What to Check If Deploy Fails

1. **Build errors**: Run `npm run build` locally and check for TypeScript/compilation errors
2. **Netlify auto-deploy broken**: The GitHub-Netlify integration may be disconnected. Check `deploy_key_id` and `installation_id` in site settings. If both are `None`, the user needs to re-link in Netlify UI
3. **SPA routing broken**: Verify `public/_redirects` has `/* /index.html 200` as the LAST rule
4. **WASM files**: Ensure `netlify.toml` has `Content-Type: application/wasm` header and `faceRecognition.ts` sets WASM paths to CDN

## Hono API Deployment (api.facesmash.app)

### How to Deploy

```bash
ssh root@142.93.78.220

# On the server:
cd /opt/facesmash-api
git pull origin main
npm install
pm2 restart facesmash-api

# Verify
curl -s https://api.facesmash.app/api/health
```

### Post-Deploy Verification

```bash
# Check API health
curl -s https://api.facesmash.app/api/health | python3 -m json.tool

# Check PM2 process is running
ssh root@142.93.78.220 "pm2 status"

# Check for errors in logs
ssh root@142.93.78.220 "pm2 logs facesmash-api --lines 20 --nostream"
```

## Key URLs

- **App**: https://facesmash.app
- **API**: https://api.facesmash.app/api/health
- **Docs**: https://docs.facesmash.app
- **Dev Portal**: https://developers.facesmash.app
- **Netlify Dashboard**: https://app.netlify.com/sites/facesmash1

## Secrets Required

- `$netlify` — Netlify API auth token (already saved)
- SSH key for root@142.93.78.220 (for API server access)
