<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { navbar } from '$lib/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	let elapsed = $state(0);

	const navItems = [
		{ href: '/', label: 'Accueil', icon: '🏠' },
		{ href: '/hybrid-diagrams', label: 'Diagrammes mécaniques', icon: '⚙️' },
		{ href: '/img-convert', label: 'Conversion d\'images', icon: '🎨' },
		{ href: '/game-of-life', label: 'Jeu de la vie', icon: '🧬' }
	];

	onMount(() => {
		navbar.init();
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

	function onNavClick() {
		// On mobile, close sidebar after navigating
		if (window.innerWidth < 768) {
			navbar.toggle();
		}
	}
</script>

<!-- Hamburger tab (position:fixed, slides via translateX) -->
<button
	class="hamburger"
	class:open={navbar.isOpen}
	onclick={() => navbar.toggle()}
	aria-label="Menu"
>
	<span></span>
	<span></span>
	<span></span>
</button>

<!-- Sidebar overlay (mobile only) -->
{#if navbar.isOpen}
	<div class="overlay" onclick={() => navbar.toggle()} role="presentation"></div>
{/if}

<!-- Sidebar -->
<nav class="sidebar" class:open={navbar.isOpen}>
	<div class="sidebar-header">
		<span class="logo">F12</span>
	</div>

	<ul class="nav-list">
		{#each navItems as item}
			<li>
				<a
					href={item.href}
					class:active={isActive(item.href)}
					onclick={onNavClick}
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
		width: 320px;
		height: 100vh;
		background: var(--color-surface);
		border-right: 3px solid var(--color-border);
		display: flex;
		flex-direction: column;
		z-index: 100;
		transform: translateX(-100%);
		transition: transform 0.3s ease, background-color 0.3s ease;
	}

	.sidebar.open {
		transform: translateX(0);
	}

	.sidebar-header {
		padding: 2rem 1.5rem 8rem 2rem;
		position: relative;
		height: 6rem;
		background-image: linear-gradient(
			to right,
			var(--header-gradient-from) 0%,
			var(--header-gradient-to) 100%
		);
		transition: background-image 0.3s ease;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 6rem;
			width: 100%;
			height: 4rem;
			background-color: var(--color-surface);
			-webkit-mask-image: linear-gradient(to bottom, transparent, black);
			mask-image: linear-gradient(to bottom, transparent, black);
			transition: background-color 0.3s ease;
		}
	}

	.logo {
		font-size: 2.5rem;
		font-weight: 800;
		font-family: 'Fredoka', 'Baloo 2', 'Nunito', system-ui, sans-serif;
		color: var(--color-primary);
		letter-spacing: 0.05em;
	}

	.nav-list {
		list-style: none;
		padding: 1rem 0;
		flex: 1;
	}

	.nav-list li a {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.8rem 1.5rem;
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
		border-top: 3px solid var(--color-border);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.timer {
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border: 3px solid var(--color-border);
		padding: 0.3rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-family: monospace;
		transition: background-color 0.3s, color 0.3s;
	}

	/* --- Hamburger tab (position:fixed, slides with sidebar) --- */
	.hamburger {
		display: flex;
		position: fixed;
		top: 2rem;
		left: 0;
		width: 4rem;
		height: 4rem;
		background: var(--color-bg);
		border: 3px solid var(--color-border);
		border-left: none;
		border-radius: 0 8px 8px 0;
		cursor: pointer;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 0;
		z-index: 200;
		transform: translateX(0);
		transition: background-color 0.3s ease, transform 0.3s ease;
	}

	/* open: button right edge = sidebar right edge, flip horizontally */
	.hamburger.open {
		transform: translateX(calc(320px - 3.5rem)) scale(-1, 1);
	}

	.hamburger span {
		display: block;
		width: 22px;
		height: 3px;
		background: var(--color-text-secondary);
		border-radius: 999px;
		transition: all 0.25s ease;
	}

	/* burger → left arrow chevron (scale(-1,1) on parent flips > to <) */
	.hamburger.open span:nth-child(1) {
		width: 13px;
		transform: rotate(35deg) translate(3px, 2px);
	}
	.hamburger.open span:nth-child(2) {
		width: 14px;
    	transform: translate(-11px, 0px);
	}
	.hamburger.open span:nth-child(3) {
		width: 13px;
		transform: rotate(-35deg) translate(3px, -2px);
	}

	/* --- Overlay (mobile only) ------------------ */
	.overlay {
		width: 13px;
		transform: rotate(-35deg) translate(3px, -3px);
	}

	/* --- Mobile --------------------------------- */
	@media (max-width: 768px) {
		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.4);
			z-index: 90;
		}
	}
</style>
