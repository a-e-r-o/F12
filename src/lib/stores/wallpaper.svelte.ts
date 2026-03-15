import bliss from '$lib/assets/Backgrounds/bliss.jpg';
import peakpx from '$lib/assets/Backgrounds/peakpx.jpg';
import peakpxLava from '$lib/assets/Backgrounds/peakpx_lava.jpg';
import spaceNebula from '$lib/assets/Backgrounds/space_nebula.jpg';

export interface Wallpaper {
	id: string;
	name: string;
	url: string;
}

const STORAGE_KEY = 'f12-wallpaper';

function createWallpaperState() {
	const wallpapers: Wallpaper[] = [
		{ id: 'none', name: 'None', url: '' },
		{ id: 'bliss', name: 'Bliss', url: bliss },
		{ id: 'peakpx', name: 'Peakpx', url: peakpx },
		{ id: 'peakpx-lava', name: 'Peakpx Lava', url: peakpxLava },
		{ id: 'space-nebula', name: 'Space Nebula', url: spaceNebula }
	];

	let current = $state<string>('bliss');

	return {
		get wallpapers() {
			return wallpapers;
		},

		get current() {
			return current;
		},

		get currentUrl() {
			return wallpapers.find((w) => w.id === current)?.url ?? '';
		},

		init() {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved && wallpapers.some((w) => w.id === saved)) {
				current = saved;
			}
		},

		set(id: string) {
			if (wallpapers.some((w) => w.id === id)) {
				current = id;
				localStorage.setItem(STORAGE_KEY, id);
			}
		}
	};
}

export const wallpaperState = createWallpaperState();
