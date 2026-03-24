<script lang="ts">
	import { crt } from '$lib/stores/crt.svelte';
</script>

<button
	class="crt-toggle"
	onclick={() => crt.toggle()}
	aria-label={crt.enabled ? 'Disable CRT effects' : 'Enable CRT effects'}
	title={crt.enabled ? 'Disable CRT effects' : 'Enable CRT effects'}
>
	<span class="icon">{crt.enabled ? '📺' : '🖥️'}</span>
</button>

<style>
	.crt-toggle {
		background: var(--glass-surface-strong);
		border: 1px solid var(--ui-border);
		border-radius: 50%;
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s,
			transform 0.2s;
		font-size: 1.1rem;
		box-shadow: inset 0 1px 0 var(--glass-highlight);
		backdrop-filter: blur(calc(var(--glass-blur) * 0.55));
		-webkit-backdrop-filter: blur(calc(var(--glass-blur) * 0.55));

		&:hover {
			transform: scale(1.1);
			border-color: var(--color-primary);
		}
	}

	.icon {
		line-height: 0.5;
	}
</style>
