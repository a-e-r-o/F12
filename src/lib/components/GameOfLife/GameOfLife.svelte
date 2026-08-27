<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import LifeSimulation from './LifeSimulation.svelte';

	type Screen = 'menu' | 'normal';

	let screen = $state<Screen>('menu');
</script>

{#if screen === 'menu'}
	<div class="life-menu">
		<h3>{i18n.t('gameOfLife.modeTitle')}</h3>
		<p class="intro">{i18n.t('gameOfLife.modeIntro')}</p>

		<div class="modes">
			<button class="mode" onclick={() => (screen = 'normal')}>
				<span class="mode-icon" aria-hidden="true">
					<!-- A glider: the most recognisable thing in the game -->
					<svg width="48" height="48" viewBox="0 0 5 5">
						<rect width="5" height="5" fill="#f4f6f8" />
						<g fill="#1f3b57">
							<rect x="1" y="0" width="1" height="1" />
							<rect x="2" y="1" width="1" height="1" />
							<rect x="0" y="2" width="1" height="1" />
							<rect x="1" y="2" width="1" height="1" />
							<rect x="2" y="2" width="1" height="1" />
						</g>
					</svg>
				</span>
				<span class="mode-name">{i18n.t('gameOfLife.normal')}</span>
				<span class="mode-desc">{i18n.t('gameOfLife.normalDesc')}</span>
			</button>

			<!--
				Advanced mode is announced but not built yet: it will expose the birth/survive
				rule, which `life.ts` already takes as a parameter. Disabled rather than hidden
				so it is clear the plan exists.
			-->
			<button class="mode" disabled>
				<span class="mode-icon" aria-hidden="true">⚙</span>
				<span class="mode-name">
					{i18n.t('gameOfLife.advanced')}
					<span class="badge">{i18n.t('gameOfLife.comingSoon')}</span>
				</span>
				<span class="mode-desc">{i18n.t('gameOfLife.advancedDesc')}</span>
			</button>
		</div>
	</div>
{:else}
	<LifeSimulation onBack={() => (screen = 'menu')} />
{/if}

<style>
	/* Theme-neutral by design — the board and its menu look the same in Retro and Aero. */
	.life-menu {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
		max-width: 460px;

		h3 {
			font-size: 14px;
			font-weight: bold;
			color: #1f3b57;
		}

		.intro {
			font-size: 12px;
			line-height: 1.5;
			color: #55606b;
		}
	}

	.modes {
		display: flex;
		gap: 10px;
	}

	.mode {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 10px;
		text-align: center;
		font-family: inherit;
		color: #1f3b57;
		background: #ffffff;
		border: 1px solid #8a97a3;
		border-radius: 4px;
		cursor: pointer;

		&:hover:not(:disabled) {
			background: #eaf1f7;
			border-color: #5a7a96;
			box-shadow: 0 1px 4px rgba(31, 59, 87, 0.18);
		}

		&:disabled {
			cursor: default;
			opacity: 0.55;
		}

		.mode-icon {
			font-size: 34px;
			line-height: 1;

			svg {
				display: block;
				image-rendering: pixelated;
				border: 1px solid #d9dfe5;
			}
		}

		.mode-name {
			font-size: 13px;
			font-weight: bold;
		}

		.mode-desc {
			font-size: 11px;
			line-height: 1.45;
			color: #55606b;
		}

		.badge {
			display: inline-block;
			margin-left: 4px;
			padding: 1px 5px;
			font-size: 9px;
			font-weight: normal;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			color: #7a6320;
			background: #fdf3d4;
			border: 1px solid #e3cf8a;
			border-radius: 8px;
			vertical-align: middle;
		}
	}
</style>
