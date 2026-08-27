<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
</script>

<div class="home-content">
	<h2>F12</h2>
	<p>{i18n.t('about.subtitle')}</p>
	<p class="built-with">{i18n.t('footer.builtWith')}</p>
	<p class="repo-link">
		<a href="https://github.com/a-e-r-o/F12" target="_blank" rel="noopener noreferrer">
			{i18n.t('about.sourceCode')}
		</a>
	</p>
</div>

<style>
	.home-content {
		padding: 12px;
		text-align: center;

		h2 {
			font-size: 18px;
			font-weight: bold;
			margin-bottom: 6px;
		}

		p {
			font-size: 12px;
		}

		.built-with {
			font-size: 11px;
			color: var(--color-text-secondary);
			margin-top: 8px;
		}

		.repo-link {
			font-size: 11px;
			margin-top: 4px;

			a {
				color: var(--color-accent);
			}
		}
	}
</style>
