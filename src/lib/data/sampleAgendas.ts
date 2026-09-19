import type { Agenda } from '$lib/types/quran';

export const SAMPLE_AGENDAS: Agenda[] = [
	{
		id: '1',
		title: 'Kajian Akbar: Menyelami Samudra Al-Baqarah',
		category: 'Kajian',
		description: 'Tadabbur mendalam mengenai hukum, kisah para Nabi, dan petunjuk keimanan dalam Surah Al-Baqarah bersama asatidz pakar tafsir.',
		event_date: '2026-09-21T19:30:00+07:00',
		location: 'Masjid Raya Al-Ikhlas & Zoom Live',
		speaker: 'Ust. Dr. Muhammad Zulkarnain, MA',
		image_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop',
		status: 'published'
	},
	{
		id: '2',
		title: 'Khatam Bersama: Malam Nuzulul Quran & Simaan 30 Juz',
		category: 'Tilawah',
		description: 'Simaan Al-Qur\'an 30 Juz serentak bersama para huffadz dan jamaah Portal Qur\'an dengan tajwid bersanad.',
		event_date: '2026-09-25T20:00:00+07:00',
		location: 'Auditorium Utama & Live YouTube',
		speaker: 'Dewan Asatidz Portal Qur\'an',
		image_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop',
		status: 'published'
	},
	{
		id: '3',
		title: 'Webinar: Rahasia Istiqomah Tilawah Harian',
		category: 'Event',
		description: 'Tips membangun kebiasaan membaca Qur\'an minimal 1 juz per hari tanpa rasa lelah dan konsisten sepanjang tahun.',
		event_date: '2026-09-28T09:00:00+07:00',
		location: 'Zoom Meeting Interaktif',
		speaker: 'Ust. Ahmad Fauzan Al-Hafizh',
		image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
		status: 'published'
	},
	{
		id: '4',
		title: 'Pengingat: Tilawah & Tadabbur Surah Al-Kahfi',
		category: 'Pengingat',
		description: 'Sunnah membaca Surah Al-Kahfi di hari Jum\'at sebagai penerang cahaya di antara dua Jum\'at.',
		event_date: '2026-09-18T05:00:00+07:00',
		location: 'Portal Qur\'an Mobile & Desktop',
		speaker: 'Tim Portal Qur\'an',
		image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop',
		status: 'published'
	}
];
