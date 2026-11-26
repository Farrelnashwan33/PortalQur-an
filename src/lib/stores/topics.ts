import { writable } from 'svelte/store';
import type { QuranTopic } from '$lib/types/quran';
import { QURAN_TOPICS } from '$lib/data/topicsData';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const TOPICS_STORAGE_KEY = 'pq_topics_data_v34';
const SUPABASE_TOPICS_KEY = 'custom_topics_v34';

function createTopicStore() {
	let initialTopics: QuranTopic[] = QURAN_TOPICS;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(TOPICS_STORAGE_KEY);
		if (stored) {
			try {
				initialTopics = JSON.parse(stored);
			} catch {
				initialTopics = QURAN_TOPICS;
			}
		}
	}

	const { subscribe, set, update } = writable<QuranTopic[]>(initialTopics);
	let bc: BroadcastChannel | null = null;

	async function refreshFromCloud() {
		if (!isSupabaseConfigured()) return;
		try {
			const { data, error } = await supabase
				.from('app_settings')
				.select('value')
				.eq('key', SUPABASE_TOPICS_KEY)
				.maybeSingle();

			if (!error && Array.isArray(data?.value) && data.value.length > 0) {
				set(data.value as QuranTopic[]);
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(data.value));
				}
			}
		} catch {}
	}

	async function syncCloud(items: QuranTopic[]) {
		if (!isSupabaseConfigured()) return;
		try {
			await supabase.from('app_settings').upsert(
				{
					key: SUPABASE_TOPICS_KEY,
					value: items,
					description: 'Daftar topik tematik Al-Qur\'an terkelola Admin',
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'key' }
			);
		} catch {}
	}

	if (typeof window !== 'undefined') {
		try {
			if ('BroadcastChannel' in window) {
				bc = new BroadcastChannel('pq_topics_sync');
				bc.onmessage = (ev) => {
					if (Array.isArray(ev?.data)) {
						set(ev.data);
						localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(ev.data));
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
		addTopic: async (topic: QuranTopic) => {
			let snapshot: QuranTopic[] = [];
			update((items) => {
				const updated = [...items, topic];
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});
			await syncCloud(snapshot);
		},
		updateTopic: async (slug: string, updates: Partial<QuranTopic>) => {
			let snapshot: QuranTopic[] = [];
			update((items) => {
				const updated = items.map((t) => (t.slug === slug ? { ...t, ...updates } : t));
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});
			await syncCloud(snapshot);
		},
		deleteTopic: async (slug: string) => {
			let snapshot: QuranTopic[] = [];
			update((items) => {
				const updated = items.filter((t) => t.slug !== slug);
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(updated));
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

export const topicStore = createTopicStore();
