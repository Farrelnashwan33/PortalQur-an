import { writable } from 'svelte/store';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

export interface ManagedUser {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	role: 'customer' | 'admin';
	is_active: boolean;
	ayahs_read: number;
	streak: number;
	created_at: string;
}

const USERS_STORAGE_KEY = 'pq_managed_users_v33';

function createUsersStore() {
	let initialUsers: ManagedUser[] = [];

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(USERS_STORAGE_KEY);
		if (stored) {
			try {
				initialUsers = JSON.parse(stored);
			} catch {
				initialUsers = [];
			}
		}
	}

	const { subscribe, set, update } = writable<ManagedUser[]>(initialUsers);

	function save(items: ManagedUser[]) {
		if (typeof window !== 'undefined') {
			localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(items));
		}
	}

	return {
		subscribe,
		fetchUsers: async () => {
			if (isSupabaseConfigured()) {
				try {
					const { data, error } = await supabase
						.from('profiles')
						.select('*')
						.order('created_at', { ascending: false });

					if (!error && data) {
						const mapped: ManagedUser[] = data.map((p: any) => ({
							id: p.id,
							name: p.full_name || 'Pengguna',
							email: p.email || '',
							phone: p.phone || '',
							role: p.role || 'customer',
							is_active: p.is_active !== false,
							ayahs_read: p.daily_target_ayahs || 0,
							streak: p.reading_target_juz || 0,
							created_at: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
						}));
						set(mapped);
						save(mapped);
						return mapped;
					}
				} catch (err) {
					console.warn('Error fetching Supabase users:', err);
				}
			}
			return [];
		},
		addUser: async (user: ManagedUser) => {
			update((items) => {
				const updated = [user, ...items];
				save(updated);
				return updated;
			});
		},
		toggleActive: async (id: string) => {
			update((items) => {
				const updated = items.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
				save(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					const current = (await supabase.from('profiles').select('is_active').eq('id', id).single()).data;
					if (current !== null) {
						await supabase.from('profiles').update({ is_active: !current.is_active }).eq('id', id);
					}
				} catch {}
			}
		},
		toggleRole: async (id: string) => {
			let newRole: 'customer' | 'admin' = 'customer';
			update((items) => {
				const updated: ManagedUser[] = items.map((u) => {
					if (u.id === id) {
						newRole = u.role === 'admin' ? 'customer' : 'admin';
						return { ...u, role: newRole };
					}
					return u;
				});
				save(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').update({ role: newRole }).eq('id', id);
				} catch {}
			}
		},
		deleteUser: async (id: string) => {
			update((items) => {
				const updated = items.filter((u) => u.id !== id);
				save(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').delete().eq('id', id);
				} catch {}
			}
		}
	};
}

export const usersStore = createUsersStore();
