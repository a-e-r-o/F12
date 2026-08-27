<script lang="ts">
	import { windowsState } from '$lib/stores/windows.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { themeState } from '$lib/stores/theme.svelte';

	function openPersonalization() {
		windowsState.open('personalization');
	}
</script>

<div class="control-panel">
	<h3>{i18n.t('controlPanel.title')}</h3>
	<div class="cp-grid">
		<button class="cp-item" onclick={openPersonalization}>
			<img class="cp-icon" src={themeState.icon('wallpaper', 32)} alt="" draggable="false" />
			<div class="cp-text">
				<span class="cp-name">{i18n.t('controlPanel.personalization')}</span>
				<span class="cp-desc">{i18n.t('controlPanel.personalizationDesc')}</span>
			</div>
		</button>
	</div>
</div>

<style>
	/* CSS refactorisé : nesting appliqué */
	.control-panel {
		padding: 12px;

		h3 {
			font-size: 13px;
			font-weight: bold;
			margin-bottom: 12px;
		}

		.cp-grid {
			display: flex;
			flex-direction: column;
			gap: 4px;

			.cp-item {
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 8px 12px;
				background: none;
				border: 1px solid transparent;
				border-radius: 3px;
				cursor: pointer;
				font-family: inherit;
				text-align: left;

				&:hover {
					background: var(--color-primary);
					color: #fff;
					border-color: var(--color-primary);

					.cp-desc {
						color: inherit;
						opacity: 0.8;
					}
				}

				.cp-icon {
					width: 32px;
					height: 32px;
					flex-shrink: 0;
					image-rendering: pixelated;
				}

				.cp-text {
					display: flex;
					flex-direction: column;
					gap: 2px;
				}

				.cp-name {
					font-size: 12px;
					font-weight: bold;
				}

				.cp-desc {
					font-size: 10px;
					color: var(--color-text-secondary);
				}
			}
		}
	}

	/* ============== WIN7 AERO OVERRIDES ================== */
	:global([data-theme="win7aero"]) .control-panel {
		.cp-item:hover {
			background: linear-gradient(#ddecfd, #c2dcfd);
			color: #1a1a1a;
			border-color: #7da2ce;
			box-shadow: inset 0 0 0 1px #fff;
		}
	}
</style>
