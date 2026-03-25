<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { programs } from '$lib/stores/programs.svelte';
	import { themeState } from '$lib/stores/theme.svelte';

	let { open = false, onclose }: { open: boolean; onclose: () => void } = $props();

	let startMenuPrograms = $derived(programs.filter(p => p.inStartMenu));
	let isWin7 = $derived(themeState.isWin7);

	function launch(id: string) {
		windowsState.open(id);
		onclose();
	}

	function handleShutdown() {
		onclose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="start-menu-backdrop" onmousedown={onclose}></div>

	{#if isWin7}
		<!-- ===== WIN7 AERO START MENU ===== -->
		<div class="start-menu aero-menu">
			<div class="aero-top">
				<div class="aero-programs">
					{#each startMenuPrograms as prog (prog.id)}
						<button class="aero-item" onclick={() => launch(prog.id)}>
							<img class="aero-icon" src={themeState.icon(prog.iconKey, 32)} alt="" draggable="false" />
							<span class="aero-label">{i18n.t(prog.titleKey)}</span>
						</button>
					{/each}
					<div class="aero-programs-footer">
						<div class="aero-sep"></div>
						<button class="aero-item all-programs">
							<span class="aero-label">{i18n.locale === 'fr' ? 'Tous les programmes' : 'All Programs'}</span>
							<span class="aero-arrow">▶</span>
						</button>
					</div>
				</div>
				<div class="aero-sidebar">
					<div class="aero-user">
						<div class="aero-avatar">👤</div>
						<span class="aero-username">User</span>
					</div>
					<div class="aero-separator"></div>
					<button class="aero-sidebar-item" onclick={() => { launch('home'); }}>
						<img class="sidebar-icon" src={themeState.icon('about')} alt="" draggable="false" /> {i18n.t('nav.about')}
					</button>
					<button class="aero-sidebar-item" onclick={() => { launch('wallpaper'); onclose(); }}>
						<img class="sidebar-icon" src={themeState.icon('wallpaper')} alt="" draggable="false" /> {i18n.locale === 'fr' ? 'Personnaliser' : 'Personalize'}
					</button>
				</div>
			</div>
			<div class="aero-bottom">
				<div class="aero-search">
					<input type="text" class="aero-search-input" placeholder={i18n.locale === 'fr' ? 'Rechercher...' : 'Search programs and files'} readonly />
					<span class="aero-search-icon">🔍</span>
				</div>
				<button class="aero-shutdown" onclick={handleShutdown}>
					<span>{i18n.t('startMenu.shutDown')}</span>
					<span class="shutdown-arrow">▶</span>
				</button>
			</div>
		</div>
	{:else}
		<!-- ===== WIN95 START MENU ===== -->
		<div class="start-menu win95-menu">
			<div class="sidebar">
				<span class="sidebar-text">F12</span>
			</div>
			<div class="menu-content">
				<div class="menu-section">
					<div class="section-label">{i18n.t('startMenu.programs')}</div>
					<div class="separator"></div>
					{#each startMenuPrograms as prog (prog.id)}
						<button class="menu-item" onclick={() => launch(prog.id)}>
							<img class="menu-icon" src={themeState.icon(prog.iconKey, 32)} alt="" draggable="false" />
							<span class="menu-label">{i18n.t(prog.titleKey)}</span>
						</button>
					{/each}
				</div>
				<div class="separator thick"></div>
				<button class="menu-item shutdown" onclick={handleShutdown}>
					<img class="menu-icon" src={themeState.icon('shutdown', 32)} alt="" draggable="false" />
					<span class="menu-label">{i18n.t('startMenu.shutDown')}</span>
				</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	.start-menu-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
	}

	/* =================== WIN95 MENU ====================== */
	.start-menu {
		position: fixed;
		bottom: 32px;
		left: 0;
		z-index: 10001;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.win95-menu {
		display: flex;
		flex-direction: row;
		background: var(--win-surface, #c0c0c0);
		border: 2px solid;
		border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
		box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
		min-width: 200px;
	}

	.sidebar {
		width: 24px;
		background: linear-gradient(to top, #000080, #1084d0);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 6px;
		flex-shrink: 0;
	}

	.sidebar-text {
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		color: #ffffff;
		font-size: 18px;
		font-weight: bold;
		letter-spacing: 2px;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		user-select: none;
	}

	.menu-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 2px 0;
	}

	.menu-section {
		display: flex;
		flex-direction: column;
	}

	.section-label {
		font-size: 10px;
		font-weight: bold;
		color: #808080;
		padding: 4px 12px 2px;
		user-select: none;
	}

	.separator {
		height: 1px;
		margin: 2px 4px;
		border-top: 1px solid var(--win-border-dark, #808080);
		border-bottom: 1px solid var(--win-border-light, #ffffff);
	}

	.separator.thick {
		margin: 4px 4px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 6px 16px;
		background: none;
		border: none;
		cursor: pointer;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		font-size: 11px;
		color: #000000;
		text-align: left;
	}

	.menu-item:hover {
		background: var(--win-titlebar-active, #000080);
		color: #ffffff;
	}

	.menu-icon {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		image-rendering: pixelated;
	}

	.menu-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.shutdown {
		margin-top: auto;
	}

	/* =================== WIN7 AERO MENU ================== */
	.aero-menu {
		bottom: 44px;
		min-width: 420px;
		background: rgba(255, 255, 255, 0.96);
		border: 1px solid rgba(80, 140, 210, 0.50);
		border-radius: 8px 8px 0 0;
		box-shadow:
			0 -4px 30px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(100, 160, 230, 0.30),
			inset 0 0 0 1px rgba(255, 255, 255, 0.50);
		display: flex;
		flex-direction: column;
		font-family: 'Segoe UI', Arial, sans-serif;
		overflow: hidden;
	}

	.aero-top {
		display: flex;
		flex: 1;
		min-height: 280px;
	}

	/* Left pane: white, programs */
	.aero-programs {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 6px 0;
		background: #ffffff;
		border-radius: 7px 0 0 0;
	}

	.aero-programs-footer {
		margin-top: auto;
		padding: 0;
	}

	.aero-sep {
		height: 1px;
		margin: 4px 8px;
		background: #e0e0e0;
	}

	.aero-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 12px;
		background: none;
		border: none;
		cursor: pointer;
		font-family: 'Segoe UI', Arial, sans-serif;
		font-size: 12px;
		color: #1a1a1a;
		text-align: left;
		border-radius: 2px;
		margin: 0 4px;
	}

	.aero-item:hover {
		background: rgba(80, 140, 210, 0.12);
	}

	.aero-item.all-programs {
		justify-content: space-between;
		font-weight: 600;
	}

	.aero-arrow {
		font-size: 8px;
		color: #666;
	}

	.aero-icon {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		image-rendering: auto;
	}

	.aero-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Right pane: light blue, sidebar */
	.aero-sidebar {
		width: 180px;
		display: flex;
		flex-direction: column;
		padding: 6px 0;
		background: linear-gradient(180deg,
			rgba(200, 220, 240, 0.90) 0%,
			rgba(180, 210, 240, 0.85) 50%,
			rgba(170, 200, 235, 0.90) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-left: 1px solid rgba(160, 200, 240, 0.60);
		border-radius: 0 7px 0 0;
	}

	.aero-user {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 10px 10px 8px;
	}

	.aero-avatar {
		width: 48px;
		height: 48px;
		border-radius: 4px;
		background: #e8e8e8;
		border: 2px solid rgba(100, 150, 210, 0.40);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.aero-username {
		font-size: 12px;
		font-weight: 600;
		color: #1a3a5c;
	}

	.aero-separator {
		height: 1px;
		margin: 4px 10px;
		background: rgba(100, 150, 200, 0.30);
	}

	.aero-sidebar-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 14px;
		background: none;
		border: none;
		cursor: pointer;
		color: #1a3a5c;
		font-family: 'Segoe UI', Arial, sans-serif;
		font-size: 12px;
		text-align: left;
		border-radius: 2px;
		margin: 0 4px;
	}

	.sidebar-icon {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}

	.aero-sidebar-item:hover {
		background: rgba(80, 140, 210, 0.15);
		color: #0a2040;
	}

	/* Bottom bar: search + shutdown */
	.aero-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		background: linear-gradient(180deg,
			rgba(180, 210, 240, 0.85) 0%,
			rgba(160, 195, 235, 0.90) 100%
		);
		border-top: 1px solid rgba(160, 200, 240, 0.50);
	}

	.aero-search {
		position: relative;
		flex: 1;
		margin-right: 8px;
	}

	.aero-search-input {
		width: 100%;
		padding: 4px 28px 4px 8px;
		border: 1px solid rgba(100, 150, 200, 0.50);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.90);
		font-family: 'Segoe UI', Arial, sans-serif;
		font-size: 11px;
		color: #666;
		outline: none;
	}

	.aero-search-input:focus {
		border-color: rgba(60, 130, 200, 0.70);
		box-shadow: 0 0 4px rgba(80, 150, 220, 0.30);
	}

	.aero-search-icon {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		pointer-events: none;
	}

	.aero-shutdown {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border: 1px solid rgba(0, 0, 0, 0.20);
		border-radius: 3px;
		background: linear-gradient(180deg, #f0f0f0 0%, #dadada 100%);
		color: #1a1a1a;
		cursor: pointer;
		font-family: 'Segoe UI', Arial, sans-serif;
		font-size: 12px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.10);
		white-space: nowrap;
	}

	.aero-shutdown:hover {
		background: linear-gradient(180deg, #ecf4fc 0%, #dcebfc 40%, #c2dcf7 50%, #d0e6fb 100%);
		border-color: #3c7fb1;
	}

	.shutdown-arrow {
		font-size: 8px;
		margin-left: 4px;
		border-left: 1px solid rgba(0, 0, 0, 0.15);
		padding-left: 6px;
		color: #666;
	}
</style>
