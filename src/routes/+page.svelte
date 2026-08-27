<script lang="ts">
	import { i18n } from '$lib/stores';
	import { AppWindow } from '$lib/components';
	import { themeState } from '$lib/stores/theme.svelte';
</script>

<svelte:head>
	<title>F12 — Desktop</title>
</svelte:head>

<!-- About window -->
<AppWindow id="home" title={i18n.t('nav.about')} iconKey="about">
	<div class="home-content">
		<h2>F12</h2>
		<p>{i18n.t('about.subtitle')}</p>
		<p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 8px;">
			{i18n.t('footer.builtWith')}
		</p>
	</div>
</AppWindow>

<!-- Hybrid Diagrams window -->
<AppWindow id="hybrid-diagrams" title={i18n.t('nav.hybridDiagrams')} iconKey="gears">
	{#await import('$lib/components/HybridDiagrams/GearsSvg.svelte') then { default: GearsSvg }}
		{#await import('$lib/components/HybridDiagrams/GaugeCanvas.svelte') then { default: GaugeCanvas }}
			<div class="diagrams-content">
				<h3>{i18n.t('gearsSvg.title')}</h3>
				<GearsSvg />
				<GaugeCanvas />
			</div>
		{/await}
	{/await}
</AppWindow>

<!-- Converters window -->
<AppWindow id="converters" title={i18n.t('nav.converters')} iconKey="converters">
	{#await import('$lib/components/Converters/MpgConverter.svelte') then { default: MpgConverter }}
		{#await import('$lib/components/Converters/FuelPriceConverter.svelte') then { default: FuelPriceConverter }}
			{#await import('$lib/components/Converters/FuelCostCalculator.svelte') then { default: FuelCostCalculator }}
				<div class="converters-content">
					<h3>{i18n.t('converters.title')}</h3>
					<MpgConverter />
					<FuelPriceConverter />
					<FuelCostCalculator />
				</div>
			{/await}
		{/await}
	{/await}
</AppWindow>

<!-- Game of Life window -->
<AppWindow id="game-of-life" title={i18n.t('nav.gameOfLife')} iconKey="gameOfLife">
	<div class="placeholder-content">TODO</div>
</AppWindow>

<!-- Image Convert window -->
<AppWindow id="image-convert" title={i18n.t('nav.imgConvert')} iconKey="imageConvert">
	{#await import('$lib/components/Converters/PngToIco.svelte') then { default: PngToIco }}
		<div class="image-convert-content">
			<PngToIco />
		</div>
	{/await}
</AppWindow>

<!-- Control Panel window -->
<AppWindow id="control-panel" title={i18n.t('nav.controlPanel')} iconKey="controlPanel">
	{#await import('$lib/components/ControlPanel/ControlPanel.svelte') then { default: ControlPanel }}
		<ControlPanel />
	{/await}
</AppWindow>

<!-- Personalization window -->
<AppWindow id="personalization" title={i18n.t('nav.personalization')} iconKey="wallpaper">
	{#await import('$lib/components/Personalization/Personalization.svelte') then { default: Personalization }}
		<Personalization />
	{/await}
</AppWindow>

<!-- Minesweeper window -->
<AppWindow id="minesweeper" title={i18n.t('startMenu.minesweeper')} iconKey="minesweeper">
	{#await import('$lib/components/Minesweeper/Minesweeper.svelte') then { default: Minesweeper }}
		<Minesweeper />
	{/await}
</AppWindow>

<!-- Tetris window -->
<AppWindow id="tetris" title={i18n.t('startMenu.tetris')} iconKey="tetris">
	{#await import('$lib/components/Tetris/Tetris.svelte') then { default: Tetris }}
		<Tetris />
	{/await}
</AppWindow>

<!-- Pokémon Quiz window -->
<AppWindow id="pokemon-quiz" title={i18n.t('startMenu.pokemonQuiz')} iconKey="pokemonQuiz">
	{#await import('$lib/components/PokemonQuiz/PokemonQuiz.svelte') then { default: PokemonQuiz }}
		<PokemonQuiz />
	{/await}
</AppWindow>

<style>
	.home-content {
		padding: 12px;
		text-align: center;

		h2 {
			font-size: 18px;
			font-weight: bold;
			margin-bottom: 6px;
		}

		p {
			font-size: 12px;
		}
	}

	.diagrams-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 8px;

		h3 {
			font-size: 13px;
			font-weight: bold;
		}
	}

	.converters-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 8px;

		h3 {
			font-size: 13px;
			font-weight: bold;
		}
	}

	.image-convert-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 8px;
	}

	.placeholder-content {
		padding: 20px;
		text-align: center;
		font-size: 12px;
		color: var(--color-text-secondary);
	}
</style>
