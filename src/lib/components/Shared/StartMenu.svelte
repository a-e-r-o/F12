<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { programs } from '$lib/stores/programs.svelte';

	let { open = false, onclose }: { open: boolean; onclose: () => void } = $props();

	let startMenuPrograms = $derived(programs.filter(p => p.inStartMenu));

	function launch(id: string) {
		windowsState.open(id);
		onclose();
	}

	function handleShutdown() {
		// Not implemented yet
		onclose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="start-menu-backdrop" onmousedown={onclose}></div>
	<div class="start-menu">
		<div class="sidebar">
			<span class="sidebar-text">F12</span>
		</div>
		<div class="menu-content">
			<div class="menu-section">
				<div class="section-label">{i18n.t('startMenu.programs')}</div>
				<div class="separator"></div>
				{#each startMenuPrograms as prog (prog.id)}
					<button class="menu-item" onclick={() => launch(prog.id)}>
						<span class="menu-icon">{prog.icon}</span>
						<span class="menu-label">{i18n.t(prog.titleKey)}</span>
					</button>
				{/each}
			</div>
			<div class="separator thick"></div>
			<button class="menu-item shutdown" onclick={handleShutdown}>
				<span class="menu-icon">🔌</span>
				<span class="menu-label">{i18n.t('startMenu.shutDown')}</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.start-menu-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
	}

	.start-menu {
		position: fixed;
		bottom: 32px;
		left: 0;
		display: flex;
		flex-direction: row;
		background: var(--win95-surface, #c0c0c0);
		border: 2px solid;
		border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
		box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
		z-index: 10001;
		min-width: 200px;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
		border-top: 1px solid var(--win95-border-dark, #808080);
		border-bottom: 1px solid var(--win95-border-light, #ffffff);
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
		background: var(--win95-titlebar-active, #000080);
		color: #ffffff;
	}

	.menu-icon {
		font-size: 16px;
		width: 22px;
		text-align: center;
		flex-shrink: 0;
	}

	.menu-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.shutdown {
		margin-top: auto;
	}
</style>
