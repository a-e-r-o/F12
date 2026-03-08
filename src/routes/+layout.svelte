<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { theme, navbar } from '$lib/stores';
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
<main class="content" class:sidebar-open={navbar.isOpen}>
	{@render children()}
</main>

<FpsCounter />

<style>
	.content {
		margin-left: 0;
		min-height: 100vh;
		transition: margin-left 0.3s ease;
	}

	@media (min-width: 769px) {
		.content.sidebar-open {
			margin-left: 320px;
		}
	}
</style>
