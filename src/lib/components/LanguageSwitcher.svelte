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
	.lang-switcher {
		position: relative;
		display: inline-block;
        width: 2.25rem;
		height: 2.25rem;
	}

	.lang-toggle {
		background: var(--glass-surface-strong);
		border: 1px solid var(--ui-border);
		border-radius: 50%;
		height: 100%;
        width: 100%;
		padding: 0;
		overflow: hidden;
		cursor: pointer;
		box-shadow: inset 0 1px 0 var(--glass-highlight);
		backdrop-filter: blur(calc(var(--glass-blur) * 0.55));
		-webkit-backdrop-filter: blur(calc(var(--glass-blur) * 0.55));
		transition:
			border-color 0.2s,
			transform 0.2s;

		&:hover {
			transform: scale(1.1);
			border-color: var(--color-primary);
		}
	}

    .flag-img {
        display: block;
        width: 100%;
        height: 100%;
        padding: 4px;
        box-sizing: border-box;
        border-radius: 100%;
        overflow: hidden;
        object-fit: cover;            
    }

	.flag-img-sm {
		width: 1.4rem;
		height: 1rem;
		object-fit: cover;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.dropdown {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
		list-style: none;
		margin: 0;
		padding: 0.35rem 0;
		background: var(--glass-surface-strong);
		border: 1px solid var(--ui-border);
		border-radius: 8px;
		box-shadow: var(--glass-shadow);
		backdrop-filter: blur(calc(var(--glass-blur) * 0.75)) saturate(var(--glass-saturate));
		-webkit-backdrop-filter: blur(calc(var(--glass-blur) * 0.75)) saturate(var(--glass-saturate));
		min-width: 140px;
		z-index: 300;

        li button {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            width: 100%;
            padding: 0.45rem 1rem;
            border: none;
            background: none;
            color: var(--color-text);
            font-size: 0.9rem;
            cursor: pointer;
            transition: background-color 0.1s;

        }

		li button:hover {
				background: color-mix(in srgb, var(--glass-surface) 90%, transparent);
        }

        li button.active {
            color: var(--color-primary);
            font-weight: 600;
        }
    }
</style>
