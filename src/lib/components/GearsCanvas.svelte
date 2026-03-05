<script lang="ts">
	import { onMount } from 'svelte';

	let speed = $state(1);
	let canvas: HTMLCanvasElement;

	const TEETH = 12;
	const OUTER_R = 80;
	const INNER_R = 60;
	const CENTER_R = 20;
	const TOOTH_TOP_W = 0.2;
	const TOOTH_BOTTOM_W = 0.3;
	const pitchR = (OUTER_R + INNER_R) / 2;
	const gearGap = pitchR * 2;
	const meshOffset = Math.PI / TEETH; // half tooth in radians

	function drawGear(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		angle: number,
		fillColor: string,
		strokeColor: string
	) {
		const step = (Math.PI * 2) / TEETH;

		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(angle);

		// Gear body
		ctx.beginPath();
		for (let i = 0; i < TEETH; i++) {
			const a = i * step;
			const bw = step * TOOTH_BOTTOM_W;
			const tw = step * TOOTH_TOP_W;

			if (i === 0) {
				ctx.moveTo(
					INNER_R * Math.cos(a - bw),
					INNER_R * Math.sin(a - bw)
				);
			} else {
				ctx.lineTo(
					INNER_R * Math.cos(a - bw),
					INNER_R * Math.sin(a - bw)
				);
			}
			ctx.lineTo(OUTER_R * Math.cos(a - tw), OUTER_R * Math.sin(a - tw));
			ctx.lineTo(OUTER_R * Math.cos(a + tw), OUTER_R * Math.sin(a + tw));
			ctx.lineTo(INNER_R * Math.cos(a + bw), INNER_R * Math.sin(a + bw));
		}
		ctx.closePath();

		ctx.globalAlpha = 0.85;
		ctx.fillStyle = fillColor;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// Center hole
		ctx.beginPath();
		ctx.arc(0, 0, CENTER_R, 0, Math.PI * 2);
		ctx.fillStyle = getComputedStyle(canvas).getPropertyValue('--gear-bg') || '#f4f4f5';
		ctx.fill();
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = 2;
		ctx.stroke();

		// Axis indicator line
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, -(INNER_R - 5));
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.restore();
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const dpr = window.devicePixelRatio || 1;

		// HiDPI support
		const w = 440;
		const h = 400;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = `${w}px`;
		canvas.style.height = `${h}px`;
		ctx.scale(dpr, dpr);

		const leftCx = w / 2 - gearGap / 2;
		const leftCy = 180;
		const rightCx = w / 2 + gearGap / 2;
		const rightCy = 180;

		let angle = 0;
		let last = performance.now();
		let animId: number;

		function getColors() {
			const style = getComputedStyle(document.documentElement);
			return {
				primary: style.getPropertyValue('--color-primary').trim() || '#ff3e00',
				primaryHover: style.getPropertyValue('--color-primary-hover').trim() || '#cc3200',
				text: style.getPropertyValue('--color-text').trim() || '#1a1a2e',
				textSecondary: style.getPropertyValue('--color-text-secondary').trim() || '#555566',
				bg: style.getPropertyValue('--color-bg').trim() || '#ffffff',
				bgSecondary: style.getPropertyValue('--color-bg-secondary').trim() || '#f4f4f5'
			};
		}

		function frame(now: number) {
			const dt = (now - last) / 1000;
			last = now;
			angle += speed * 60 * dt * (Math.PI / 180);

			const c = getColors();

			// Clear
			ctx.clearRect(0, 0, w, h);

			// Draw left gear (opposite direction)
			drawGear(ctx, leftCx, leftCy, -angle + meshOffset, c.primary, c.text);

			// Draw right gear (driver)
			drawGear(ctx, rightCx, rightCy, angle, c.primaryHover, c.text);

			// Labels
			ctx.fillStyle = c.textSecondary;
			ctx.font = '14px system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('Engrenage gauche (entraîné)', leftCx, leftCy + OUTER_R + 30);
			ctx.fillText('Engrenage droit (moteur)', rightCx, rightCy + OUTER_R + 30);

			animId = requestAnimationFrame(frame);
		}

		animId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(animId);
	});
</script>

<div class="gears-canvas">
	<h2>Engrenages — Approche Canvas</h2>

	<canvas
		bind:this={canvas}
		style="--gear-bg: var(--color-bg-secondary)"
	></canvas>

	<div class="controls">
		<label>
			Vitesse : <strong>{speed.toFixed(1)}</strong>
			<input type="range" bind:value={speed} min="-3" max="3" step="0.1" />
		</label>
		<p class="hint">Valeurs négatives = rotation inversée</p>
	</div>
</div>

<style>
	.gears-canvas {
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

	canvas {
		max-width: 100%;
		height: auto;
		border-radius: 12px;
		border: 1px solid var(--color-border);
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

	input[type='range'] {
		width: 220px;
		accent-color: var(--color-primary);
	}

	.hint {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}
</style>
