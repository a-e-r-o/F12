<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { programs } from '$lib/stores/programs.svelte';
	import { themeState } from '$lib/stores/theme.svelte';

	let { open = false, onclose }: { open: boolean; onclose: () => void } = $props();

	let startMenuPrograms = $derived(programs.filter(p => p.inStartMenu));

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

	<!-- ===== WIN7 AERO START MENU ===== -->
	<div class="start-menu aero-start-menu">
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
			<div class="aero-search">
				<input type="text" class="aero-search-input" placeholder={i18n.locale === 'fr' ? 'Rechercher...' : 'Search programs and files'} readonly />
				<span class="aero-search-icon">🔍</span>
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
			<button class="aero-sidebar-item" onclick={() => { launch('personalization'); }}>
				<img class="sidebar-icon" src={themeState.icon('wallpaper')} alt="" draggable="false" /> {i18n.t('nav.personalization')}
			</button>
			<button class="aero-shutdown" onclick={handleShutdown}>
				<span>{i18n.t('startMenu.shutDown')}</span>
				<span class="shutdown-arrow">▶</span>
			</button>
		</div>
	</div>

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

<style>
	/* CSS refactorisé : nesting appliqué */

	.start-menu-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
	}

	/* =================== COMMON ========================== */
	.start-menu {
		position: fixed;
		bottom: var(--taskbar-height, 32px);
		left: 0;
		z-index: 10001;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	/* =================== WIN95 MENU ====================== */
	.win95-menu {
		display: flex;
		flex-direction: row;
		background: var(--win-surface, #c0c0c0);
		border: 2px solid;
		border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
		box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);
		min-width: 200px;

		.sidebar {
			width: 24px;
			background: linear-gradient(to top, #000080, #1084d0);
			display: flex;
			align-items: flex-end;
			justify-content: center;
			padding-bottom: 6px;
			flex-shrink: 0;

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
		}

		.menu-content {
			display: flex;
			flex-direction: column;
			flex: 1;
			padding: 2px 0;

			.menu-section {
				display: flex;
				flex-direction: column;

				.section-label {
					font-size: 10px;
					font-weight: bold;
					color: #808080;
					padding: 4px 12px 2px;
					user-select: none;
				}
			}

			.separator {
				height: 1px;
				margin: 2px 4px;
				border-top: 1px solid var(--win-border-dark, #808080);
				border-bottom: 1px solid var(--win-border-light, #ffffff);

				&.thick {
					margin: 4px 4px;
				}
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

				&:hover {
					background: var(--win-titlebar-active, #000080);
					color: #ffffff;
				}

				&.shutdown {
					margin-top: auto;
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
			}
		}
	}

	/* =================== WIN7 AERO MENU ================== */
	.aero-start-menu {
		display: none;
		flex-wrap: nowrap;
		font-family: 'Segoe UI', Arial, sans-serif;
		overflow: hidden;
		padding: 6px;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		border: 1px solid #555;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.333);
		background: linear-gradient(rgba(0, 0, 0, 0.333), rgba(0, 0, 0, 0.533) 15% 60%, rgba(0, 0, 0, 0.133));
		background-color: var(--theme-color);
		flex: 1;
		min-height: 280px;

		.aero-programs {
			width: 248px;
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			padding: 6px 0;
			border: 1px solid rgba(0, 0, 0, 0.667);
			background: #fff;
			border-radius: 4px;
			box-shadow: 0 0 0 1px rgba(255,255,255,.3333333333);

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
				border: 1px solid transparent;
				cursor: pointer;
				font-family: 'Segoe UI', Arial, sans-serif;
				font-size: 12px;
				color: #1a1a1a;
				text-align: left;
				border-radius: 3px;
				margin: 0 4px;

				&:hover {
					border-color: #7da2ce;
					background: linear-gradient(#ddecfd, #c2dcfd);
					box-shadow: inset 0 0 0 1px #fff;
				}

				&.all-programs {
					justify-content: space-between;
					font-weight: 600;
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

				.aero-arrow {
					font-size: 8px;
					color: #666;
				}
			}

			.aero-search {
				position: relative;
				margin-top: auto;
				background: #f1f5fb;
				box-shadow: inset 0 2px 3px #d6e0ef;
				padding: 8px;

				.aero-search-input {
					width: 100%;
					padding: 4px 6px;
					background-color: #fff;
					border: 0 !important;
					font-family: 'Segoe UI', Arial, sans-serif;
					font-size: 12px;
					color: #666;
					outline: none;
					box-shadow: inset 1px 1px 0 #8e8f8f,inset -1px -1px 0 #ccc !important;
				}

				.aero-search-icon {
					position: absolute;
					right: 8px;
					top: 50%;
					transform: translateY(-50%);
					font-size: 12px;
					pointer-events: none;
				}
			}
		}

		.aero-sidebar {
			flex: 1;
			width: 140px;
			display: flex;
			flex-direction: column;
			padding: 6px 0;
			padding-top: 10px;
			border-left: 1px solid rgba(0, 0, 0, 0.667);
			border-radius: 0;
			color: #fff;

			.aero-user {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4px;
				padding: 10px 10px 8px;

				.aero-avatar {
					width: 48px;
					height: 48px;
					border-radius: 4px;
					background: rgba(255, 255, 255, 0.15);
					border: 2px solid rgba(255, 255, 255, 0.40);
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 26px;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
				}

				.aero-username {
					font-size: 12px;
					font-weight: 600;
					color: #fff;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
				}
			}

			.aero-separator {
				height: 1px;
				margin: 4px 10px;
				background: rgba(255, 255, 255, 0.30);
			}

			.aero-sidebar-item {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 5px 14px;
				background: none;
				border: 1px solid transparent;
				cursor: pointer;
				color: #fff;
				font-family: 'Segoe UI', Arial, sans-serif;
				font-size: 12px;
				text-align: left;
				border-radius: 3px;
				margin: 0 4px;
				text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);

				&:hover {
					border-color: rgba(0, 0, 0, 0.667);
					box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.33), 0 0 0 1px rgba(255, 255, 255, 0.2);
					background: linear-gradient(to right, rgba(0, 0, 0, 0.10), rgba(255, 255, 255, 0.2) 40%, rgba(255, 255, 255, 0.2) 60%, rgba(0, 0, 0, 0.10)),
						linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.10) 48%, rgba(0, 0, 0, 0.4) 50%, transparent 98%);
					color: #fff;
				}

				.sidebar-icon {
					width: 16px;
					height: 16px;
					image-rendering: pixelated;
					filter: brightness(2);
				}
			}

			.aero-shutdown {
				display: flex;
				align-items: center;
				gap: 4px;
				padding: 4px 10px;
				border: 1px solid rgba(0, 0, 0, 0.47);
				border-radius: 0 0 3px 3px;
				margin-top: auto;
				width: 100%;
				justify-content: space-between;
				background: linear-gradient(
					rgba(255, 255, 255, 0.50),
					rgba(255, 255, 255, 0.20) 40%,
					rgba(39, 71, 86, 0.50) 50%,
					rgba(39, 71, 86, 0.10) 90%,
					rgba(255, 255, 255, 0.50)
				);
				box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.667);
				color: #fff;
				cursor: pointer;
				font-family: 'Segoe UI', Arial, sans-serif;
				font-size: 12px;
				text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
				white-space: nowrap;

				&:hover {
					box-shadow: inset 0 0 2px 1px #fff;
				}

				.shutdown-arrow {
					font-size: 8px;
					margin-left: 4px;
					border-left: 1px solid rgba(255, 255, 255, 0.30);
					padding-left: 6px;
					color: #fff;
				}
			}
		}
	}

	/* ============== WIN7 AERO OVERRIDES ================== */
	:global([data-theme="win7aero"]) .win95-menu {
		display: none;
	}

	:global([data-theme="win7aero"]) .aero-start-menu {
		display: flex;
	}
</style>
