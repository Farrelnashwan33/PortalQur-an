import { writable } from 'svelte/store';

export interface ManagedUser {
	id: string;
	name: string;
	phone: string;
	email?: string;
	role: 'customer' | 'admin';
	is_active: boolean;
	ayahs_read: number;
	streak: number;
	created_at: string;
}

const DEFAULT_USERS: ManagedUser[] = [
	{ id: 'usr-1', name: 'Ahmad Fauzan', phone: '081234567891', email: 'fauzan@gmail.com', role: 'customer', is_active: true, ayahs_read: 420, streak: 14, created_at: '2026-08-10' },
	{ id: 'usr-2', name: 'Rina Salsabila', phone: '081398765432', email: 'rina.salsa@yahoo.com', role: 'customer', is_active: true, ayahs_read: 280, streak: 7, created_at: '2026-08-15' },
	{ id: 'usr-3', name: 'Farrel Nashwan', phone: '081299998888', email: 'farrel@portalquran.id', role: 'admin', is_active: true, ayahs_read: 890, streak: 30, created_at: '2026-07-01' },
	{ id: 'usr-4', name: 'Muhammad Zulkarnain', phone: '081122334455', email: 'dr.zulkarnain@kemenag.go.id', role: 'admin', is_active: true, ayahs_read: 1200, streak: 45, created_at: '2026-07-15' },
	{ id: 'usr-5', name: 'Dimas Pratama', phone: '085678901234', email: 'dimas.p@gmail.com', role: 'customer', is_active: true, ayahs_read: 110, streak: 3, created_at: '2026-09-01' },
	{ id: 'usr-6', name: 'Aisyah Putri', phone: '087712345678', email: 'aisyah.p@outlook.com', role: 'customer', is_active: false, ayahs_read: 45, streak: 0, created_at: '2026-09-05' }
];

const USERS_STORAGE_KEY = 'pq_managed_users_v33';

function createUsersStore() {
	let initialUsers: ManagedUser[] = DEFAULT_USERS;

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(USERS_STORAGE_KEY);
		if (stored) {
			try {
				initialUsers = JSON.parse(stored);
			} catch {
				initialUsers = DEFAULT_USERS;
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
		addUser: (user: ManagedUser) => {
			update((items) => {
				const updated = [user, ...items];
				save(updated);
				return updated;
			});
		},
		toggleActive: (id: string) => {
			update((items) => {
				const updated = items.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
				save(updated);
				return updated;
			});
		},
		toggleRole: (id: string) => {
			update((items) => {
				const updated: ManagedUser[] = items.map((u) => {
					if (u.id === id) {
						const nextRole: 'customer' | 'admin' = u.role === 'admin' ? 'customer' : 'admin';
						return { ...u, role: nextRole };
					}
					return u;
				});
				save(updated);
				return updated;
			});
		},
		deleteUser: (id: string) => {
			update((items) => {
				const updated = items.filter((u) => u.id !== id);
				save(updated);
				return updated;
			});
		},
		updatePassword: (id: string, phone: string, newPass: string) => {
			if (typeof window !== 'undefined') {
				const cleanPhone = phone.trim().replace(/[\s-]/g, '');
				localStorage.setItem(`pq_pwd_${cleanPhone}`, newPass);
				localStorage.setItem(`pq_pwd_${id}`, newPass);
			}
		}
	};
}

export const usersStore = createUsersStore();
