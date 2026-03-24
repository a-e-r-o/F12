<script lang="ts">
	import { i18n } from '$lib/stores';
	import { Win95Window } from '$lib/components';
</script>

<svelte:head>
	<title>F12 — Desktop</title>
</svelte:head>

<!-- About window -->
<Win95Window id="home" title={i18n.t('nav.about')} icon="ℹ️">
	<div class="home-content">
		<h2>F12</h2>
		<p>{i18n.t('about.subtitle')}</p>
		<p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 8px;">
			{i18n.t('footer.builtWith')}
		</p>
	</div>
</Win95Window>

<!-- Hybrid Diagrams window -->
<Win95Window id="hybrid-diagrams" title={i18n.t('nav.hybridDiagrams')} icon="⚙️">
	{#await import('$lib/components/HybridDiagrams/GearsSvg.svelte') then { default: GearsSvg }}
		{#await import('$lib/components/HybridDiagrams/GaugeCanvas.svelte') then { default: GaugeCanvas }}
			<div class="diagrams-content">
				<h3>{i18n.t('gearsSvg.title')}</h3>
				<GearsSvg />
				<GaugeCanvas />
			</div>
		{/await}
	{/await}
</Win95Window>

<!-- Converters window -->
<Win95Window id="converters" title={i18n.t('nav.converters')} icon="🔄">
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
</Win95Window>

<!-- Game of Life window -->
<Win95Window id="game-of-life" title={i18n.t('nav.gameOfLife')} icon="🧬">
	<div class="placeholder-content">TODO</div>
</Win95Window>

<!-- Image Convert window -->
<Win95Window id="image-convert" title={i18n.t('nav.imgConvert')} icon="🎨">
	{#await import('$lib/components/Converters/PngToIco.svelte') then { default: PngToIco }}
		<div class="image-convert-content">
			<PngToIco />
		</div>
	{/await}
</Win95Window>

<!-- Wallpaper window -->
<Win95Window id="wallpaper" title={i18n.locale === 'fr' ? "Fond d'écran" : 'Wallpaper'} icon="🖼️">
	{#await import('$lib/components/Wallpaper/WallpaperPicker.svelte') then { default: WallpaperPicker }}
		<WallpaperPicker />
	{/await}
</Win95Window>

<!-- Minesweeper window -->
<Win95Window id="minesweeper" title={i18n.t('startMenu.minesweeper')} icon="💣">
	{#await import('$lib/components/Minesweeper/Minesweeper.svelte') then { default: Minesweeper }}
		<Minesweeper />
	{/await}
</Win95Window>

<!-- Tetris window -->
<Win95Window id="tetris" title={i18n.t('startMenu.tetris')} icon="🧱">
	{#await import('$lib/components/Tetris/Tetris.svelte') then { default: Tetris }}
		<Tetris />
	{/await}
</Win95Window>

<!-- Pokémon Quiz window -->
<Win95Window id="pokemon-quiz" title={i18n.t('startMenu.pokemonQuiz')} icon="❓">
	{#await import('$lib/components/PokemonQuiz/PokemonQuiz.svelte') then { default: PokemonQuiz }}
		<PokemonQuiz />
	{/await}
</Win95Window>

<style>
	.home-content {
		padding: 12px;
		text-align: center;
	}

	.home-content h2 {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 6px;
	}

	.home-content p {
		font-size: 12px;
	}

	.diagrams-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 8px;
	}

	.diagrams-content h3 {
		font-size: 13px;
		font-weight: bold;
	}

	.converters-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 8px;
	}

	.converters-content h3 {
		font-size: 13px;
		font-weight: bold;
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
