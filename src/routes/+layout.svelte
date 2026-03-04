<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { theme } from '$lib/theme.svelte';
	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	let elapsed = $state(0);

	onMount(() => {
		// Initialise theme (localStorage / OS preference)
		theme.init();

		const interval = setInterval(() => {
			elapsed += 1;
		}, 1000);
		return () => clearInterval(interval);
	});

	function formatTime(seconds: number): string {
		const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
		const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${h}:${m}:${s}`;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="top-bar">
	<div class="timer">⏱ {formatTime(elapsed)}</div>
	<ThemeToggle />
</div>

{@render children()}

<style>
	.top-bar {
		position: fixed;
		top: 1rem;
		right: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		z-index: 1000;
	}

	.timer {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: 0.4rem 0.9rem;
		border-radius: 20px;
		font-size: 0.95rem;
		font-family: monospace;
		transition:
			background-color 0.3s,
			color 0.3s;
	}
</style>
