<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { theme } from '$lib/stores';
	import { FpsCounter, Navbar } from '$lib/components';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

<!-- Main content -->
<main class="content">
	{@render children()}
</main>

<FpsCounter />

<style>
	.content {
		margin-left: 220px;
		min-height: 100vh;
		transition: margin-left 0.3s ease;
	}

	@media (max-width: 768px) {
		.content {
			margin-left: 0;
		}
	}
</style>
