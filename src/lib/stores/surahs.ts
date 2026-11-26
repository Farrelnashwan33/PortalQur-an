import { writable, get } from 'svelte/store';
import { SURAH_LIST } from '$lib/data/surahList';
import type { SurahMeta } from '$lib/types/quran';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const SURAHS_STORAGE_KEY = 'pq_surahs_meta_v34';
const TAFSIR_STORAGE_KEY = 'pq_tafsir_custom_v34';
const SUPABASE_SURAHS_KEY = 'custom_surahs_meta_v34';
const SUPABASE_TAFSIR_KEY = 'custom_tafsirs_v34';

export interface TafsirCustom {
	surah_number: number;
	ayah_number: number;
	text_arabic: string;
	text_id: string;
	tafsir_ringkas: string;
}

const DEFAULT_TAFSIRS: TafsirCustom[] = [
	{
		surah_number: 1,
		ayah_number: 1,
		text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
		text_id: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
		tafsir_ringkas: 'Memulai setiap perbuatan baik dengan menyebut asma Allah Yang Maha Pengasih dan Maha Penyayang.'
	},
	{
		surah_number: 1,
		ayah_number: 2,
		text_arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
		text_id: 'Segala puji bagi Allah, Tuhan seluruh alam.',
		tafsir_ringkas: 'Segala bentuk pujian dan sanjungan hakiki adalah milik Allah, Pencipta dan Pemelihara seluruh alam semesta.'
	},
	{
		surah_number: 2,
		ayah_number: 255,
		text_arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
		text_id: 'Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus-menerus mengurus (makhluk-Nya)...',
		tafsir_ringkas: 'Ayat Kursi: Penegasan keesaan Allah, sifat kehidupan-Nya yang sempurna, kekuasaan mutlak di langit dan bumi.'
	},
	{
		surah_number: 112,
		ayah_number: 1,
		text_arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
		text_id: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
		tafsir_ringkas: 'Penegasan kemurnian tauhid bahwa Allah itu Esa dalam Dzat, Sifat, dan Perbuatan-Nya.'
	}
];

function applySurahOverrides(base: SurahMeta[], overrides: Record<number, Partial<SurahMeta>>): SurahMeta[] {
	return base.map((s) => (overrides[s.number] ? { ...s, ...overrides[s.number] } : s));
}

function extractSurahOverrides(items: SurahMeta[]): Record<number, Partial<SurahMeta>> {
	const diff: Record<number, Partial<SurahMeta>> = {};
	for (const item of items) {
		const orig = SURAH_LIST.find((s) => s.number === item.number);
		if (!orig) continue;
		if (
			item.name_latin !== orig.name_latin ||
			item.name_id !== orig.name_id ||
			item.description !== orig.description ||
			item.virtues !== orig.virtues
		) {
			diff[item.number] = {
				name_latin: item.name_latin,
				name_id: item.name_id,
				description: item.description,
				virtues: item.virtues
			};
		}
	}
	return diff;
}

function createSurahStore() {
	let initialSurahs: SurahMeta[] = SURAH_LIST;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(SURAHS_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length === 114) {
					initialSurahs = parsed;
				} else if (parsed && typeof parsed === 'object') {
					initialSurahs = applySurahOverrides(SURAH_LIST, parsed);
				}
			} catch {
				initialSurahs = SURAH_LIST;
			}
		}
	}

	const { subscribe, set, update } = writable<SurahMeta[]>(initialSurahs);
	let bc: BroadcastChannel | null = null;

	async function refreshFromCloud() {
		if (!isSupabaseConfigured()) return;
		try {
			const { data, error } = await supabase
				.from('app_settings')
				.select('value')
				.eq('key', SUPABASE_SURAHS_KEY)
				.maybeSingle();

			if (!error && data?.value && typeof data.value === 'object') {
				const merged = applySurahOverrides(SURAH_LIST, data.value as Record<number, Partial<SurahMeta>>);
				set(merged);
				if (typeof window !== 'undefined') {
					localStorage.setItem(SURAHS_STORAGE_KEY, JSON.stringify(data.value));
				}
			}
		} catch {}
	}

	if (typeof window !== 'undefined') {
		try {
			if ('BroadcastChannel' in window) {
				bc = new BroadcastChannel('pq_surahs_meta_sync');
				bc.onmessage = (ev) => {
					if (ev?.data && typeof ev.data === 'object') {
						const merged = applySurahOverrides(SURAH_LIST, ev.data);
						set(merged);
						localStorage.setItem(SURAHS_STORAGE_KEY, JSON.stringify(ev.data));
					}
				};
			}
		} catch {}

		window.addEventListener('focus', () => refreshFromCloud());
		refreshFromCloud();
	}

	return {
		subscribe,
		refresh: refreshFromCloud,
		updateSurah: async (number: number, updates: Partial<SurahMeta>) => {
			let overrides: Record<number, Partial<SurahMeta>> = {};
			update((items) => {
				const updated = items.map((s) => (s.number === number ? { ...s, ...updates } : s));
				overrides = extractSurahOverrides(updated);
				if (typeof window !== 'undefined') {
					localStorage.setItem(SURAHS_STORAGE_KEY, JSON.stringify(overrides));
				}
				try {
					bc?.postMessage(overrides);
				} catch {}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('app_settings').upsert(
						{
							key: SUPABASE_SURAHS_KEY,
							value: overrides,
							description: 'Kustomisasi info & keutamaan 114 surah dari Admin',
							updated_at: new Date().toISOString()
						},
						{ onConflict: 'key' }
					);
				} catch {}
			}
		}
	};
}

function createTafsirStore() {
	let initialTafsirs: TafsirCustom[] = DEFAULT_TAFSIRS;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(TAFSIR_STORAGE_KEY);
		if (stored) {
			try {
				initialTafsirs = JSON.parse(stored);
			} catch {
				initialTafsirs = DEFAULT_TAFSIRS;
			}
		}
	}

	const { subscribe, set, update } = writable<TafsirCustom[]>(initialTafsirs);
	let bc: BroadcastChannel | null = null;

	async function refreshFromCloud() {
		if (!isSupabaseConfigured()) return;
		try {
			const { data, error } = await supabase
				.from('app_settings')
				.select('value')
				.eq('key', SUPABASE_TAFSIR_KEY)
				.maybeSingle();

			if (!error && Array.isArray(data?.value)) {
				set(data.value as TafsirCustom[]);
				if (typeof window !== 'undefined') {
					localStorage.setItem(TAFSIR_STORAGE_KEY, JSON.stringify(data.value));
				}
			}
		} catch {}
	}

	async function syncCloud(items: TafsirCustom[]) {
		if (!isSupabaseConfigured()) return;
		try {
			await supabase.from('app_settings').upsert(
				{
					key: SUPABASE_TAFSIR_KEY,
					value: items,
					description: 'Kustomisasi tafsir & terjemahan ayat dari Admin',
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'key' }
			);
		} catch {}
	}

	if (typeof window !== 'undefined') {
		try {
			if ('BroadcastChannel' in window) {
				bc = new BroadcastChannel('pq_tafsir_custom_sync');
				bc.onmessage = (ev) => {
					if (Array.isArray(ev?.data)) {
						set(ev.data);
						localStorage.setItem(TAFSIR_STORAGE_KEY, JSON.stringify(ev.data));
					}
				};
			}
		} catch {}

		window.addEventListener('focus', () => refreshFromCloud());
		refreshFromCloud();
	}

	return {
		subscribe,
		refresh: refreshFromCloud,
		updateTafsir: async (surahNumber: number, ayahNumber: number, textId: string, tafsirRingkas: string) => {
			let snapshot: TafsirCustom[] = [];
			update((items) => {
				const existing = items.find((i) => i.surah_number === surahNumber && i.ayah_number === ayahNumber);
				let updated: TafsirCustom[];
				if (existing) {
					updated = items.map((i) =>
						i.surah_number === surahNumber && i.ayah_number === ayahNumber
							? { ...i, text_id: textId, tafsir_ringkas: tafsirRingkas }
							: i
					);
				} else {
					updated = [
						...items,
						{
							surah_number: surahNumber,
							ayah_number: ayahNumber,
							text_arabic: '',
							text_id: textId,
							tafsir_ringkas: tafsirRingkas
						}
					];
				}
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(TAFSIR_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});
			await syncCloud(snapshot);
		},
		deleteTafsir: async (surahNumber: number, ayahNumber: number) => {
			let snapshot: TafsirCustom[] = [];
			update((items) => {
				const updated = items.filter((i) => !(i.surah_number === surahNumber && i.ayah_number === ayahNumber));
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(TAFSIR_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});
			await syncCloud(snapshot);
		}
	};
}

export const surahStore = createSurahStore();
export const tafsirStore = createTafsirStore();
