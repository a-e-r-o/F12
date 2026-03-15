<script lang="ts">
	import { onMount } from 'svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	let elapsed = $state(0);
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
		windowsState.updateTitles({
			'home': i18n.t('nav.about'),
			'hybrid-diagrams': i18n.t('nav.hybridDiagrams'),
			'converters': i18n.t('nav.converters'),
			'game-of-life': i18n.t('nav.gameOfLife'),
			'image-convert': i18n.t('nav.imgConvert'),
			'wallpaper': i18n.locale === 'fr' ? 'Fond d\'écran' : 'Wallpaper'
		});
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="taskbar" class:mobile={isMobile}>
	{#if isMobile}
		<!-- Mobile: hamburger + current window title -->
		<button class="start-btn win95-btn" onclick={() => menuOpen = !menuOpen}>
			<span class="start-logo">☰</span>
			<span class="start-text">Menu</span>
		</button>

		{#each windowsState.windows as win (win.id)}
			{#if win.visible}
				<div class="mobile-title">
					<span>{win.icon}</span>
					<span>{win.title}</span>
				</div>
			{/if}
		{/each}

		<!-- Mobile popup menu -->
		{#if menuOpen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="menu-backdrop" onmousedown={() => menuOpen = false} ontouchstart={() => menuOpen = false}></div>
			<div class="mobile-menu">
				{#each windowsState.windows.filter(w => w.id !== 'wallpaper') as win (win.id)}
					<button
						class="menu-item"
						class:active={win.visible}
						onclick={() => selectWindow(win.id)}
					>
						<span class="menu-icon">{win.icon}</span>
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
		<button class="start-btn win95-btn">
			<span class="start-logo">🪟</span>
			<span class="start-text">{i18n.locale === 'fr' ? 'Démarrer' : 'Start'}</span>
		</button>

		<div class="taskbar-divider"></div>

		<div class="task-buttons">
			{#each windowsState.windows.filter(w => w.id !== 'wallpaper') as win (win.id)}
				<button
					class="task-btn"
					class:active={win.visible}
					onclick={() => windowsState.toggle(win.id)}
					title={win.title}
				>
					<span class="task-icon">{win.icon}</span>
					<span class="task-label">{win.title}</span>
				</button>
			{/each}
		</div>

		<div class="system-tray">
			<div class="tray-divider"></div>
			<button class="tray-btn win95-btn" onclick={() => windowsState.toggle('wallpaper')} title="Wallpaper">
				🖼️
			</button>
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
		height: 32px;
		background: var(--win95-taskbar-bg);
		border-top: 2px solid var(--win95-border-light);
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

	.start-logo {
		font-size: 14px;
		line-height: 1;
	}

	.start-text {
		font-size: 11px;
		font-weight: bold;
	}

	.taskbar-divider {
		width: 2px;
		height: 22px;
		margin: 0 1px;
		border-left: 1px solid var(--win95-border-dark);
		border-right: 1px solid var(--win95-border-light);
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
		background: var(--win95-btn-face);
		border: 2px solid;
		border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
		box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
		cursor: pointer;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		font-size: 11px;
		color: #000000;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex-shrink: 1;
	}

	.task-btn.active {
		border-color: var(--win95-border-darkest) var(--win95-border-light) var(--win95-border-light) var(--win95-border-darkest);
		box-shadow: inset 1px 1px 0 var(--win95-border-dark), inset -1px -1px 0 var(--win95-border-mid);
		font-weight: bold;
		background-image: url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='0' width='1' height='1' fill='%23ffffff'/%3E%3Crect x='0' y='1' width='1' height='1' fill='%23ffffff'/%3E%3C/svg%3E");
		background-size: 2px 2px;
	}

	.task-icon {
		font-size: 12px;
		flex-shrink: 0;
	}

	.task-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

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
		border-left: 1px solid var(--win95-border-dark);
		border-right: 1px solid var(--win95-border-light);
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

	.clock {
		font-size: 11px;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		display: flex;
		align-items: center;
		padding: 2px 8px;
		border: 1px solid;
		border-color: var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark);
		box-shadow: inset 1px 1px 0 var(--win95-border-darkest);
		white-space: nowrap;
	}

	/* Mobile styles */
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

	.menu-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9998;
	}

	.mobile-menu {
		position: fixed;
		bottom: 32px;
		left: 0;
		background: var(--win95-surface);
		border: 2px solid;
		border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
		box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
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
	}

	.menu-item:hover {
		background: var(--win95-titlebar-active, #000080);
		color: #fff;
	}

	.menu-item.active {
		font-weight: bold;
	}

	.menu-icon {
		font-size: 14px;
		width: 20px;
		text-align: center;
		flex-shrink: 0;
	}

	.menu-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
