<script lang="ts">
	import { i18n } from '$lib/stores';
	import MpgConverter from '$lib/components/MpgConverter.svelte';
	import FuelPriceConverter from '$lib/components/FuelPriceConverter.svelte';
</script>

<svelte:head>
	<title>{i18n.t('pageTitle.converters')}</title>
</svelte:head>

<div class="page">
	<h1>{i18n.t('converters.title')}</h1>
	<div class="converters">
		<MpgConverter />
		<FuelPriceConverter />
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem;
		gap: 2rem;
	}

	h1 {
		font-size: 1.6rem;
		color: var(--color-text);
		padding-bottom: 0.4rem;
		border-bottom: 3px solid var(--color-primary);
	}

	.converters {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
		max-width: 760px;
		margin: 0 auto;
	}
</style>
