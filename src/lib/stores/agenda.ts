import { writable } from 'svelte/store';
import type { Agenda } from '$lib/types/quran';
import { SAMPLE_AGENDAS } from '$lib/data/sampleAgendas';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const AGENDAS_STORAGE_KEY = 'pq_agendas_data_v33';

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
	Kajian: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop',
	Tilawah: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop',
	Event: '/images/agendas/tilawah-harian.jpg',
	Pengingat: '/images/agendas/alkahfi-friday.jpg'
};

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
		const stored = localStorage.getItem(AGENDAS_STORAGE_KEY);
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

	// Fetch fresh from Supabase if configured
	if (typeof window !== 'undefined' && isSupabaseConfigured()) {
		(async () => {
			try {
				const { data, error } = await supabase
					.from('agendas')
					.select('*')
					.order('event_date', { ascending: true });
				if (!error && data && data.length > 0) {
					const normalized = normalizeAgendas(data as Agenda[]);
					set(normalized);
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(normalized));
				}
			} catch {}
		})();
	}

	return {
		subscribe,
		addAgenda: async (agenda: Agenda) => {
			const normalizedAgenda = normalizeAgendaItem(agenda);
			update((items) => {
				const updated = [normalizedAgenda, ...items];
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').insert([normalizedAgenda]);
				} catch (e) {
					console.warn('Supabase agenda insert error:', e);
				}
			}
		},
		updateAgenda: async (id: string, updates: Partial<Agenda>) => {
			update((items) => {
				const updated = items.map((a) => (a.id === id ? { ...a, ...updates } : a));
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').update(updates).eq('id', id);
				} catch (e) {
					console.warn('Supabase agenda update error:', e);
				}
			}
		},
		deleteAgenda: async (id: string) => {
			update((items) => {
				const updated = items.filter((a) => a.id !== id);
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').delete().eq('id', id);
				} catch (e) {
					console.warn('Supabase agenda delete error:', e);
				}
			}
		}
	};
}

export const agendaStore = createAgendaStore();
