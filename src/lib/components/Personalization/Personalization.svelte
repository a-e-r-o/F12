<script lang="ts">
	import { themeState } from '$lib/stores/theme.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import WallpaperPicker from '../Wallpaper/WallpaperPicker.svelte';

	let current = $derived(themeState.current);
</script>

<div class="personalization">
	<section class="theme-section">
		<h4>{i18n.t('personalization.theme')}</h4>
		<div class="theme-options">
			<label class="theme-option">
				<input type="radio" name="theme" value="win95" checked={current === 'win95'} onchange={() => themeState.set('win95')} />
				{i18n.t('personalization.retro')}
			</label>
			<label class="theme-option">
				<input type="radio" name="theme" value="win7aero" checked={current === 'win7aero'} onchange={() => themeState.set('win7aero')} />
				{i18n.t('personalization.aero')}
			</label>
		</div>
	</section>

	<section class="wallpaper-section">
		<h4>{i18n.t('personalization.wallpaper')}</h4>
		<WallpaperPicker />
	</section>
</div>

<style>
	/* CSS refactorisé : nesting appliqué */
	.personalization {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 16px;

		h4 {
			font-size: 12px;
			font-weight: bold;
			margin-bottom: 8px;
		}

		.theme-options {
			display: flex;
			gap: 16px;

			.theme-option {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 12px;
				cursor: pointer;

				input[type="radio"] {
					cursor: pointer;
				}
			}
		}
	}
</style>
