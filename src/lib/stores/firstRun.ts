const STORAGE_KEY = 'f12-first-run-done';

/**
 * Whether the one-time welcome dialog has already been dismissed.
 * A missing key means "never seen it" — so a reload before choosing shows it again.
 */
export function isFirstRun(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) !== '1';
	} catch {
		// Private mode / storage disabled: don't nag, just skip the dialog.
		return false;
	}
}

export function markFirstRunDone(): void {
	try {
		localStorage.setItem(STORAGE_KEY, '1');
	} catch {
		/* nothing we can do, and nothing worth breaking over */
	}
}
