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
		<div class="fields">
			<label>
				<span>{i18n.t('converters.eurPerLiter')}</span>
				<input type="number" min="0" step="any" value={eurPerLiter ?? ''} oninput={onEurInput} placeholder={i18n.t('converters.eurPlaceholder')} />
			</label>

			<span class="arrow">⇄</span>

			<label>
				<span>{i18n.t('converters.usdPerGallon')}</span>
				<input type="number" min="0" step="any" value={usdPerGallon ?? ''} oninput={onUsdInput} placeholder={i18n.t('converters.usdPlaceholder')} />
			</label>
		</div>

		<p class="rate-info">{i18n.t('converters.exchangeRate', { rate: fuelRate.rate!.toFixed(4) })}</p>
	{/if}
</div>

<style>
	.converter-card {
		padding: 8px 12px;
		width: 100%;
		background: var(--win95-surface);
	}

	h2 {
		margin: 0 0 8px;
		font-size: 13px;
		color: var(--color-text);
		font-weight: bold;
	}

	.fields {
		display: flex;
		align-items: flex-end;
		gap: 8px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;

		span {
			font-size: 11px;
			color: var(--color-text);
		}
	}

	input {
		padding: 3px 4px;
		border: 2px solid;
		border-color: var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark);
		box-shadow: inset 1px 1px 0 var(--win95-border-darkest);
		font-size: 12px;
		background: #ffffff;
		color: var(--color-text);
		width: 100%;
		box-sizing: border-box;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.arrow {
		font-size: 14px;
		padding-bottom: 4px;
		color: var(--color-text-secondary);
		user-select: none;
	}

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
