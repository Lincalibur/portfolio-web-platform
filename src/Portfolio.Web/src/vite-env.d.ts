/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PROXY_TARGET: string;
  readonly VITE_ENABLE_INTERACTION_METRICS: string;
  readonly VITE_USE_HOST_STATS_API: string;
  /** When `true`, SPA runs without Portfolio.Api (GitHub Pages / static hosting). */
  readonly VITE_STATIC_DEMO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
