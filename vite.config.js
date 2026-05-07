import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// Source maps + Sentry release tagging.
//
// We always emit source maps in `build` so stack traces stay decodable.
// The Sentry plugin uploads them to the project, then `filesToDeleteAfterUpload`
// removes the .map files from `dist/` so Vercel never serves them publicly.
// If `SENTRY_AUTH_TOKEN` is missing (local builds, PR previews without the
// secret), the plugin no-ops and the maps stay alongside the bundle — fine
// for local inspection, never reaches production unless you push that build.
//
// Required env (build-time, NOT exposed to the client):
//   SENTRY_AUTH_TOKEN   org-scoped token with project:write + sourcemaps:write
//   SENTRY_ORG          Sentry org slug
//   SENTRY_PROJECT      Sentry project slug
//
// Required env (runtime, exposed to the client via VITE_ prefix):
//   VITE_SENTRY_DSN          public DSN (safe to embed in the client bundle)
//   VITE_APP_VERSION         release identifier (e.g. Vercel commit SHA)
//   VITE_SENTRY_ENVIRONMENT  "production" | "preview" | etc. (optional)
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG        = process.env.SENTRY_ORG;
const SENTRY_PROJECT    = process.env.SENTRY_PROJECT;
const RELEASE           = process.env.VITE_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA;

const sentryEnabled = Boolean(SENTRY_AUTH_TOKEN && SENTRY_ORG && SENTRY_PROJECT);

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Surface the Sentry-plugin decision in build logs. Without this signal
  // a Vercel build silently produces no [sentry-vite-plugin] output when
  // the secrets aren't wired up — leaving you to guess whether the plugin
  // ran and failed, or never ran at all. We only log on `build` so the
  // dev server stays quiet.
  if (command === 'build') {
    if (sentryEnabled) {
      console.log(
        `[sentry] plugin enabled (org=${SENTRY_ORG}, project=${SENTRY_PROJECT}, release=${RELEASE || 'unset'})`
      );
    } else {
      const missing = [
        !SENTRY_AUTH_TOKEN && 'SENTRY_AUTH_TOKEN',
        !SENTRY_ORG && 'SENTRY_ORG',
        !SENTRY_PROJECT && 'SENTRY_PROJECT',
      ].filter(Boolean);
      console.log(`[sentry] plugin skipped — missing env: ${missing.join(', ')}`);
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      // The plugin must be the LAST entry — it needs to see the final bundle
      // before deleting source maps. It also runs only when fully configured;
      // otherwise we'd silently fail uploads on every build.
      sentryEnabled && sentryVitePlugin({
        authToken: SENTRY_AUTH_TOKEN,
        org: SENTRY_ORG,
        project: SENTRY_PROJECT,
        release: { name: RELEASE },
        sourcemaps: {
          assets: './dist/assets/**',
          // Source maps are uploaded to Sentry, then deleted from the build
          // output so they never reach Vercel's CDN. Stack traces in Sentry
          // stay readable; the public site stays opaque.
          filesToDeleteAfterUpload: './dist/assets/**/*.map',
        },
        telemetry: false,
      }),
    ].filter(Boolean),
    build: {
      // Hidden source maps emit the .map files but strip the
      // //# sourceMappingURL comment from the bundles. Even if a .map
      // accidentally ships, browsers won't auto-fetch it.
      sourcemap: 'hidden',
    },
  };
})
