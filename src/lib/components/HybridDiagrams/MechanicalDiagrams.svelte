<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import GearsSvg from './GearsSvg.svelte';
	import GaugeCanvas from './GaugeCanvas.svelte';
</script>

<div class="diagrams-content">
	<h3>{i18n.t('gearsSvg.title')}</h3>
	<GearsSvg />
	<GaugeCanvas />
</div>

<style>
	.diagrams-content {
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
