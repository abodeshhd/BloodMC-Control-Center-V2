# BloodMC Control Center V2

Installable Android and Windows clients for BloodMC, with a locally bundled Arabic RTL interface and a secure HTTPS backend proxy. Designed & developed by DEV_ABOUDI.

## Backend setup
Deploy this Node.js project on a Node.js hosting service with HTTPS. Set these private environment variables in the host:
- `PANEL_URL=https://panel.primehost.cc`
- `PANEL_SERVER_ID=cb21b17b`
- `PANEL_API_KEY`: a newly generated least-privilege PrimeHost Client API key.
- `DASHBOARD_PASSWORD`: a unique password of at least 12 characters.
- `PORT`: supplied by the host.

On Render or another host with ephemeral storage, set secrets as environment variables. Do not rely on the in-app setup form writing a .env file, because ephemeral files can be lost on restart. Revoke any previously exposed API key. Never put API keys in GitHub, app configuration, APK/EXE, or chat.

## Build Android APK and Windows installer
1. Confirm the backend is deployed and its HTTPS URL is healthy.
2. The build workflow already uses the public Render backend URL and starts automatically after updates to the main branch; it can also be started from **Actions → Build BloodMC apps → Run workflow**.
3. Download `BloodMC-Android-APK` and `BloodMC-Windows-EXE` after the jobs succeed.

The Android and Windows packages contain the UI locally; they connect to the backend over HTTPS for server management. The current Android output is a debug APK for testing. The Windows output is an NSIS installer. These are installable clients, not offline server controllers; the backend and internet connection are required for live server management.

## Current features
- Arabic RTL interface with BloodMC branding and DEV_ABOUDI credits.
- Password-protected access to the backend.
- PrimeHost server status and resource metrics.
- Start, stop, restart, and one-command console submission.

## Not implemented yet
- Live WebSocket console stream.
- Player list and player management.
- Signed Android release APK and Windows code signing.
