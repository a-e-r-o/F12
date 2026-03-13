const STORAGE_KEY = 'crt-effects';

function createCrtState() {
	let enabled = $state(true);

	return {
		get enabled() {
			return enabled;
		},

		init() {
			const stored = localStorage.getItem(STORAGE_KEY);
			enabled = stored !== 'off';
			applyToDOM(enabled);
		},

		toggle() {
			enabled = !enabled;
			localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
			applyToDOM(enabled);
		}
	};
}

function applyToDOM(on: boolean) {
	document.documentElement.setAttribute('data-crt', on ? 'on' : 'off');
}

export const crt = createCrtState();
