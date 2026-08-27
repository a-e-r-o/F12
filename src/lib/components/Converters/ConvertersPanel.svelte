<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import MpgConverter from './MpgConverter.svelte';
	import FuelPriceConverter from './FuelPriceConverter.svelte';
	import FuelCostCalculator from './FuelCostCalculator.svelte';
</script>

<div class="converters-content">
	<h3>{i18n.t('converters.title')}</h3>
	<MpgConverter />
	<FuelPriceConverter />
	<FuelCostCalculator />
</div>

<style>
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
</style>
