import { writable } from 'svelte/store';
import type { ReadingMode, ThemeMode, ArabicFontFamily } from '$lib/types/quran';

export interface ReaderSettings {
	mode: ReadingMode;
	theme: ThemeMode;
	arabicFontSize: number; // 24 to 48px
	translationFontSize: number; // 12 to 24px
	arabicFontFamily: ArabicFontFamily;
	showTajweed: boolean;
	showTransliteration: boolean;
	autoScroll: boolean;
	autoScrollSpeed: number; // 1 to 5
}

const STORAGE_KEY = 'pq_reader_settings_v33';

const defaultSettings: ReaderSettings = {
	mode: 'terjemahan',
	theme: 'cream',
	arabicFontSize: 30,
	translationFontSize: 15,
	arabicFontFamily: 'Scheherazade New',
	showTajweed: false,
	showTransliteration: true,
	autoScroll: false,
	autoScrollSpeed: 2
};

function createReaderStore() {
	let initial: ReaderSettings = defaultSettings;
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				initial = { ...defaultSettings, ...JSON.parse(stored) };
			} catch {
				initial = defaultSettings;
			}
		}
	}

	const { subscribe, set, update } = writable<ReaderSettings>(initial);

	return {
		subscribe,
		setMode: (mode: ReadingMode) => {
			update((s) => {
				const next = { ...s, mode };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		setTheme: (theme: ThemeMode) => {
			update((s) => {
				const next = { ...s, theme };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		setArabicFontSize: (size: number) => {
			update((s) => {
				const next = { ...s, arabicFontSize: Math.max(20, Math.min(52, size)) };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		setTranslationFontSize: (size: number) => {
			update((s) => {
				const next = { ...s, translationFontSize: Math.max(12, Math.min(24, size)) };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		setArabicFontFamily: (font: ArabicFontFamily) => {
			update((s) => {
				const next = { ...s, arabicFontFamily: font };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		toggleTransliteration: () => {
			update((s) => {
				const next = { ...s, showTransliteration: !s.showTransliteration };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		toggleAutoScroll: () => {
			update((s) => {
				const next = { ...s, autoScroll: !s.autoScroll };
				if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		reset: () => {
			set(defaultSettings);
			if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
		}
	};
}

export const readerStore = createReaderStore();
