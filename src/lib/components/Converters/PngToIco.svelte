<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { ICO_SIZES, loadImage, resizeToPngBlob, buildIco, parseIco, type IcoEntry } from '$lib/utils/ico';

	/* ── PNG → ICO ─────────────────────────────────────── */
	let file = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let selectedSizes = $state<Set<number>>(new Set([16, 32, 48, 256]));
	let generating = $state(false);
	let error = $state<string | null>(null);

	/* ── ICO → PNG ─────────────────────────────────────── */
	let icoFile = $state<File | null>(null);
	let icoEntries = $state<IcoEntry[]>([]);
	let icoError = $state<string | null>(null);
	let icoParsing = $state(false);

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0];
		if (!f) return;
		if (f.type !== 'image/png') {
			error = i18n.t('imgConvert.errorNotPng');
			file = null;
			previewUrl = null;
			return;
		}
		error = null;
		file = f;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(f);
	}

	function toggleSize(size: number) {
		const next = new Set(selectedSizes);
		if (next.has(size)) next.delete(size);
		else next.add(size);
		selectedSizes = next;
	}

	async function generate() {
		if (!file || selectedSizes.size === 0) return;
		generating = true;
		error = null;
		try {
			const img = await loadImage(file);
			const sorted = [...selectedSizes].sort((a, b) => a - b);
			const blobs = await Promise.all(sorted.map((s) => resizeToPngBlob(img, s)));
			const ico = await buildIco(blobs, sorted);

			const url = URL.createObjectURL(ico);
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name.replace(/\.png$/i, '') + '.ico';
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			error = i18n.t('imgConvert.errorGeneric');
		} finally {
			generating = false;
		}
	}

	/* ── ICO → PNG handlers ────────────────────────────── */
	async function onIcoFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0];
		if (!f) return;
		if (!f.name.toLowerCase().endsWith('.ico')) {
			icoError = i18n.t('imgConvert.errorNotIco');
			icoFile = null;
			icoEntries = [];
			return;
		}
		icoError = null;
		icoFile = f;
		icoParsing = true;
		try {
			icoEntries = await parseIco(f);
		} catch {
			icoError = i18n.t('imgConvert.errorParseIco');
			icoEntries = [];
		} finally {
			icoParsing = false;
		}
	}

	function downloadPng(entry: IcoEntry) {
		const url = URL.createObjectURL(entry.blob);
		const a = document.createElement('a');
		a.href = url;
		const baseName = icoFile ? icoFile.name.replace(/\.ico$/i, '') : 'icon';
		a.download = `${baseName}_${entry.width}x${entry.height}.png`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function downloadAllPngs() {
		for (const entry of icoEntries) {
			downloadPng(entry);
		}
	}
</script>

<div class="converter-card">
	<h2>🎨 {i18n.t('imgConvert.title')}</h2>

	<div class="ico-section">
		<label class="file-label win95-btn">
			{i18n.t('imgConvert.selectPng')}
			<input type="file" accept=".png,image/png" onchange={onFileChange} hidden />
		</label>

		{#if file}
			<span class="file-name">{file.name}</span>
		{/if}
	</div>

	{#if previewUrl}
		<div class="preview-row">
			<img src={previewUrl} alt="Preview" class="preview-img" />
		</div>
	{/if}

	<div class="sizes-fieldset win95-sunken">
		<span class="sizes-legend">{i18n.t('imgConvert.sizes')}</span>
		<div class="sizes-grid">
			{#each ICO_SIZES as size}
				<label class="size-option">
					<input
						type="checkbox"
						checked={selectedSizes.has(size)}
						onchange={() => toggleSize(size)}
					/>
					<span>{size}×{size}</span>
				</label>
			{/each}
		</div>
	</div>

	{#if error}
		<p class="error-msg">{error}</p>
	{/if}

	<button
		class="win95-btn generate-btn"
		onclick={generate}
		disabled={!file || selectedSizes.size === 0 || generating}
	>
		{generating ? i18n.t('imgConvert.generating') : i18n.t('imgConvert.generate')}
	</button>

	<!-- ── ICO → PNG ─────────────────────────────────── -->
	<hr class="section-divider" />

	<h2>🖼️ {i18n.t('imgConvert.icoToPngTitle')}</h2>

	<div class="ico-section">
		<label class="file-label win95-btn">
			{i18n.t('imgConvert.selectIco')}
			<input type="file" accept=".ico" onchange={onIcoFileChange} hidden />
		</label>

		{#if icoFile}
			<span class="file-name">{icoFile.name}</span>
		{/if}
	</div>

	{#if icoParsing}
		<p class="info-msg">{i18n.t('imgConvert.parsing')}</p>
	{/if}

	{#if icoError}
		<p class="error-msg">{icoError}</p>
	{/if}

	{#if icoEntries.length > 0}
		<div class="sizes-fieldset win95-sunken">
			<span class="sizes-legend">{i18n.t('imgConvert.availableSizes')}</span>
			<div class="ico-entries-grid">
				{#each icoEntries as entry, idx}
					<button class="win95-btn ico-entry-btn" onclick={() => downloadPng(entry)}>
						📥 {entry.width}×{entry.height}
					</button>
				{/each}
			</div>
		</div>

		<button class="win95-btn generate-btn" onclick={downloadAllPngs}>
			{i18n.t('imgConvert.downloadAll')}
		</button>
	{/if}
</div>

<style>
	.ico-section {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;

		.file-label {
			cursor: pointer;
			padding: 3px 12px;
			font-size: 11px;
			white-space: nowrap;
		}

		.file-name {
			font-size: 11px;
			color: var(--color-text-secondary);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.preview-row {
		display: flex;
		justify-content: center;
		margin-bottom: 8px;

		.preview-img {
			max-width: 128px;
			max-height: 128px;
			image-rendering: pixelated;
			border: 1px solid var(--win95-border-dark);
		}
	}

	.sizes-fieldset {
		position: relative;
		margin: 0 0 8px;
		padding: 14px 8px 6px;
		font-size: 11px;

		.sizes-legend {
			position: absolute;
			top: -7px;
			left: 8px;
			background: var(--win95-surface);
			padding: 0 3px;
			font-size: 11px;
			font-weight: bold;
			white-space: nowrap;
		}

		.sizes-grid {
			display: grid;
			grid-template-columns: repeat(4, auto);
			justify-content: start;
			gap: 4px 12px;

			.size-option {
				display: flex;
				align-items: center;
				gap: 3px;
				cursor: pointer;
				font-size: 11px;
			}
		}

		.ico-entries-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
			gap: 4px;

			.ico-entry-btn {
				padding: 3px 8px;
				font-size: 11px;
				white-space: nowrap;
				cursor: pointer;
			}
		}
	}

	.error-msg {
		font-size: 11px;
		color: #c00;
		margin: 0 0 6px;
	}

	.generate-btn {
		padding: 3px 16px;
		font-size: 11px;
	}

	.section-divider {
		border: none;
		border-top: 1px solid var(--win-border-dark, #808080);
		border-bottom: 1px solid var(--win-border-light, #ffffff);
		margin: 12px 0;
	}

	.info-msg {
		font-size: 11px;
		color: var(--color-text-secondary);
		margin: 0 0 6px;
	}
</style>
