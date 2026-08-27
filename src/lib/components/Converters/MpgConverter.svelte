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
	<div class="converter-fields">
		<label class="converter-label">
			<span>{i18n.t('converters.mpg')}</span>
			<input class="win95-input" type="number" min="0" step="any" value={mpg ?? ''} oninput={onMpgInput} placeholder={i18n.t('converters.mpgPlaceholder')} />
		</label>

		<span class="converter-arrow">⇄</span>

		<label class="converter-label">
			<span>{i18n.t('converters.lper100')}</span>
			<input class="win95-input" type="number" min="0" step="any" value={lper100 ?? ''} oninput={onLper100Input} placeholder={i18n.t('converters.lper100Placeholder')} />
		</label>
	</div>
</div>

<style>
</style>
