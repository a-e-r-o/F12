<script lang="ts">
	import { onMount } from 'svelte';
	import { gears } from '$lib/stores';

	import bgSrc from '$lib/assets/background.png';
	import layoutSrc from '$lib/assets/layout.png';
	import needleSrc from '$lib/assets/needle.png';
	import arrowTopFwdSrc from '$lib/assets/arrow-top-forward.png';
	import arrowTopBwdSrc from '$lib/assets/arrow-top-backward.png';
	import arrowDownLeftFwdSrc from '$lib/assets/arrow-down-left-forward.png';
	import arrowDownRightBwdSrc from '$lib/assets/arrow-down-right-backward.png';

	let canvas = $state<HTMLCanvasElement | null>(null);
	let animId: number;

	// Background native size
	const W = 1281;
	const H = 819;

	// Needle pivot point (in background pixels)
	const PIVOT_X = 854;
	const PIVOT_Y = 421;

	// The needle image is 270px but the virtual shaft extends further;
	// offset so bottom of needle floats above pivot center
	const NEEDLE_OFFSET = 5;

	// Tachometer mapping is not perfectly linear on the artwork.
	// These anchors are measured from the centers of the major graduations.
	const TACH_ANGLE_BY_RPM = [
		{ rpm: 0, angle: 180 },
		{ rpm: 1000, angle: 215 },
		{ rpm: 2000, angle: 250 },
		{ rpm: 3000, angle: 285 },
		{ rpm: 4000, angle: 320 },
		{ rpm: 5000, angle: 360 },
		{ rpm: 6000, angle: 406 }
	] as const;
	const MAX_RPM = 7000;

	// Speed display position (centered on dial, just above "km/h" text)
	const SPEED_X = 860;
	const SPEED_Y = 292;

	// Arrow positions (center of each arrow image, in bg-pixel coords)
	// Will be refined later — placed approximately for now
	const ARROW_POS = {
		topForward:        { x: 315, y: 358 },  // ICE → Wheels
		topBackward:       { x: 315, y: 358 },  // Wheels → ICE
		downLeftForward:   { x: 230, y: 478 },  // ICE → Battery
		downRightBackward: { x: 395, y: 478 },  // Wheels → Battery
		downRightForward:  { x: 395, y: 478 },  // Battery → Wheels (missing asset → flipped)
	};

	// Energy flow flags (reactive)
	let showIceToWheels = $derived(gears.iceRpm > 100 && gears.mg2Rpm > 100);
	let showIceToBattery = $derived(gears.iceRpm > 100 && gears.mg1Rpm < -100);
	let showWheelsToBattery = $derived(gears.mg2Rpm < -100);
	let showBatteryToWheels = $derived(gears.iceRpm < 100 && gears.mg2Rpm > 100);
	let showWheelsToIce = $derived(false); // placeholder

	function loadImg(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	function drawCentered(
		ctx: CanvasRenderingContext2D,
		img: HTMLImageElement | HTMLCanvasElement,
		x: number, y: number
	) {
		ctx.drawImage(img, x - img.width / 2, y - img.height / 2);
	}

	function getTachAngle(rpm: number): number {
		const clampedRpm = Math.max(0, Math.min(MAX_RPM, rpm));

		for (let index = 1; index < TACH_ANGLE_BY_RPM.length; index += 1) {
			const prev = TACH_ANGLE_BY_RPM[index - 1];
			const next = TACH_ANGLE_BY_RPM[index];

			if (clampedRpm <= next.rpm) {
				const ratio = (clampedRpm - prev.rpm) / (next.rpm - prev.rpm);
				return prev.angle + (next.angle - prev.angle) * ratio;
			}
		}

		return TACH_ANGLE_BY_RPM[TACH_ANGLE_BY_RPM.length - 1].angle;
	}

	// ODO position (right-aligned just before "km" on the background)
	const ODO_X = 939;
	const ODO_Y = 543.4;

	onMount(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;
		let mounted = true;
		let lastTime = performance.now();
		let odoKm = 0;

		Promise.all([
			loadImg(bgSrc),
			loadImg(layoutSrc),
			loadImg(needleSrc),
			loadImg(arrowTopFwdSrc),
			loadImg(arrowTopBwdSrc),
			loadImg(arrowDownLeftFwdSrc),
			loadImg(arrowDownRightBwdSrc),
		]).then(([bg, layout, needle, aTopFwd, aTopBwd, aDownLeftFwd, aDownRightBwd]) => {
			if (!mounted) return;

			// Create missing arrow (battery→wheels) by flipping downRightBackward vertically
			const aDownRightFwd = document.createElement('canvas');
			aDownRightFwd.width = aDownRightBwd.width;
			aDownRightFwd.height = aDownRightBwd.height;
			const fctx = aDownRightFwd.getContext('2d')!;
			fctx.translate(0, aDownRightBwd.height);
			fctx.scale(1, -1);
			fctx.drawImage(aDownRightBwd, 0, 0);

			function draw() {
				const now = performance.now();
				const dtH = (now - lastTime) / 3_600_000; // ms → hours
				lastTime = now;
				odoKm += Math.abs(gears.speedKmh) * dtH;

				ctx.clearRect(0, 0, W, H);

				// 1. Background
				ctx.drawImage(bg, 0, 0, W, H);

				// 2. Energy flow arrows
				if (showIceToWheels)     drawCentered(ctx, aTopFwd,       ARROW_POS.topForward.x,        ARROW_POS.topForward.y);
				if (showWheelsToIce)     drawCentered(ctx, aTopBwd,       ARROW_POS.topBackward.x,       ARROW_POS.topBackward.y);
				if (showIceToBattery)    drawCentered(ctx, aDownLeftFwd,  ARROW_POS.downLeftForward.x,   ARROW_POS.downLeftForward.y);
				if (showWheelsToBattery) drawCentered(ctx, aDownRightBwd, ARROW_POS.downRightBackward.x, ARROW_POS.downRightBackward.y);
				if (showBatteryToWheels) drawCentered(ctx, aDownRightFwd, ARROW_POS.downRightForward.x,  ARROW_POS.downRightForward.y);

				// 3. Needle
				const rpm = Math.max(0, Math.min(MAX_RPM, gears.iceRpm));
				const angleDeg = getTachAngle(rpm);
				const angleRad = (angleDeg * Math.PI) / 180;

				ctx.save();
				ctx.translate(PIVOT_X, PIVOT_Y);
				ctx.rotate(angleRad);
				// Draw needle offset from pivot so tail floats (virtual longer shaft)
				ctx.drawImage(needle, -needle.width / 2, -(needle.height + NEEDLE_OFFSET), needle.width, needle.height);
				ctx.restore();

				// 4. Layout overlay (on top of needle, behind text)
				ctx.drawImage(layout, 695, 327);

				// 5. Speed display (km/h number) with outline
				const speed = Math.abs(gears.speedKmh);
				const isReverse = gears.speedKmh < 0;
				ctx.save();
				ctx.font = 'bold 110px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.lineWidth = 10;
				ctx.strokeStyle = '#000000';
				ctx.lineJoin = 'round';
				ctx.strokeText(String(speed), SPEED_X, SPEED_Y);
				ctx.fillStyle = '#ffffff';
				ctx.fillText(String(speed), SPEED_X, SPEED_Y);
				if (isReverse) {
					ctx.font = 'bold 28px sans-serif';
					ctx.fillStyle = '#ff6666';
					ctx.fillText('R', SPEED_X, SPEED_Y + 68);
				}
				ctx.restore();

				// 6. ODO display with outline
				ctx.save();
				ctx.font = '22px sans-serif';
				ctx.textAlign = 'right';
				ctx.textBaseline = 'middle';
				ctx.lineWidth = 3;
				ctx.strokeStyle = '#000000';
				ctx.lineJoin = 'round';
				ctx.strokeText(odoKm.toFixed(1), ODO_X, ODO_Y);
				ctx.fillStyle = '#ffffff';
				ctx.fillText(odoKm.toFixed(1), ODO_X, ODO_Y);
				ctx.restore();

				animId = requestAnimationFrame(draw);
			}

			animId = requestAnimationFrame(draw);
		});

		return () => { mounted = false; cancelAnimationFrame(animId); };
	});
</script>

<canvas bind:this={canvas} width={W} height={H} class="gauge-canvas"></canvas>

<style>
	.gauge-canvas {
		width: 100%;
		max-width: 640px;
		height: auto;
		border-radius: 0.75rem;
	}
</style>
