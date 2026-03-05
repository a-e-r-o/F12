/**
 * Theme management module using Svelte 5 runes.
 *
 * - Persists choice in localStorage
 * - Falls back to OS preference (prefers-color-scheme)
 * - Applies `data-theme` attribute on <html> for CSS variable switching
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function getPreferredTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeState() {
	let current = $state<Theme>('light');

	return {
		get current() {
			return current;
		},

		/** Initialise theme from localStorage or OS preference. Call in onMount. */
		init() {
			const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
			current = stored ?? getPreferredTheme();
			applyToDOM(current);

			// Listen for OS-level theme changes (only if no manual preference saved)
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (!localStorage.getItem(STORAGE_KEY)) {
					current = e.matches ? 'dark' : 'light';
					applyToDOM(current);
				}
			});
		},

		/** Toggle between light and dark */
		toggle() {
			current = current === 'dark' ? 'light' : 'dark';
			localStorage.setItem(STORAGE_KEY, current);
			applyToDOM(current);
		},

		/** Set a specific theme */
		set(theme: Theme) {
			current = theme;
			localStorage.setItem(STORAGE_KEY, current);
			applyToDOM(current);
		}
	};
}

function applyToDOM(theme: Theme) {
	document.documentElement.setAttribute('data-theme', theme);
}

/** Singleton theme state — import and use across the app */
export const theme = createThemeState();
