/**
 * Average colour of an icon, used for the Win7 taskbar hover glow: the Superbar tints the
 * bloom under a button with the dominant colour of that program's icon.
 *
 * Grey and near-transparent pixels are discarded, and each remaining pixel is weighted by
 * saturation — otherwise the white/grey chrome most icons carry drags every result to beige.
 */

const cache = new Map<string, string>();

const SAMPLE = 24;
const MIN_ALPHA = 128;
const MIN_SATURATION = 0.15;

export function dominantColor(img: HTMLImageElement): string | null {
	const key = img.currentSrc || img.src;
	const hit = cache.get(key);
	if (hit) return hit;

	const canvas = document.createElement('canvas');
	canvas.width = SAMPLE;
	canvas.height = SAMPLE;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return null;

	let data: Uint8ClampedArray;
	try {
		ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
		data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
	} catch {
		// Tainted canvas (shouldn't happen for bundled assets, but don't take the page down)
		return null;
	}

	let r = 0, g = 0, b = 0, total = 0;
	for (let i = 0; i < data.length; i += 4) {
		const [pr, pg, pb, pa] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
		if (pa < MIN_ALPHA) continue;

		const max = Math.max(pr, pg, pb);
		const min = Math.min(pr, pg, pb);
		const saturation = max === 0 ? 0 : (max - min) / max;
		if (saturation < MIN_SATURATION) continue;

		const weight = saturation;
		r += pr * weight;
		g += pg * weight;
		b += pb * weight;
		total += weight;
	}

	// Nothing colourful in the icon — let the caller fall back to the default blue glow
	if (total === 0) return null;

	// Push towards the light, luminous end: the glow is a bloom, not a paint sample
	const lift = (c: number) => Math.round(Math.min(255, c / total + 60));
	const color = `rgb(${lift(r)} ${lift(g)} ${lift(b)})`;
	cache.set(key, color);
	return color;
}
