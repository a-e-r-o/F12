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
		<div class="dropdown">
			<ul class="dropdown-body" role="menu">
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
		</div>
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
			background: var(--win95-surface);
			border: 2px solid;
			border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
			box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);
			min-width: 120px;
			z-index: 10001;

			.dropdown-body {
				list-style: none;
				margin: 0;
				padding: 2px 0;
			}

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

	/* =================== WIN7 AERO OVERRIDES =================== */
	:global([data-theme="win7aero"]) .lang-switcher {
		width: 22px;
		height: 22px;

		.lang-toggle {
			background: transparent;
			border: 1px solid rgba(0, 0, 0, 0.35);
			border-radius: 50%;
			box-shadow:
				inset 0 0 0 1px rgba(255, 255, 255, 0.5),
				0 1px 2px rgba(0, 0, 0, 0.3);
			padding: 0;
			overflow: hidden;
			transition: box-shadow 0.15s, border-color 0.15s;

			&:hover {
				border-color: rgba(0, 0, 0, 0.55);
				box-shadow:
					inset 0 0 0 1px rgba(255, 255, 255, 0.7),
					0 0 6px 1px rgba(120, 200, 255, 0.6);
			}

			.flag-img {
				padding: 0;
				width: 100%;
				height: 100%;
				border-radius: 50%;
				object-fit: cover;
			}
		}

		.dropdown {
			backdrop-filter: blur(7px);
			-webkit-backdrop-filter: blur(7px);
			border: 1px solid #000;
			border-radius: 7px;
			padding: 6px;
			box-shadow:
				0 0 10px 2px rgba(0, 0, 0, 0.333),
				inset 0 0 0 1px rgba(255, 255, 255, 0.667);
			background:
				linear-gradient(rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0) 40%),
				linear-gradient(140deg, rgba(255, 255, 255, 0.33) 70px, transparent 100px),
				linear-gradient(229deg, rgba(255, 255, 255, 0.33) 70px, transparent 100px),
				color(from var(--window-background-color) srgb r g b / 0.5);

			.dropdown-body {
				border: 1px solid rgba(0, 0, 0, 0.667);
				background: var(--win-body-bg, #ffffff);
				box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.667);
				padding: 4px;
				border-radius: 0;
			}

			li button {
				font-family: 'Segoe UI', Arial, sans-serif;
				font-size: 12px;
				color: #1a1a1a;
				text-shadow: none;
				border: 1px solid transparent;
				border-radius: 3px;
				padding: 4px 10px;

				&:hover {
					border-color: #7da2ce;
					background: linear-gradient(#ddecfd, #c2dcfd);
					box-shadow: inset 0 0 0 1px #fff;
					color: #1a1a1a;
				}
			}
		}
	}

</style>
