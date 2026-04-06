<script lang="ts">
	import { onMount } from 'svelte';
	import { gears, sunMin, sunMax, carrierMin, carrierMax, RPM_FACTOR } from '$lib/stores';
	import { i18n } from '$lib/stores/i18n.svelte';

	let sunAngle = $state(0);
	let carrierAngle = $state(0);
	let animationId: number;

	// --- Module & tooth counts -------------------
	const M = 3.5; // module (common)
	const Zs = 30; // sun teeth
	const Zp = 23; // planet teeth
	const Zr = 78; // ring teeth
	const NUM_PLANETS = 4;

	// --- Radii ----------------------------------
	const RpSun = (Zs * M) / 2;   // sun pitch radius
	const RaSun = RpSun + M;       // sun addendum (tip)
	const RfSun = RpSun - 1.25 * M; // sun dedendum (root)

	const RpPlanet = (Zp * M) / 2;
	const RaPlanet = RpPlanet + M;
	const RfPlanet = RpPlanet - 1.25 * M;

	const centerDist = RpSun + RpPlanet; // sun-planet center distance

	// --- Ring gear (internal) -------------------
	const RpRing = (Zr * M) / 2;         // pitch radius: 136.5
	const RaRing = RpRing - M;            // tip: inward at 133
	const RfRing = RpRing + 1.25 * M;    // root: outer at 140.875
	const ringOuterR = RfRing + 12;      // structural outer border

	// --- SVG layout -----------------------------
	const svgSize = Math.ceil(2 * (ringOuterR + 20));
	const cx = svgSize / 2;
	const cy = svgSize / 2;

	// --- Gear tooth path generator --------------
	function gearPath(Z: number, Rp: number, Ra: number, Rf: number): string {
		const step = (Math.PI * 2) / Z;
		// Tooth angular half-width at pitch circle ≈ step/4 (so tooth ≈ gap)
		const toothHalfAtPitch = step / 4;
		// Apex is narrow → sharp edge
		const apexHalf = step * 0.06;
		// Root half-width (slightly wider than pitch for the curved flank)
		const rootHalf = step * 0.30;
		// Fillet at root
		const filletHalf = step * 0.35;

		let d = '';
		for (let i = 0; i < Z; i++) {
			const θ = i * step;

			// Root arc start (end of previous gap)
			const gapStart = θ - filletHalf;
			// Root of flank (left side)
			const rootL = θ - rootHalf;
			// Apex left
			const apexL = θ - apexHalf;
			// Apex right
			const apexR = θ + apexHalf;
			// Root of flank (right side)
			const rootR = θ + rootHalf;
			// Root arc end (start of next gap)
			const gapEnd = θ + filletHalf;

			// Points
			const pGapStart = polar(Rf, gapStart);
			const pRootL = polar(Rf, rootL);
			const pApexL = polar(Ra, apexL);
			const pApexR = polar(Ra, apexR);
			const pRootR = polar(Rf, rootR);
			const pGapEnd = polar(Rf, gapEnd);

			// Bézier control points for left flank (root → apex)
			// Pull from root outward radially, from apex tangentially
			const cpRootL = polar(Rp * 1.02, rootL + step * 0.02);
			const cpApexL = polar(Ra * 0.97, apexL - step * 0.08);

			// Bézier control points for right flank (apex → root)
			const cpApexR = polar(Ra * 0.97, apexR + step * 0.08);
			const cpRootR = polar(Rp * 1.02, rootR - step * 0.02);

			if (i === 0) {
				d += `M ${pGapStart.x},${pGapStart.y} `;
			}

			// Arc along root circle to start of tooth
			d += `A ${Rf} ${Rf} 0 0 1 ${pRootL.x},${pRootL.y} `;
			// Left flank: cubic bézier
			d += `C ${cpRootL.x},${cpRootL.y} ${cpApexL.x},${cpApexL.y} ${pApexL.x},${pApexL.y} `;
			// Apex: straight line (sharp edge)
			d += `L ${pApexR.x},${pApexR.y} `;
			// Right flank: cubic bézier
			d += `C ${cpApexR.x},${cpApexR.y} ${cpRootR.x},${cpRootR.y} ${pRootR.x},${pRootR.y} `;
			// Arc along root to gap end / next tooth start
			d += `A ${Rf} ${Rf} 0 0 1 ${pGapEnd.x},${pGapEnd.y} `;
		}
		d += 'Z';
		return d;
	}

	function polar(r: number, angle: number) {
		return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
	}

	// --- Ring gear path (internal teeth) --------
	function ringGearPath(Z: number, Rp: number, Ra: number, Rf: number, outerR: number): string {
		// Outer structural circle (clockwise)
		let d = `M ${outerR},0 A ${outerR} ${outerR} 0 1 0 ${-outerR},0 A ${outerR} ${outerR} 0 1 0 ${outerR},0 Z `;

		const step = (Math.PI * 2) / Z;
		const apexHalf = step * 0.06;
		const rootHalf = step * 0.30;
		const filletHalf = step * 0.35;

		for (let i = 0; i < Z; i++) {
			const θ = i * step;

			const gapStart = θ - filletHalf;
			const rootL    = θ - rootHalf;
			const apexL    = θ - apexHalf;
			const apexR    = θ + apexHalf;
			const rootR    = θ + rootHalf;
			const gapEnd   = θ + filletHalf;

			// Internal gear: root at Rf (outer), tip at Ra (inner)
			const pGapStart = polar(Rf, gapStart);
			const pRootL    = polar(Rf, rootL);
			const pApexL    = polar(Ra, apexL);
			const pApexR    = polar(Ra, apexR);
			const pRootR    = polar(Rf, rootR);
			const pGapEnd   = polar(Rf, gapEnd);

			// Bézier CPs: flancs inversés (root outer → apex inner)
			const cpRootL = polar(Rp * 0.98, rootL + step * 0.02);
			const cpApexL = polar(Ra * 1.03, apexL - step * 0.08);
			const cpApexR = polar(Ra * 1.03, apexR + step * 0.08);
			const cpRootR = polar(Rp * 0.98, rootR - step * 0.02);

			if (i === 0) d += `M ${pGapStart.x},${pGapStart.y} `;

			// Counter-clockwise (sweep-flag = 0)
			d += `A ${Rf} ${Rf} 0 0 0 ${pRootL.x},${pRootL.y} `;
			d += `C ${cpRootL.x},${cpRootL.y} ${cpApexL.x},${cpApexL.y} ${pApexL.x},${pApexL.y} `;
			d += `L ${pApexR.x},${pApexR.y} `;
			d += `C ${cpApexR.x},${cpApexR.y} ${cpRootR.x},${cpRootR.y} ${pRootR.x},${pRootR.y} `;
			d += `A ${Rf} ${Rf} 0 0 0 ${pGapEnd.x},${pGapEnd.y} `;
		}
		d += 'Z';
		return d;
	}

	// Pre-compute gear paths (static, only depend on geometry)
	const sunPath = gearPath(Zs, RpSun, RaSun, RfSun);
	const planetPath = gearPath(Zp, RpPlanet, RaPlanet, RfPlanet);
	const ringPath = ringGearPath(Zr, RpRing, RaRing, RfRing, ringOuterR);

	// Hub radii
	const sunHub = RfSun * 0.4;
	const planetHub = RfPlanet * 0.35;

	// --- Carrier (porte-satellite) geometry ------
	const carrierRingW = 14;
	const carrierInnerR = centerDist - carrierRingW / 2;
	const carrierOuterR = centerDist + carrierRingW / 2;
	const carrierBarW = 4;

	// Carrier annulus path with planet shaft holes
	const carrierAnnulusPath = (() => {
		const oR = carrierOuterR;
		const iR = carrierInnerR;
		let d = `M ${oR},0 A ${oR} ${oR} 0 1 0 ${-oR},0 A ${oR} ${oR} 0 1 0 ${oR},0 Z `;
		d += `M ${iR},0 A ${iR} ${iR} 0 1 1 ${-iR},0 A ${iR} ${iR} 0 1 1 ${iR},0 Z `;
		const hr = planetHub + 2;
		for (let k = 0; k < NUM_PLANETS; k++) {
			const a = (k * 2 * Math.PI) / NUM_PLANETS;
			const hx = centerDist * Math.cos(a);
			const hy = centerDist * Math.sin(a);
			d += `M ${hx + hr},${hy} A ${hr} ${hr} 0 1 1 ${hx - hr},${hy} A ${hr} ${hr} 0 1 1 ${hx + hr},${hy} Z `;
		}
		return d;
	})();

	// --- Indicator bar geometry ------------------
	const sunBarW    = RfSun    * (2 * Math.PI / Zs) * 0.30;
	const planetBarW = RfPlanet * (2 * Math.PI / Zp) * 0.30;
	const ringBarW   = RaRing   * (2 * Math.PI / Zr) * 0.30;
	// Rotation to align a vertical rect (pointing −y) with first tooth gap
	const sunGapAngle    = 90 + 180 / Zs;
	const planetGapAngle = 90 + 180 / Zp;
	const ringGapAngle   = 90 + 180 / Zr;

	// Planet positions (fixed, porte-satellites fixe)
	const planetAngles = Array.from({ length: NUM_PLANETS }, (_, i) => (i * 360) / NUM_PLANETS);

	// Gear ratios
	const ratioSunPlanet = Zs / Zp; // 30/23
	const ratioSunRing   = Zs / Zr; // 30/78

	// Mesh offsets: corrected for non-integer tooth alignment (30/4 = 7.5 teeth per quadrant)
	const meshOffsets = planetAngles.map((φ) => φ / Zp);
	const ringMeshOffset = 180 / Zr;

	// --- Animation ------------------------------
	onMount(() => {
		let last = performance.now();
		function frame(now: number) {
			const dt = (now - last) / 1000;
			last = now;
			sunAngle += gears.sunSpeed * 60 * dt;
			carrierAngle += gears.carrierSpeed * 60 * dt;
			animationId = requestAnimationFrame(frame);
		}
		animationId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(animationId);
	});

	// Derived rotation angles
	let planetRotations = $derived(
		planetAngles.map((_, i) => carrierAngle * (1 + ratioSunPlanet) - sunAngle * ratioSunPlanet + meshOffsets[i])
	);
	let ringAngle = $derived(carrierAngle * (1 + ratioSunRing) - sunAngle * ratioSunRing + ringMeshOffset);

	// --- Slider display limits ---
	const ringMin = -2.5, ringMax = 15;

	// Ring speed from store (derived)
	let ringSpeed = $derived(gears.ringSpeed);

	// Connector line / slider layout — must match CSS pixel values
	const sliderH = 200;
	const thumbR = 10;
	const trackH = sliderH - 2 * thumbR;
	const colW = 50;
	const colGap = 12;
	const labelH = 24;
	const connectorW = 3 * colW + 2 * colGap;
	const carrier_x = colW / 2;
	const sun_x = colW + colGap + colW / 2;
	const ring_x = 2 * (colW + colGap) + colW / 2;

	// Thumb Y positions for connector line (from top of slider, in px)
	let sunThumbY = $derived((sunMax - gears.sunSpeed) / (sunMax - sunMin) * trackH + thumbR);
	let carrierThumbY = $derived((carrierMax - gears.carrierSpeed) / (carrierMax - carrierMin) * trackH + thumbR);
	let ringThumbY = $derived((ringMax - ringSpeed) / (ringMax - ringMin) * trackH + thumbR);

	// --- Tooltip / popup -----------------------
	type GearId = 'sun' | 'carrier' | 'ring';
	let hoveredGear = $state<GearId | null>(null);
	let touchMode = false;
	let isTouchDevice = false;
	let popupEl = $state<HTMLDivElement | null>(null);
	let diagramEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!popupEl || !diagramEl) return;
		const parentRect = diagramEl.getBoundingClientRect();
		const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const gapPx = remPx * 0.75; // 0.75rem gap between diagram edge and popup
		const popupW = popupEl.offsetWidth;
		const borderRight = parseFloat(getComputedStyle(popupEl).borderRightWidth);
		const availableRight = window.innerWidth - remPx - parentRect.right;

		if (availableRight >= popupW + borderRight + gapPx) {
			popupEl.style.left = `${parentRect.width + gapPx}px`;
			popupEl.style.top = '1rem';
		} else {
			popupEl.style.left = '0px';
			popupEl.style.top = `${parentRect.height + gapPx}px`;
		}
	});

	const gearInfo: Record<GearId, { title: string; color: string; body: string, note?: string }> = $derived({
		sun: {
			title: i18n.t('gearsSvg.sunTitle'),
			color: 'var(--gear-sun)',
			body: i18n.t('gearsSvg.sunBody'),
			note: i18n.t('gearsSvg.sunNote')
		},
		carrier: {
			title: i18n.t('gearsSvg.carrierTitle'),
			color: 'var(--gear-planet)',
			body: i18n.t('gearsSvg.carrierBody'),
			note: i18n.t('gearsSvg.carrierNote')
		},
		ring: {
			title: i18n.t('gearsSvg.ringTitle'),
			color: 'var(--gear-ring)',
			body: i18n.t('gearsSvg.ringBody'),
			note: i18n.t('gearsSvg.ringNote')
		}
	});

	let leaveTimer: ReturnType<typeof setTimeout> | null = null;

	function onGearEnter(gear: GearId) {
		if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
		if (!isTouchDevice && !touchMode) hoveredGear = gear;
	}
	function onGearLeave(_gear: GearId) {
		if (isTouchDevice || touchMode) return;
		leaveTimer = setTimeout(() => { hoveredGear = null; leaveTimer = null; }, 80);
	}
	function onGearClick(gear: GearId, e: MouseEvent) {
		e.stopPropagation();
		if (!isTouchDevice) touchMode = true;
		hoveredGear = hoveredGear === gear ? null : gear;
	}

	onMount(() => {
		isTouchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
		function onDocClick() { hoveredGear = null; touchMode = false; }
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
	let svgShownExplanations = $state(false);

</script>

<div class="gears-svg">
	<div class="whole-diagram-wrapper">
		<div class="controls">
			<div class="sliders-area">
				<svg
					class="thumb-connector"
					width={connectorW}
					height={sliderH}
					style="top: {labelH}px"
				>
					<line x1={carrier_x} y1={carrierThumbY} x2={sun_x} y2={sunThumbY} class="connector-line" />
					<line x1={sun_x} y1={sunThumbY} x2={ring_x} y2={ringThumbY} class="connector-line connector-line-ring" />
				</svg>
				<!-- Porte-satellite -->
				<div class="slider-col">
					<span class="slider-label">ICE</span>
					<div class="slider-wrapper planet" style="--zero-pct: {carrierMax / (carrierMax - carrierMin) * 100}">
						<input type="range" bind:value={gears.carrierSpeed} min={carrierMin} max={carrierMax} step="0.1" />
						<div class="zero-indicator"></div>
					</div>
					<strong>{gears.carrierSpeed * RPM_FACTOR}</strong>
				</div>
				<!-- Soleil -->
				<div class="slider-col">
					<span class="slider-label">MG1</span>
					<div class="slider-wrapper sun" style="--zero-pct: {sunMax / (sunMax - sunMin) * 100}">
						<input type="range" bind:value={gears.sunSpeed} min={sunMin} max={sunMax} step="0.1" />
						<div class="zero-indicator"></div>
					</div>
					<strong>{gears.sunSpeed * RPM_FACTOR}</strong>
				</div>
				<!-- Couronne (lecture seule) -->
				<div class="slider-col ring-col">
					<span class="slider-label">MG2</span>
					<div class="slider-wrapper ring" style="--zero-pct: {ringMax / (ringMax - ringMin) * 100}">
						<input type="range" disabled value={ringSpeed} min={ringMin} max={ringMax} step="0.1" />
						<div class="zero-indicator"></div>
					</div>
					<strong>{Math.round(ringSpeed * RPM_FACTOR)}</strong>
				</div>
			</div>
			<p class="hint">{i18n.t('gearsSvg.negativeHint')}</p>
		</div>

	
		<div class="diagram-area" bind:this={diagramEl}>
			<svg class="gear-diagram" viewBox="0 0 {svgSize} {svgSize}" width={svgSize} height={svgSize}>
				<!-- Ring gear -->
				<g transform="translate({cx}, {cy}) rotate({ringAngle})"
					class="gear-interactive" class:gear-highlighted={hoveredGear === 'ring'}
					onmouseenter={() => onGearEnter('ring')}
					onmouseleave={() => onGearLeave('ring')}
					onclick={(e) => onGearClick('ring', e)}
					onkeydown={(e) => e.key === 'Enter' && onGearClick('ring', e as unknown as MouseEvent)}
					role="button" tabindex="0" aria-label={i18n.t('gearsSvg.ringAria')}>
					<path d={ringPath} class="gear ring" fill-rule="evenodd" />
					<circle r={ringOuterR} fill="transparent" />
					<g transform="rotate({ringGapAngle})">
						<rect
							x={-ringBarW / 2}
							y={-ringOuterR}
							width={ringBarW}
							height={ringOuterR - RfRing}
							class="indicator"
						/>
					</g>
				</g>
				
				<!-- Carrier (porte-satellite) -->
				<g transform="translate({cx}, {cy}) rotate({carrierAngle})"
					class="gear-interactive" class:gear-highlighted={hoveredGear === 'carrier'}
					onmouseenter={() => onGearEnter('carrier')}
					onmouseleave={() => onGearLeave('carrier')}
					onclick={(e) => onGearClick('carrier', e)}
					onkeydown={(e) => e.key === 'Enter' && onGearClick('carrier', e as unknown as MouseEvent)}
					role="button" tabindex="0" aria-label={i18n.t('gearsSvg.carrierAria')}>
					<path d={carrierAnnulusPath} class="gear carrier" fill-rule="evenodd" />
					<circle r={carrierOuterR} fill="transparent" />
					<!-- Indicator placed at 45° = midway between planet 0 (0°) and planet 1 (90°) -->
					<g transform="rotate(45)">
						<rect
							x={-carrierBarW / 2}
							y={-carrierOuterR}
							width={carrierBarW}
							height={carrierRingW}
							class="indicator carrier-indicator"
						/>
					</g>
				</g>
				
				<!-- Planets (part of ICE / carrier) -->
				{#each planetAngles as φ, i}
				{@const rad = ((φ + carrierAngle) * Math.PI) / 180}
				{@const px = cx + centerDist * Math.cos(rad)}
				{@const py = cy + centerDist * Math.sin(rad)}
				<g transform="translate({px}, {py}) rotate({planetRotations[i]})"
					class="gear-interactive" class:gear-highlighted={hoveredGear === 'carrier'}
					onmouseenter={() => onGearEnter('carrier')}
					onmouseleave={() => onGearLeave('carrier')}
					onclick={(e) => onGearClick('carrier', e)}
					onkeydown={(e) => e.key === 'Enter' && onGearClick('carrier', e as unknown as MouseEvent)}
					role="button" tabindex="-1" aria-label={i18n.t('gearsSvg.planetAria')}>
					<path d={planetPath} class="gear planet" />
					<circle r={RaPlanet} fill="transparent" />
					<circle r={planetHub} class="hub" />
					<g transform="rotate({planetGapAngle})">
						<rect
								x={-planetBarW / 2}
								y={-RfPlanet}
								width={planetBarW}
								height={RfPlanet - planetHub}
								class="indicator"
							/>
						</g>
					</g>
					{/each}
					
					<!-- Sun gear (center) -->
					<g transform="translate({cx}, {cy}) rotate({sunAngle})"
						class="gear-interactive" class:gear-highlighted={hoveredGear === 'sun'}
						onmouseenter={() => onGearEnter('sun')}
						onmouseleave={() => onGearLeave('sun')}
						onclick={(e) => onGearClick('sun', e)}
						onkeydown={(e) => e.key === 'Enter' && onGearClick('sun', e as unknown as MouseEvent)}
						role="button" tabindex="0" aria-label={i18n.t('gearsSvg.sunAria')}>
						<path d={sunPath} class="gear sun" />
						<circle r={RaSun} fill="transparent" />
						<circle r={sunHub} class="hub" />
						<g transform="rotate({sunGapAngle})">
							<rect
							x={-sunBarW / 2}
							y={-RfSun}
							width={sunBarW}
							height={RfSun - sunHub}
							class="indicator"
						/>
					</g>
				</g>
			</svg>

			{#if hoveredGear}
				<div class="gear-popup" bind:this={popupEl} style="--popup-color: {gearInfo[hoveredGear].color}">
					<strong>{gearInfo[hoveredGear].title}</strong>
					<p>{@html gearInfo[hoveredGear].body}</p>
					{#if gearInfo[hoveredGear].note}
						<p class="note">{@html gearInfo[hoveredGear].note}</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class="explanations-wrapper">
		<button class="toggle-explanations" onclick={() => svgShownExplanations = !svgShownExplanations}>
			{svgShownExplanations ? '▲' : '▼'} {i18n.t('gearsSvg.showExplanations')}
		</button>
		{#if svgShownExplanations}
			<div class="explanations">
				{#each (['carrier', 'sun', 'ring'] as const) as gear}
					<div class="explanation-card" style="--popup-color: {gearInfo[gear].color}">
						<strong>{gearInfo[gear].title}</strong>
						<p>{@html gearInfo[gear].body}</p>
						{#if gearInfo[gear].note}
							<p class="note">{@html gearInfo[gear].note}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* CSS refactorisé : nesting appliqué */

	.gears-svg {
		display: flex;
		flex-direction: column;
		align-items: center;

		/* --- Layout -------------------------------- */
		.whole-diagram-wrapper {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: 1.5rem;
			padding: 1.25rem;
			border-radius: 24px;
			width: max-content;

			/* --- Controls (sliders) ---------------- */
			.controls {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 1rem;
				flex-shrink: 0;

				.sliders-area {
					display: flex;
					flex-direction: row;
					gap: 12px; /* = colGap in script */
					position: relative;
					align-items: flex-start;

					.thumb-connector {
						position: absolute;
						left: 0;
						pointer-events: none;
						z-index: 5;

						.connector-line {
							stroke: var(--color-text-secondary);
							stroke-width: 2;
							stroke-linecap: round;
							opacity: 0.6;
						}

						.connector-line-ring {
							stroke-dasharray: 4 3;
							opacity: 0.35;
						}
					}

					.slider-col {
						display: flex;
						flex-direction: column;
						align-items: center;
						gap: 4px;
						width: 50px; /* = colW in script */

						strong {
							font-size: 0.8rem;
							color: var(--color-text);
							text-align: center;
						}

						.slider-label {
							font-size: 0.7rem;
							color: var(--color-text-secondary);
							text-align: center;
							height: 24px; /* = labelH in script */
							line-height: 24px;
							white-space: nowrap;
						}

						.slider-wrapper {
							position: relative;
							width: 20px;
							height: 200px; /* = sliderH in script */
							display: flex;
							align-items: center;
							justify-content: center;
							overflow: visible;

							&.sun { accent-color: var(--gear-sun); }
							&.planet { accent-color: var(--gear-planet); }
							&.ring { accent-color: var(--gear-ring); }

							input[type='range'] {
								writing-mode: vertical-lr;
								direction: rtl;
								width: 20px;
								height: 200px; /* = sliderH in script */
								margin: 0;
								cursor: pointer;
							}

							.zero-indicator {
								position: absolute;
								top: calc(var(--zero-pct) * (200px - 20px) / 100 + 10px);
								left: 50%;
								transform: translateX(-50%) translateY(-50%);
								width: 18px;
								height: 3px;
								background-color: var(--color-text-secondary);
								opacity: 0.8;
								pointer-events: none;
								border-radius: 1px;
								z-index: 10;
							}
						}

						&.ring-col .slider-wrapper input[type='range']:disabled {
							accent-color: var(--gear-ring);
							cursor: default;
							opacity: 0.7;
						}
					}
				}

				.hint {
					font-size: 0.8rem;
					color: var(--color-text-secondary);
				}
			}

			/* --- SVG diagram and indicators -------- */
			.diagram-area {
				position: relative;
				flex-shrink: 0;
				width: fit-content;

				.gear-diagram {
					max-width: 100%;
					height: auto;
					display: block;
				}

				.gear {
					stroke: var(--color-text);
					stroke-width: 1.5;

					&.sun { fill: var(--gear-sun); }
					&.planet { fill: var(--gear-planet); }
					&.ring {
						fill: var(--gear-ring);
						stroke: var(--color-text);
						stroke-width: 1;
					}
					&.carrier {
						fill: var(--gear-carrier);
						opacity: 0.4;
					}
				}

				.hub {
					fill: var(--color-bg-secondary);
					stroke: var(--color-text);
					stroke-width: 2;
				}

				.indicator {
					fill: var(--indicator-fill);
					opacity: 0.9;

					&.carrier-indicator {
						fill: var(--indicator-carrier);
						opacity: 0.8;
					}
				}

				/* --- Gear popup / tooltip ---------- */
				.gear-interactive {
					cursor: pointer;
				}

				.gear-highlighted {
					path,
					circle:not([fill='transparent']) {
						filter: brightness(1.15);
					}
				}

				.gear-popup {
					position: absolute;
					top: 1rem;
					left: 0;
					width: 260px;
					padding: 8px;
					background: var(--win95-surface);
					border: 2px solid var(--popup-color);
					box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
					color: var(--color-text);
					animation: popup-in 0.15s ease;
					z-index: 20;
					pointer-events: none;

					strong {
						display: block;
						margin-bottom: 0.5rem;
						font-size: 0.95rem;
						color: var(--popup-color);
					}

					p {
						font-size: 0.82rem;
						line-height: 1.5;
						color: var(--color-text-secondary);
						margin: 0 0 0.4rem;
					}

					@media (max-width: 900px) {
						position: static;
						width: auto;
						margin-top: 0.75rem;
						align-self: stretch;
					}
				}

				@media (max-width: 900px) {
					display: flex;
					flex-direction: column;
				}
			}
		}

		/* --- Explanations ----------------------- */
		.explanations-wrapper {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			.toggle-explanations {
				border: none;
				cursor: pointer;
				font-size: 0.78rem;
				color: var(--color-text-secondary);
				opacity: 0.92;
				padding: 0.45rem 0.8rem;
				border-radius: 999px;
				background: none;
				transition: opacity 0.15s, border-color 0.15s;

				&:hover {
					opacity: 1;
					border-color: var(--color-primary);
				}
			}

			.explanations {
				display: flex;
				flex-wrap: wrap;
				gap: 1rem;
				justify-content: center;
				max-width: 860px;

				.explanation-card {
					width: 260px;
					padding: 8px;
					background: var(--win95-surface);
					border-left: 3px solid var(--popup-color);
					border: 2px solid;
					border-color: var(--win95-border-light) var(--win95-border-darkest) var(--win95-border-darkest) var(--win95-border-light);
					box-shadow: inset 1px 1px 0 var(--win95-border-mid), inset -1px -1px 0 var(--win95-border-dark);

					strong {
						display: block;
						margin-bottom: 0.4rem;
						font-size: 0.9rem;
						color: var(--popup-color);
					}

					p {
						font-size: 0.8rem;
						line-height: 1.5;
						color: var(--color-text-secondary);
						margin: 0;
					}
				}
			}
		}
	}
</style>
