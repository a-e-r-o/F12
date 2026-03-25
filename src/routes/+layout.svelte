<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { i18n, windowsState, themeState } from '$lib/stores';
	import { wallpaperState } from '$lib/stores/wallpaper.svelte';
	import { crt } from '$lib/stores/crt.svelte';
	import { Win95Taskbar } from '$lib/components';
	import { onMount } from 'svelte';

	let { children } = $props();

	let bgStyle = $derived(wallpaperState.backgroundStyle);
	let taskbarHeight = $derived(themeState.isWin7 ? 44 : 32);

	onMount(() => {
		themeState.init();
		i18n.init();
		windowsState.init();
		wallpaperState.init();
		crt.init();
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
	class:pixelated={themeState.isWin95}
	style="{bgStyle} height: calc(100vh - {taskbarHeight}px);"
>
	{@render children()}
</div>

<Win95Taskbar />

<!-- SVG filter for CRT horizontal color bleed (hidden, referenced by CSS) -->
<svg class="crt-filter-svg" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<filter id="crt-color-bleed" color-interpolation-filters="sRGB">
			<!-- Horizontal blur: blends adjacent pixel colors along scanline -->
			<feGaussianBlur in="SourceGraphic" stdDeviation="0.6 0" />
		</filter>
	</defs>
</svg>

<style>
	.desktop {
		position: relative;
		width: 100vw;
		overflow: hidden;
		background-size: cover;
		background-position: center;
	}

	.desktop.pixelated {
		image-rendering: pixelated;
	}
</style>
