import { writable } from 'svelte/store';
import type { Qari } from '$lib/types/quran';
import { QARI_LIST } from '$lib/data/surahList';

const QARIS_STORAGE_KEY = 'pq_qaris_data_v33';

function createQariStore() {
	let initialQaris: Qari[] = QARI_LIST;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(QARIS_STORAGE_KEY);
		if (stored) {
			try {
				initialQaris = JSON.parse(stored);
			} catch {
				initialQaris = QARI_LIST;
			}
		}
	}

	const { subscribe, set, update } = writable<Qari[]>(initialQaris);

	return {
		subscribe,
		addQari: (qari: Qari) => {
			update((items) => {
				const updated = [...items, qari];
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		toggleActive: (id: number) => {
			update((items) => {
				const updated = items.map((q) => (q.id === id ? { ...q, is_active: !q.is_active } : q));
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		deleteQari: (id: number) => {
			update((items) => {
				const updated = items.filter((q) => q.id !== id);
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		}
	};
}

export const qariStore = createQariStore();
