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

/** A single image entry extracted from an ICO file. */
export interface IcoEntry {
	width: number;
	height: number;
	blob: Blob;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

/**
 * Parse an ICO file and extract each embedded image as a PNG Blob.
 * BMP entries are rendered to a canvas and re-exported as PNG.
 */
export async function parseIco(file: Blob): Promise<IcoEntry[]> {
	const buf = await file.arrayBuffer();
	const view = new DataView(buf);

	const reserved = view.getUint16(0, true);
	const type = view.getUint16(2, true);
	const count = view.getUint16(4, true);

	if (reserved !== 0 || type !== 1 || count === 0) {
		throw new Error('Not a valid ICO file');
	}

	const entries: IcoEntry[] = [];

	for (let i = 0; i < count; i++) {
		const offset = 6 + i * 16;
		const w = view.getUint8(offset) || 256;
		const h = view.getUint8(offset + 1) || 256;
		const bytesInRes = view.getUint32(offset + 8, true);
		const imageOffset = view.getUint32(offset + 12, true);

		const imageData = new Uint8Array(buf, imageOffset, bytesInRes);

		const isPng = imageData.length >= 4 &&
			imageData[0] === PNG_SIGNATURE[0] &&
			imageData[1] === PNG_SIGNATURE[1] &&
			imageData[2] === PNG_SIGNATURE[2] &&
			imageData[3] === PNG_SIGNATURE[3];

		if (isPng) {
			entries.push({ width: w, height: h, blob: new Blob([imageData], { type: 'image/png' }) });
		} else {
			// DIB data inside ICO (no BITMAPFILEHEADER) — decode manually
			const dibView = new DataView(imageData.buffer, imageData.byteOffset, imageData.byteLength);
			const bpp = dibView.getUint16(14, true); // biBitCount
			// biHeight in ICO DIBs is doubled (XOR + AND mask), real height is h from directory
			const realW = w;
			const realH = h;

			const canvas = document.createElement('canvas');
			canvas.width = realW;
			canvas.height = realH;
			const ctx = canvas.getContext('2d')!;
			const imgData = ctx.createImageData(realW, realH);

			if (bpp === 32) {
				// 32-bit BGRA — pixel data starts after 40-byte BITMAPINFOHEADER
				const pixelOffset = 40;
				const stride = realW * 4;
				for (let y = 0; y < realH; y++) {
					// DIB rows are bottom-up
					const srcRow = (realH - 1 - y) * stride + pixelOffset;
					const dstRow = y * realW * 4;
					for (let x = 0; x < realW; x++) {
						const si = srcRow + x * 4;
						const di = dstRow + x * 4;
						imgData.data[di] = imageData[si + 2];     // R ← B
						imgData.data[di + 1] = imageData[si + 1]; // G
						imgData.data[di + 2] = imageData[si];     // B ← R
						imgData.data[di + 3] = imageData[si + 3]; // A
					}
				}
			} else if (bpp === 24) {
				const headerSize = dibView.getUint32(0, true);
				const pixelOffset = headerSize;
				const rowBytes = Math.ceil((realW * 3) / 4) * 4; // rows padded to 4 bytes
				for (let y = 0; y < realH; y++) {
					const srcRow = (realH - 1 - y) * rowBytes + pixelOffset;
					const dstRow = y * realW * 4;
					for (let x = 0; x < realW; x++) {
						const si = srcRow + x * 3;
						const di = dstRow + x * 4;
						imgData.data[di] = imageData[si + 2];
						imgData.data[di + 1] = imageData[si + 1];
						imgData.data[di + 2] = imageData[si];
						imgData.data[di + 3] = 255;
					}
				}
			} else {
				// Unsupported bpp — skip this entry
				continue;
			}

			ctx.putImageData(imgData, 0, 0);
			const pngBlob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('DIB to PNG failed'))), 'image/png');
			});
			entries.push({ width: realW, height: realH, blob: pngBlob });
		}
	}

	return entries.sort((a, b) => a.width - b.width);
}
