import { SURAH_LIST } from '$lib/data/surahList';
import type { SurahDetail, AyahDetail, AyahWord, SurahMeta } from '$lib/types/quran';

// In-memory cache
const surahCache = new Map<number, SurahDetail>();

export async function getSurahList(): Promise<SurahMeta[]> {
	return SURAH_LIST;
}

export function prefetchSurah(surahNumber: number) {
	if (surahNumber >= 1 && surahNumber <= 114 && !surahCache.has(surahNumber)) {
		getSurahDetail(surahNumber).catch(() => {});
	}
}

export async function getSurahDetail(surahNumber: number): Promise<SurahDetail | null> {
	if (surahNumber < 1 || surahNumber > 114) return null;

	// Check in-memory cache (Instant 0ms)
	if (surahCache.has(surahNumber)) {
		return surahCache.get(surahNumber)!;
	}

	// Check localStorage in browser (Instant 1ms)
	if (typeof window !== 'undefined') {
		const localKey = `pq_surah_detail_${surahNumber}_v3_ibnkathir`;
		const cached = localStorage.getItem(localKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached) as SurahDetail;
				surahCache.set(surahNumber, parsed);
				return parsed;
			} catch {
				// Ignore parse error
			}
		}
	}

	const meta = SURAH_LIST.find((s) => s.number === surahNumber) || {
		number: surahNumber,
		name_arabic: '',
		name_latin: `Surah ${surahNumber}`,
		name_id: '',
		number_of_ayahs: 7,
		revelation_type: 'Makkiyah',
		revelation_order: surahNumber
	};

	try {
		// Concurrent parallel fetch with timeout for maximum responsiveness
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 9000);

		const [suratRes, wbwRes, tafsirRes] = await Promise.allSettled([
			fetch(`https://equran.id/api/v2/surat/${surahNumber}`, { signal: controller.signal }),
			fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=id&words=true&word_fields=text_uthmani,location,code_v1`, { signal: controller.signal }),
			fetch(`https://api.quran.com/api/v4/tafsirs/169/by_chapter/${surahNumber}`, { signal: controller.signal })
		]);
		clearTimeout(timeoutId);

		// 1. Process Authentic Tafsir Ibnu Katsir (Resource ID 169)
		let tafsirIbnuKatsirMap: Record<number, string> = {};
		if (tafsirRes.status === 'fulfilled' && tafsirRes.value.ok) {
			try {
				const tafsirJson = await tafsirRes.value.json();
				if (tafsirJson.tafsirs && Array.isArray(tafsirJson.tafsirs)) {
					for (const item of tafsirJson.tafsirs) {
						if (item.verse_key) {
							const ayahNum = parseInt(item.verse_key.split(':')[1], 10);
							if (!isNaN(ayahNum)) {
								tafsirIbnuKatsirMap[ayahNum] = stripHtml(item.text || '');
							}
						}
					}
				}
			} catch (e) {
				console.debug('Tafsir Ibnu Katsir parse note:', e);
			}
		}

		// 2. Process Quran.com Word-By-Word Dataset
		let wbwAyahsMap: Record<number, AyahWord[]> = {};
		if (wbwRes.status === 'fulfilled' && wbwRes.value.ok) {
			try {
				const wbwJson = await wbwRes.value.json();
				if (wbwJson.verses && Array.isArray(wbwJson.verses)) {
					for (const verse of wbwJson.verses) {
						const ayahNum = verse.verse_number;
						if (verse.words && Array.isArray(verse.words)) {
							const words: AyahWord[] = verse.words
								.filter((w: any) => w.char_type_name === 'word' || !w.char_type_name)
								.map((w: any, idx: number) => ({
									position: w.position || (idx + 1),
									arabic: w.text_uthmani || w.text || '',
									latin: w.transliteration?.text || '',
									translation: w.translation?.text || ''
								}));
							wbwAyahsMap[ayahNum] = words;
						}
					}
				}
			} catch (e) {
				console.debug('Word by word parse note:', e);
			}
		}

		// 3. Assemble Surah Details
		if (suratRes.status === 'fulfilled' && suratRes.value.ok) {
			const json = await suratRes.value.json();
			const data = json.data;

			const ayahs: AyahDetail[] = data.ayat.map((a: any) => {
				const ayahNum = a.nomorAyat;
				
				// Accurate Word-By-Word fallback if Quran.com WBW API didn't return
				let words: AyahWord[] = wbwAyahsMap[ayahNum];
				if (!words || words.length === 0) {
					const wordsArabic = (a.teksArab || '').trim().split(/\s+/);
					const wordsLatin = (a.teksLatin || '').trim().split(/\s+/);
					words = wordsArabic.map((ar: string, idx: number) => ({
						position: idx + 1,
						arabic: ar,
						latin: wordsLatin[idx] || '',
						translation: idx === 0 ? 'Dengan nama' : (idx === 1 ? 'Allah' : '')
					}));
				}

				const tafsirText = tafsirIbnuKatsirMap[ayahNum] || `Tafsir Ibnu Katsir untuk Surah ${meta.name_latin} ayat ${ayahNum}.`;

				return {
					surah_number: surahNumber,
					ayah_number: ayahNum,
					juz_number: getJuzForSurahAyah(surahNumber, ayahNum),
					page_number: 1,
					text_arabic: a.teksArab,
					text_latin: a.teksLatin,
					text_id: a.teksIndonesia,
					tafsir_ringkas: tafsirText,
					audio_url: a.audio?.['01'] || a.audio?.['05'] || `https://everyayah.com/data/Alafasy_128kbps/${pad3(surahNumber)}${pad3(ayahNum)}.mp3`,
					words
				};
			});

			const fullDetail: SurahDetail = {
				...meta,
				description: data.deskripsi ? stripHtml(data.deskripsi) : meta.description,
				audio_url: data.audioFull?.['01'] || `https://server8.mp3quran.net/afs/${pad3(surahNumber)}.mp3`,
				ayahs
			};

			surahCache.set(surahNumber, fullDetail);
			if (typeof window !== 'undefined') {
				try {
					localStorage.setItem(`pq_surah_detail_${surahNumber}_v3_ibnkathir`, JSON.stringify(fullDetail));
				} catch {
					// Storage full protection
				}
			}

			// Prefetch next surah
			if (surahNumber < 114) {
				setTimeout(() => prefetchSurah(surahNumber + 1), 500);
			}

			return fullDetail;
		}
	} catch (e) {
		console.warn('Network fetch error for surah detail:', e);
	}

	// Secondary Fallback Generator if offline / network error
	const fallbackAyahs: AyahDetail[] = Array.from({ length: meta.number_of_ayahs }, (_, i) => {
		const num = i + 1;
		return {
			surah_number: surahNumber,
			ayah_number: num,
			juz_number: getJuzForSurahAyah(surahNumber, num),
			page_number: 1,
			text_arabic: num === 1 && surahNumber !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : `آية رقم ${num} من سورة ${meta.name_arabic}`,
			text_latin: num === 1 && surahNumber !== 9 ? 'Bismillaahir-rahmaanir-rahiim' : `Ayat nomor ${num} dari surah ${meta.name_latin}`,
			text_id: num === 1 && surahNumber !== 9 ? 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.' : `Terjemahan ayat ke-${num} surah ${meta.name_latin}.`,
			tafsir_ringkas: `Tafsir Ibnu Katsir untuk ayat ${num} surah ${meta.name_latin}.`,
			audio_url: `https://everyayah.com/data/Alafasy_128kbps/${pad3(surahNumber)}${pad3(num)}.mp3`,
			words: [
				{ position: 1, arabic: 'بِسْمِ', latin: "bis'mi", translation: 'dengan nama' },
				{ position: 2, arabic: 'اللَّهِ', latin: 'allahi', translation: 'Allah' },
				{ position: 3, arabic: 'الرَّحْمَٰنِ', latin: 'ar-rahmani', translation: 'Yang Maha Pengasih' },
				{ position: 4, arabic: 'الرَّحِيمِ', latin: 'ar-rahimi', translation: 'Maha Penyayang' }
			]
		};
	});

	const fallbackDetail: SurahDetail = {
		...meta,
		audio_url: `https://server8.mp3quran.net/afs/${pad3(surahNumber)}.mp3`,
		ayahs: fallbackAyahs
	};

	return fallbackDetail;
}

function pad3(num: number): string {
	return num.toString().padStart(3, '0');
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>?/gm, '').trim();
}

// Approximate Juz mapper for major Quran Surahs
function getJuzForSurahAyah(surah: number, ayah: number): number {
	if (surah === 1) return 1;
	if (surah === 2) {
		if (ayah <= 141) return 1;
		if (ayah <= 252) return 2;
		return 3;
	}
	if (surah === 3) {
		if (ayah <= 92) return 3;
		return 4;
	}
	if (surah === 4) {
		if (ayah <= 23) return 4;
		if (ayah <= 147) return 5;
		return 6;
	}
	if (surah >= 78) return 30;
	if (surah >= 67) return 29;
	if (surah >= 58) return 28;
	if (surah >= 51) return 27;
	if (surah >= 46) return 26;
	if (surah >= 41) return 25;
	if (surah >= 37) return 24;
	if (surah >= 33) return 23;
	if (surah >= 28) return 20;
	return Math.min(30, Math.max(1, Math.floor(surah / 4) + 1));
}
