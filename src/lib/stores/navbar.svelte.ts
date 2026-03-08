function createNavbarState() {
	let isOpen = $state(true);

	return {
		get isOpen() {
			return isOpen;
		},
		toggle() {
			isOpen = !isOpen;
		},
		/** Call in onMount: open by default on desktop, closed on mobile. */
		init() {
			if (typeof window !== 'undefined') {
				isOpen = window.innerWidth >= 768;
			}
		}
	};
}

export const navbar = createNavbarState();
