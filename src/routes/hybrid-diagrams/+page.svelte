<script lang="ts">
	import GearsSvg from '$lib/components/GearsSvg.svelte';
	import GaugeCanvas from '$lib/components/GaugeCanvas.svelte';
</script>


<div class="main-content">
	<h2>Train Épicycloïdal — SVG</h2>

	<GearsSvg />

	<GaugeCanvas />
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