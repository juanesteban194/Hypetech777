export const THEME_STORAGE_KEY = 'theme'

export type Theme = 'dark' | 'light'

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

/**
 * Runs before first paint (inline in <head>) to avoid a flash of the wrong theme.
 *
 * Order: explicit choice stored by the visitor -> prefers-color-scheme on the first visit ->
 * dark ("Obsidiana"), which is also what no-JS visitors get from the CSS defaults.
 * Storage and matchMedia are wrapped in try/catch: both can throw (private mode, blocked data).
 *
 * The content is constant, so a CSP can allow it by hash without nonces (docs/DECISIONES.md, D-008).
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){try{t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}catch(e){t='dark'}}d.setAttribute('data-theme',t)})();`
