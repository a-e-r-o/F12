<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { i18n, windowsState } from '$lib/stores';
	import { wallpaperState } from '$lib/stores/wallpaper.svelte';
	import { Win95Taskbar } from '$lib/components';
	import { onMount } from 'svelte';

	let { children } = $props();

	let wpUrl = $derived(wallpaperState.currentUrl);

	onMount(() => {
		i18n.init();
		windowsState.init();
		wallpaperState.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
	<meta name="description" content="F12 — Interactive toolbox built with SvelteKit & Svelte 5" />
</svelte:head>

<div
	class="desktop"
	style={wpUrl ? `background-image: url('${wpUrl}'); background-size: cover; background-position: center; image-rendering: pixelated;` : ''}
>
	{@render children()}
</div>

<Win95Taskbar />

<style>
	.desktop {
		position: relative;
		width: 100vw;
		height: calc(100vh - 32px);
		overflow: hidden;
	}
</style>
