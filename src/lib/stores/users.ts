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

					if (!error && data && data.length > 0) {
						const mapped: ManagedUser[] = data.map((p: any) => ({
							id: p.id,
							name: p.full_name || (p.email ? p.email.split('@')[0] : 'Pengguna'),
							email: p.email || '',
							phone: p.phone || '',
							role: p.role || (p.email?.includes('admin') ? 'admin' : 'customer'),
							is_active: p.is_active !== false,
							ayahs_read: p.daily_target_ayahs || 10,
							streak: p.reading_target_juz || 30,
							created_at: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
						}));

						// Ensure primary users exist if not returned by query
						if (!mapped.some(u => u.email === 'yadifarrel@gmail.com')) {
							mapped.push({
								id: 'usr-yadi-01',
								name: 'Yadi',
								email: 'yadifarrel@gmail.com',
								phone: '081234567890',
								role: 'customer',
								is_active: true,
								ayahs_read: 120,
								streak: 7,
								created_at: new Date().toISOString().split('T')[0]
							});
						}

						set(mapped);
						save(mapped);
						return mapped;
					}
				} catch (err) {
					console.warn('Error fetching Supabase users:', err);
				}
			}

			// Default list containing both Admin and Yadi (Customer)
			const defaultList: ManagedUser[] = [
				{
					id: 'admin-001',
					name: 'Administrator Portal Qur\'an',
					email: 'admin@portalquran.id',
					phone: '081234567890',
					role: 'admin',
					is_active: true,
					ayahs_read: 284,
					streak: 15,
					created_at: new Date().toISOString().split('T')[0]
				},
				{
					id: 'usr-yadi-01',
					name: 'Yadi',
					email: 'yadifarrel@gmail.com',
					phone: '081234567891',
					role: 'customer',
					is_active: true,
					ayahs_read: 120,
					streak: 7,
					created_at: new Date().toISOString().split('T')[0]
				}
			];
			set(defaultList);
			save(defaultList);
			return defaultList;
		},
		addUser: async (user: ManagedUser) => {
			update((items) => {
				const updated = [user, ...items];
				save(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').upsert({
						id: user.id.startsWith('usr-') ? undefined : user.id,
						full_name: user.name,
						email: user.email,
						role: user.role,
						is_active: user.is_active,
						created_at: new Date().toISOString()
					});
				} catch (err) {
					console.warn('Could not sync added user to Supabase:', err);
				}
			}
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
