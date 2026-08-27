<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { fuelRate } from '$lib/stores/fuelRate.svelte';
	import { eurLiterToUsdGallon, usdGallonToEurLiter } from '$lib/utils/conversions';

	let eurPerLiter = $state<number | null>(null);
	let usdPerGallon = $state<number | null>(null);

	onMount(() => fuelRate.init());

	function onEurInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		if (Number.isFinite(v) && v >= 0 && fuelRate.rate) {
			eurPerLiter = v;
			usdPerGallon = eurLiterToUsdGallon(v, fuelRate.rate);
		} else {
			eurPerLiter = null;
			usdPerGallon = null;
		}
	}

	function onUsdInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		if (Number.isFinite(v) && v >= 0 && fuelRate.rate) {
			usdPerGallon = v;
			eurPerLiter = usdGallonToEurLiter(v, fuelRate.rate);
		} else {
			usdPerGallon = null;
			eurPerLiter = null;
		}
	}
</script>

<div class="converter-card">
	<h2>⛽ {i18n.t('converters.fuelPrice')}</h2>

	{#if fuelRate.error}
		<p class="rate-error">{i18n.t('converters.rateError')}</p>
	{:else if fuelRate.loading}
		<p class="rate-loading">{i18n.t('converters.rateLoading')}</p>
	{:else}
		<div class="converter-fields">
			<label class="converter-label">
				<span>{i18n.t('converters.eurPerLiter')}</span>
				<input class="win95-input" type="number" min="0" step="0.01" value={eurPerLiter ?? ''} oninput={onEurInput} placeholder={i18n.t('converters.eurPlaceholder')} />
			</label>

			<span class="converter-arrow">⇄</span>

			<label class="converter-label">
				<span>{i18n.t('converters.usdPerGallon')}</span>
				<input class="win95-input" type="number" min="0" step="0.01" value={usdPerGallon ?? ''} oninput={onUsdInput} placeholder={i18n.t('converters.usdPlaceholder')} />
			</label>
		</div>

		<p class="rate-info">{i18n.t('converters.exchangeRate', { rate: fuelRate.rate!.toFixed(4) })}</p>
	{/if}
</div>

<style>
	.rate-info {
		margin: 6px 0 0;
		font-size: 10px;
		color: var(--color-text-secondary);
		text-align: right;
	}

	.rate-loading {
		font-size: 11px;
		color: var(--color-text-secondary);
	}

	.rate-error {
		font-size: 11px;
		color: #e74c3c;
	}
</style>
