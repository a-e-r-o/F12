<script lang="ts">
	import { i18n, locales } from '$lib/stores/i18n.svelte';

	let open = $state(false);

	function select(code: typeof locales[number]['code']) {
		i18n.setLocale(code);
		open = false;
	}

	function toggle(e: MouseEvent) {
		e.stopPropagation();
		open = !open;
	}

	function onDocClick() {
		open = false;
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', onDocClick);
			return () => document.removeEventListener('click', onDocClick);
		}
	});
</script>

<div class="lang-switcher">
	<button
		class="lang-toggle"
		onclick={toggle}
		aria-label={i18n.t('lang.switchLabel')}
		title={i18n.t('lang.switchLabel')}
	>
        <img src={i18n.flagSrc} alt={i18n.locale} class="flag-img" />
	</button>

	{#if open}
		<ul class="dropdown" role="menu">
			{#each locales as loc}
				<li role="menuitem">
					<button
						class:active={i18n.locale === loc.code}
						onclick={() => select(loc.code)}
					>                        
                        <img src={loc.flagSrc} alt={loc.code} class="flag-img-sm" />
						<span>{loc.name}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	/* CSS refactorisé : nesting appliqué */
	.lang-switcher {
		position: relative;
		display: inline-block;
		width: 20px;
		height: 20px;

		.lang-toggle {
			background: var(--win95-btn-face);
			border: 1px solid var(--win95-border-dark);
			border-radius: 0;
			height: 100%;
			width: 100%;
			padding: 0;
			overflow: hidden;
			cursor: pointer;

			&:hover {
				border-color: var(--win95-border-darkest);
			}

			.flag-img {
				display: block;
				width: 100%;
				height: 100%;
				padding: 1px;
				box-sizing: border-box;
				object-fit: cover;
			}
		}

		.dropdown {
			position: absolute;
			bottom: calc(100% + 4px);
			left: 50%;
			transform: translateX(-50%);
			list-style: none;
			margin: 0;
			padding: 2px 0;
			background: var(--win95-surface);
			border: 2px solid;
			border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
			box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
			min-width: 120px;
			z-index: 10001;

			li button {
				display: flex;
				align-items: center;
				gap: 6px;
				width: 100%;
				padding: 3px 8px;
				border: none;
				background: none;
				color: var(--color-text);
				font-size: 11px;
				cursor: pointer;
				font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

				&:hover {
					background: var(--color-primary);
					color: #ffffff;
				}

				&.active {
					font-weight: bold;
				}

				.flag-img-sm {
					width: 18px;
					height: 12px;
					object-fit: cover;
					flex-shrink: 0;
				}
			}
		}
	}

</style>
