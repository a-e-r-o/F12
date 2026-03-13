<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/theme.css';
	import { theme, navbar, i18n, crt } from '$lib/stores';
	import { FpsCounter, Navbar } from '$lib/components';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	onMount(() => {
		theme.init();
		i18n.init();
		crt.init();
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="F12 — Interactive toolbox built with SvelteKit & Svelte 5" />
</svelte:head>

<Navbar />

<!-- Main content -->
<main class="content" class:sidebar-open={navbar.isOpen}>
	{@render children()}
</main>

<footer class="site-footer" class:sidebar-open={navbar.isOpen}>
	<span>F12</span>
	<span class="sep">·</span>
	<span>{i18n.t('footer.builtWith')}</span>
</footer>

<FpsCounter />

<style>
	@keyframes fade-in {
		from { opacity: 0; }
	}
	@keyframes fade-out {
		to { opacity: 0; }
	}

	:root {
		&::view-transition-old(root) {
			animation: 120ms ease fade-out;
		}
		&::view-transition-new(root) {
			animation: 120ms ease fade-in;
		}
	}

	.content {
		margin-left: 0;
		min-height: 100vh;
		position: relative;
		background:
			radial-gradient(
				ellipse 55% 60% at 0% 0%,
				color-mix(in srgb, var(--header-gradient-from) 50%, transparent),
				transparent
			),
			radial-gradient(
				ellipse 55% 60% at 100% 100%,
				color-mix(in srgb, var(--header-gradient-to) 50%, transparent),
				transparent
			);
		transition: margin-left 0.3s ease;
		padding-bottom: 1.5rem;
	}

	.site-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		font-size: 0.78rem;
		color: var(--color-text-secondary);
		margin: 0 auto 1rem;
		width: min(calc(100% - 2rem), 960px);
		border: 1px solid var(--glass-border);
		border-radius: 999px;
		background: var(--glass-surface);
		box-shadow: var(--glass-shadow);
		backdrop-filter: blur(calc(var(--glass-blur) * 0.75)) saturate(var(--glass-saturate));
		-webkit-backdrop-filter: blur(calc(var(--glass-blur) * 0.75)) saturate(var(--glass-saturate));
		opacity: 0.9;
		transition: margin-left 0.3s ease;
	}

	.site-footer .sep {
		opacity: 0.4;
	}

	@media (min-width: 769px) {
		.content.sidebar-open {
			margin-left: 320px;
		}
		.site-footer.sidebar-open {
			margin-left: 320px;
		}
	}
</style>
