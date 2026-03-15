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

<div class="converter-card">
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
</style>
