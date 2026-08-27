/**
 * Conway's Game of Life — pure logic, no DOM.
 *
 * The rule is a parameter rather than hard-coded B3/S23, because the planned "advanced" mode
 * is precisely about changing it. That way adding the mode is a UI job, not a rewrite.
 */

export interface Rule {
	/** Neighbour counts that bring a dead cell to life */
	birth: number[];
	/** Neighbour counts that keep a live cell alive */
	survive: number[];
}

/** The original: born on 3 neighbours, survives on 2 or 3. */
export const CONWAY: Rule = { birth: [3], survive: [2, 3] };

/** A grid is a flat Uint8Array of 0/1 — one byte per cell, indexed row-major. */
export interface Grid {
	cols: number;
	rows: number;
	cells: Uint8Array;
}

export function createGrid(cols: number, rows: number): Grid {
	return { cols, rows, cells: new Uint8Array(cols * rows) };
}

export function get(grid: Grid, col: number, row: number): number {
	return grid.cells[row * grid.cols + col];
}

export function set(grid: Grid, col: number, row: number, value: 0 | 1): void {
	if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return;
	grid.cells[row * grid.cols + col] = value;
}

export function clear(grid: Grid): void {
	grid.cells.fill(0);
}

export function randomise(grid: Grid, density = 0.3): void {
	for (let i = 0; i < grid.cells.length; i++) {
		grid.cells[i] = Math.random() < density ? 1 : 0;
	}
}

export function population(grid: Grid): number {
	let n = 0;
	for (let i = 0; i < grid.cells.length; i++) n += grid.cells[i];
	return n;
}

/**
 * Resize while keeping what fits, anchored at the top-left. Used when the window is resized:
 * losing the whole pattern because the window grew by 20px would be infuriating.
 */
export function resize(grid: Grid, cols: number, rows: number): Grid {
	if (cols === grid.cols && rows === grid.rows) return grid;
	const next = createGrid(cols, rows);
	const copyCols = Math.min(cols, grid.cols);
	const copyRows = Math.min(rows, grid.rows);
	for (let r = 0; r < copyRows; r++) {
		for (let c = 0; c < copyCols; c++) {
			next.cells[r * cols + c] = grid.cells[r * grid.cols + c];
		}
	}
	return next;
}

/**
 * One generation, into a caller-provided output buffer so we can ping-pong between two
 * allocations instead of allocating every frame.
 *
 * The grid wraps around at the edges (a torus): on a grid this small, a hard border would
 * kill gliders the moment they reach it.
 */
export function step(grid: Grid, out: Uint8Array, rule: Rule = CONWAY): void {
	const { cols, rows, cells } = grid;

	// Lookup tables: `birth[n]` / `survive[n]` beats an array search per cell
	const birth = new Uint8Array(9);
	const survive = new Uint8Array(9);
	for (const n of rule.birth) if (n >= 0 && n <= 8) birth[n] = 1;
	for (const n of rule.survive) if (n >= 0 && n <= 8) survive[n] = 1;

	for (let row = 0; row < rows; row++) {
		const up = ((row - 1 + rows) % rows) * cols;
		const mid = row * cols;
		const down = ((row + 1) % rows) * cols;

		for (let col = 0; col < cols; col++) {
			const left = (col - 1 + cols) % cols;
			const right = (col + 1) % cols;

			const neighbours =
				cells[up + left] + cells[up + col] + cells[up + right] +
				cells[mid + left] + cells[mid + right] +
				cells[down + left] + cells[down + col] + cells[down + right];

			const alive = cells[mid + col];
			out[mid + col] = alive ? survive[neighbours] : birth[neighbours];
		}
	}
}
