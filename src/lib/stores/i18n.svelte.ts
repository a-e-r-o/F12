import fr from '$lib/i18n/fr.json';
import en from '$lib/i18n/en.json';
import flagFR from '$lib/assets/lang-flags/flag_FR.png';
import flagGB from '$lib/assets/lang-flags/flag_GB.png';

export type Locale = 'fr' | 'en';

const STORAGE_KEY = 'locale';

type Messages = Record<string, unknown>;
const translations: Record<Locale, Messages> = { fr, en };

export const locales: { code: Locale; flagSrc: string; name: string }[] = [
	{ code: 'fr', flagSrc: flagFR, name: 'Français' },
	{ code: 'en', flagSrc: flagGB, name: 'English' }
];

function resolve(obj: Messages, key: string): string | undefined {
	const parts = key.split('.');
	let val: unknown = obj;
	for (const p of parts) {
		if (val == null || typeof val !== 'object') return undefined;
		val = (val as Record<string, unknown>)[p];
	}
	return typeof val === 'string' ? val : undefined;
}

function format(template: string, args?: Record<string, string | number>): string {
	if (!args) return template;
	return template.replace(/\{(\w+)\}/g, (_, name: string) =>
		args[name] !== undefined ? String(args[name]) : `{${name}}`
	);
}

function createI18nState() {
	let current = $state<Locale>('fr');

	return {
		get locale() {
			return current;
		},

		get flagSrc() {
			return locales.find((l) => l.code === current)?.flagSrc ?? '';
		},

		init() {
			const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
			if (stored && stored in translations) {
				current = stored;
			}
		},

		setLocale(locale: Locale) {
			current = locale;
			localStorage.setItem(STORAGE_KEY, locale);
		},

		/** Resolve a dot-path key and optionally format `{placeholder}` args. */
		t(key: string, args?: Record<string, string | number>): string {
			const val = resolve(translations[current], key);
			if (!val) return key;
			return format(val, args);
		}
	};
}

export const i18n = createI18nState();
