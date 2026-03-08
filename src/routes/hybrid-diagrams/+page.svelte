<script lang="ts">
	import GearsSvg from '$lib/components/GearsSvg.svelte';
	import lexusGauge from '$lib/assets/lexus-is-300h-f-gauge.jpg';
</script>


<div class="main-content">
	<h2>Train Épicycloïdal — SVG</h2>

	<GearsSvg />

	<img src="{lexusGauge}" alt="Lexus IS 300h F-Gauge" height="300" />
</div>


<style>
	.main-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		max-width: 1000px;
		margin-left: auto;
		margin-right: auto;
		padding: 2rem;
	}

	h2 {
		color: var(--color-text);
		font-size: 1.4rem;
	}
</style>