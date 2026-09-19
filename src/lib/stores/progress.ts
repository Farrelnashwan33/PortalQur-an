import { writable } from 'svelte/store';
import type { Bookmark, UserCollection, ReadingProgress, ReadingStats } from '$lib/types/quran';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const PROGRESS_KEY = 'pq_reading_progress_v33';
const BOOKMARKS_KEY = 'pq_bookmarks_v33';
const COLLECTIONS_KEY = 'pq_collections_v33';
const STATS_KEY = 'pq_reading_stats_v33';

// Default initial progress
const defaultProgress: ReadingProgress = {
	surah_number: 1,
	surah_name: 'Al-Fatihah',
	ayah_number: 1,
	juz_number: 1,
	last_read_at: new Date().toISOString()
};

// Default initial collections
const defaultCollections: UserCollection[] = [
	{
		id: 'col-1',
		title: 'Ayat Penyejuk Hati',
		description: 'Kumpulan ayat-ayat penenang jiwa dan penghapus kesedihan.',
		color: '#6F4E37',
		is_favorite: true,
		items_count: 2,
		created_at: new Date().toISOString(),
		items: [
			{
				id: 'item-1',
				surah_number: 13,
				surah_name: 'Ar-Ra\'d',
				ayah_number: 28,
				text_arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
				text_id: '(Yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
				notes: 'Ayat pengingat di kala cemas.'
			},
			{
				id: 'item-2',
				surah_number: 94,
				surah_name: 'Al-Insyirah',
				ayah_number: 5,
				text_arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
				text_id: 'Maka sesungguhnya beserta kesulitan ada kemudahan.',
				notes: 'Optimisme dan janji Allah.'
			}
		]
	},
	{
		id: 'col-2',
		title: 'Doa Para Nabi',
		description: 'Untaian doa agung para Rasul yang diabadikan dalam Al-Qur\'an.',
		color: '#C9A66B',
		is_favorite: false,
		items_count: 1,
		created_at: new Date().toISOString(),
		items: [
			{
				id: 'item-3',
				surah_number: 21,
				surah_name: 'Al-Anbiya\'',
				ayah_number: 87,
				text_arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
				text_id: 'Tidak ada tuhan selain Engkau, Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.',
				notes: 'Doa Nabi Yunus saat di dalam perut ikan paus.'
			}
		]
	}
];

const defaultBookmarks: Bookmark[] = [
	{
		id: 'bm-1',
		surah_number: 1,
		surah_name: 'Al-Fatihah',
		ayah_number: 5,
		text_arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
		text_id: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
		notes: 'Intisari tauhid ibadah dan isti\'anah',
		created_at: new Date().toISOString()
	},
	{
		id: 'bm-2',
		surah_number: 2,
		surah_name: 'Al-Baqarah',
		ayah_number: 255,
		text_arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
		text_id: 'Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus-menerus mengurus (makhluk-Nya)...',
		notes: 'Ayat Kursi - pelindung harian',
		created_at: new Date().toISOString()
	}
];

const defaultStats: ReadingStats = {
	total_ayahs_read: 245,
	total_surahs_read: 18,
	total_reading_minutes: 320,
	current_streak_days: 7,
	completed_juz: [1, 2, 3, 30],
	weekly_activity: [
		{ day: 'Sen', count: 35, date: '2026-09-11' },
		{ day: 'Sel', count: 42, date: '2026-09-12' },
		{ day: 'Rab', count: 28, date: '2026-09-13' },
		{ day: 'Kam', count: 50, date: '2026-09-14' },
		{ day: 'Jum', count: 65, date: '2026-09-15' },
		{ day: 'Sab', count: 30, date: '2026-09-16' },
		{ day: 'Ahad', count: 48, date: '2026-09-17' }
	],
	top_surahs: [
		{ surah_number: 18, name: 'Al-Kahf', count: 45 },
		{ surah_number: 67, name: 'Al-Mulk', count: 38 },
		{ surah_number: 56, name: 'Al-Waqi\'ah', count: 30 },
		{ surah_number: 55, name: 'Ar-Rahman', count: 28 },
		{ surah_number: 36, name: 'Ya Sin', count: 22 }
	],
	recent_history: [
		{ surah_number: 18, surah_name: 'Al-Kahf', ayah_number: 10, timestamp: '10 menit yang lalu' },
		{ surah_number: 67, surah_name: 'Al-Mulk', ayah_number: 30, timestamp: 'Kemarin, 21:15' },
		{ surah_number: 1, surah_name: 'Al-Fatihah', ayah_number: 7, timestamp: '2 hari lalu' }
	]
};

function createProgressStore() {
	let initialProgress = defaultProgress;
	let initialBookmarks = defaultBookmarks;
	let initialCollections = defaultCollections;
	let initialStats = defaultStats;

	if (typeof window !== 'undefined') {
		try {
			const p = localStorage.getItem(PROGRESS_KEY);
			if (p) initialProgress = JSON.parse(p);
			const b = localStorage.getItem(BOOKMARKS_KEY);
			if (b) initialBookmarks = JSON.parse(b);
			const c = localStorage.getItem(COLLECTIONS_KEY);
			if (c) initialCollections = JSON.parse(c);
			const s = localStorage.getItem(STATS_KEY);
			if (s) initialStats = JSON.parse(s);
		} catch {
			// fallback
		}
	}

	const progress = writable<ReadingProgress>(initialProgress);
	const bookmarks = writable<Bookmark[]>(initialBookmarks);
	const collections = writable<UserCollection[]>(initialCollections);
	const stats = writable<ReadingStats>(initialStats);

	// Debounce timer for recording reading progress
	let progressDebounceTimer: any = null;

	return {
		progress: {
			subscribe: progress.subscribe,
			setLastRead: (surah_number: number, surah_name: string, ayah_number: number, juz_number: number = 1) => {
				const entry: ReadingProgress = {
					surah_number,
					surah_name,
					ayah_number,
					juz_number,
					last_read_at: new Date().toISOString()
				};
				progress.set(entry);
				if (typeof window !== 'undefined') {
					localStorage.setItem(PROGRESS_KEY, JSON.stringify(entry));
				}

				// Record reading history with debouncing
				clearTimeout(progressDebounceTimer);
				progressDebounceTimer = setTimeout(() => {
					stats.update((s) => {
						const nextAyahs = s.total_ayahs_read + 1;
						const nextHistory = [
							{ surah_number, surah_name, ayah_number, timestamp: 'Baru saja' },
							...s.recent_history.slice(0, 19)
						];
						const updated = {
							...s,
							total_ayahs_read: nextAyahs,
							recent_history: nextHistory
						};
						if (typeof window !== 'undefined') {
							localStorage.setItem(STATS_KEY, JSON.stringify(updated));
						}
						return updated;
					});

					// Sync with Supabase if online
					if (isSupabaseConfigured()) {
						supabase.auth.getSession().then(({ data }) => {
							if (data.session?.user) {
								supabase.from('reading_progress').upsert({
									user_id: data.session.user.id,
									surah_number,
									ayah_number,
									juz_number,
									last_read_at: new Date().toISOString()
								}).then(() => {});
							}
						}).catch(() => {});
					}
				}, 1200);
			}
		},
		bookmarks: {
			subscribe: bookmarks.subscribe,
			toggleBookmark: (surah_number: number, surah_name: string, ayah_number: number, text_arabic?: string, text_id?: string, notes?: string) => {
				bookmarks.update((items) => {
					const existingIndex = items.findIndex((b) => b.surah_number === surah_number && b.ayah_number === ayah_number);
					let updated: Bookmark[];
					if (existingIndex >= 0) {
						// Remove
						updated = items.filter((_, i) => i !== existingIndex);
					} else {
						// Add
						const newItem: Bookmark = {
							id: 'bm-' + Date.now(),
							surah_number,
							surah_name,
							ayah_number,
							text_arabic,
							text_id,
							notes: notes || '',
							created_at: new Date().toISOString()
						};
						updated = [newItem, ...items];
					}
					if (typeof window !== 'undefined') {
						localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			},
			isBookmarked: (surah_number: number, ayah_number: number, list: Bookmark[]) => {
				return list.some((b) => b.surah_number === surah_number && b.ayah_number === ayah_number);
			},
			removeBookmark: (id: string) => {
				bookmarks.update((items) => {
					const updated = items.filter((b) => b.id !== id);
					if (typeof window !== 'undefined') {
						localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			}
		},
		collections: {
			subscribe: collections.subscribe,
			createCollection: (title: string, description: string = '', color: string = '#6F4E37') => {
				collections.update((cols) => {
					const newCol: UserCollection = {
						id: 'col-' + Date.now(),
						title,
						description,
						color,
						is_favorite: false,
						items_count: 0,
						created_at: new Date().toISOString(),
						items: []
					};
					const updated = [newCol, ...cols];
					if (typeof window !== 'undefined') {
						localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			},
			deleteCollection: (collectionId: string) => {
				collections.update((cols) => {
					const updated = cols.filter((c) => c.id !== collectionId);
					if (typeof window !== 'undefined') {
						localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			},
			addAyahToCollection: (collectionId: string, surah_number: number, surah_name: string, ayah_number: number, text_arabic: string, text_id: string, notes?: string) => {
				collections.update((cols) => {
					const updated = cols.map((col) => {
						if (col.id === collectionId) {
							const items = col.items || [];
							const exists = items.some((i) => i.surah_number === surah_number && i.ayah_number === ayah_number);
							if (exists) return col;

							const newItem = {
								id: 'item-' + Date.now(),
								surah_number,
								surah_name,
								ayah_number,
								text_arabic,
								text_id,
								notes
							};
							const newItems = [...items, newItem];
							return {
								...col,
								items: newItems,
								items_count: newItems.length
							};
						}
						return col;
					});
					if (typeof window !== 'undefined') {
						localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			},
			removeItemFromCollection: (collectionId: string, itemId: string) => {
				collections.update((cols) => {
					const updated = cols.map((col) => {
						if (col.id === collectionId) {
							const newItems = (col.items || []).filter((i) => i.id !== itemId);
							return {
								...col,
								items: newItems,
								items_count: newItems.length
							};
						}
						return col;
					});
					if (typeof window !== 'undefined') {
						localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			}
		},
		stats: {
			subscribe: stats.subscribe,
			recordSession: (minutes: number, ayahsCount: number) => {
				stats.update((s) => {
					const updated = {
						...s,
						total_reading_minutes: s.total_reading_minutes + minutes,
						total_ayahs_read: s.total_ayahs_read + ayahsCount
					};
					if (typeof window !== 'undefined') {
						localStorage.setItem(STATS_KEY, JSON.stringify(updated));
					}
					return updated;
				});
			}
		}
	};
}

export const progressStore = createProgressStore();
