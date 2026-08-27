<script lang="ts">
	import type { Snippet } from 'svelte';
	import { windowsState, taskbarHeight, isShown, isRunning } from '$lib/stores/windows.svelte';
	import { themeState } from '$lib/stores/theme.svelte';
	import { programById } from '$lib/stores/programs';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { id, children }: { id: string; children: Snippet } = $props();

	// Title and icon come from the program registry, resolved at render time so they follow
	// both the active locale and the active theme with no syncing code.
	let prog = $derived(programById(id));
	let title = $derived(prog ? i18n.t(prog.titleKey) : id);
	let iconKey = $derived(prog?.iconKey ?? '');

	let win = $derived(windowsState.windows.find((w) => w.id === id));
	let visible = $derived(win ? isShown(win) : false);
	let maximized = $derived(win?.status === 'maximized');
	let maximizable = $derived(win?.maximizable ?? true);
	let closable = $derived(win?.closable ?? false);
	let isMobile = $derived(windowsState.isMobile);
	let icon = $derived(iconKey ? themeState.icon(iconKey) : '');
	let isFocused = $derived(windowsState.focusedId === id);

	// A closed program isn't mounted at all: its chunk stays unloaded and its state resets.
	let mounted = $derived(win ? isRunning(win) : false);

	// NB: this used to publish a 'window:active' context for animating children to read.
	// Nothing ever consumed it, and when wired up it did not survive the children-snippet +
	// dynamic-import boundary. Components that need to know now measure the DOM themselves —
	// see utils/windowActive.svelte.ts.

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

	/**
	 * Pointer Events rather than mouse events: this gets touch dragging on tablets for free,
	 * and `setPointerCapture` keeps the drag alive when the cursor leaves the browser window
	 * or crosses an iframe — both of which used to drop it mid-move.
	 */
	function onTitlebarDown(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('.titlebar-buttons')) return;
		if (maximized || isMobile) return;
		if (e.button !== 0) return; // left button / primary touch only

		const titlebar = e.currentTarget as HTMLElement;
		e.preventDefault();
		// Throws NotFoundError if the pointer is already gone; capture is a nicety, not a
		// prerequisite, so a failure must not abort the drag.
		try {
			titlebar.setPointerCapture(e.pointerId);
		} catch {
			/* drag without capture */
		}

		dragging = true;
		dragOffsetX = e.clientX - (win?.x ?? 0);
		dragOffsetY = e.clientY - (win?.y ?? 0);
		bringToFront();

		const onMove = (ev: PointerEvent) => {
			if (ev.pointerId !== e.pointerId) return;
			const dw = window.innerWidth;
			const dh = window.innerHeight - taskbarHeight();
			const nx = Math.max(-200, Math.min(ev.clientX - dragOffsetX, dw - 40));
			const ny = Math.max(0, Math.min(ev.clientY - dragOffsetY, dh - 22));
			windowsState.move(id, nx, ny);
		};

		const onUp = (ev: PointerEvent) => {
			if (ev.pointerId !== e.pointerId) return;
			dragging = false;
			try {
				titlebar.releasePointerCapture(e.pointerId);
			} catch {
				/* never had it */
			}
			titlebar.removeEventListener('pointermove', onMove);
			titlebar.removeEventListener('pointerup', onUp);
			titlebar.removeEventListener('pointercancel', onUp);
		};

		titlebar.addEventListener('pointermove', onMove);
		titlebar.addEventListener('pointerup', onUp);
		titlebar.addEventListener('pointercancel', onUp);
	}
</script>

{#if mounted}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="desktop-window"
		class:maximized
		class:mobile={isMobile}
		class:minimized={!visible}
		class:focused={isFocused}
		style={maximized || isMobile
			? `left: 0; top: 0; z-index: ${win?.zIndex};`
			: `left: ${win?.x ?? 0}px; top: ${win?.y ?? 0}px; z-index: ${win?.zIndex ?? 10};`}
		onpointerdown={(e) => { e.stopPropagation(); bringToFront(); }}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="titlebar"
			class:dragging
			onpointerdown={onTitlebarDown}
			ondblclick={(e) => { if (maximizable && !isMobile && !(e.target as HTMLElement).closest('.titlebar-buttons')) toggleMaximize(); }}
		>
			<div class="titlebar-left">
				{#if icon}
					<img class="titlebar-icon" src={icon} alt="" draggable="false" />
				{/if}
				<span class="titlebar-title">{title}</span>
			</div>
			<div class="titlebar-buttons">
				{#if !isMobile}
					<button class="tb-btn minimize-btn" onclick={minimize} aria-label="Minimize" title="Minimize">
						<svg class="icon-retro" width="8" height="7" viewBox="0 0 8 7"><rect x="0" y="5" width="8" height="2" fill="currentColor" /></svg>
						<svg class="icon-aero" width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="7" width="8" height="2" fill="currentColor" /></svg>
					</button>
					<button class="tb-btn maximize-btn" onclick={toggleMaximize} disabled={isMobile || !maximizable} aria-label={maximized ? 'Restore' : 'Maximize'} title={maximized ? 'Restore' : 'Maximize'}>
						{#if maximized}
							<svg class="icon-retro" width="9" height="9" viewBox="0 0 9 9">
								<rect x="2" y="0" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
								<rect x="2" y="0" width="7" height="2" fill="currentColor" />
								<rect x="0" y="2" width="7" height="7" fill="var(--win95-btn-face)" stroke="currentColor" stroke-width="1" />
								<rect x="0" y="2" width="7" height="2" fill="currentColor" />
							</svg>
							<svg class="icon-aero" width="10" height="10" viewBox="0 0 10 10">
								<rect x="2.5" y="0.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
								<rect x="0.5" y="2.5" width="7" height="7" fill="var(--win-body-bg, #fff)" stroke="currentColor" stroke-width="1" />
							</svg>
						{:else}
							<svg class="icon-retro" width="9" height="9" viewBox="0 0 9 9">
								<rect x="0" y="0" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1" />
								<rect x="0" y="0" width="9" height="2" fill="currentColor" />
							</svg>
							<svg class="icon-aero" width="10" height="10" viewBox="0 0 10 10">
								<rect x="1" y="3" width="8" height="6" fill="none" stroke="currentColor" stroke-width="2" />
							</svg>
						{/if}
					</button>
					<button class="tb-btn close-btn" disabled={!closable} onclick={closable ? closeWindow : undefined} aria-label="Close" title="Close">
						<svg class="icon-retro" width="8" height="7" viewBox="0 0 8 7">
							<line x1="0" y1="0" x2="8" y2="7" stroke="currentColor" stroke-width="1.5" />
							<line x1="8" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1.5" />
						</svg>
						<svg class="icon-aero" width="10" height="10" viewBox="0 0 10 10">
							<line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							<line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
						</svg>
					</button>
				{/if}
				{#if isMobile && closable}
					<button class="tb-btn close-btn" onclick={closeWindow} aria-label="Close" title="Close">
						<svg class="icon-retro" width="8" height="7" viewBox="0 0 8 7">
							<line x1="0" y1="0" x2="8" y2="7" stroke="currentColor" stroke-width="1.5" />
							<line x1="8" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1.5" />
						</svg>
						<svg class="icon-aero" width="10" height="10" viewBox="0 0 10 10">
							<line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							<line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
						</svg>
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
	/* CSS refactorisé : nesting appliqué */

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
		background: var(--win-surface);
		border: 2px solid;
		border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
		box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
		border-radius: var(--win-window-radius);

		&.minimized {
			display: none;
		}

		&.maximized,
		&.mobile {
			width: 100%;
			height: 100%;
			border: none;
			box-shadow: none;
			border-radius: 0;
		}
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

		&.dragging {
			cursor: grabbing;
		}

		.maximized &,
		.mobile & {
			cursor: default;
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

		&:active:not(:disabled) {
			border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
			box-shadow: inset 1px 1px 0 var(--win-border-dark);
		}

		&:disabled {
			color: var(--win-border-dark);
			cursor: default;
		}

		/* Aero SVGs hidden by default (win95) */
		.icon-aero {
			display: none;
		}
	}

	/* ============ TOUCH TARGETS (mobile) ================== */
	/* 16×14 is a mouse-sized button. On a phone the close button is the only one left,
	   so give it room rather than making people aim. */
	.mobile .titlebar {
		min-height: 40px;
		padding: 2px 6px;

		.tb-btn {
			width: 36px;
			height: 32px;
		}

		.titlebar-title {
			font-size: 14px;
		}

		.titlebar-icon {
			width: 20px;
			height: 20px;
		}
	}

	/* =================== WINDOW BODY ====================== */
	.window-body {
		padding: 4px;
		flex: 1;
		overflow: auto;
		min-height: 0;
	}

	/* ============== WIN7 AERO OVERRIDES ================== */
	:global([data-theme="win7aero"]) .desktop-window {
		backdrop-filter: blur(7px);
		border: 1px solid #000;
		padding: 0 6px 6px 6px;
		border-radius: 7px;
		box-shadow:
			0 0 10px 2px rgba(0,0,0,0.333),
			inset 0 0 0 1px rgba(255,255,255,0.667);
		background:
			linear-gradient(rgba(255,255,255,0) 30px, rgba(255,255,255,0.50) 40%, rgba(255,255,255,0) 41%),
			linear-gradient(140deg, rgba(255,255,255,0.23) 70px, transparent 100px),
			linear-gradient(229deg, rgba(255,255,255,0.23) 70px, transparent 100px);

		.titlebar {
			background: none;
			backdrop-filter: none;
			border-radius: 2px 2px 0 0;
			padding: 0px 0px 0px 6px;
			min-height: 33px;

			.titlebar-icon {
				font-size: 14px;
			}

			.titlebar-title {
				font-size: 12px;
				font-family: 'Segoe UI', Arial, sans-serif;
				color: #1a1a1a;
				font-weight: 500;
				overflow: visible;
				padding: 6px 12px 6px 0px;
				text-shadow: 0px 0px 10px rgb(255 255 255),
							 -1px -1px 15px rgb(255 255 255),
							 1px 1px 15px rgb(255 255 255),
							 1px -1px 15px rgb(255 255 255),
							 -1px 1px 15px rgb(255 255 255);
			}

			.titlebar-buttons {
				gap: 0;
				position: relative;
				top: 0;
				align-self: flex-start;
				border-bottom-left-radius: 5px;
				border-bottom-right-radius: 5px;
				border: 1px solid rgba(0,0,0,0.33);
				border-top: 0;
				overflow: hidden;
			}
		}

		.tb-btn {
			width: 31px;
			height: 20px;
			border: none;
			border-radius: 0;
			box-shadow: inset 0 0 0 1px rgba(255,255,255,0.33);
			background-image: none;
			background-color: transparent;
			border-right: 1px solid rgba(0,0,0,0.33);
			color: #fff;
			padding: 0;
			position: relative;
			cursor: pointer;

			&:first-child {
				border-bottom-left-radius: 5px;
			}

			&.close-btn {
				border-right: 0;
				border-bottom-right-radius: 5px;
				width: 48px;
				background-color: transparent;
				background-image: none;
			}

			&:disabled {
				cursor: default;
			}

			.icon-retro {
				display: none;
			}

			.icon-aero {
				display: block;
				position: relative;
				z-index: 1;
				filter: drop-shadow(0 0 0.75px rgba(0,0,0,0.75));
			}

			&::before,
			&::after {
				content: '';
				position: absolute;
				inset: 0;
				z-index: 0;
				opacity: 0;
				pointer-events: none;
				box-shadow: 0 0 7px 3px #5dc4f0, inset 0 0 0 1px rgba(255,255,255,0.47);
			}

			&::before {
				background: radial-gradient(circle at bottom, #0bfdfa, transparent 65%), linear-gradient(#b6d9ee 50%, #1a6ca1 50%);
				transition: opacity 0.15s;
			}

			&::after {
				background: radial-gradient(circle at bottom, #0bfdfa, transparent 65%), linear-gradient(#86a7bc 50%, #092747 50%);
			}

			&:not(:disabled):hover::before {
				opacity: 1;
			}

			&:not(:disabled):active::after {
				opacity: 1;
			}

			&.close-btn::before {
				background:
					radial-gradient(circle at 50% 170%, #f4e676 10% 20%, transparent 60%),
					radial-gradient(circle at -60% 50%, rgba(0,0,0,0.47) 5% 10%, transparent 50%),
					radial-gradient(circle at 160% 50%, rgba(0,0,0,0.47) 5% 10%, transparent 50%),
					linear-gradient(#fb9d8b, #ee6d56 25% 50%, #d42809 50%);
				box-shadow: 0 0 7px 3px #e68e75, inset 0 0 0 1px rgba(255,255,255,0.47);
			}

			&.close-btn::after {
				background:
					radial-gradient(circle at 50% 170%, #dcc03f 10% 20%, transparent 60%),
					radial-gradient(circle at -60% 50%, rgba(0,0,0,0.67) 5% 10%, transparent 50%),
					radial-gradient(circle at 160% 50%, rgba(0,0,0,0.67) 5% 10%, transparent 50%),
					linear-gradient(#d1a894, #b67562 25% 50%, #7d0d01 50%);
				box-shadow: 0 0 7px 3px #e68e75, inset 0 0 0 1px rgba(255,255,255,0.47);
			}
		}

		.window-body {
			border: 1px solid rgba(0,0,0,0.667);
			background: var(--win-body-bg, #ffffff);
			border-radius: 0;
			box-shadow: 0 0 0 1px rgba(255,255,255,0.667);
			padding: 10px;
		}

		&.focused {
			/* glass reflection effect sides */
			/* glass reflection effect left corner */
			/* glass reflection effect right corner */
			/* base background color with some opacity for the frosted glass effect */
			background:
				linear-gradient(rgba(255,255,255,0) 30px, rgba(255,255,255,0.70) 40%, rgba(255,255,255,0) 41%),
				linear-gradient(140deg, rgba(255,255,255,0.33) 70px, transparent 100px),
				linear-gradient(229deg, rgba(255,255,255,0.33) 70px, transparent 100px),
				var(--window-background-translucent);
			box-shadow:
				inset 0 0 0 1px rgba(255,255,255,0.667),
				2px 2px 15px 1px rgba(0,0,0,0.93);

			.titlebar {
				.titlebar-buttons {
					border-color: rgba(0,0,0,0.667);
					box-shadow: 0 0 0 1px rgba(255,255,255,0.667);
				}
			}

			.tb-btn {
				background-image: linear-gradient(
					rgba(244,244,244,0.57),
					rgba(211,211,211,0.45) 45%,
					rgba(0,0,0,0.18) 50%,
					rgba(143,150,173,0.31)
				);
				border-right-color: rgba(0,0,0,0.67);
				box-shadow: inset 0 0 0 1px rgba(255,255,255,0.667);

				&:disabled {
					background-color: rgba(255, 255, 255, 0.4);
					backdrop-filter: saturate(0.25);
				}

				&.close-btn {
					background-color: #d54f36;
					background-image:
						linear-gradient(
							rgba(244,244,244,0.57),
							rgba(211,211,211,0.45) 45%,
							rgba(0,0,0,0.18) 50%,
							rgba(143,150,173,0.31)
						),
						radial-gradient(circle at -60% 50%, rgba(0,0,0,0.33) 5% 10%, transparent 50%),
						radial-gradient(circle at 160% 50%, rgba(0,0,0,0.33) 5% 10%, transparent 50%);
					color: #fff;
				}
			}
		}

		&.maximized,
		&.mobile {
			border: 0;
			border-radius: 0;
			padding: 0;

			.titlebar {
				border-radius: 0;
				min-height: 28px;
			}

			.titlebar-buttons {
				margin-right: 2px;
			}

			.window-body {
				border-width: 1px 0 0 0;
			}
		}
	}
</style>
