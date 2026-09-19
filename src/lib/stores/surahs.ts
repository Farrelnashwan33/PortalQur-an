import { writable } from 'svelte/store';
import { SURAH_LIST } from '$lib/data/surahList';
import type { SurahMeta } from '$lib/types/quran';

const SURAHS_STORAGE_KEY = 'pq_surahs_meta_v33';
const TAFSIR_STORAGE_KEY = 'pq_tafsir_custom_v33';

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

function createSurahStore() {
	let initialSurahs: SurahMeta[] = SURAH_LIST;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(SURAHS_STORAGE_KEY);
		if (stored) {
			try {
				initialSurahs = JSON.parse(stored);
			} catch {
				initialSurahs = SURAH_LIST;
			}
		}
	}

	const { subscribe, set, update } = writable<SurahMeta[]>(initialSurahs);

	return {
		subscribe,
		updateSurah: (number: number, updates: Partial<SurahMeta>) => {
			update((items) => {
				const updated = items.map((s) => (s.number === number ? { ...s, ...updates } : s));
				if (typeof window !== 'undefined') {
					localStorage.setItem(SURAHS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
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

	return {
		subscribe,
		updateTafsir: (surahNumber: number, ayahNumber: number, textId: string, tafsirRingkas: string) => {
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
				if (typeof window !== 'undefined') {
					localStorage.setItem(TAFSIR_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		deleteTafsir: (surahNumber: number, ayahNumber: number) => {
			update((items) => {
				const updated = items.filter((i) => !(i.surah_number === surahNumber && i.ayah_number === ayahNumber));
				if (typeof window !== 'undefined') {
					localStorage.setItem(TAFSIR_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		}
	};
}

export const surahStore = createSurahStore();
export const tafsirStore = createTafsirStore();
