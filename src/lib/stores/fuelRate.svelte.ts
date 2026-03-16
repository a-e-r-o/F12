/**
 * Shared EUR→USD exchange rate store.
 * Fetches once on first init(); subsequent calls are no-ops.
 * Import and call init() from onMount in any component that needs the rate.
 */
function createFuelRateStore() {
	let rate = $state<number | null>(null);
	let error = $state(false);
	let initialized = false;

	return {
		get rate() { return rate; },
		get error() { return error; },
		get loading() { return !rate && !error; },

		async init() {
			if (initialized) return;
			initialized = true;
			try {
				const res = await fetch('https://open.er-api.com/v6/latest/EUR');
				if (!res.ok) throw new Error('API error');
				const data = await res.json();
				rate = data.rates?.USD ?? null;
				if (!rate) throw new Error('No USD rate');
			} catch {
				error = true;
			}
		}
	};
}

export const fuelRate = createFuelRateStore();
