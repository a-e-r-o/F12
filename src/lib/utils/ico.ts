/**
 * Pure TypeScript ICO encoder.
 * Packs one or more PNG images (already resized) into a single .ico file.
 *
 * ICO format reference:
 *   ICONDIR (6 bytes) + ICONDIRENTRY[] (16 bytes each) + image data (raw PNG blobs)
 */

/** Resize a source image (from an HTMLImageElement) to a square canvas of the given size and return the PNG blob. */
export function resizeToPngBlob(img: HTMLImageElement, size: number): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, 0, 0, size, size);
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error('Canvas toBlob failed'));
		}, 'image/png');
	});
}

/** Load an image element from a File or Blob. */
export function loadImage(source: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(source);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};
		img.src = url;
	});
}

/**
 * Build a multi-size .ico Blob from an array of PNG blobs.
 * Each blob must already be the correct square size.
 * `sizes` must correspond 1:1 with `pngBlobs`.
 */
export async function buildIco(pngBlobs: Blob[], sizes: number[]): Promise<Blob> {
	const count = pngBlobs.length;
	const pngBuffers = await Promise.all(pngBlobs.map((b) => b.arrayBuffer()));

	// ICONDIR: 6 bytes, each ICONDIRENTRY: 16 bytes
	const headerSize = 6 + count * 16;
	let dataOffset = headerSize;

	// Build the directory entries
	const entries: ArrayBuffer[] = [];
	for (let i = 0; i < count; i++) {
		const entry = new ArrayBuffer(16);
		const view = new DataView(entry);
		// bWidth / bHeight: 0 means 256
		const dim = sizes[i] >= 256 ? 0 : sizes[i];
		view.setUint8(0, dim); // width
		view.setUint8(1, dim); // height
		view.setUint8(2, 0); // color palette count
		view.setUint8(3, 0); // reserved
		view.setUint16(4, 1, true); // color planes
		view.setUint16(6, 32, true); // bits per pixel
		view.setUint32(8, pngBuffers[i].byteLength, true); // image size
		view.setUint32(12, dataOffset, true); // offset to image data
		dataOffset += pngBuffers[i].byteLength;
		entries.push(entry);
	}

	// ICONDIR header
	const header = new ArrayBuffer(6);
	const hView = new DataView(header);
	hView.setUint16(0, 0, true); // reserved
	hView.setUint16(2, 1, true); // type: 1 = ICO
	hView.setUint16(4, count, true); // image count

	return new Blob([header, ...entries, ...pngBuffers], { type: 'image/x-icon' });
}

/** All standard sizes available for an ICO file. */
export const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256] as const;
