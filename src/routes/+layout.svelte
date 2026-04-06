<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { i18n, windowsState, themeState } from '$lib/stores';
	import { wallpaperState } from '$lib/stores/wallpaper.svelte';
	import { AppTaskbar } from '$lib/components';
	import StartMenu from '$lib/components/Shared/StartMenu.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	let bgStyle = $derived(wallpaperState.backgroundStyle);
	let startMenuOpen = $state(false);

	onMount(() => {
		themeState.init();
		i18n.init();
		windowsState.init();
		wallpaperState.init();
	});

	// Sync wallpaper collection when theme changes
	$effect(() => {
		const theme = themeState.current;
		if (theme) {
			wallpaperState.setTheme(theme);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
	<meta name="description" content="F12 — Interactive toolbox built with SvelteKit & Svelte 5" />
</svelte:head>

<div
	class="desktop"
	style="{bgStyle}"
	role="presentation"
	onmousedown={() => windowsState.unfocusAll()}
>
	{@render children()}
</div>

<StartMenu open={startMenuOpen} onclose={() => startMenuOpen = false} />
<AppTaskbar bind:startMenuOpen />

<style>
	.desktop {
		position: relative;
		width: 100vw;
		height: calc(100vh - var(--taskbar-height, 32px));
		overflow: hidden;
		background-size: cover;
		background-position: center;

		:global([data-theme="win95"]) & {
			image-rendering: pixelated;
		}
	}
</style>
