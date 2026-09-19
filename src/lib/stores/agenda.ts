import { writable } from 'svelte/store';
import type { Agenda } from '$lib/types/quran';
import { SAMPLE_AGENDAS } from '$lib/data/sampleAgendas';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

const AGENDAS_STORAGE_KEY = 'pq_agendas_data_v33';

function createAgendaStore() {
	let initialAgendas: Agenda[] = SAMPLE_AGENDAS;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(AGENDAS_STORAGE_KEY);
		if (stored) {
			try {
				initialAgendas = JSON.parse(stored);
			} catch {
				initialAgendas = SAMPLE_AGENDAS;
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
					set(data as Agenda[]);
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(data));
				}
			} catch {}
		})();
	}

	return {
		subscribe,
		addAgenda: async (agenda: Agenda) => {
			update((items) => {
				const updated = [agenda, ...items];
				if (typeof window !== 'undefined') {
					localStorage.setItem(AGENDAS_STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('agendas').insert([agenda]);
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
