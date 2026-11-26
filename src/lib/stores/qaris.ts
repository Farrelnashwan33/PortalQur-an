import { writable } from 'svelte/store';
import type { Qari } from '$lib/types/quran';
import { QARI_LIST } from '$lib/data/surahList';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const QARIS_STORAGE_KEY = 'pq_qaris_data_v34';
const SUPABASE_QARIS_KEY = 'custom_qaris_v34';

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
	let bc: BroadcastChannel | null = null;

	async function refreshFromCloud() {
		if (!isSupabaseConfigured()) return;
		try {
			const { data, error } = await supabase
				.from('app_settings')
				.select('value')
				.eq('key', SUPABASE_QARIS_KEY)
				.maybeSingle();

			if (!error && Array.isArray(data?.value) && data.value.length > 0) {
				set(data.value as Qari[]);
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(data.value));
				}
			}
		} catch {}
	}

	async function syncCloud(items: Qari[]) {
		if (!isSupabaseConfigured()) return;
		try {
			await supabase.from('app_settings').upsert(
				{
					key: SUPABASE_QARIS_KEY,
					value: items,
					description: 'Daftar qari murattal terkelola Admin',
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'key' }
			);
		} catch {}
	}

	if (typeof window !== 'undefined') {
		try {
			if ('BroadcastChannel' in window) {
				bc = new BroadcastChannel('pq_qaris_sync');
				bc.onmessage = (ev) => {
					if (Array.isArray(ev?.data)) {
						set(ev.data);
						localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(ev.data));
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
		addQari: async (qari: Qari) => {
			let snapshot: Qari[] = [];
			update((items) => {
				const updated = [...items, qari];
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});
			await syncCloud(snapshot);
		},
		toggleActive: async (id: number) => {
			let snapshot: Qari[] = [];
			update((items) => {
				const updated = items.map((q) => (q.id === id ? { ...q, is_active: !q.is_active } : q));
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});
			await syncCloud(snapshot);
		},
		deleteQari: async (id: number) => {
			let snapshot: Qari[] = [];
			update((items) => {
				const updated = items.filter((q) => q.id !== id);
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(QARIS_STORAGE_KEY, JSON.stringify(updated));
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

export const qariStore = createQariStore();
