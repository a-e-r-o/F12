<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
</script>

<div class="tetris-placeholder">
	<div class="icon">🧱</div>
	<h3>{i18n.t('startMenu.tetris')}</h3>
	<p>{i18n.locale === 'fr' ? 'Bientôt disponible !' : 'Coming soon!'}</p>
</div>

<style>
	.tetris-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 32px 24px;
		gap: 8px;
		min-width: 280px;
		min-height: 200px;
	}

	.icon {
		font-size: 48px;
	}

	h3 {
		font-size: 14px;
		font-weight: bold;
		margin: 0;
	}

	p {
		font-size: 11px;
		color: #808080;
		margin: 0;
	}
</style>
