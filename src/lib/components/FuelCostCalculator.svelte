<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { fuelRate } from '$lib/stores/fuelRate.svelte';
	import {
		mpgToLper100,
		lper100ToMpg,
		eurLiterToUsdGallon,
		usdGallonToEurLiter,
		kmToMiles,
		milesToKm
	} from '$lib/utils/conversions';

	// true = metric (€/L, L/100km, km), false = imperial ($/gal, MPG, miles)
	let metric = $state(true);

	let fuelPrice = $state<number | null>(null);
	let consumption = $state<number | null>(null);
	let distance = $state<number>(100);

	let result = $derived.by(() => {
		if (fuelPrice === null || consumption === null || distance <= 0) return null;
		if (fuelPrice < 0 || consumption <= 0) return null;
		if (metric) {
			// €/L × L/100km × km / 100 = €
			return Math.round(fuelPrice * consumption * distance / 100 * 100) / 100;
		} else {
			// (miles / MPG) × $/gal = $
			return Math.round((distance / consumption) * fuelPrice * 100) / 100;
		}
	});

	onMount(() => fuelRate.init());

	function onPriceInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		fuelPrice = Number.isFinite(v) && v >= 0 ? v : null;
	}

	function onConsumptionInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		consumption = Number.isFinite(v) && v > 0 ? v : null;
	}

	function onDistanceInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		distance = Number.isFinite(v) && v > 0 ? v : 0;
	}

	function switchMode(toMetric: boolean) {
		if (metric === toMetric) return;

		if (toMetric) {
			// imperial → metric
			if (fuelPrice !== null && fuelRate.rate) {
				fuelPrice = usdGallonToEurLiter(fuelPrice, fuelRate.rate);
			}
			if (consumption !== null) {
				consumption = mpgToLper100(consumption);
			}
			distance = milesToKm(distance);
		distance = Math.round(distance);
		} else {
			// metric → imperial
			if (fuelPrice !== null && fuelRate.rate) {
				fuelPrice = eurLiterToUsdGallon(fuelPrice, fuelRate.rate);
			}
			if (consumption !== null) {
				consumption = lper100ToMpg(consumption);
			}
			distance = kmToMiles(distance);
		distance = Math.round(distance);
		}

		metric = toMetric;
	}
</script>

<div class="converter-card">
	<h2>💰 {i18n.t('converters.fuelCostTitle')}</h2>

	<!-- Mode toggle -->
	<div class="toggle-bar">
		<button class="toggle-btn" class:active={metric} onclick={() => switchMode(true)}>
			{i18n.t('converters.fuelCostMetricMode')}
		</button>
		<button class="toggle-btn" class:active={!metric} onclick={() => switchMode(false)}>
			{i18n.t('converters.fuelCostImperialMode')}
		</button>
	</div>

	<div class="fields">
		<label>
			<span>{metric ? i18n.t('converters.eurPerLiter') : i18n.t('converters.usdPerGallon')}</span>
			<input
				type="number"
				min="0"
				step="0.01"
				value={fuelPrice ?? ''}
				oninput={onPriceInput}
				placeholder={metric ? i18n.t('converters.eurPlaceholder') : i18n.t('converters.usdPlaceholder')}
			/>
		</label>

		<span class="sep">×</span>

		<label>
			<span>{metric ? i18n.t('converters.lper100') : i18n.t('converters.mpg')}</span>
			<input
				type="number"
				min="0"
				step="any"
				value={consumption ?? ''}
				oninput={onConsumptionInput}
				placeholder={metric ? i18n.t('converters.lper100Placeholder') : i18n.t('converters.mpgPlaceholder')}
			/>
		</label>
	</div>

	<div class="bottom-row">
		<label class="label-distance">
			<span>{metric ? i18n.t('converters.fuelCostDistance') : i18n.t('converters.fuelCostDistanceMi')}</span>
			<input
				type="number"
				min="1"
				step="1"
				value={distance}
				oninput={onDistanceInput}
				placeholder={i18n.t('converters.fuelCostDistancePlaceholder')}
			/>
		</label>

		<div class="result" class:has-value={result !== null}>
			<span class="result-label">
				{metric
					? i18n.t('converters.fuelCostResult', { distance: distance.toString() })
					: i18n.t('converters.fuelCostResultMi', { distance: distance.toString() })}
			</span>
			<span class="result-value">
				{#if result !== null}
					{metric ? '€' : '$'}{result.toFixed(2)}
				{:else}
					—
				{/if}
			</span>
		</div>
	</div>
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

	.toggle-bar {
		display: flex;
		gap: 4px;
		margin-bottom: 10px;
		width: fit-content;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		height: 24px;
		padding: 2px 10px;
		font-size: 11px;
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		cursor: pointer;
		background: var(--win95-btn-face);
		color: #000000;
		border: 2px solid;
		border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
		box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
		user-select: none;
		white-space: nowrap;

		&.active {
			border-color: var(--win95-border-darkest) var(--win95-border-light) var(--win95-border-light) var(--win95-border-darkest);
			box-shadow: inset 1px 1px 0 var(--win95-border-dark), inset -1px -1px 0 var(--win95-border-mid);
			font-weight: bold;
			background-image: url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='0' width='1' height='1' fill='%23ffffff'/%3E%3Crect x='0' y='1' width='1' height='1' fill='%23ffffff'/%3E%3C/svg%3E");
			background-size: 2px 2px;
		}
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

	.label-distance {
		flex: 0 0 90px;
	}

	.bottom-row {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		margin-top: 10px;
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

	.sep {
		font-size: 16px;
		padding-bottom: 4px;
		color: var(--color-text-secondary);
		user-select: none;
		flex-shrink: 0;
	}

	.result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1;
		padding: 0 8px;
		border: 2px solid;
		border-color: var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark);
		box-shadow: inset 1px 1px 0 var(--win95-border-darkest);
		background: var(--win95-surface);
	}

	.result-label {
		font-size: 11px;
		color: var(--color-text-secondary);
	}

	.result-value {
		font-size: 15px;
		font-weight: bold;
		color: var(--color-text);
		letter-spacing: 0.5px;
	}

	.result.has-value .result-value {
		color: var(--win95-titlebar-active, #000080);
	}
</style>
