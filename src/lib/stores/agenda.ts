import { writable } from 'svelte/store';
import type { Agenda } from '$lib/types/quran';
import { SAMPLE_AGENDAS } from '$lib/data/sampleAgendas';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const AGENDAS_STORAGE_KEY = 'pq_agendas_data_v34';
const SUPABASE_AGENDAS_FALLBACK_KEY = 'custom_agendas_v34';

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
	Kajian: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop',
	Tilawah: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop',
	Event: '/images/agendas/tilawah-harian.jpg',
	Pengingat: '/images/agendas/alkahfi-friday.jpg'
};

function generateUuid(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function normalizeAgendaItem(agenda: Agenda): Agenda {
	const url = agenda.image_url?.trim() || '';
	if (url.includes('photo-1507692049790-de58290a4334')) {
		return { ...agenda, image_url: '/images/agendas/alkahfi-friday.jpg' };
	}
	if (url.includes('photo-1542838132-92c53300491e')) {
		return { ...agenda, image_url: '/images/agendas/tilawah-harian.jpg' };
	}
	if (!url) {
		return {
			...agenda,
			image_url: CATEGORY_DEFAULT_IMAGES[agenda.category] || '/images/agendas/alkahfi-friday.jpg'
		};
	}
	return agenda;
}

function normalizeAgendas(items: Agenda[]): Agenda[] {
	return items.map(normalizeAgendaItem);
}

function createAgendaStore() {
	let initialAgendas: Agenda[] = normalizeAgendas(SAMPLE_AGENDAS);

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(AGENDAS_STORAGE_KEY) || localStorage.getItem('pq_agendas_data_v33');
		if (stored) {
			try {
				initialAgendas = normalizeAgendas(JSON.parse(stored));
				localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(initialAgendas));
			} catch {
				initialAgendas = normalizeAgendas(SAMPLE_AGENDAS);
			}
		}
	}

	const { subscribe, set, update } = writable<Agenda[]>(initialAgendas);
	let bc: BroadcastChannel | null = null;

	async function syncSettingsBackup(items: Agenda[]) {
		if (!isSupabaseConfigured()) return;
		try {
			await supabase.from('app_settings').upsert(
				{
					key: SUPABASE_AGENDAS_FALLBACK_KEY,
					value: items,
					description: 'Daftar agenda kajian & pengingat jamaah',
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'key' }
			);
		} catch {}
	}

	async function refreshFromCloud() {
		if (!isSupabaseConfigured()) return;
		try {
			const [settingsRes, tableRes] = await Promise.allSettled([
				supabase.from('app_settings').select('value').eq('key', SUPABASE_AGENDAS_FALLBACK_KEY).maybeSingle(),
				supabase.from('agendas').select('*').order('event_date', { ascending: true })
			]);

			if (settingsRes.status === 'fulfilled' && Array.isArray(settingsRes.value.data?.value) && settingsRes.value.data.value.length > 0) {
				const normalized = normalizeAgendas(settingsRes.value.data.value as Agenda[]);
				set(normalized);
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(normalized));
				}
				return;
			}

			if (tableRes.status === 'fulfilled' && !tableRes.value.error && tableRes.value.data && tableRes.value.data.length > 0) {
				const normalized = normalizeAgendas(tableRes.value.data as Agenda[]);
				set(normalized);
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(normalized));
				}
			}
		} catch {}
	}

	if (typeof window !== 'undefined') {
		try {
			if ('BroadcastChannel' in window) {
				bc = new BroadcastChannel('pq_agendas_sync');
				bc.onmessage = (ev) => {
					if (Array.isArray(ev?.data)) {
						const normalized = normalizeAgendas(ev.data);
						set(normalized);
						localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(normalized));
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
		addAgenda: async (agenda: Agenda) => {
			const cleanId = /^[0-9a-f-]{36}$/i.test(agenda.id) ? agenda.id : generateUuid();
			const normalizedAgenda = normalizeAgendaItem({ ...agenda, id: cleanId });
			let snapshot: Agenda[] = [];

			update((items) => {
				const updated = [normalizedAgenda, ...items];
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').upsert([normalizedAgenda], { onConflict: 'id' });
				} catch {}
				await syncSettingsBackup(snapshot);
			}
		},
		updateAgenda: async (id: string, updates: Partial<Agenda>) => {
			let snapshot: Agenda[] = [];
			update((items) => {
				const updated = items.map((a) => (a.id === id ? normalizeAgendaItem({ ...a, ...updates }) : a));
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').update(updates).eq('id', id);
				} catch {}
				await syncSettingsBackup(snapshot);
			}
		},
		deleteAgenda: async (id: string) => {
			let snapshot: Agenda[] = [];
			update((items) => {
				const updated = items.filter((a) => a.id !== id);
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				try {
					bc?.postMessage(updated);
				} catch {}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').delete().eq('id', id);
				} catch {}
				await syncSettingsBackup(snapshot);
			}
		}
	};
}

export const agendaStore = createAgendaStore();
