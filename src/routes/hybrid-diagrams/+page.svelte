<script lang="ts">
	import { i18n } from '$lib/stores';
	import GearsSvg from '$lib/components/GearsSvg.svelte';
	import GaugeCanvas from '$lib/components/GaugeCanvas.svelte';
</script>

<svelte:head>
	<title>{i18n.t('pageTitle.hybridDiagrams')}</title>
</svelte:head>


<div class="main-content">
	<h2>{i18n.t('gearsSvg.title')}</h2>

	<GearsSvg />

	<GaugeCanvas />
</div>


<style>
	.main-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		max-width: 1000px;
		margin-left: auto;
		margin-right: auto;
		padding: 2rem;
	}

	h2 {
		color: var(--color-text);
		font-size: 1.4rem;
		padding-bottom: 0.4rem;
		border-bottom: 3px solid var(--color-primary);
	}
</style>