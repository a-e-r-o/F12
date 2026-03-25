import { buildWindows } from './programs.svelte';

export interface Win95Window {
	id: string;
	title: string;
	iconKey: string;
	visible: boolean;
	maximized: boolean;
	/** Whether the window can be maximized on desktop */
	maximizable: boolean;
	/** Whether the window can be closed (removed from taskbar) */
	closable: boolean;
	/** Whether a closable window is currently "open" (shown in taskbar, even if minimized) */
	running: boolean;
	x: number;
	y: number;
	zIndex: number;
	/** Pre-maximize position, for restore */
	prevX: number;
	prevY: number;
}

const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = 'win95-windows';
let nextZ = 10;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(windows: Win95Window[]) {
	if (saveTimer !== null) clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		const data = windows.map(({ id, visible, maximized, x, y, prevX, prevY, closable }) => ({
			id, visible, maximized, x, y, prevX, prevY, closable
		}));
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}, 800);
}

function randomPos(maxW: number, maxH: number, winW = 520, winH = 380) {
	const x = Math.floor(Math.random() * Math.max(0, maxW - winW));
	const y = Math.floor(Math.random() * Math.max(0, maxH - winH));
	return { x, y };
}

function createWindowsState() {
	let windows = $state<Win95Window[]>(buildWindows());

	let mobile = $state(false);

	return {
		get windows() {
			return windows;
		},

		get isMobile() {
			return mobile;
		},

		/** Call once on mount — sets up mobile detection, randomizes positions, and installs resize clamping */
		init() {
			const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
			mobile = mql.matches;
			mql.addEventListener('change', (e) => {
				mobile = e.matches;
			});

			if (mobile) {
				// On mobile: show only Mechanical Diagrams, maximized
				for (const w of windows) {
					w.visible = w.id === 'hybrid-diagrams';
					w.maximized = true;
					w.x = 0;
					w.y = 0;
				}
			} else {
				// On desktop: restore saved state or randomize positions
				const saved = localStorage.getItem(STORAGE_KEY);
				if (saved) {
					try {
						const data: Pick<Win95Window, 'id' | 'visible' | 'maximized' | 'x' | 'y' | 'prevX' | 'prevY'>[] = JSON.parse(saved);
						for (const w of windows) {
							const s = data.find((d) => d.id === w.id);
							if (s) {
								// closable windows start hidden on reload
								w.visible = w.closable ? false : s.visible;
							w.maximized = (w.closable || !w.maximizable) ? false : s.maximized;
								w.x = s.x;
								w.y = s.y;
								w.prevX = s.prevX;
								w.prevY = s.prevY;
							}
							w.zIndex = nextZ++;
						}
					} catch {
						localStorage.removeItem(STORAGE_KEY);
					}
				} else {
					const dw = window.innerWidth;
					const dh = window.innerHeight - 32;
					for (const w of windows) {
						const p = randomPos(dw, dh);
						w.x = p.x;
						w.y = p.y;
						w.zIndex = nextZ++;
					}
				}
			}

			// Debounced resize: clamp window positions back into view
			let resizeTimer: ReturnType<typeof setTimeout>;
			window.addEventListener('resize', () => {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					if (mobile) return;
					const dw = window.innerWidth;
					const dh = window.innerHeight - 32;
					for (const w of windows) {
						if (w.maximized) continue;
						// Keep at least 40px of titlebar horizontally and fully visible vertically
						w.x = Math.max(-200, Math.min(w.x, dw - 40));
						w.y = Math.max(0, Math.min(w.y, dh - 22));
					}
				}, 300);
			});
		},

		bringToFront(id: string) {
			const w = windows.find((w) => w.id === id);
			if (w) w.zIndex = nextZ++;
		},

		move(id: string, x: number, y: number) {
			const w = windows.find((w) => w.id === id);
			if (w) {
				w.x = x;
				w.y = y;
				scheduleSave(windows);
			}
		},

		toggleMaximize(id: string) {
			const w = windows.find((w) => w.id === id);
			if (!w || !w.maximizable) return;
			if (w.maximized) {
				// Restore
				w.maximized = false;
				w.x = w.prevX;
				w.y = w.prevY;
			} else {
				// Maximize
				w.prevX = w.x;
				w.prevY = w.y;
				w.maximized = true;
				w.x = 0;
				w.y = 0;
			}
			w.zIndex = nextZ++;
			scheduleSave(windows);
		},

		/** Show a single window exclusively (used on mobile) */
		showExclusive(id: string) {
			for (const w of windows) {
				w.visible = w.id === id;
				if (w.visible) {
					w.maximized = true;
					w.x = 0;
					w.y = 0;
					w.zIndex = nextZ++;
				}
			}
		},

		toggle(id: string) {
			if (mobile) {
				this.showExclusive(id);
				return;
			}
			const w = windows.find((w) => w.id === id);
			if (w) {
				w.visible = !w.visible;
				if (w.visible) w.zIndex = nextZ++;
				scheduleSave(windows);
			}
		},

		show(id: string) {
			if (mobile) {
				this.showExclusive(id);
				return;
			}
			const w = windows.find((w) => w.id === id);
			if (w) {
				w.visible = true;
				w.zIndex = nextZ++;
				scheduleSave(windows);
			}
		},

		hide(id: string) {
			const w = windows.find((w) => w.id === id);
			if (w) {
				w.visible = false;
				if (mobile) {
					// On mobile, show home when closing
					const home = windows.find((w) => w.id === 'home');
					if (home) {
						home.visible = true;
						home.maximized = true;
						home.x = 0;
						home.y = 0;
						home.zIndex = nextZ++;
					}
				} else {
					scheduleSave(windows);
				}
			}
		},

		isVisible(id: string): boolean {
			return windows.find((w) => w.id === id)?.visible ?? false;
		},

		/** Close a closable window (hides it and resets position) */
		close(id: string) {
			const w = windows.find((w) => w.id === id);
			if (!w || !w.closable) return;
			w.visible = false;
			w.maximized = false;
			w.running = false;
			if (mobile) {
				const home = windows.find((w) => w.id === 'home');
				if (home) {
					home.visible = true;
					home.maximized = true;
					home.x = 0;
					home.y = 0;
					home.zIndex = nextZ++;
				}
			} else {
				scheduleSave(windows);
			}
		},

		/** Open a closable window with a random position */
		open(id: string) {
			if (mobile) {
				this.showExclusive(id);
				return;
			}
			const w = windows.find((w) => w.id === id);
			if (!w) return;
			if (!w.visible) {
				const dw = window.innerWidth;
				const dh = window.innerHeight - 32;
				const p = randomPos(dw, dh);
				w.x = p.x;
				w.y = p.y;
			}
			w.visible = true;
			w.running = true;
			w.zIndex = nextZ++;
			scheduleSave(windows);
		},

		/** Update titles when language changes */
		updateTitles(titles: Record<string, string>) {
			for (const w of windows) {
				if (titles[w.id]) w.title = titles[w.id];
			}
		}
	};
}

export const windowsState = createWindowsState();
