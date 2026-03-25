<script lang="ts">
	import { onMount } from 'svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { programs } from '$lib/stores/programs.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { themeState } from '$lib/stores/theme.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import StartMenu from './StartMenu.svelte';
	import { crt } from '$lib/stores/crt.svelte';

	let elapsed = $state(0);
	let startMenuOpen = $state(false);
	let menuOpen = $state(false);
	let isMobile = $derived(windowsState.isMobile);
	let isWin7 = $derived(themeState.isWin7);

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
<div class="taskbar" class:mobile={isMobile} class:aero={isWin7}>
	{#if isMobile}
		<!-- Mobile: hamburger + current window title -->
		<button class="start-btn" class:win95-btn={!isWin7} class:aero-start-btn={isWin7} onclick={() => menuOpen = !menuOpen}>
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
			<div class="mobile-menu" class:aero={isWin7}>
				{#each windowsState.windows.filter(w => w.id !== 'wallpaper') as win (win.id)}
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
		<button class="start-btn" class:win95-btn={!isWin7} class:aero-start-btn={isWin7} class:active={startMenuOpen} onclick={() => startMenuOpen = !startMenuOpen}>
			{#if isWin7}
				<span class="start-orb">⊞</span>
			{:else}
				<img class="start-logo" src={themeState.icon('start')} alt="" draggable="false" />
				<span class="start-text">{i18n.t('startMenu.start')}</span>
			{/if}
		</button>

		<StartMenu open={startMenuOpen} onclose={() => startMenuOpen = false} />

		{#if !isWin7}
			<div class="taskbar-divider"></div>
		{/if}

		<div class="task-buttons">
			{#each windowsState.windows.filter(w => w.id !== 'wallpaper' && (!w.closable || w.running)) as win (win.id)}
				<button
					class="task-btn"
					class:active={win.visible}
					class:aero={isWin7}
					onclick={() => windowsState.toggle(win.id)}
					title={win.title}
				>
					<img class="task-icon" src={themeState.icon(win.iconKey)} alt="" draggable="false" />
					{#if !isWin7}
						<span class="task-label">{win.title}</span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="system-tray" class:aero={isWin7}>
			{#if !isWin7}
				<div class="tray-divider"></div>
			{/if}
			<button class="tray-btn" class:win95-btn={!isWin7} class:aero-tray-btn={isWin7} onclick={() => windowsState.toggle('wallpaper')} title="Wallpaper">
				<img class="tray-icon" src={themeState.icon('wallpaper')} alt="" draggable="false" />
			</button>
			<button
				class="tray-btn"
				class:win95-btn={!isWin7}
				class:aero-tray-btn={isWin7}
				onclick={() => themeState.toggle()}
				title={isWin7 ? 'Theme: Win7 Aero' : 'Theme: Win95'}
			>
				{isWin7 ? '🪟' : '💎'}
			</button>
			<button
				class="tray-btn"
				class:win95-btn={!isWin7}
				class:aero-tray-btn={isWin7}
				class:active={crt.enabled}
				onclick={() => crt.toggle()}
				title={crt.enabled ? 'CRT: ON' : 'CRT: OFF'}
			>
				<img class="tray-icon" src={crt.enabled ? themeState.icon('crtOn') : themeState.icon('crtOff')} alt="" draggable="false" />
			</button>
			<LanguageSwitcher />
			<div class="clock" class:aero={isWin7}>{formatTime(elapsed)}</div>
		</div>
	{/if}
</div>

<style>
	/* =================== TASKBAR BASE ==================== */
	.taskbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 32px;
		background: var(--win-taskbar-bg);
		border-top: 2px solid var(--win-border-light);
		display: flex;
		align-items: center;
		padding: 2px 2px;
		gap: 2px;
		z-index: 9999;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.taskbar.mobile {
		height: 48px;
		padding: 4px 6px;
		gap: 6px;
	}

	/* =================== WIN7 AERO TASKBAR ================ */
	.taskbar.aero {
		height: 44px;
		background: linear-gradient(180deg,
			rgba(60, 100, 170, 0.50) 0%,
			rgba(30, 65, 130, 0.60) 50%,
			rgba(20, 50, 110, 0.65) 100%
		);
		backdrop-filter: blur(30px) saturate(1.4);
		-webkit-backdrop-filter: blur(30px) saturate(1.4);
		border-top: 1px solid rgba(150, 200, 255, 0.35);
		padding: 0 4px;
		gap: 1px;
		font-family: 'Segoe UI', Arial, sans-serif;
	}

	.taskbar.aero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(120, 180, 255, 0.08) 0%, transparent 40%);
		pointer-events: none;
	}

	.taskbar.aero.mobile {
		height: 52px;
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
	}

	.start-btn.active:not(.aero-start-btn) {
		border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
		box-shadow: inset 1px 1px 0 var(--win-border-dark), inset -1px -1px 0 var(--win-border-mid);
	}

	.mobile .start-btn {
		height: 38px;
		padding: 4px 12px;
		font-size: 13px;
		gap: 6px;
	}

	.mobile .start-logo {
		font-size: 18px;
	}

	.mobile .system-tray {
		gap: 8px;
		padding: 0 6px;
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

	/* Win7 Start orb */
	.aero-start-btn {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: none;
		background: radial-gradient(circle at 50% 38%,
			rgba(130, 200, 255, 0.95) 0%,
			rgba(72, 145, 230, 0.95) 35%,
			rgba(40, 100, 200, 0.98) 60%,
			rgba(25, 70, 160, 1) 100%
		);
		box-shadow:
			0 0 12px rgba(80, 160, 255, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.4),
			inset 0 1px 3px rgba(255, 255, 255, 0.5),
			inset 0 -2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		margin: 0 2px;
		margin-top: -6px;
		padding: 0;
		z-index: 1;
	}

	.aero-start-btn::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 8px;
		right: 8px;
		height: 45%;
		border-radius: 50%;
		background: linear-gradient(180deg,
			rgba(255, 255, 255, 0.50) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		pointer-events: none;
	}

	.aero-start-btn:hover {
		background: radial-gradient(circle at 50% 38%,
			rgba(160, 220, 255, 1) 0%,
			rgba(90, 165, 245, 1) 35%,
			rgba(55, 120, 220, 1) 60%,
			rgba(35, 85, 180, 1) 100%
		);
		box-shadow:
			0 0 20px rgba(80, 160, 255, 0.6),
			0 2px 4px rgba(0, 0, 0, 0.4),
			inset 0 1px 3px rgba(255, 255, 255, 0.6),
			inset 0 -2px 4px rgba(0, 0, 0, 0.2);
	}

	.aero-start-btn.active {
		background: radial-gradient(circle at 50% 38%,
			rgba(100, 170, 240, 0.95) 0%,
			rgba(50, 115, 200, 0.95) 35%,
			rgba(30, 80, 170, 0.98) 60%,
			rgba(18, 55, 130, 1) 100%
		);
	}

	.start-orb {
		font-size: 24px;
		color: #fff;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		line-height: 1;
		position: relative;
		z-index: 1;
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

	/* Win95 task buttons */
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
	}

	.task-btn.active:not(.aero) {
		border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
		box-shadow: inset 1px 1px 0 var(--win-border-dark), inset -1px -1px 0 var(--win-border-mid);
		font-weight: bold;
		background-image: url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='0' width='1' height='1' fill='%23ffffff'/%3E%3Crect x='0' y='1' width='1' height='1' fill='%23ffffff'/%3E%3C/svg%3E");
		background-size: 2px 2px;
	}

	/* Win7 Aero task buttons (icon-only, like Win7 superbar) */
	.task-btn.aero {
		min-width: 44px;
		max-width: 44px;
		height: 38px;
		border: 1px solid transparent;
		border-radius: 3px;
		background: transparent;
		box-shadow: none;
		padding: 0;
		justify-content: center;
		transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
	}

	.task-btn.aero .task-icon {
		width: 24px;
		height: 24px;
	}

	.task-btn.aero:hover {
		background: rgba(255, 255, 255, 0.18);
		border-color: rgba(180, 220, 255, 0.30);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	.task-btn.aero.active {
		background: linear-gradient(180deg,
			rgba(130, 190, 255, 0.25) 0%,
			rgba(100, 170, 250, 0.18) 50%,
			rgba(80, 150, 240, 0.22) 100%
		);
		border-color: rgba(140, 200, 255, 0.40);
		box-shadow:
			inset 0 0 10px rgba(100, 180, 255, 0.15),
			0 0 6px rgba(80, 160, 255, 0.12);
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

	/* =================== SYSTEM TRAY ===================== */
	.system-tray {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
		flex-shrink: 0;
		padding: 0 4px;
	}

	.system-tray.aero {
		gap: 2px;
		padding: 0 8px;
		border-left: 1px solid rgba(180, 220, 255, 0.15);
	}

	.tray-divider {
		width: 2px;
		height: 22px;
		border-left: 1px solid var(--win-border-dark);
		border-right: 1px solid var(--win-border-light);
	}

	.tray-btn {
		height: 22px;
		width: 26px;
		padding: 0;
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
	}

	/* Win7 tray button */
	.aero-tray-btn {
		width: 28px;
		height: 28px;
		border: 1px solid transparent;
		border-radius: 3px;
		background: transparent;
		color: #e0e0e0;
		font-size: 14px;
	}

	.aero-tray-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.2);
	}

	/* Clock */
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

	.clock.aero {
		border: none;
		box-shadow: none;
		color: #ffffff;
		font-family: 'Segoe UI', Arial, sans-serif;
		font-size: 12px;
		padding: 4px 8px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
	}

	.aero .mobile-title {
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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

	.mobile-menu.aero {
		bottom: 44px;
		background: rgba(40, 70, 130, 0.88);
		backdrop-filter: blur(30px) saturate(1.4);
		-webkit-backdrop-filter: blur(30px) saturate(1.4);
		border: 1px solid rgba(150, 200, 255, 0.25);
		border-radius: 6px 6px 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
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
	}

	.aero .menu-item {
		color: #ffffff;
		font-family: 'Segoe UI', Arial, sans-serif;
		border-radius: 3px;
	}

	.menu-item:hover {
		background: var(--win-titlebar-active, #000080);
		color: #fff;
	}

	.aero .menu-item:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.menu-item.active {
		font-weight: bold;
	}

	.menu-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		image-rendering: pixelated;
	}

	.tray-icon {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}

	.mobile-title-icon {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}

	.menu-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
