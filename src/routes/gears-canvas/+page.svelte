<script lang="ts">
	import { i18n } from '$lib/stores';
	import { GearsCanvas } from '$lib/components';
</script>

<svelte:head>
	<title>{i18n.t('pageTitle.gearsCanvas')}</title>
</svelte:head>
	
<GearsCanvas />	