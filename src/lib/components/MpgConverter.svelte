<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';

	const FACTOR = 235.214583;

	let mpg = $state<number | null>(null);
	let lper100 = $state<number | null>(null);

	function onMpgInput(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		if (Number.isFinite(v) && v > 0) {
			mpg = v;
			lper100 = Math.round((FACTOR / v) * 100) / 100;
		} else {
			mpg = null;
			lper100 = null;
		}
	}

	function onLper100Input(e: Event) {
		const v = parseFloat((e.target as HTMLInputElement).value);
		if (Number.isFinite(v) && v > 0) {
			lper100 = v;
			mpg = Math.round((FACTOR / v) * 100) / 100;
		} else {
			lper100 = null;
			mpg = null;
		}
	}
</script>

<div class="converter-card glass-panel">
	<h2>🛣️ {i18n.t('converters.consumption')}</h2>
	<div class="fields">
		<label>
			<span>{i18n.t('converters.mpg')}</span>
			<input type="number" min="0" step="any" value={mpg ?? ''} oninput={onMpgInput} placeholder={i18n.t('converters.mpgPlaceholder')} />
		</label>

		<span class="arrow">⇄</span>

		<label>
			<span>{i18n.t('converters.lper100')}</span>
			<input type="number" min="0" step="any" value={lper100 ?? ''} oninput={onLper100Input} placeholder={i18n.t('converters.lper100Placeholder')} />
		</label>
	</div>
</div>

<style>
	.converter-card {
		border-radius: 14px;
		padding: 4rem 4rem;
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
