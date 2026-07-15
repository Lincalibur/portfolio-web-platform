/**
 * Resolves a public asset path against Vite's base URL (required for GitHub Pages project sites).
 * @param path Absolute path under `public/` (e.g. `/fixtures/profile.json`).
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalised = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalised}`;
}
