/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_INTERACTION_METRICS: string;
  readonly VITE_USE_HOST_STATS_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
