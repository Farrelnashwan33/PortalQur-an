import { writable, get } from 'svelte/store';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';
import { SURAH_LIST } from '$lib/data/surahList';

export interface ManagedUser {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	role: 'customer' | 'admin';
	is_active: boolean;
	ayahs_read: number;
	streak: number;
	last_surah?: string;
	source?: 'live' | 'database';
	created_at: string;
}

const USERS_STORAGE_KEY = 'pq_managed_users_v34';
const DELETED_USERS_KEY = 'pq_deleted_users_v34';
const SUPABASE_DIRECTORY_KEY = 'jamaah_directory_v34';

// Data jamaah bawaan dari database SQL komunitas Portal Qur'an
export const DATABASE_JAMAAH_SEEDS: ManagedUser[] = [
	{
		id: '11111111-1111-4111-8111-000000000001',
		name: 'Administrator Portal Qur\'an',
		email: 'admin@portalquran.id',
		phone: '081234567890',
		role: 'admin',
		is_active: true,
		ayahs_read: 640,
		streak: 24,
		last_surah: 'Al-Baqarah : 255',
		source: 'database',
		created_at: '2026-08-01'
	},
	{
		id: '11111111-1111-4111-8111-000000000002',
		name: 'Yadi',
		email: 'yadifarrel@gmail.com',
		phone: '081234567891',
		role: 'admin',
		is_active: true,
		ayahs_read: 425,
		streak: 18,
		last_surah: 'Al-Kahf : 10',
		source: 'live',
		created_at: '2026-08-03'
	},
	{
		id: '11111111-1111-4111-8111-000000000003',
		name: 'H. Ahmad Fauzi Ridwan',
		email: 'ahmad.fauzi@gmail.com',
		phone: '081319823401',
		role: 'customer',
		is_active: true,
		ayahs_read: 1240,
		streak: 32,
		last_surah: 'Ali \'Imran : 134',
		source: 'database',
		created_at: '2026-08-05'
	},
	{
		id: '11111111-1111-4111-8111-000000000004',
		name: 'Hj. Siti Nurhaliza Aminah',
		email: 'siti.aminah88@gmail.com',
		phone: '081287654312',
		role: 'customer',
		is_active: true,
		ayahs_read: 980,
		streak: 27,
		last_surah: 'Maryam : 31',
		source: 'database',
		created_at: '2026-08-07'
	},
	{
		id: '11111111-1111-4111-8111-000000000005',
		name: 'Muhammad Rizky Pratama',
		email: 'm.rizky.pratama@gmail.com',
		phone: '085712398745',
		role: 'customer',
		is_active: true,
		ayahs_read: 512,
		streak: 14,
		last_surah: 'Al-Mulk : 15',
		source: 'database',
		created_at: '2026-08-10'
	},
	{
		id: '11111111-1111-4111-8111-000000000006',
		name: 'Aisyah Azzahra Putri',
		email: 'aisyah.azzahra@yahoo.com',
		phone: '081398765120',
		role: 'customer',
		is_active: true,
		ayahs_read: 875,
		streak: 21,
		last_surah: 'Ar-Rahman : 60',
		source: 'database',
		created_at: '2026-08-11'
	},
	{
		id: '11111111-1111-4111-8111-000000000007',
		name: 'Ust. Hasan Basri Al-Hafizh',
		email: 'hasan.basri@pesantren.id',
		phone: '082134569870',
		role: 'customer',
		is_active: true,
		ayahs_read: 2150,
		streak: 45,
		last_surah: 'Yusuf : 101',
		source: 'database',
		created_at: '2026-08-12'
	},
	{
		id: '11111111-1111-4111-8111-000000000008',
		name: 'Fatimah Khairunnisa',
		email: 'fatimah.khairun@gmail.com',
		phone: '085267812390',
		role: 'customer',
		is_active: true,
		ayahs_read: 430,
		streak: 11,
		last_surah: 'Al-Waqi\'ah : 40',
		source: 'database',
		created_at: '2026-08-14'
	},
	{
		id: '11111111-1111-4111-8111-000000000009',
		name: 'Abdurrahman Wahid Syahputra',
		email: 'abdurrahman.syah@gmail.com',
		phone: '081908723456',
		role: 'customer',
		is_active: true,
		ayahs_read: 365,
		streak: 9,
		last_surah: 'Ya Sin : 83',
		source: 'database',
		created_at: '2026-08-16'
	},
	{
		id: '11111111-1111-4111-8111-000000000010',
		name: 'Nabila Syakieb Rahmawati',
		email: 'nabila.rahmawati@gmail.com',
		phone: '087812340987',
		role: 'customer',
		is_active: true,
		ayahs_read: 690,
		streak: 16,
		last_surah: 'An-Nur : 35',
		source: 'database',
		created_at: '2026-08-18'
	},
	{
		id: '11111111-1111-4111-8111-000000000011',
		name: 'Budi Santoso Wijaya',
		email: 'budi.santoso.jkt@gmail.com',
		phone: '081123458901',
		role: 'customer',
		is_active: true,
		ayahs_read: 290,
		streak: 6,
		last_surah: 'Al-Kahf : 110',
		source: 'database',
		created_at: '2026-08-20'
	},
	{
		id: '11111111-1111-4111-8111-000000000012',
		name: 'Khadijah Mardhiyah',
		email: 'khadijah.mardhiyah@gmail.com',
		phone: '082298712345',
		role: 'customer',
		is_active: true,
		ayahs_read: 1120,
		streak: 29,
		last_surah: 'At-Taubah : 128',
		source: 'database',
		created_at: '2026-08-22'
	},
	{
		id: '11111111-1111-4111-8111-000000000013',
		name: 'Ilham Ramadhan Saputra',
		email: 'ilham.ramadhan@outlook.com',
		phone: '085690123478',
		role: 'customer',
		is_active: true,
		ayahs_read: 340,
		streak: 8,
		last_surah: 'Al-Isra\' : 23',
		source: 'database',
		created_at: '2026-08-25'
	},
	{
		id: '11111111-1111-4111-8111-000000000014',
		name: 'Zainab Al-Kaff',
		email: 'zainab.alkaff@gmail.com',
		phone: '081345098712',
		role: 'customer',
		is_active: true,
		ayahs_read: 780,
		streak: 19,
		last_surah: 'Luqman : 19',
		source: 'database',
		created_at: '2026-08-28'
	},
	{
		id: '11111111-1111-4111-8111-000000000015',
		name: 'Fajar Siddiq Maulana',
		email: 'fajar.maulana@gmail.com',
		phone: '085876543219',
		role: 'customer',
		is_active: true,
		ayahs_read: 215,
		streak: 5,
		last_surah: 'Al-Fajr : 30',
		source: 'database',
		created_at: '2026-09-01'
	},
	{
		id: '11111111-1111-4111-8111-000000000016',
		name: 'Dewi Sartika Lestari',
		email: 'dewi.lestari.bdg@gmail.com',
		phone: '081223344556',
		role: 'customer',
		is_active: true,
		ayahs_read: 540,
		streak: 12,
		last_surah: 'Taha : 114',
		source: 'database',
		created_at: '2026-09-03'
	},
	{
		id: '11111111-1111-4111-8111-000000000017',
		name: 'Hendra Gunawan',
		email: 'hendra.gunawan@gmail.com',
		phone: '081876512349',
		role: 'customer',
		is_active: false,
		ayahs_read: 95,
		streak: 2,
		last_surah: 'Al-Fatihah : 7',
		source: 'database',
		created_at: '2026-09-05'
	},
	{
		id: '11111111-1111-4111-8111-000000000018',
		name: 'Salma Salsabila',
		email: 'salma.salsabila@gmail.com',
		phone: '082187650934',
		role: 'customer',
		is_active: true,
		ayahs_read: 615,
		streak: 15,
		last_surah: 'Ad-Duha : 11',
		source: 'database',
		created_at: '2026-09-07'
	},
	{
		id: '11111111-1111-4111-8111-000000000019',
		name: 'Ridho Illahi Kurniawan',
		email: 'ridho.kurniawan@gmail.com',
		phone: '085312987654',
		role: 'customer',
		is_active: true,
		ayahs_read: 470,
		streak: 10,
		last_surah: 'Al-Hasyr : 24',
		source: 'database',
		created_at: '2026-09-09'
	},
	{
		id: '11111111-1111-4111-8111-000000000020',
		name: 'Ummu Kultsum Hidayah',
		email: 'ummu.hidayah@gmail.com',
		phone: '081376548902',
		role: 'customer',
		is_active: true,
		ayahs_read: 930,
		streak: 22,
		last_surah: 'Al-Mujadalah : 11',
		source: 'database',
		created_at: '2026-09-11'
	},
	{
		id: '11111111-1111-4111-8111-000000000021',
		name: 'Luthfi Hakim Anshori',
		email: 'luthfi.anshori@gmail.com',
		phone: '089612348765',
		role: 'customer',
		is_active: true,
		ayahs_read: 388,
		streak: 9,
		last_surah: 'Al-Anfal : 46',
		source: 'database',
		created_at: '2026-09-12'
	},
	{
		id: '11111111-1111-4111-8111-000000000022',
		name: 'Hafshah Nurul Izzah',
		email: 'hafshah.izzah@gmail.com',
		phone: '081290876543',
		role: 'customer',
		is_active: true,
		ayahs_read: 810,
		streak: 20,
		last_surah: 'Al-Furqan : 74',
		source: 'database',
		created_at: '2026-09-14'
	},
	{
		id: '11111111-1111-4111-8111-000000000023',
		name: 'Syahrul Gunawan Al-Farisi',
		email: 'syahrul.alfarisi@gmail.com',
		phone: '085789012345',
		role: 'customer',
		is_active: true,
		ayahs_read: 275,
		streak: 7,
		last_surah: 'Al-Ikhlas : 4',
		source: 'database',
		created_at: '2026-09-15'
	},
	{
		id: '11111111-1111-4111-8111-000000000024',
		name: 'Maryam Jamilah',
		email: 'maryam.jamilah@gmail.com',
		phone: '081365432198',
		role: 'customer',
		is_active: true,
		ayahs_read: 645,
		streak: 14,
		last_surah: 'Al-Insyirah : 8',
		source: 'database',
		created_at: '2026-09-16'
	}
];

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

function getSurahName(surahNumber?: number): string {
	if (!surahNumber) return 'Al-Fatihah';
	return SURAH_LIST.find((s) => s.number === surahNumber)?.name_latin || `Surah ${surahNumber}`;
}

function loadDeletedSet(): Set<string> {
	if (typeof window === 'undefined') return new Set();
	try {
		const raw = localStorage.getItem(DELETED_USERS_KEY);
		if (raw) return new Set(JSON.parse(raw));
	} catch {}
	return new Set();
}

function saveDeletedSet(setIds: Set<string>) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(DELETED_USERS_KEY, JSON.stringify([...setIds]));
	}
}

function mergeUniqueUsers(lists: ManagedUser[][], deletedIds: Set<string>): ManagedUser[] {
	const byKey = new Map<string, ManagedUser>();

	for (const list of lists) {
		for (const u of list) {
			if (!u) continue;
			const emailKey = (u.email || '').trim().toLowerCase();
			if (deletedIds.has(u.id) || (emailKey && deletedIds.has(emailKey))) continue;

			const key = emailKey || u.id;
			const existing = byKey.get(key);
			if (!existing) {
				byKey.set(key, { ...u });
			} else {
				// Prefer live data & higher reading progress
				byKey.set(key, {
					...existing,
					...u,
					id: existing.source === 'live' ? existing.id : u.id,
					source: existing.source === 'live' || u.source === 'live' ? 'live' : 'database',
					ayahs_read: Math.max(existing.ayahs_read || 0, u.ayahs_read || 0),
					streak: Math.max(existing.streak || 0, u.streak || 0),
					last_surah: u.last_surah || existing.last_surah
				});
			}
		}
	}

	return Array.from(byKey.values()).sort((a, b) => {
		if (a.role === 'admin' && b.role !== 'admin') return -1;
		if (b.role === 'admin' && a.role !== 'admin') return 1;
		if (a.source === 'live' && b.source !== 'live') return -1;
		if (b.source === 'live' && a.source !== 'live') return 1;
		return (b.created_at || '').localeCompare(a.created_at || '');
	});
}

function createUsersStore() {
	const deletedIds = loadDeletedSet();
	let initialUsers: ManagedUser[] = mergeUniqueUsers([DATABASE_JAMAAH_SEEDS], deletedIds);

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(USERS_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as ManagedUser[];
				initialUsers = mergeUniqueUsers([parsed, DATABASE_JAMAAH_SEEDS], deletedIds);
			} catch {
				initialUsers = mergeUniqueUsers([DATABASE_JAMAAH_SEEDS], deletedIds);
			}
		}
	}

	const { subscribe, set, update } = writable<ManagedUser[]>(initialUsers);

	function saveLocal(items: ManagedUser[]) {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(items));
			} catch {}
		}
	}

	async function syncCloudDirectory(items: ManagedUser[]) {
		if (!isSupabaseConfigured()) return;
		try {
			await supabase.from('app_settings').upsert(
				{
					key: SUPABASE_DIRECTORY_KEY,
					value: {
						users: items,
						deleted: [...loadDeletedSet()],
						updatedAt: new Date().toISOString()
					},
					description: 'Direktori terpadu jamaah Portal Qur\'an'
				},
				{ onConflict: 'key' }
			);
		} catch {}
	}

	return {
		subscribe,

		fetchUsers: async () => {
			const deleted = loadDeletedSet();
			let liveProfiles: ManagedUser[] = [];
			let cloudDirectoryUsers: ManagedUser[] = [];

			if (isSupabaseConfigured()) {
				try {
					const [profilesRes, progressRes, sessionsRes, directoryRes] = await Promise.allSettled([
						supabase.from('profiles').select('*').order('created_at', { ascending: false }),
						supabase.from('reading_progress').select('user_id, surah_number, ayah_number, juz_number, updated_at'),
						supabase.from('reading_sessions').select('user_id, ayahs_read_count'),
						supabase.from('app_settings').select('value').eq('key', SUPABASE_DIRECTORY_KEY).maybeSingle()
					]);

					// Parse reading progress map per user_id
					const progressByUser = new Map<string, { last_surah: string; juz: number }>();
					if (progressRes.status === 'fulfilled' && progressRes.value.data) {
						for (const row of progressRes.value.data as any[]) {
							progressByUser.set(row.user_id, {
								last_surah: `${getSurahName(row.surah_number)} : ${row.ayah_number || 1}`,
								juz: row.juz_number || 1
							});
						}
					}

					// Parse total ayahs read from sessions
					const ayahsByUser = new Map<string, number>();
					if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data) {
						for (const row of sessionsRes.value.data as any[]) {
							ayahsByUser.set(row.user_id, (ayahsByUser.get(row.user_id) || 0) + (row.ayahs_read_count || 0));
						}
					}

					// Parse cloud directory if saved
					if (directoryRes.status === 'fulfilled' && directoryRes.value.data?.value) {
						const val = directoryRes.value.data.value as any;
						if (Array.isArray(val.deleted)) {
							for (const d of val.deleted) deleted.add(d);
							saveDeletedSet(deleted);
						}
						if (Array.isArray(val.users)) {
							cloudDirectoryUsers = val.users;
						}
					}

					if (profilesRes.status === 'fulfilled' && profilesRes.value.data) {
						liveProfiles = (profilesRes.value.data as any[]).map((p) => {
							const prog = progressByUser.get(p.id);
							const sessAyahs = ayahsByUser.get(p.id) || 0;
							const cleanEmail = (p.email || '').toLowerCase();
							return {
								id: p.id,
								name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : (p.full_name || (p.email ? p.email.split('@')[0] : 'Jamaah Portal Qur\'an')),
								email: p.email || '',
								phone: p.phone || '',
								role: p.role || (cleanEmail.includes('admin') || cleanEmail === 'yadifarrel@gmail.com' ? 'admin' : 'customer'),
								is_active: p.is_active !== false,
								ayahs_read: Math.max(sessAyahs, p.daily_target_ayahs && p.daily_target_ayahs > 10 ? p.daily_target_ayahs : 25),
								streak: prog?.juz || (p.reading_target_juz && p.reading_target_juz < 30 ? p.reading_target_juz : 5),
								last_surah: prog?.last_surah || 'Al-Fatihah : 1',
								source: 'live',
								created_at: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
							};
						});
					}
				} catch (err) {
					console.warn('Error fetching Supabase users:', err);
				}
			}

			const currentLocal = get({ subscribe });
			const merged = mergeUniqueUsers(
				[liveProfiles, cloudDirectoryUsers, currentLocal, DATABASE_JAMAAH_SEEDS],
				deleted
			);

			set(merged);
			saveLocal(merged);
			return merged;
		},

		// Dipanggil otomatis saat jamaah daftar, login, atau membuka bacaan Al-Qur'an
		syncActiveJamaah: async (profile: {
			id: string;
			full_name: string;
			email?: string;
			phone?: string;
			role?: 'customer' | 'admin';
			is_active?: boolean;
			created_at?: string;
		}, readingInfo?: { last_surah?: string; ayahs_read?: number; streak?: number }) => {
			if (!profile || (!profile.email && !profile.full_name)) return;

			const cleanEmail = (profile.email || '').trim().toLowerCase();
			const deleted = loadDeletedSet();
			deleted.delete(profile.id);
			if (cleanEmail) deleted.delete(cleanEmail);
			saveDeletedSet(deleted);

			const entry: ManagedUser = {
				id: profile.id || generateUuid(),
				name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : (profile.full_name || cleanEmail.split('@')[0] || 'Sahabat Qur\'an'),
				email: cleanEmail,
				phone: profile.phone || '',
				role: profile.role || (cleanEmail.includes('admin') ? 'admin' : 'customer'),
				is_active: profile.is_active !== false,
				ayahs_read: readingInfo?.ayahs_read ?? 15,
				streak: readingInfo?.streak ?? 1,
				last_surah: readingInfo?.last_surah || 'Al-Fatihah : 1',
				source: 'live',
				created_at: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
			};

			let snapshot: ManagedUser[] = [];
			update((items) => {
				snapshot = mergeUniqueUsers([[entry], items], deleted);
				saveLocal(snapshot);
				return snapshot;
			});

			if (isSupabaseConfigured()) {
				try {
					const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.id);
					if (isUuid) {
						await supabase.from('profiles').upsert(
							{
								id: entry.id,
								full_name: entry.name,
								email: entry.email || null,
								phone: entry.phone || null,
								role: entry.role,
								is_active: entry.is_active,
								last_login_at: new Date().toISOString()
							},
							{ onConflict: 'id' }
						);
					}
				} catch {}
				await syncCloudDirectory(snapshot);
			}
		},

		recordReadingActivity: async (emailOrId: string, lastSurahLabel: string, totalAyahsRead: number, streakDays: number) => {
			if (!emailOrId) return;
			const cleanTarget = emailOrId.trim().toLowerCase();
			let snapshot: ManagedUser[] = [];

			update((items) => {
				const updated = items.map((u) => {
					if (u.id === emailOrId || (u.email && u.email.toLowerCase() === cleanTarget)) {
						return {
							...u,
							last_surah: lastSurahLabel,
							ayahs_read: Math.max(u.ayahs_read || 0, totalAyahsRead),
							streak: Math.max(u.streak || 1, streakDays),
							source: 'live' as const
						};
					}
					return u;
				});
				snapshot = updated;
				saveLocal(updated);
				return updated;
			});

			if (snapshot.length > 0) {
				await syncCloudDirectory(snapshot);
			}
		},

		addUser: async (user: Omit<ManagedUser, 'id'> & { id?: string }) => {
			const finalUser: ManagedUser = {
				...user,
				id: user.id && /^[0-9a-f-]{36}$/i.test(user.id) ? user.id : generateUuid(),
				source: 'live'
			};

			const deleted = loadDeletedSet();
			deleted.delete(finalUser.id);
			if (finalUser.email) deleted.delete(finalUser.email.toLowerCase());
			saveDeletedSet(deleted);

			let snapshot: ManagedUser[] = [];
			update((items) => {
				snapshot = mergeUniqueUsers([[finalUser], items], deleted);
				saveLocal(snapshot);
				return snapshot;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').upsert(
						{
							id: finalUser.id,
							full_name: finalUser.name,
							email: finalUser.email || null,
							phone: finalUser.phone || null,
							role: finalUser.role,
							is_active: finalUser.is_active,
							daily_target_ayahs: finalUser.ayahs_read || 10,
							reading_target_juz: finalUser.streak || 30,
							created_at: new Date().toISOString()
						},
						{ onConflict: 'id' }
					);
				} catch {}
				await syncCloudDirectory(snapshot);
			}
		},

		updateUser: async (id: string, updates: Partial<ManagedUser>) => {
			let snapshot: ManagedUser[] = [];
			update((items) => {
				const updated = items.map((u) => (u.id === id ? { ...u, ...updates } : u));
				snapshot = updated;
				saveLocal(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					const dbPatch: Record<string, any> = {};
					if (updates.name !== undefined) dbPatch.full_name = updates.name;
					if (updates.email !== undefined) dbPatch.email = updates.email;
					if (updates.phone !== undefined) dbPatch.phone = updates.phone;
					if (updates.role !== undefined) dbPatch.role = updates.role;
					if (updates.is_active !== undefined) dbPatch.is_active = updates.is_active;
					if (Object.keys(dbPatch).length > 0) {
						await supabase.from('profiles').update(dbPatch).eq('id', id);
					}
				} catch {}
				await syncCloudDirectory(snapshot);
			}
		},

		toggleActive: async (id: string) => {
			let nextActive = true;
			let snapshot: ManagedUser[] = [];
			update((items) => {
				const updated = items.map((u) => {
					if (u.id === id) {
						nextActive = !u.is_active;
						return { ...u, is_active: nextActive };
					}
					return u;
				});
				snapshot = updated;
				saveLocal(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').update({ is_active: nextActive }).eq('id', id);
				} catch {}
				await syncCloudDirectory(snapshot);
			}
		},

		toggleRole: async (id: string) => {
			let newRole: 'customer' | 'admin' = 'customer';
			let snapshot: ManagedUser[] = [];
			update((items) => {
				const updated: ManagedUser[] = items.map((u) => {
					if (u.id === id) {
						newRole = u.role === 'admin' ? 'customer' : 'admin';
						return { ...u, role: newRole };
					}
					return u;
				});
				snapshot = updated;
				saveLocal(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').update({ role: newRole }).eq('id', id);
				} catch {}
				await syncCloudDirectory(snapshot);
			}
		},

		deleteUser: async (id: string) => {
			const deleted = loadDeletedSet();
			deleted.add(id);

			let snapshot: ManagedUser[] = [];
			update((items) => {
				const target = items.find((u) => u.id === id);
				if (target?.email) deleted.add(target.email.toLowerCase());
				saveDeletedSet(deleted);

				const updated = items.filter((u) => u.id !== id);
				snapshot = updated;
				saveLocal(updated);
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					await supabase.from('profiles').delete().eq('id', id);
				} catch {}
				await syncCloudDirectory(snapshot);
			}
		},

		importDatabaseSeeds: async () => {
			saveDeletedSet(new Set());
			let snapshot: ManagedUser[] = [];
			update((items) => {
				snapshot = mergeUniqueUsers([items, DATABASE_JAMAAH_SEEDS], new Set());
				saveLocal(snapshot);
				return snapshot;
			});

			if (isSupabaseConfigured()) {
				try {
					const rows = DATABASE_JAMAAH_SEEDS.map((u) => ({
						id: u.id,
						full_name: u.name,
						email: u.email || null,
						phone: u.phone || null,
						role: u.role,
						is_active: u.is_active,
						daily_target_ayahs: u.ayahs_read,
						reading_target_juz: u.streak
					}));
					await supabase.from('profiles').upsert(rows, { onConflict: 'id' });
				} catch {}
				await syncCloudDirectory(snapshot);
			}
			return snapshot;
		}
	};
}

export const usersStore = createUsersStore();
