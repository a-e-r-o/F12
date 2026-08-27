<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { createVisibility } from '$lib/utils/windowActive.svelte';
	import { CONWAY, clear, createGrid, get, population, randomise, resize, set, step, type Grid, type Rule } from './life';

	let { rule = CONWAY, onBack }: { rule?: Rule; onBack: () => void } = $props();

	const CELL_PX = 12;
	const MIN_COLS = 20;
	const MIN_ROWS = 14;

	let canvas = $state<HTMLCanvasElement | null>(null);
	let frame = $state<HTMLDivElement | null>(null);

	/**
	 * The grid is deliberately *not* `$state`: Svelte would proxy the object holding the cell
	 * buffer, and a proxy on the hot path of a per-frame simulation is pure overhead. Redraws
	 * are requested explicitly instead, by bumping `version`.
	 */
	let grid: Grid = createGrid(56, 34);
	// Annotated rather than inferred: `new Uint8Array(n)` narrows to Uint8Array<ArrayBuffer>,
	// which then refuses to be swapped with the buffer coming back out of the grid.
	let scratch: Uint8Array = new Uint8Array(grid.cells.length);
	let version = $state(0);

	function invalidate() {
		version += 1;
	}

	let running = $state(true);
	/** Generations per second */
	let speed = $state(8);
	let generation = $state(0);
	let alive = $derived.by(() => {
		version;
		return population(grid);
	});

	const onScreen = createVisibility();
	$effect(() => (frame ? onScreen.observe(frame) : undefined));

	/* ── Rendering ──────────────────────────────────────────────── */

	function draw() {
		const el = canvas;
		if (!el) return;
		const ctx = el.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const w = grid.cols * CELL_PX;
		const h = grid.rows * CELL_PX;

		if (el.width !== w * dpr || el.height !== h * dpr) {
			el.width = w * dpr;
			el.height = h * dpr;
			el.style.width = `${w}px`;
			el.style.height = `${h}px`;
		}
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.fillStyle = '#f4f6f8';
		ctx.fillRect(0, 0, w, h);

		// Live cells, inset by a hair so the grid lines stay visible between them
		ctx.fillStyle = '#1f3b57';
		for (let row = 0; row < grid.rows; row++) {
			for (let col = 0; col < grid.cols; col++) {
				if (grid.cells[row * grid.cols + col]) {
					ctx.fillRect(col * CELL_PX, row * CELL_PX, CELL_PX - 1, CELL_PX - 1);
				}
			}
		}

		ctx.strokeStyle = '#d9dfe5';
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let col = 0; col <= grid.cols; col++) {
			ctx.moveTo(col * CELL_PX + 0.5, 0);
			ctx.lineTo(col * CELL_PX + 0.5, h);
		}
		for (let row = 0; row <= grid.rows; row++) {
			ctx.moveTo(0, row * CELL_PX + 0.5);
			ctx.lineTo(w, row * CELL_PX + 0.5);
		}
		ctx.stroke();
	}

	// Redraw on every explicit invalidation (paint, generation, clear, resize)
	$effect(() => {
		version;
		draw();
	});

	/* ── Simulation loop ────────────────────────────────────────── */

	function advance() {
		if (scratch.length !== grid.cells.length) scratch = new Uint8Array(grid.cells.length);
		step(grid, scratch, rule);
		// Swap the buffers rather than allocating a new one every generation
		const previous = grid.cells;
		grid.cells = scratch;
		scratch = previous;
		generation += 1;
		invalidate();
	}

	$effect(() => {
		if (!running || !onScreen.value) return;

		const interval = 1000 / speed;
		/** Generations we are willing to run in a single frame to catch up */
		const MAX_CATCHUP = 4;

		let last = performance.now();
		let id = requestAnimationFrame(function tick(now) {
			// Accumulate rather than stepping once per frame: the slider sets generations per
			// second, which must not depend on the display's refresh rate.
			const elapsed = now - last;
			if (elapsed >= interval) {
				const owed = Math.floor(elapsed / interval);
				const steps = Math.min(owed, MAX_CATCHUP);
				for (let i = 0; i < steps; i++) advance();

				// If we're further behind than we're willing to catch up — a backgrounded tab
				// suspends rAF for seconds — drop the backlog instead of carrying it. Advancing
				// `last` by the steps we ran would leave the debt in place and make the next
				// frames run flat out until they caught up.
				last = owed > MAX_CATCHUP ? now : last + steps * interval;
			}
			id = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(id);
	});

	/* ── Painting ───────────────────────────────────────────────── */

	let paintValue: 0 | 1 = 1;
	let lastCell: { col: number; row: number } | null = null;

	function cellAt(e: PointerEvent): { col: number; row: number } | null {
		const el = canvas;
		if (!el) return null;
		const rect = el.getBoundingClientRect();
		const col = Math.floor(((e.clientX - rect.left) / rect.width) * grid.cols);
		const row = Math.floor(((e.clientY - rect.top) / rect.height) * grid.rows);
		if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return null;
		return { col, row };
	}

	/**
	 * Fill every cell between two points. A fast drag only fires a handful of pointermove
	 * events, so without this you get a dotted line instead of a stroke.
	 */
	function paintLine(from: { col: number; row: number }, to: { col: number; row: number }) {
		let { col: x0, row: y0 } = from;
		const { col: x1, row: y1 } = to;
		const dx = Math.abs(x1 - x0);
		const dy = -Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx + dy;

		for (;;) {
			set(grid, x0, y0, paintValue);
			if (x0 === x1 && y0 === y1) break;
			const e2 = 2 * err;
			if (e2 >= dy) { err += dy; x0 += sx; }
			if (e2 <= dx) { err += dx; y0 += sy; }
		}
		invalidate();
	}

	function onPointerDown(e: PointerEvent) {
		const cell = cellAt(e);
		if (!cell) return;
		e.preventDefault();
		capture(e.pointerId);

		// Paint-style: the first cell decides whether this gesture draws or erases, so
		// dragging across a live area doesn't flicker cells on and off.
		paintValue = get(grid, cell.col, cell.row) ? 0 : 1;
		lastCell = cell;
		set(grid, cell.col, cell.row, paintValue);
		invalidate();
	}

	function onPointerMove(e: PointerEvent) {
		if (lastCell === null) return;
		const cell = cellAt(e);
		if (!cell || (cell.col === lastCell.col && cell.row === lastCell.row)) return;
		paintLine(lastCell, cell);
		lastCell = cell;
	}

	function onPointerUp(e: PointerEvent) {
		lastCell = null;
		release(e.pointerId);
	}

	/**
	 * Pointer capture throws NotFoundError when the pointer is no longer active — which
	 * happens for real if the button is released between the event and the handler running.
	 * Capture is an optimisation here, so failing to get it must not abort the stroke.
	 */
	function capture(pointerId: number) {
		try {
			canvas?.setPointerCapture(pointerId);
		} catch {
			/* carry on without capture */
		}
	}

	function release(pointerId: number) {
		try {
			canvas?.releasePointerCapture(pointerId);
		} catch {
			/* never had it */
		}
	}

	/* ── Grid sizing ────────────────────────────────────────────── */

	// Fit the grid to the window, keeping the pattern. Debounced via rAF because a resize
	// drag fires continuously.
	$effect(() => {
		const el = frame;
		if (!el || typeof ResizeObserver === 'undefined') return;

		let pending = 0;
		const ro = new ResizeObserver((entries) => {
			cancelAnimationFrame(pending);
			pending = requestAnimationFrame(() => {
				const box = entries[entries.length - 1].contentRect;
				const cols = Math.max(MIN_COLS, Math.floor(box.width / CELL_PX));
				const rows = Math.max(MIN_ROWS, Math.floor(box.height / CELL_PX));
				const next = resize(grid, cols, rows);
				if (next !== grid) {
					grid = next;
					scratch = new Uint8Array(next.cells.length);
					invalidate();
				}
			});
		});
		ro.observe(el);
		return () => {
			cancelAnimationFrame(pending);
			ro.disconnect();
		};
	});

	/* ── Controls ───────────────────────────────────────────────── */

	function doClear() {
		clear(grid);
		generation = 0;
		invalidate();
	}

	function doRandom() {
		randomise(grid);
		generation = 0;
		invalidate();
	}

	function stepOnce() {
		running = false;
		advance();
	}
</script>

<div class="life">
	<div class="life-frame" bind:this={frame}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<canvas
			bind:this={canvas}
			class="life-canvas"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			aria-label={i18n.t('gameOfLife.canvasLabel')}
		></canvas>
	</div>

	<div class="life-controls">
		<button class="life-btn primary" onclick={() => (running = !running)}>
			{running ? `⏸ ${i18n.t('gameOfLife.pause')}` : `▶ ${i18n.t('gameOfLife.play')}`}
		</button>
		<button class="life-btn" onclick={stepOnce}>⏭ {i18n.t('gameOfLife.step')}</button>
		<button class="life-btn" onclick={doRandom}>🎲 {i18n.t('gameOfLife.random')}</button>
		<button class="life-btn" onclick={doClear}>🗑 {i18n.t('gameOfLife.clear')}</button>

		<label class="life-speed">
			<span>{i18n.t('gameOfLife.speed')}</span>
			<input type="range" min="1" max="30" step="1" bind:value={speed} />
			<strong>{speed}/s</strong>
		</label>

		<button class="life-btn subtle" onclick={onBack}>← {i18n.t('gameOfLife.backToMenu')}</button>
	</div>

	<p class="life-stats">
		{i18n.t('gameOfLife.generation')} <strong>{generation}</strong>
		· {i18n.t('gameOfLife.population')} <strong>{alive}</strong>
		· <span class="hint">{i18n.t('gameOfLife.paintHint')}</span>
	</p>
</div>

<style>
	/*
		Deliberately theme-neutral: the board should look the same in Retro and Aero, so there
		are no [data-theme] overrides in this file. Only the window frame around it changes.
	*/
	.life {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		min-width: 280px;
	}

	.life-frame {
		flex: 1;
		min-width: 260px;
		min-height: 200px;
		width: 100%;
		height: 60vh;
		max-height: 520px;
		overflow: hidden;
		border: 1px solid #8a97a3;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
		background: #f4f6f8;
	}

	.life-canvas {
		display: block;
		/* The cursor is the whole point of the drag-to-paint interaction */
		cursor: crosshair;
		touch-action: none;
	}

	.life-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}

	.life-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 5px 10px;
		font-family: inherit;
		font-size: 12px;
		color: #1f3b57;
		background: #ffffff;
		border: 1px solid #8a97a3;
		border-radius: 3px;
		cursor: pointer;
		white-space: nowrap;

		&:hover {
			background: #eaf1f7;
			border-color: #5a7a96;
		}

		&:active {
			background: #dce7f1;
			box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
		}

		&.primary {
			font-weight: bold;
			background: #1f3b57;
			color: #ffffff;
			border-color: #14293d;

			&:hover {
				background: #2a4e72;
			}
		}

		&.subtle {
			margin-left: auto;
			color: #55606b;
			background: transparent;
			border-color: transparent;

			&:hover {
				background: #eaf1f7;
			}
		}
	}

	.life-speed {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: #1f3b57;

		input[type='range'] {
			width: 110px;
			accent-color: #1f3b57;
			cursor: pointer;
		}

		strong {
			min-width: 34px;
		}
	}

	.life-stats {
		font-size: 11px;
		color: #55606b;

		.hint {
			opacity: 0.85;
		}
	}
</style>
