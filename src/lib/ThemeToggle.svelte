<script lang="ts">
	import { themeState } from '$lib/theme.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
</script>

<button
	class="theme-toggle"
	onclick={() => themeState.toggle()}
	aria-label="Toggle theme"
	title="Toggle theme"
>
	{#if themeState.isWin7}
		<span class="icon">🪟</span>
	{:else}
		<span class="icon">💎</span>
	{/if}
</button>

<style>
	.theme-toggle {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s,
			transform 0.2s;
		font-size: 1.2rem;
	}

	.theme-toggle:hover {
		transform: scale(1.1);
		border-color: var(--color-primary);
	}

	.icon {
		line-height: 1;
	}
</style>
