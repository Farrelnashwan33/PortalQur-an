import { writable } from 'svelte/store';
import type { QuranTopic } from '$lib/types/quran';
import { QURAN_TOPICS } from '$lib/data/topicsData';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const TOPICS_STORAGE_KEY = 'pq_topics_data_v33';

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

	return {
		subscribe,
		addTopic: async (topic: QuranTopic) => {
			update((items) => {
				const updated = [...items, topic];
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		updateTopic: async (slug: string, updates: Partial<QuranTopic>) => {
			update((items) => {
				const updated = items.map((t) => (t.slug === slug ? { ...t, ...updates } : t));
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		deleteTopic: async (slug: string) => {
			update((items) => {
				const updated = items.filter((t) => t.slug !== slug);
				if (typeof window !== 'undefined') {
					localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		}
	};
}

export const topicStore = createTopicStore();
