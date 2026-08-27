import bliss from '$lib/assets/Backgrounds/win95/bliss.jpg';
import peakpx from '$lib/assets/Backgrounds/win95/peakpx.jpg';
import peakpxLava from '$lib/assets/Backgrounds/win95/peakpx_lava.jpg';
import spaceNebula from '$lib/assets/Backgrounds/win95/space_nebula.jpg';
import frutigerAero from '$lib/assets/Backgrounds/win7/Frutiger_Aero.jpg';
import frutigerAero1 from '$lib/assets/Backgrounds/win7/frutigeraero.jpg';
import defaultWin7 from '$lib/assets/Backgrounds/win7/defaultwin7.jpg';
import type { ThemeId } from './theme.svelte';

export interface Wallpaper {
	id: string;
	name: string;
	url: string;
}

const STORAGE_KEY = 'f12-wallpaper';

/** Wallpapers grouped by theme */
const wallpapersByTheme: Record<ThemeId, Wallpaper[]> = {
	win95: [
		{ id: 'none', name: 'None', url: '' },
		{ id: 'bliss', name: 'Bliss', url: bliss },
		{ id: 'peakpx', name: 'Peakpx', url: peakpx },
		{ id: 'peakpx-lava', name: 'Peakpx Lava', url: peakpxLava },
		{ id: 'space-nebula', name: 'Space Nebula', url: spaceNebula }
	],
	win7aero: [
		{ id: 'none', name: 'None', url: '' },
		{ id: 'aero-default', name: 'Aero', url: defaultWin7 },
		{ id: 'frutiger-aero', name: 'Frutiger Aero 1', url: frutigerAero },
		{ id: 'frutiger-aero-2', name: 'Frutiger Aero 2', url: frutigerAero1 },
	]
};

function createWallpaperState() {
	let current = $state<string>('bliss');
	let activeTheme = $state<ThemeId>('win95');

	return {
		get wallpapers(): Wallpaper[] {
			return wallpapersByTheme[activeTheme] ?? wallpapersByTheme.win95;
		},

		get current() {
			return current;
		},

		get currentUrl() {
			const all = wallpapersByTheme[activeTheme] ?? wallpapersByTheme.win95;
			return all.find((w) => w.id === current)?.url ?? '';
		},

		/** Get the CSS background style for the current wallpaper */
		get backgroundStyle(): string {
			const url = this.currentUrl;
			if (!url) return '';
			return `background-image: url('${url}'); background-size: cover; background-position: center;`;
		},

		init() {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				// Check if saved wallpaper exists in current theme
				const all = wallpapersByTheme[activeTheme] ?? wallpapersByTheme.win95;
				if (all.some((w) => w.id === saved)) {
					current = saved;
				}
			}
		},

		/** Called when the theme changes — switch to the default wallpaper for that theme */
		setTheme(theme: ThemeId) {
			activeTheme = theme;
			const all = wallpapersByTheme[theme];
			// If current wallpaper isn't in the new theme, pick the default
			if (!all.some((w) => w.id === current)) {
				const defaultId = theme === 'win7aero' ? 'aero-default' : 'bliss';
				current = defaultId;
				localStorage.setItem(STORAGE_KEY, current);
			}
		},

		set(id: string) {
			const all = wallpapersByTheme[activeTheme] ?? wallpapersByTheme.win95;
			if (all.some((w) => w.id === id)) {
				current = id;
				localStorage.setItem(STORAGE_KEY, id);
			}
		}
	};
}

export const wallpaperState = createWallpaperState();
