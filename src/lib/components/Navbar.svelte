<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { theme } from '$lib/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	let elapsed = $state(0);
	let sidebarOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Accueil', icon: '🏠' },
		{ href: '/gears-svg', label: 'Engrenages SVG', icon: '⚙️' },
		{ href: '/gears-canvas', label: 'Engrenages Canvas', icon: '🎨' },
		{ href: '/markus', label: 'Markus', icon: '🐧' }
	];

	onMount(() => {
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

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<!-- Hamburger button (mobile) -->
<button
	class="hamburger"
	class:open={sidebarOpen}
	onclick={() => (sidebarOpen = !sidebarOpen)}
	aria-label="Menu"
>
	<span></span>
	<span></span>
	<span></span>
</button>

<!-- Sidebar overlay (mobile) -->
{#if sidebarOpen}
	<div class="overlay" onclick={() => (sidebarOpen = false)} role="presentation"></div>
{/if}

<!-- Sidebar -->
<nav class="sidebar" class:open={sidebarOpen}>
	<div class="sidebar-header">
		<span class="logo">F12</span>
	</div>

	<ul class="nav-list">
		{#each navItems as item}
			<li>
				<a
					href={item.href}
					class:active={isActive(item.href)}
					onclick={() => (sidebarOpen = false)}
				>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="sidebar-footer">
		<ThemeToggle />
		<div class="timer">⏱ {formatTime(elapsed)}</div>
	</div>
</nav>

<style>
	/* --- Sidebar -------------------------------- */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 220px;
		height: 100vh;
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		z-index: 100;
		transition: transform 0.3s ease, background-color 0.3s ease;
	}

	.sidebar-header {
		padding: 1.5rem 1.25rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.logo {
		font-size: 1.6rem;
		font-weight: 800;
		font-family: monospace;
		color: var(--color-primary);
	}

	.nav-list {
		list-style: none;
		padding: 0.75rem 0;
		flex: 1;
	}

	.nav-list li a {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 1.25rem;
		text-decoration: none;
		color: var(--color-text-secondary);
		font-size: 0.95rem;
		border-left: 3px solid transparent;
		transition: all 0.15s ease;
	}

	.nav-list li a:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.nav-list li a.active {
		color: var(--color-primary);
		border-left-color: var(--color-primary);
		background: var(--color-bg-secondary);
		font-weight: 600;
	}

	.nav-icon {
		font-size: 1.15rem;
		width: 1.5rem;
		text-align: center;
	}

	.sidebar-footer {
		padding: 1rem 1.25rem;
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.timer {
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: 0.3rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-family: monospace;
		transition: background-color 0.3s, color 0.3s;
	}

	/* --- Hamburger (hidden on desktop) ---------- */
	.hamburger {
		display: none;
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 200;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		width: 2.5rem;
		height: 2.5rem;
		cursor: pointer;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 0;
	}

	.hamburger span {
		display: block;
		width: 18px;
		height: 2px;
		background: var(--color-text);
		border-radius: 2px;
		transition: all 0.25s ease;
	}

	.hamburger.open span:nth-child(1) {
		transform: rotate(45deg) translate(4px, 4px);
	}
	.hamburger.open span:nth-child(2) {
		opacity: 0;
	}
	.hamburger.open span:nth-child(3) {
		transform: rotate(-45deg) translate(4px, -4px);
	}

	.overlay {
		display: none;
	}

	/* --- Mobile --------------------------------- */
	@media (max-width: 768px) {
		.hamburger {
			display: flex;
		}

		.sidebar {
			transform: translateX(-100%);
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.4);
			z-index: 90;
		}
	}
</style>
