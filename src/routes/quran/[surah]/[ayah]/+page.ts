import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSurahDetail } from '$lib/services/quranService';

export const load: PageLoad = async ({ params }) => {
	const surahNum = parseInt(params.surah, 10);
	const ayahNum = parseInt(params.ayah, 10);

	if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114) {
		throw error(404, 'Ayat tidak ditemukan.');
	}

	const surah = await getSurahDetail(surahNum);
	if (!surah) {
		throw error(404, 'Gagal memuat surah.');
	}

	const ayah = surah.ayahs.find((a) => a.ayah_number === ayahNum);
	if (!ayah) {
		throw error(404, 'Nomor ayat tidak ditemukan dalam surah ini.');
	}

	return {
		surah,
		ayah
	};
};
