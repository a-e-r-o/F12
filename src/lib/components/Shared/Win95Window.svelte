<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { windowsState } from '$lib/stores/windows.svelte';

	let {
		id,
		title,
		icon = '',
		children
	}: {
		id: string;
		title: string;
		icon?: string;
		children: Snippet;
	} = $props();

	let win = $derived(windowsState.windows.find((w) => w.id === id));
	let visible = $derived(win?.visible ?? false);
	let maximized = $derived(win?.maximized ?? false);
	let maximizable = $derived(win?.maximizable ?? true);
	let closable = $derived(win?.closable ?? false);
	let isMobile = $derived(windowsState.isMobile);

	/**
	 * Two-level lifecycle:
	 *  - mounted: the program is alive in memory.
	 *    Closable windows → alive only while running (false after close → component tree destroyed).
	 *    Non-closable windows → always alive.
	 *  - visible: the window content is rendered on screen.
	 *    false on minimize → inner component destroyed → zero resource usage.
	 *
	 * Inner components (games, etc.) can consume the 'win95:active' context to
	 * reactively pause work (rAF loops, timers) when the window is hidden, in
	 * case they are ever kept alive via CSS rather than destroyed.
	 */
	let mounted = $derived(!win?.closable || (win?.running ?? false));

	// Reactive context: inner components read `.value` inside $derived / $effect
	setContext('win95:active', { get value() { return visible; } });

	let dragging = $state(false);
	let dragOffsetX = 0;
	let dragOffsetY = 0;

	function minimize() {
		windowsState.hide(id);
	}

	function closeWindow() {
		windowsState.close(id);
	}

	function toggleMaximize() {
		windowsState.toggleMaximize(id);
	}

	function bringToFront() {
		windowsState.bringToFront(id);
	}

	function onTitlebarDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.titlebar-buttons')) return;
		// Don't drag when maximized or on mobile
		if (maximized || isMobile) return;
		e.preventDefault();
		dragging = true;
		dragOffsetX = e.clientX - (win?.x ?? 0);
		dragOffsetY = e.clientY - (win?.y ?? 0);
		bringToFront();

		const onMove = (ev: MouseEvent) => {
			const dw = window.innerWidth;
			const dh = window.innerHeight - 32;
			let nx = ev.clientX - dragOffsetX;
			let ny = ev.clientY - dragOffsetY;
			nx = Math.max(-200, Math.min(nx, dw - 40));
			ny = Math.max(0, Math.min(ny, dh - 22));
			windowsState.move(id, nx, ny);
		};

		const onUp = () => {
			dragging = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}
</script>

{#if mounted}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="win95-window"
		class:maximized
		class:mobile={isMobile}
		class:minimized={!visible}
		style={maximized || isMobile
			? `left: 0; top: 0; z-index: ${win?.zIndex};`
			: `left: ${win?.x ?? 0}px; top: ${win?.y ?? 0}px; z-index: ${win?.zIndex ?? 10};`}
		onmousedown={bringToFront}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="titlebar"
			class:dragging
			onmousedown={onTitlebarDown}
		>
			<div class="titlebar-left">
				{#if icon}
					<span class="titlebar-icon">{icon}</span>
				{/if}
				<span class="titlebar-title">{title}</span>
			</div>
			<div class="titlebar-buttons">
				{#if !isMobile}
					<button class="tb-btn" onclick={minimize} aria-label="Minimize" title="Minimize">
						<svg width="8" height="7" viewBox="0 0 8 7"><rect x="0" y="5" width="8" height="2" fill="currentColor" /></svg>
					</button>
				{/if}
				<button class="tb-btn" onclick={toggleMaximize} disabled={isMobile || !maximizable} aria-label={maximized ? 'Restore' : 'Maximize'} title={maximized ? 'Restore' : 'Maximize'}>
					{#if maximized && !isMobile}
						<!-- Restore icon (two overlapping windows) -->
						<svg width="9" height="9" viewBox="0 0 9 9">
							<rect x="2" y="0" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
							<rect x="2" y="0" width="7" height="2" fill="currentColor" />
							<rect x="0" y="2" width="7" height="7" fill="var(--win95-btn-face)" stroke="currentColor" stroke-width="1" />
							<rect x="0" y="2" width="7" height="2" fill="currentColor" />
						</svg>
					{:else}
						<!-- Maximize icon -->
						<svg width="9" height="9" viewBox="0 0 9 9">
							<rect x="0" y="0" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1" />
							<rect x="0" y="0" width="9" height="2" fill="currentColor" />
						</svg>
					{/if}
				</button>
				<button class="tb-btn close-btn" disabled={!closable} onclick={closable ? closeWindow : undefined} aria-label="Close" title="Close">
					<svg width="8" height="7" viewBox="0 0 8 7">
						<line x1="0" y1="0" x2="8" y2="7" stroke="currentColor" stroke-width="1.5" />
						<line x1="8" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1.5" />
					</svg>
				</button>
			</div>
		</div>
		<div class="window-body">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.win95-window {
		position: absolute;
		background: var(--win95-surface);
		border: 2px solid;
		border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
		box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: max-content;
		height: max-content;
		min-width: 200px;
		min-height: 80px;
	}

	.win95-window.minimized {
		display: none;
	}

	.win95-window.maximized {
		width: 100%;
		height: 100%;
		border: none;
		box-shadow: none;
	}

	.win95-window.mobile {
		width: 100%;
		height: 100%;
		border: none;
		box-shadow: none;
	}

	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--win95-titlebar-active);
		padding: 2px 3px;
		min-height: 22px;
		gap: 4px;
		user-select: none;
		cursor: grab;
	}

	.maximized .titlebar,
	.mobile .titlebar {
		cursor: default;
	}

	.titlebar.dragging {
		cursor: grabbing;
	}

	.titlebar-left {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		overflow: hidden;
	}

	.titlebar-icon {
		font-size: 12px;
		flex-shrink: 0;
	}

	.titlebar-title {
		font-size: 11px;
		font-weight: bold;
		color: var(--win95-titlebar-text-active);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.titlebar-buttons {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	.tb-btn {
		width: 16px;
		height: 14px;
		background: var(--win95-btn-face);
		border: 1px solid;
		border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
		box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 0;
		color: #000;
	}

	.tb-btn:active:not(:disabled) {
		border-color: var(--win95-border-darkest) var(--win95-border-light) var(--win95-border-light) var(--win95-border-darkest);
		box-shadow: inset 1px 1px 0 var(--win95-border-dark);
	}

	.tb-btn:disabled {
		color: var(--win95-border-dark);
		cursor: default;
	}

	.window-body {
		padding: 4px;
		flex: 1;
		overflow: auto;
		min-height: 0;
	}
</style>
