export type ThemeId = 'win95' | 'win7aero';
export type IconSize = 16 | 32 | 48;

/* ── Eagerly import all icon PNGs as resolved URLs ─────────────── */
const win95Icons = import.meta.glob('../assets/icons/win95/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const win7Icons  = import.meta.glob('../assets/icons/win7/*.png',  { eager: true, import: 'default' }) as Record<string, string>;

const themeIconSets: Record<ThemeId, Record<string, string>> = {
	win95:    win95Icons,
	win7aero: win7Icons
};

/** Map iconKey → filename base (without _size.png), per theme */
const iconKeyToFile: Record<ThemeId, Record<string, string>> = {
	win95: {
		about:        'about',
		gears:        'gears',
		converters:   'converters',
		gameOfLife:   'video',
		imageConvert: 'img_converter',
		wallpaper:    'wallpaper',
		controlPanel: 'wallpaper',
		minesweeper:  'minesweeper',
		tetris:       'tetris',
		pokemonQuiz:  'quizz',
		start:        'win',
		shutdown:     'shutdown',
	},
	win7aero: {
		gears: 'gear',
	}
};

/** Look up a resolved URL from the glob record by filename base + size */
function findUrl(icons: Record<string, string>, base: string, size: IconSize): string | undefined {
	const suffix = `/${base}_${size}.png`;
	const key = Object.keys(icons).find(k => k.endsWith(suffix));
	return key ? icons[key] : undefined;
}

const STORAGE_KEY = 'f12-theme';

function createThemeState() {
	let current = $state<ThemeId>('win95');

	function applyToDOM(theme: ThemeId) {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	}

	return {
		get current() {
			return current;
		},

		get isWin7() {
			return current === 'win7aero';
		},

		get isWin95() {
			return current === 'win95';
		},

		/**
		 * Resolve an icon key to a themed PNG URL.
		 * Falls back to the theme's default icon, then win95 default.
		 */
		icon(key: string, size: IconSize = 16): string {
			const icons = themeIconSets[current];
			const fileBase = iconKeyToFile[current]?.[key];

			// 1. Try the exact icon for the current theme
			if (fileBase) {
				const url = findUrl(icons, fileBase, size);
				if (url) return url;
			}

			// 2. Fallback: default icon for the current theme
			const fallback = findUrl(icons, 'default', size);
			if (fallback) return fallback;

			// 3. Ultimate fallback: win95 default
			return findUrl(win95Icons, 'default', size) ?? '';
		},

		init() {
			const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
			if (saved && (saved === 'win95' || saved === 'win7aero')) {
				current = saved;
			}
			applyToDOM(current);
		},

		set(theme: ThemeId) {
			current = theme;
			localStorage.setItem(STORAGE_KEY, theme);
			applyToDOM(theme);
		},

		toggle() {
			const next: ThemeId = current === 'win95' ? 'win7aero' : 'win95';
			this.set(next);
		}
	};
}

export const themeState = createThemeState();
