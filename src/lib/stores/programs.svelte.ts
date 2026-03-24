import type { Win95Window } from './windows.svelte';

/** Static definition of a program — how it appears and behaves at startup */
export interface ProgramDef {
	id: string;
	icon: string;
	/** i18n key for the title (resolved at runtime) */
	titleKey: string;
	/** Fallback title when i18n is not yet loaded */
	defaultTitle: string;
	/** Whether the window is visible at first launch (no saved state) */
	startVisible: boolean;
	/** Whether this program appears in the Start Menu */
	inStartMenu: boolean;
	/** Whether the window can be maximized */
	maximizable: boolean;
	/** Whether the window can be closed (and disappears from the taskbar) */
	closable: boolean;
}

export const programs: ProgramDef[] = [
	{ id: 'home',             icon: 'ℹ️',  titleKey: 'nav.about',             defaultTitle: 'About',                startVisible: false, inStartMenu: false, maximizable: false, closable: false },
	{ id: 'hybrid-diagrams',  icon: '⚙️',  titleKey: 'nav.hybridDiagrams',    defaultTitle: 'Mechanical Diagrams',  startVisible: true,  inStartMenu: true, maximizable: true,  closable: true },
	{ id: 'converters',       icon: '🔄',  titleKey: 'nav.converters',        defaultTitle: 'Converters',           startVisible: true,  inStartMenu: true, maximizable: false, closable:  true },
	{ id: 'game-of-life',     icon: '🧬',  titleKey: 'nav.gameOfLife',        defaultTitle: 'Game of Life',         startVisible: true,  inStartMenu: true, maximizable: true,  closable: true  },
	{ id: 'image-convert',    icon: '🎨',  titleKey: 'nav.imgConvert',        defaultTitle: 'Image Conversion',     startVisible: true,  inStartMenu: true, maximizable: false,  closable: true },
	{ id: 'wallpaper',        icon: '🖼️',  titleKey: 'nav.wallpaper',         defaultTitle: 'Wallpaper',            startVisible: false, inStartMenu: false, maximizable: true, closable: false },
	{ id: 'minesweeper',      icon: '💣',  titleKey: 'startMenu.minesweeper', defaultTitle: 'Minesweeper',          startVisible: false, inStartMenu: true,  maximizable: false, closable: true  },
	{ id: 'tetris',           icon: '🧱',  titleKey: 'startMenu.tetris',      defaultTitle: 'Tetris',               startVisible: false, inStartMenu: true,  maximizable: false, closable: true  },
	{ id: 'pokemon-quiz',     icon: '❓',   titleKey: 'startMenu.pokemonQuiz', defaultTitle: 'Pokémon Quiz',         startVisible: false, inStartMenu: true,  maximizable: false, closable: true  }
];

/** Build the initial Win95Window array from program definitions */
export function buildWindows(): Win95Window[] {
	return programs.map((p) => ({
		id: p.id,
		title: p.defaultTitle,
		icon: p.icon,
		visible: p.startVisible,
		maximized: false,
		maximizable: p.maximizable,
		closable: p.closable,
		running: p.startVisible,
		x: 0,
		y: 0,
		zIndex: 10,
		prevX: 0,
		prevY: 0
	}));
}
