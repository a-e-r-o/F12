<script lang="ts">
	import { wallpaperState } from '$lib/stores/wallpaper.svelte';

	let current = $derived(wallpaperState.current);
</script>

<div class="wallpaper-picker">
	<p class="picker-label">Choose a wallpaper:</p>
	<div class="picker-grid">
		{#each wallpaperState.wallpapers as wp (wp.id)}
			<button
				class="wp-thumb"
				class:selected={current === wp.id}
				onclick={() => wallpaperState.set(wp.id)}
				title={wp.name}
			>
				{#if wp.url}
					<img src={wp.url} alt={wp.name} loading="lazy" />
				{:else}
					<div class="wp-none">✕</div>
				{/if}
				<span class="wp-name">{wp.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	/* CSS refactorisé : nesting appliqué */
	.wallpaper-picker {
		padding: 8px;

		.picker-label {
			font-size: 11px;
			font-weight: bold;
			margin-bottom: 8px;
		}

		.picker-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
			gap: 8px;
		}

		.wp-thumb {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4px;
			padding: 4px;
			background: var(--win-btn-face, var(--win95-btn-face));
			border: 2px solid;
			border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
			cursor: pointer;
			font-family: inherit;
			font-size: 10px;
			color: var(--win-window-text, #000);

			& img {
				width: 90px;
				height: 60px;
				object-fit: cover;
				border: 1px solid var(--win95-border-dark, rgba(0, 0, 0, 0.2));
			}

			&.selected {
				border-color: var(--win95-border-darkest) var(--win95-border-light) var(--win95-border-light) var(--win95-border-darkest);
				box-shadow: inset 1px 1px 0 var(--win95-border-dark);
				background-image: url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23c0c0c0'/%3E%3Crect x='1' y='0' width='1' height='1' fill='%23ffffff'/%3E%3Crect x='0' y='1' width='1' height='1' fill='%23ffffff'/%3E%3C/svg%3E");
				background-size: 2px 2px;
			}
		}

		.wp-none {
			width: 90px;
			height: 60px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--win95-desktop-bg, #008080);
			border: 1px solid var(--win95-border-dark, rgba(0, 0, 0, 0.2));
			font-size: 18px;
			color: #fff;
		}

		.wp-name {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 90px;
		}
	}

	/* ============== WIN7 AERO OVERRIDES ================== */
	:global([data-theme="win7aero"]) .wallpaper-picker {
		.wp-thumb {
			border: 2px solid rgba(255, 255, 255, 0.3);
			border-radius: 4px;
			background: var(--win-btn-face);

			&.selected {
				border-color: #4ca3ff;
				box-shadow: 0 0 6px rgba(76, 163, 255, 0.5);
				background-image: none;
				background: rgba(76, 163, 255, 0.15);
			}
		}

		.wp-none {
			background: #000;
		}
	}
</style>
