<script lang="ts">
	import { onMount } from 'svelte';

	let fps = $state(0);
	let animationId: number;

	onMount(() => {
		let frameCount = 0;
		let lastTime = performance.now();

		function frame(now: number) {
			frameCount++;
			const elapsed = now - lastTime;
			if (elapsed >= 1000) {
				fps = Math.round((frameCount * 1000) / elapsed);
				frameCount = 0;
				lastTime = now;
			}
			animationId = requestAnimationFrame(frame);
		}

		animationId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(animationId);
	});

	let color = $derived(fps >= 50 ? 'green' : fps >= 30 ? 'orange' : 'red');
</script>

<div class="fps-counter" style="--fps-color: {color}">
	{fps} FPS
</div>

<style>
	.fps-counter {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		background: var(--color-bg-secondary);
		color: var(--fps-color);
		border: 1px solid var(--fps-color);
		padding: 0.3rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-family: monospace;
		z-index: 1000;
		transition: color 0.3s, border-color 0.3s;
	}
</style>
