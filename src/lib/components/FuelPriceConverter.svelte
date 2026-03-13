<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	const LITERS_PER_GALLON = 3.785411784;

	let eurPerLiter = $state<number | null>(null);
	let usdPerGallon = $state<number | null>(null);
	let rate = $state<number | null>(null);
	let rateError = $state(false);

	onMount(async () => {
		try {
			const res = await fetch('https://open.er-api.com/v6/latest/EUR');
			if (!res.ok) throw new Error('API error');
			const data = await res.json();
			rate = data.rates?.USD ?? null;
			if (!rate) throw new Error('No USD rate');
		} catch {
			rateError = true;
		}
	});

	function onEurInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		if (Number.isFinite(v) && v >= 0 && rate) {
			eurPerLiter = v;
			usdPerGallon = Math.round(v * LITERS_PER_GALLON * rate * 100) / 100;
		} else {
			eurPerLiter = null;
			usdPerGallon = null;
		}
	}

	function onUsdInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		if (Number.isFinite(v) && v >= 0 && rate) {
			usdPerGallon = v;
			eurPerLiter = Math.round((v / (LITERS_PER_GALLON * rate)) * 100) / 100;
		} else {
			usdPerGallon = null;
			eurPerLiter = null;
		}
	}
</script>

<div class="converter-card glass-panel">
	<h2>⛽ {i18n.t('converters.fuelPrice')}</h2>

	{#if rateError}
		<p class="rate-error">{i18n.t('converters.rateError')}</p>
	{:else if !rate}
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

		<p class="rate-info">{i18n.t('converters.exchangeRate', { rate: rate.toFixed(4) })}</p>
	{/if}
</div>

<style>
	.converter-card {
		border-radius: 14px;
		padding: 2rem 2.5rem;
		max-width: 720px;
		width: 100%;
		transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
	}

	h2 {
		margin: 0 0 1.25rem;
		font-size: 1.2rem;
		color: var(--color-text);
	}

	.fields {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1;

		span {
			font-size: 0.85rem;
			color: var(--color-text-secondary);
			font-weight: 500;
		}
	}

	input {
		padding: 0.6rem 0.85rem;
		border: 1.5px solid var(--color-border);
		border-radius: 8px;
		font-size: 1rem;
		background: color-mix(in srgb, rgb(var(--color-surface-rgb) / 0.6) 88%, transparent);
		color: var(--color-text);
		transition: border-color 0.15s;
		width: 100%;
		box-sizing: border-box;

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
		}
	}

	.arrow {
		font-size: 1.4rem;
		padding-bottom: 0.4rem;
		color: var(--color-text-secondary);
		user-select: none;
	}

	.rate-info {
		margin: 1rem 0 0;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		opacity: 0.7;
		text-align: right;
	}

	.rate-loading {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.rate-error {
		font-size: 0.9rem;
		color: #e74c3c;
	}

	@media (max-width: 500px) {
		.fields {
			flex-direction: column;
			align-items: stretch;
		}
		.arrow {
			text-align: center;
			padding: 0;
		}
	}
</style>
