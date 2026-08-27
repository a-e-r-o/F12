/**
 * Tracks whether a component is actually being displayed.
 *
 * `AppWindow` hides a minimised window with `display: none` instead of unmounting it, so an
 * animating component keeps burning frames on something nobody can see. Anything driving a
 * `requestAnimationFrame` loop should gate it on this.
 *
 * We measure the DOM directly with an IntersectionObserver rather than passing the window's
 * state down: window contents are rendered through a `children` snippet and loaded with a
 * dynamic `import()`, and Svelte's context did not survive that boundary reliably. Observing
 * the element answers the real question — "is this on screen?" — with no plumbing to keep in
 * sync, and it also covers scrolled-out-of-view content for free.
 *
 * ```svelte
 * const shown = createVisibility();
 * <div bind:this={root}>…</div>
 * $effect(() => (root ? shown.observe(root) : undefined));
 * $effect(() => { if (!shown.value) return; … });
 * ```
 */
export function createVisibility() {
	// Assume hidden until the observer reports otherwise, so nothing animates before it can be seen
	let visible = $state(false);

	return {
		get value() {
			return visible;
		},

		/** Wire up to an element. Returns a teardown, so it slots straight into an `$effect`. */
		observe(node: Element) {
			if (typeof IntersectionObserver === 'undefined') {
				visible = true; // no observer available: better to animate than to freeze
				return;
			}
			const io = new IntersectionObserver((entries) => {
				visible = entries[entries.length - 1].isIntersecting;
			});
			io.observe(node);
			return () => {
				io.disconnect();
				visible = false;
			};
		}
	};
}
