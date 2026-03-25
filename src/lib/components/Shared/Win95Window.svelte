<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { themeState } from '$lib/stores/theme.svelte';

	let {
		id,
		title,
		iconKey = '',
		children
	}: {
		id: string;
		title: string;
		iconKey?: string;
		children: Snippet;
	} = $props();

	let win = $derived(windowsState.windows.find((w) => w.id === id));
	let visible = $derived(win?.visible ?? false);
	let maximized = $derived(win?.maximized ?? false);
	let maximizable = $derived(win?.maximizable ?? true);
	let closable = $derived(win?.closable ?? false);
	let isMobile = $derived(windowsState.isMobile);
	let isWin7 = $derived(themeState.isWin7);
	let icon = $derived(iconKey ? themeState.icon(iconKey) : '');

	let mounted = $derived(!win?.closable || (win?.running ?? false));

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
		class="desktop-window"
		class:maximized
		class:mobile={isMobile}
		class:minimized={!visible}
		class:aero={isWin7}
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
					<img class="titlebar-icon" src={icon} alt="" draggable="false" />
				{/if}
				<span class="titlebar-title">{title}</span>
			</div>
			<div class="titlebar-buttons">
				{#if !isMobile}
					{#if isWin7}
						<!-- Win7 Aero window buttons -->
						<button class="tb-btn aero-btn minimize-btn" onclick={minimize} aria-label="Minimize" title="Minimize">
							<svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="7" width="8" height="2" fill="currentColor" /></svg>
						</button>
						<button class="tb-btn aero-btn maximize-btn" onclick={toggleMaximize} disabled={isMobile || !maximizable} aria-label={maximized ? 'Restore' : 'Maximize'} title={maximized ? 'Restore' : 'Maximize'}>
							{#if maximized}
								<svg width="10" height="10" viewBox="0 0 10 10">
									<rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.2" />
									<rect x="0" y="2" width="8" height="8" fill="var(--win-body-bg, #fff)" stroke="currentColor" stroke-width="1.2" />
								</svg>
							{:else}
								<svg width="10" height="10" viewBox="0 0 10 10">
									<rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.2" />
								</svg>
							{/if}
						</button>
						<button class="tb-btn aero-btn close-btn" disabled={!closable} onclick={closable ? closeWindow : undefined} aria-label="Close" title="Close">
							<svg width="10" height="10" viewBox="0 0 10 10">
								<line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
								<line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							</svg>
						</button>
					{:else}
						<!-- Win95 window buttons -->
						<button class="tb-btn" onclick={minimize} aria-label="Minimize" title="Minimize">
							<svg width="8" height="7" viewBox="0 0 8 7"><rect x="0" y="5" width="8" height="2" fill="currentColor" /></svg>
						</button>
						<button class="tb-btn" onclick={toggleMaximize} disabled={isMobile || !maximizable} aria-label={maximized ? 'Restore' : 'Maximize'} title={maximized ? 'Restore' : 'Maximize'}>
							{#if maximized && !isMobile}
								<svg width="9" height="9" viewBox="0 0 9 9">
									<rect x="2" y="0" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
									<rect x="2" y="0" width="7" height="2" fill="currentColor" />
									<rect x="0" y="2" width="7" height="7" fill="var(--win95-btn-face)" stroke="currentColor" stroke-width="1" />
									<rect x="0" y="2" width="7" height="2" fill="currentColor" />
								</svg>
							{:else}
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
					{/if}
				{/if}
				{#if isMobile && closable}
					<button class="tb-btn close-btn" onclick={closeWindow} aria-label="Close" title="Close">
						{#if isWin7}
							<svg width="10" height="10" viewBox="0 0 10 10">
								<line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
								<line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							</svg>
						{:else}
							<svg width="8" height="7" viewBox="0 0 8 7">
								<line x1="0" y1="0" x2="8" y2="7" stroke="currentColor" stroke-width="1.5" />
								<line x1="8" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1.5" />
							</svg>
						{/if}
					</button>
				{/if}
			</div>
		</div>
		<div class="window-body">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	/* =================== BASE (shared) =================== */
	.desktop-window {
		position: absolute;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: max-content;
		height: max-content;
		min-width: 200px;
		min-height: 80px;
		/* Win95 defaults (overridden by .aero) */
		background: var(--win-surface);
		border: 2px solid;
		border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
		box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
		border-radius: var(--win-window-radius);
	}

	.desktop-window.minimized {
		display: none;
	}

	.desktop-window.maximized,
	.desktop-window.mobile {
		width: 100%;
		height: 100%;
		border: none;
		box-shadow: none;
		border-radius: 0;
	}

	/* =================== TITLEBAR ========================= */
	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--win-titlebar-active);
		padding: 2px 3px;
		min-height: var(--win-titlebar-height);
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
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		image-rendering: pixelated;
	}

	.titlebar-title {
		font-size: 11px;
		font-weight: bold;
		color: var(--win-titlebar-text-active);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.titlebar-buttons {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	/* =================== WIN95 BUTTONS ==================== */
	.tb-btn {
		width: 16px;
		height: 14px;
		background: var(--win-btn-face);
		border: 1px solid;
		border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
		box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 0;
		color: #000;
	}

	.tb-btn:active:not(:disabled) {
		border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
		box-shadow: inset 1px 1px 0 var(--win-border-dark);
	}

	.tb-btn:disabled {
		color: var(--win-border-dark);
		cursor: default;
	}

	/* =================== WIN7 AERO BUTTONS ================ */
	.aero .tb-btn.aero-btn {
		width: 26px;
		height: 18px;
		border: none;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		color: #333;
		padding: 0;
		transition: background 0.1s, color 0.1s;
	}

	.aero .tb-btn.aero-btn.minimize-btn {
		border-radius: 0 0 0 2px;
	}

	.aero .tb-btn.aero-btn.close-btn {
		border-radius: 0 0 2px 0;
		margin-left: 2px;
	}

	.aero .tb-btn.aero-btn:hover {
		background: rgba(255, 255, 255, 0.35);
		color: #111;
	}

	.aero .tb-btn.aero-btn.close-btn:hover:not(:disabled) {
		background: linear-gradient(180deg, #f28b82 0%, #e04040 50%, #c42b2b 100%);
		color: #fff;
	}

	.aero .tb-btn.aero-btn.close-btn:active:not(:disabled) {
		background: linear-gradient(180deg, #c42b2b 0%, #991e1e 60%);
		color: #fff;
	}

	.aero .tb-btn.aero-btn:active:not(:disabled) {
		background: rgba(255, 255, 255, 0.20);
	}

	.aero .tb-btn.aero-btn:disabled {
		color: rgba(0, 0, 0, 0.20);
		cursor: default;
	}

	/* =================== AERO WINDOW STYLING ============== */
	.desktop-window.aero {
		backdrop-filter: blur(30px) saturate(1.6);
		border: 1px solid white;
		padding: 3px;
		border-radius: 6px;
		background: linear-gradient(180deg, rgba(150, 200, 245, 0.60) 0%, rgba(120, 178, 238, 0.45) 40%, rgba(100, 165, 230, 0.40) 100%);
		box-shadow: #00000073 0px 0px 5px 3px;
	}

	.aero .titlebar {
		background: none;
		backdrop-filter: none;
		border-radius: 2px 2px 0 0;
		padding: 4px 6px;
		height: 30px;
	}

	.aero .titlebar-icon {
		font-size: 14px;
	}

	.aero .titlebar-title {
		font-size: 12px;
		font-family: 'Segoe UI', Arial, sans-serif;
		color: #1a1a1a;
		font-weight: 500;
		text-shadow: 0 0 5px #ffffff;
	}

	.aero .titlebar-buttons {
		gap: 0;
	}

	.aero .window-body {
		border: 1px solid #0000008a;
		background: var(--win-body-bg, #ffffff);
		border-radius: 3px;
		box-shadow: 0px 0px 0px 1px #ffffff78;
	}

	.desktop-window.aero.maximized,
	.desktop-window.aero.mobile {
		border: none;
		border-radius: 0;
	}

	.desktop-window.aero.maximized .titlebar,
	.desktop-window.aero.mobile .titlebar {
		border-radius: 0;
	}

	/* =================== WINDOW BODY ====================== */
	.window-body {
		padding: 4px;
		flex: 1;
		overflow: auto;
		min-height: 0;
	}
</style>
