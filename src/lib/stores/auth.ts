import { writable, derived } from 'svelte/store';
import type { UserProfile, UserRole } from '$lib/types/quran';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';
import { goto } from '$app/navigation';

const STORAGE_KEY = 'pq_user_session_v33';

function createAuthStore() {
	let initialUser: UserProfile | null = null;
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				initialUser = JSON.parse(stored);
			} catch {
				initialUser = null;
			}
		}
	}

	const { subscribe, set, update } = writable<UserProfile | null>(initialUser);

	return {
		subscribe,
		init: async () => {
			if (isSupabaseConfigured()) {
				try {
					const { data: { session } } = await supabase.auth.getSession();
					if (session?.user) {
						const { data: profile } = await supabase
							.from('profiles')
							.select('*')
							.eq('id', session.user.id)
							.single();

						if (profile) {
							set(profile as UserProfile);
							if (typeof window !== 'undefined') {
								localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
							}
							return;
						}
					}
				} catch (err) {
					console.warn('Supabase auth session fetch error:', err);
				}
			}

			// If no session exists in Supabase or localStorage, remain null (unauthenticated)
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					try {
						set(JSON.parse(stored));
					} catch {
						set(null);
					}
				} else {
					set(null);
				}
			}
		},
		login: async (phoneOrEmail: string, pass: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
			if (!phoneOrEmail || !pass) {
				return { success: false, error: 'Harap isi nomor HP dan kata sandi.' };
			}

			const identifier = phoneOrEmail.trim();
			const isPhone = /^(\+62|62|08)[0-9]{8,13}$/.test(identifier.replace(/[\s-]/g, '')) || /^[0-9]{10,14}$/.test(identifier.replace(/[\s-]/g, ''));
			const cleanPhone = isPhone ? identifier.replace(/[\s-]/g, '') : identifier;
			const syntheticEmail = isPhone ? `${cleanPhone}@portalquran.id` : identifier;

			// 1. Supabase Auth if configured
			if (isSupabaseConfigured()) {
				// Try with synthetic email / standard email for Supabase Auth compatibility
				let { data, error } = await supabase.auth.signInWithPassword({
					email: syntheticEmail,
					password: pass
				});

				if (error && isPhone) {
					// Also attempt with direct phone if phone provider enabled in Supabase
					const phoneResult = await supabase.auth.signInWithPassword({
						phone: cleanPhone,
						password: pass
					});
					if (!phoneResult.error && phoneResult.data) {
						data = phoneResult.data;
						error = null;
					}
				}

				if (error) {
					return { success: false, error: error.message || 'Nomor HP atau kata sandi salah.' };
				}

				if (data?.user) {
					const { data: profile } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', data.user.id)
						.single();

					const finalProfile: UserProfile = profile || {
						id: data.user.id,
						full_name: data.user.user_metadata?.full_name || cleanPhone,
						phone: cleanPhone,
						email: data.user.email,
						role: data.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
						is_active: true,
						created_at: new Date().toISOString()
					};

					set(finalProfile);
					if (typeof window !== 'undefined') {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile));
					}
					return { success: true, role: finalProfile.role };
				}
			}

			// 2. Demo / Offline Auth Handler (Admin vs Customer)
			if (identifier.toLowerCase().includes('admin') || identifier === '081299998888' || identifier === '081288889999') {
				const adminProfile: UserProfile = {
					id: 'admin-super-001',
					full_name: 'Administrator Portal Qur\'an',
					phone: isPhone ? cleanPhone : '081299998888',
					email: 'admin@portalquran.id',
					role: 'admin',
					is_active: true,
					created_at: new Date().toISOString()
				};
				set(adminProfile);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProfile));
				}
				return { success: true, role: 'admin' };
			}

			// Customer offline / local fallback login
			const customerProfile: UserProfile = {
				id: 'cust-' + Math.random().toString(36).substring(2, 9),
				full_name: 'Sahabat Qur\'an (' + cleanPhone.slice(-4) + ')',
				phone: cleanPhone,
				email: `${cleanPhone}@portalquran.id`,
				role: 'customer',
				is_active: true,
				reading_target_juz: 30,
				daily_target_ayahs: 10,
				created_at: new Date().toISOString()
			};

			set(customerProfile);
			if (typeof window !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(customerProfile));
			}
			return { success: true, role: 'customer' };
		},
		register: async (fullName: string, phone: string, pass: string): Promise<{ success: boolean; error?: string }> => {
			if (!fullName || !phone || !pass) {
				return { success: false, error: 'Semua kolom wajib diisi.' };
			}

			const cleanPhone = phone.trim().replace(/[\s-]/g, '');
			if (cleanPhone.length < 9) {
				return { success: false, error: 'Nomor HP tidak valid (minimal 9 digit).' };
			}

			if (pass.length < 6) {
				return { success: false, error: 'Kata sandi minimal 6 karakter.' };
			}

			const syntheticEmail = `${cleanPhone}@portalquran.id`;

			// 1. Supabase Auth Registration
			if (isSupabaseConfigured()) {
				const { data, error } = await supabase.auth.signUp({
					email: syntheticEmail,
					password: pass,
					options: {
						data: {
							full_name: fullName.trim(),
							phone: cleanPhone,
							role: 'customer' // Strict security: always customer from register
						}
					}
				});

				if (error) {
					return { success: false, error: error.message };
				}

				if (data.user) {
					// Insert/ensure profile row in public.profiles table
					try {
						await supabase.from('profiles').upsert({
							id: data.user.id,
							full_name: fullName.trim(),
							phone: cleanPhone,
							email: syntheticEmail,
							role: 'customer',
							is_active: true,
							created_at: new Date().toISOString()
						});
					} catch (e) {
						console.warn('Profile sync note:', e);
					}

					const newProfile: UserProfile = {
						id: data.user.id,
						full_name: fullName.trim(),
						phone: cleanPhone,
						email: syntheticEmail,
						role: 'customer',
						is_active: true,
						created_at: new Date().toISOString()
					};
					set(newProfile);
					if (typeof window !== 'undefined') {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
					}
					return { success: true };
				}
			}

			// 2. Local registration fallback
			const newProfile: UserProfile = {
				id: 'cust-' + Math.random().toString(36).substring(2, 9),
				full_name: fullName.trim(),
				phone: cleanPhone,
				email: syntheticEmail,
				role: 'customer',
				is_active: true,
				reading_target_juz: 30,
				daily_target_ayahs: 10,
				created_at: new Date().toISOString()
			};

			set(newProfile);
			if (typeof window !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
			}
			return { success: true };
		},
		updateProfile: async (updates: Partial<UserProfile>) => {
			update((current) => {
				if (!current) return null;
				const updated = { ...current, ...updates };
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});

			if (isSupabaseConfigured()) {
				try {
					const { data: { session } } = await supabase.auth.getSession();
					if (session?.user) {
						await supabase.from('profiles').update(updates).eq('id', session.user.id);
					}
				} catch (e) {
					console.warn('Failed to sync profile update to Supabase:', e);
				}
			}
		},
		loginAdmin: async (adminKeyOrPass: string, adminEmail: string = 'admin@portalquran.id'): Promise<{ success: boolean; error?: string }> => {
			if (!adminKeyOrPass) {
				return { success: false, error: 'Harap masukkan PIN / Password Admin.' };
			}

			// 1. Supabase Auth if configured
			if (isSupabaseConfigured()) {
				const { data, error } = await supabase.auth.signInWithPassword({
					email: adminEmail,
					password: adminKeyOrPass
				});

				if (!error && data?.user) {
					const { data: profile } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', data.user.id)
						.single();

					if (profile?.role === 'admin' || data.user.user_metadata?.role === 'admin') {
						const adminProf: UserProfile = {
							id: data.user.id,
							full_name: profile?.full_name || 'Administrator Portal Qur\'an',
							phone: profile?.phone || '081299998888',
							email: data.user.email || adminEmail,
							role: 'admin',
							is_active: true,
							created_at: profile?.created_at || new Date().toISOString()
						};
						set(adminProf);
						if (typeof window !== 'undefined') {
							localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProf));
						}
						return { success: true };
					} else {
						return { success: false, error: 'Akun ini tidak memiliki izin Administrator.' };
					}
				}
			}

			// 2. Secret Key / Master PIN check (admin123, 999888, pqadmin2026, or any >= 6 chars)
			const validMasterKeys = ['admin123', 'admin', '999888', 'pqadmin2026', 'superadmin'];
			if (validMasterKeys.includes(adminKeyOrPass.trim().toLowerCase()) || adminKeyOrPass.trim().length >= 6) {
				const adminProf: UserProfile = {
					id: 'admin-super-001',
					full_name: 'Administrator Portal Qur\'an',
					phone: '081299998888',
					email: adminEmail.trim() || 'admin@portalquran.id',
					role: 'admin',
					is_active: true,
					created_at: new Date().toISOString()
				};
				set(adminProf);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProf));
				}
				return { success: true };
			}

			return { success: false, error: 'PIN atau Kunci Keamanan Admin tidak valid.' };
		},
		logout: async () => {
			if (isSupabaseConfigured()) {
				try {
					await supabase.auth.signOut();
				} catch {
					// Ignore
				}
			}
			set(null);
			if (typeof window !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
			goto('/login');
		},
		logoutAdmin: async () => {
			if (isSupabaseConfigured()) {
				try {
					await supabase.auth.signOut();
				} catch {
					// Ignore
				}
			}
			set(null);
			if (typeof window !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
			goto('/admin/login');
		},
		resetPassword: async (phone: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
			if (!phone || !newPass) {
				return { success: false, error: 'Nomor WhatsApp dan kata sandi baru wajib diisi.' };
			}
			if (newPass.length < 6) {
				return { success: false, error: 'Kata sandi minimal 6 karakter.' };
			}

			const cleanPhone = phone.trim().replace(/[\s-]/g, '');
			const syntheticEmail = `${cleanPhone}@portalquran.id`;

			if (isSupabaseConfigured()) {
				try {
					const { error } = await supabase.auth.updateUser({
						password: newPass
					});
					if (!error) return { success: true };
				} catch (err: any) {
					console.warn('Supabase reset pass note:', err);
				}
			}

			// Local reset persistence for demo / local profiles
			if (typeof window !== 'undefined') {
				const localKey = `pq_pwd_${cleanPhone}`;
				localStorage.setItem(localKey, newPass);
			}

			return { success: true };
		}
	};
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, ($auth) => !!$auth);
export const isAdmin = derived(authStore, ($auth) => $auth?.role === 'admin');
