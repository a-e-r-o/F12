<script lang="ts">
	import { onMount } from 'svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { programs } from '$lib/stores/programs.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { themeState } from '$lib/stores/theme.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	let elapsed = $state(0);
	let { startMenuOpen = $bindable(false) }: { startMenuOpen?: boolean } = $props();
	let menuOpen = $state(false);
	let isMobile = $derived(windowsState.isMobile);

	onMount(() => {
		const interval = setInterval(() => {
			elapsed += 1;
		}, 1000);
		return () => clearInterval(interval);
	});

	function formatTime(seconds: number): string {
		const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
		const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${h}:${m}:${s}`;
	}

	function selectWindow(id: string) {
		windowsState.toggle(id);
		menuOpen = false;
	}

	$effect(() => {
		const titles: Record<string, string> = {};
		for (const p of programs) {
			titles[p.id] = i18n.t(p.titleKey);
		}
		windowsState.updateTitles(titles);
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="taskbar" class:mobile={isMobile}>
	{#if isMobile}
		<!-- Mobile: hamburger + current window title -->
		<button class="start-btn" onclick={() => menuOpen = !menuOpen}>
			<span class="start-logo">☰</span>
			<span class="start-text">Menu</span>
		</button>

		{#each windowsState.windows as win (win.id)}
			{#if win.visible}
				<div class="mobile-title">
					<img class="mobile-title-icon" src={themeState.icon(win.iconKey)} alt="" draggable="false" />
					<span>{win.title}</span>
				</div>
			{/if}
		{/each}

		{#if menuOpen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="menu-backdrop" onmousedown={() => menuOpen = false} ontouchstart={() => menuOpen = false}></div>
			<div class="mobile-menu">
				{#each windowsState.windows.filter(w => !w.closable || w.running) as win (win.id)}
					<button
						class="menu-item"
						class:active={win.visible}
						onclick={() => selectWindow(win.id)}
					>
						<img class="menu-icon" src={themeState.icon(win.iconKey)} alt="" draggable="false" />
						<span class="menu-label">{win.title}</span>
					</button>
				{/each}
			</div>
		{/if}

		<div class="system-tray">
			<LanguageSwitcher />
		</div>
	{:else}
		<!-- Desktop: full taskbar -->
		<button class="start-btn" class:active={startMenuOpen} onclick={() => startMenuOpen = !startMenuOpen}>
			{#if themeState.isWin95}
				<img class="start-logo" src={themeState.icon('start', themeState.isWin7 ? 48 : 16)} alt="" draggable="false" />
				<span class="start-text">{i18n.t('startMenu.start')}</span>
			{/if}
		</button>

		<div class="taskbar-divider"></div>

		<div class="task-buttons">
			{#each windowsState.windows.filter(w => !w.closable || w.running) as win (win.id)}
				<button
					class="task-btn"
					class:active={win.visible}
					onclick={() => windowsState.toggle(win.id)}
					title={win.title}
				>
					<img class="task-icon" src={themeState.icon(win.iconKey, 32)} alt="" draggable="false" />
					<span class="task-label">{win.title}</span>
				</button>
			{/each}
		</div>

		<div class="system-tray">
			<div class="tray-divider"></div>
			<LanguageSwitcher />
			<div class="clock">{formatTime(elapsed)}</div>
		</div>
	{/if}
</div>

<style>
	.taskbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--taskbar-height, 32px);
		background: var(--win-taskbar-bg);
		border-top: 2px solid var(--win-border-light);
		display: flex;
		align-items: center;
		padding: 2px 2px;
		gap: 2px;
		z-index: 9999;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

		&.mobile {
			height: 48px;
			padding: 4px 6px;
			gap: 6px;

			.start-btn {
				height: 38px;
				padding: 4px 12px;
				font-size: 13px;
				gap: 6px;
			}

			.start-logo {
				font-size: 18px;
			}

			.system-tray {
				gap: 8px;
				padding: 0 6px;
			}
		}
		/* =================== START BUTTON ==================== */
		.start-btn {
			display: flex;
			align-items: center;
			gap: 3px;
			padding: 2px 6px;
			height: 24px;
			font-weight: bold;
			font-size: 11px;
			flex-shrink: 0;
			background: var(--win-btn-face);
			border: 2px solid;
			border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
			box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
			cursor: pointer;
			color: #000;
	
			&.active {
				border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
				box-shadow: inset 1px 1px 0 var(--win-border-dark), inset -1px -1px 0 var(--win-border-mid);
			}
	
			img.start-logo {
				width: 16px;
				height: 16px;
				image-rendering: pixelated;
			}
	
			.start-logo {
				line-height: 1;
			}
	
			.start-text {
				font-size: 11px;
				font-weight: bold;
			}
		}
	
		/* =================== TASK AREA ======================== */
		.taskbar-divider {
			width: 2px;
			height: 22px;
			margin: 0 1px;
			border-left: 1px solid var(--win-border-dark);
			border-right: 1px solid var(--win-border-light);
		}
	
		.task-buttons {
			display: flex;
			flex: 1;
			gap: 2px;
			overflow: hidden;
			min-width: 0;
		}
	
		.task-btn {
			display: flex;
			align-items: center;
			gap: 3px;
			height: 24px;
			min-width: 80px;
			max-width: 160px;
			padding: 2px 6px;
			background: var(--win-btn-face);
			border: 2px solid;
			border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
			box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
			cursor: pointer;
			font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			font-size: 11px;
			color: #000000;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			flex-shrink: 1;
	
			&.active {
				border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
				box-shadow: inset 1px 1px 0 var(--win-border-dark), inset -1px -1px 0 var(--win-border-mid);
				font-weight: bold;
				background-image: url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='0' width='1' height='1' fill='%23ffffff'/%3E%3Crect x='0' y='1' width='1' height='1' fill='%23ffffff'/%3E%3C/svg%3E");
				background-size: 2px 2px;
			}
	
			.task-icon {
				width: 16px;
				height: 16px;
				flex-shrink: 0;
				image-rendering: pixelated;
			}
	
			.task-label {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
	
		}
	
		/* =================== SYSTEM TRAY ===================== */
		.system-tray {
			display: flex;
			align-items: center;
			gap: 4px;
			margin-left: auto;
			flex-shrink: 0;
			padding: 0 4px;
		}
	
		.tray-divider {
			width: 2px;
			height: 22px;
			border-left: 1px solid var(--win-border-dark);
			border-right: 1px solid var(--win-border-light);
		}
	
		.clock {
			font-size: 11px;
			font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			display: flex;
			align-items: center;
			padding: 2px 8px;
			border: 1px solid;
			border-color: var(--win-border-dark) var(--win-border-light) var(--win-border-light) var(--win-border-dark);
			box-shadow: inset 1px 1px 0 var(--win-border-darkest);
			white-space: nowrap;
			line-height: 1.65;
		}
	
		/* =================== MOBILE MENU ===================== */
		.mobile-title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 14px;
			font-weight: bold;
			color: #000;
			flex: 1;
			min-width: 0;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			padding: 0 6px;
	
			.mobile-title-icon {
				width: 16px;
				height: 16px;
				image-rendering: pixelated;
			}
		}
	
		.menu-backdrop {
			position: fixed;
			inset: 0;
			z-index: 9998;
		}
	
		.mobile-menu {
			position: fixed;
			bottom: 32px;
			left: 0;
			background: var(--win-surface);
			border: 2px solid;
			border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
			box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
			z-index: 10000;
			min-width: 200px;
			padding: 2px;
		}
	
		.menu-item {
			display: flex;
			align-items: center;
			gap: 8px;
			width: 100%;
			padding: 6px 12px;
			background: none;
			border: none;
			cursor: pointer;
			font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			font-size: 12px;
			color: #000;
			text-align: left;
	
			&:hover {
				background: var(--win-titlebar-active, #000080);
				color: #fff;
			}
	
			&.active {
				font-weight: bold;
			}
	
			.menu-icon {
				width: 16px;
				height: 16px;
				flex-shrink: 0;
				image-rendering: pixelated;
			}
	
			.menu-label {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
	
		}
	}

	/* ============== WIN7 AERO TASKBAR OVERRIDES ================== */
	:global([data-theme="win7aero"]) .taskbar {
		height: var(--taskbar-height, 44px);
		background: var(--win-taskbar-bg);
		border: none;
		padding: 0;

		.start-btn {
			width: 54px;
			height: 100%;
			display: flex;
			align-items: center;
			box-shadow: none;
			cursor: pointer;
			position: relative;
			border: none;
			background-color: transparent;
			background-image: url('./src/lib/assets/images/start_aero.png');
			background-size: 55px 55px;
			background-position: center;

			&:before {
				transition: opacity 0.3s ease-out, background-image 0.3s ease-out;
				height: 100%;
				width: 100%;
				content: '';
				position: absolute;
				inset: 0;
				border: 2px solid transparent;
				border-radius: 4px;
				pointer-events: none;
				opacity: 0;
				background-image: url('./src/lib/assets/images/start_aero_hover.png');
				background-size: inherit;
				background-position: inherit;
			}

			&:hover, &:active {
				&:before {
					opacity: 1;
				}
			}

			&.active {
				&:before {
					opacity: 1;
					background-image: url('./src/lib/assets/images/start_aero_active.png');
				}
			}
		}

		.taskbar-divider {
			display: none;
		}

		.task-btn {
			min-width: 44px;
			max-width: 44px;
			height: 38px;
			border: 1px solid transparent;
			border-radius: 2px;
			background: transparent;
			box-shadow: none;
			padding: 0;
			justify-content: center;
			transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
			position: relative;

			&:hover:not(.active) {
				background:
					radial-gradient(circle at bottom, rgba(191,220,250,0.667) 5%, transparent 15%),
					radial-gradient(circle at 0 50%, rgba(0,0,0,0.33), transparent),
					radial-gradient(circle at 100% 50%, rgba(0,0,0,0.33), transparent),
					radial-gradient(circle at 0 50%, rgba(255,255,255,0.33), transparent),
					radial-gradient(circle at 100% 50%, rgba(255,255,255,0.33), transparent);
				background-size: 100%, 1px, 1px, 1px, 1px, 100%;
				background-repeat: no-repeat;
				background-position-x: center, 0, calc(100% - 1px), 1px, 100%, center;
			}

			&.active {
				border-color: rgba(0,0,0,0.53);
				box-shadow: inset 0 0 0 1px rgba(255,255,255,0.667);
				background:
					linear-gradient(155deg, rgba(255,255,255,0.667), rgba(255,255,255,0) 40%),
					radial-gradient(ellipse at bottom right, transparent, rgba(0,0,0,0.067) 64%, transparent 65%),
					linear-gradient(rgba(255,255,255,0.53), rgba(255,255,255,0.13) 60%, rgba(255,255,255,0.6));
				background-image: none;
				background-size: unset;
			}

			&.active:hover {
				background-color: rgba(255,255,255,0.33);
			}

			.task-icon {
				width: 24px;
				height: 24px;
			}

			.task-label {
				display: none;
			}
		}

		.system-tray {
			gap: 2px;
			padding: 0 8px;
			border-left: 1px solid rgba(180, 220, 255, 0.15);
		}

		.tray-divider {
			display: none;
		}

		.clock {
			border: none;
			box-shadow: none;
			color: #ffffff;
			font-family: 'Segoe UI', Arial, sans-serif;
			font-size: 12px;
			padding: 4px 8px;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		}

		.mobile-title {
			color: #fff;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		}

		.mobile-menu {
			bottom: 44px;
			background: rgba(40, 70, 130, 0.88);
			backdrop-filter: blur(30px) saturate(1.4);
			-webkit-backdrop-filter: blur(30px) saturate(1.4);
			border: 1px solid rgba(150, 200, 255, 0.25);
			border-radius: 6px 6px 0 0;
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
		}

		.menu-item {
			color: #ffffff;
			font-family: 'Segoe UI', Arial, sans-serif;
			border-radius: 3px;

			&:hover {
				background: rgba(255, 255, 255, 0.15);
			}
		}

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(to right, rgba(0,0,0,0.24), rgba(0,0,0,0.24) 70%, rgba(0,0,0,0.4) 90%);
			box-shadow:
				inset 0 1px 0 rgba(0,0,0,0.667),
				inset 0 2px 0 rgba(255,255,255,0.667);
			pointer-events: none;
		}

		&.mobile {
			height: 52px;

			.start-btn {
				background: rgba(255, 255, 255, 0.1);
				border: 1px solid rgba(255, 255, 255, 0.2);
				border-radius: 4px;
				box-shadow: none;
				color: #fff;
			}
		}
	}
</style>
