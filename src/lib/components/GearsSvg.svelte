<script lang="ts">
	import { onMount } from 'svelte';

	let speed = $state(1);
	let carrierSpeed = $state(0);
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
			sunAngle += speed * 60 * dt;
			carrierAngle += carrierSpeed * 60 * dt;
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
</script>

<div class="gears-svg">
	<h2>Train Épicycloïdal — SVG</h2>

	<svg viewBox="0 0 {svgSize} {svgSize}" width={svgSize} height={svgSize}>
		<!-- Ring gear (drawn first, behind everything) -->
		<g transform="translate({cx}, {cy}) rotate({ringAngle})">
			<path d={ringPath} class="gear ring" fill-rule="evenodd" />
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
		<g transform="translate({cx}, {cy}) rotate({carrierAngle})">
			<path d={carrierAnnulusPath} class="gear carrier" fill-rule="evenodd" />
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

		<!-- Planets -->
		{#each planetAngles as φ, i}
			{@const rad = ((φ + carrierAngle) * Math.PI) / 180}
			{@const px = cx + centerDist * Math.cos(rad)}
			{@const py = cy + centerDist * Math.sin(rad)}
			<g transform="translate({px}, {py}) rotate({planetRotations[i]})">
				<path d={planetPath} class="gear planet" />
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
		<g transform="translate({cx}, {cy}) rotate({sunAngle})">
			<path d={sunPath} class="gear sun" />
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

	<div class="controls">
		<label>
			Vitesse soleil : <strong>{speed.toFixed(1)}</strong>
			<div class="slider-wrapper" style="--zero-pct: {((0 - (-5)) / (30 - (-5))) * 100}">
				<input type="range" bind:value={speed} min="-5" max="30" step="0.1" />
				<div class="zero-indicator"></div>
			</div>
		</label>
		<label>
			Vitesse porte-satellite : <strong>{carrierSpeed.toFixed(1)}</strong>
			<div class="slider-wrapper" style="--zero-pct: {((0 - (-5)) / (30 - (-5))) * 100}">
				<input type="range" bind:value={carrierSpeed} min="-5" max="30" step="0.1" />
				<div class="zero-indicator"></div>
			</div>
		</label>
		<p class="hint">Valeurs négatives = rotation inversée</p>
	</div>
</div>

<style>
	.gears-svg {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem 1rem;
	}

	h2 {
		color: var(--color-text);
		font-size: 1.4rem;
	}

	svg {
		max-width: 100%;
		height: auto;
	}

	.gear {
		stroke: var(--color-text);
		stroke-width: 1.5;
	}

	.gear.sun {
		fill: var(--gear-sun);
	}

	.gear.planet {
		fill: var(--gear-planet);
	}

	.gear.ring {
		fill: var(--gear-ring);
		stroke: var(--color-text);
		stroke-width: 1;
	}

	.hub {
		fill: var(--color-bg-secondary);
		stroke: var(--color-text);
		stroke-width: 2;
	}

	.indicator {
		fill: var(--indicator-fill);
		opacity: 0.9;
	}

	.gear.carrier {
		fill: var(--gear-carrier);
		opacity: 0.4;
	}

	.indicator.carrier-indicator {
		fill: var(--indicator-carrier);
		opacity: 0.8;
	}

	.controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1rem;
		color: var(--color-text);
	}

	.slider-wrapper {
		position: relative;
		width: 220px;
		height: 24px;
		display: flex;
		align-items: center;
		overflow: visible;
	}

	.slider-wrapper input[type='range'] {
		width: 100%;
		accent-color: var(--color-primary);
		margin: 0;
	}

	.zero-indicator {
		position: absolute;
		left: calc((var(--zero-pct) * (220px - 20px) / 100) + 10px);
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
		width: 3px;
		height: 18px;
		background-color: var(--color-text-secondary);
		opacity: 0.8;
		pointer-events: none;
		border-radius: 1px;
		z-index: 10;
	}

	.hint {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}
</style>
