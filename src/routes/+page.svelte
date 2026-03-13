<script lang="ts">
	import { i18n } from '$lib/stores';

	let cards = $derived([
		{ href: '/hybrid-diagrams', icon: '⚙️', title: i18n.t('nav.hybridDiagrams'), desc: i18n.t('home.cardHybrid') },
		{ href: '/converters', icon: '🔄', title: i18n.t('nav.converters'), desc: i18n.t('home.cardConverters') },
		{ href: '/game-of-life', icon: '🧬', title: i18n.t('nav.gameOfLife'), desc: i18n.t('home.cardLife') },
		{ href: '/image-convert', icon: '🎨', title: i18n.t('nav.imgConvert'), desc: i18n.t('home.cardImg') }
	]);
</script>

<svelte:head>
	<title>{i18n.t('pageTitle.home')}</title>
</svelte:head>

<div class="hero glass-panel">
	<h1>{i18n.t('home.welcome')}</h1>
	<p class="subtitle">{i18n.t('home.subtitle')}</p>
</div>

<div class="card-grid">
	{#each cards as card}
		<a href={card.href} class="card glass-surface">
			<span class="card-icon">{card.icon}</span>
			<strong class="card-title">{card.title}</strong>
			<p class="card-desc">{card.desc}</p>
		</a>
	{/each}
</div>

<style>
	.hero {
		text-align: center;
		padding: 3.5rem 1.5rem 1.5rem;
		max-width: 920px;
		margin: 1.5rem auto 0;
		border-radius: 24px;
	}

	h1 {
		font-size: 2rem;
		font-family: 'Fredoka', system-ui, sans-serif;
		color: var(--color-primary);
	}

	.subtitle {
		margin-top: 0.4rem;
		font-size: 1.05rem;
		color: var(--color-text-secondary);
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1.25rem;
		max-width: 900px;
		margin: 2rem auto 3rem;
		padding: 0 1.5rem;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.5rem;
		border-radius: 14px;
		text-decoration: none;
		color: var(--color-text);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease,
			border-color 0.15s ease;

		&:hover {
			transform: translateY(-3px);
			box-shadow: 0 22px 40px color-mix(in srgb, var(--color-shadow) 90%, transparent);
			border-color: var(--color-primary);
		}
	}

	.card-icon {
		font-size: 1.8rem;
	}

	.card-title {
		font-size: 1rem;
		color: var(--color-text);
	}

	.card-desc {
		font-size: 0.82rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
	}
</style>
