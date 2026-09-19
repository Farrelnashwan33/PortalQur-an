import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSurahDetail } from '$lib/services/quranService';
import { SURAH_LIST } from '$lib/data/surahList';

export const load: PageLoad = async ({ params }) => {
	const surahNum = parseInt(params.surah, 10);
	if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
		throw error(404, 'Surah tidak ditemukan.');
	}

	const surah = await getSurahDetail(surahNum);
	if (!surah) {
		throw error(404, 'Gagal memuat data surah.');
	}

	const prevSurah = surahNum > 1 ? SURAH_LIST.find((s) => s.number === surahNum - 1) : null;
	const nextSurah = surahNum < 114 ? SURAH_LIST.find((s) => s.number === surahNum + 1) : null;

	return {
		surah,
		prevSurah,
		nextSurah
	};
};
