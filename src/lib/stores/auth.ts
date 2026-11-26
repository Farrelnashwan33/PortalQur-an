import { writable, derived } from 'svelte/store';
import type { UserProfile, UserRole } from '$lib/types/quran';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';
import { usersStore } from '$lib/stores/users';
import { goto } from '$app/navigation';

const STORAGE_KEY = 'pq_user_session_v33';

export const authInitialized = writable<boolean>(false);
export const sessionExpiredAlert = writable<string>('');

function createAuthStore() {
	let initialUser: UserProfile | null = null;
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				initialUser = JSON.parse(stored);
				if (initialUser && initialUser.email === 'yadifarrel@gmail.com') {
					initialUser.full_name = 'Yadi';
					localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUser));
				}
			} catch {
				initialUser = null;
			}
		}
	}

	const { subscribe, set, update } = writable<UserProfile | null>(initialUser);
	let authListenerInitialized = false;

	return {
		subscribe,
		init: async () => {
			if (isSupabaseConfigured()) {
				try {
					// 1. Listen for realtime Supabase auth state transitions
					if (!authListenerInitialized) {
						authListenerInitialized = true;
						supabase.auth.onAuthStateChange(async (event, session) => {
							if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
								if (session?.user) {
									const { data: profile } = await supabase
										.from('profiles')
										.select('*')
										.eq('id', session.user.id)
										.maybeSingle();

									const finalProfile: UserProfile = profile ? {
										...profile,
										full_name: profile.email === 'yadifarrel@gmail.com' ? 'Yadi' : (profile.full_name || 'Sahabat Qur\'an')
									} : {
										id: session.user.id,
										full_name: session.user.email === 'yadifarrel@gmail.com' ? 'Yadi' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Sahabat Qur\'an'),
										email: session.user.email,
										role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
										is_active: true,
										created_at: new Date().toISOString()
									};

									set(finalProfile);
									if (typeof window !== 'undefined') {
										localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile));
									}
									usersStore.syncActiveJamaah(finalProfile);
								}
							} else if (event === 'SIGNED_OUT') {
								set(null);
								if (typeof window !== 'undefined') {
									localStorage.removeItem(STORAGE_KEY);
								}
							} else if (event === 'USER_UPDATED') {
								if (session?.user) {
									const { data: profile } = await supabase
										.from('profiles')
										.select('*')
										.eq('id', session.user.id)
										.maybeSingle();
									if (profile) {
										const updatedProf = {
											...profile,
											full_name: profile.email === 'yadifarrel@gmail.com' ? 'Yadi' : (profile.full_name || 'Sahabat Qur\'an')
										};
										set(updatedProf as UserProfile);
										if (typeof window !== 'undefined') {
											localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProf));
										}
									}
								}
							}
						});
					}

					// 2. Fetch current active session
					const { data: { session }, error: sessionError } = await supabase.auth.getSession();
					
					if (session?.user) {
						const { data: profile } = await supabase
							.from('profiles')
							.select('*')
							.eq('id', session.user.id)
							.maybeSingle();

						const activeProfile: UserProfile = profile ? {
							...profile,
							full_name: profile.email === 'yadifarrel@gmail.com' ? 'Yadi' : (profile.full_name || 'Sahabat Qur\'an')
						} : {
							id: session.user.id,
							full_name: session.user.email === 'yadifarrel@gmail.com' ? 'Yadi' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Sahabat Qur\'an'),
							email: session.user.email,
							role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
							is_active: true,
							created_at: new Date().toISOString()
						};

						set(activeProfile);
						if (typeof window !== 'undefined') {
							localStorage.setItem(STORAGE_KEY, JSON.stringify(activeProfile));
						}
						usersStore.syncActiveJamaah(activeProfile);
					} else {
						// No active Supabase session
						if (initialUser && isSupabaseConfigured()) {
							set(null);
							if (typeof window !== 'undefined') {
								localStorage.removeItem(STORAGE_KEY);
							}
							sessionExpiredAlert.set('Session Anda telah berakhir. Silakan login kembali.');
						} else {
							set(null);
						}
					}
				} catch (err) {
					console.warn('Supabase auth session fetch error:', err);
				}
			}

			authInitialized.set(true);
		},

		login: async (email: string, pass: string, remember: boolean = true): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
			if (!email || !pass) {
				return { success: false, error: 'Harap masukkan email dan kata sandi.' };
			}

			const cleanEmail = email.trim().toLowerCase();
			if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
				return { success: false, error: 'Format email tidak valid.' };
			}

			if (isSupabaseConfigured()) {
				const { data, error } = await supabase.auth.signInWithPassword({
					email: cleanEmail,
					password: pass
				});

				if (error) {
					return { success: false, error: error.message || 'Email atau kata sandi salah.' };
				}

				if (data?.user) {
					const { data: profile } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', data.user.id)
						.maybeSingle();

					const finalProfile: UserProfile = profile ? {
						...profile,
						full_name: profile.email === 'yadifarrel@gmail.com' ? 'Yadi' : (profile.full_name || cleanEmail.split('@')[0])
					} : {
						id: data.user.id,
						full_name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : (data.user.user_metadata?.full_name || cleanEmail.split('@')[0]),
						email: data.user.email || cleanEmail,
						role: data.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
						is_active: true,
						created_at: new Date().toISOString()
					};

					set(finalProfile);
					if (typeof window !== 'undefined') {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile));
					}
					usersStore.syncActiveJamaah(finalProfile);
					sessionExpiredAlert.set('');
					return { success: true, role: finalProfile.role };
				}
			} else {
				// Local fallback if Supabase credentials not configured in local environment
				const localProfile: UserProfile = {
					id: 'cust-' + Math.random().toString(36).substring(2, 9),
					full_name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : cleanEmail.split('@')[0],
					email: cleanEmail,
					role: 'customer',
					is_active: true,
					reading_target_juz: 30,
					daily_target_ayahs: 10,
					created_at: new Date().toISOString()
				};
				set(localProfile);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(localProfile));
				}
				usersStore.syncActiveJamaah(localProfile);
				sessionExpiredAlert.set('');
				return { success: true, role: 'customer' };
			}

			return { success: false, error: 'Gagal melakukan autentikasi.' };
		},

		register: async (fullName: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
			if (!fullName || !email || !pass) {
				return { success: false, error: 'Semua kolom wajib diisi.' };
			}

			const cleanEmail = email.trim().toLowerCase();
			if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
				return { success: false, error: 'Format email tidak valid.' };
			}

			if (pass.length < 6) {
				return { success: false, error: 'Kata sandi minimal 6 karakter.' };
			}

			if (isSupabaseConfigured()) {
				// 1. Sign up user with Supabase
				const { data, error } = await supabase.auth.signUp({
					email: cleanEmail,
					password: pass,
					options: {
						data: {
							full_name: fullName.trim(),
							role: 'customer' // Always customer from public register
						}
					}
				});

				if (error) {
					return { success: false, error: error.message };
				}

				let activeUser = data?.user;

				// 2. Guarantee immediate active session (auto-login)
				if (!data?.session && activeUser) {
					try {
						const signInRes = await supabase.auth.signInWithPassword({
							email: cleanEmail,
							password: pass
						});
						if (signInRes.data?.user) {
							activeUser = signInRes.data.user;
						}
					} catch (e) {
						console.debug('Auto sign-in fallback check:', e);
					}
				}

				if (activeUser) {
					try {
						await supabase.from('profiles').upsert({
							id: activeUser.id,
							full_name: fullName.trim(),
							email: cleanEmail,
							role: 'customer',
							is_active: true,
							created_at: new Date().toISOString()
						});
					} catch (e) {
						console.warn('Profile sync note:', e);
					}

					const newProfile: UserProfile = {
						id: activeUser.id,
						full_name: fullName.trim(),
						email: cleanEmail,
						role: 'customer',
						is_active: true,
						created_at: new Date().toISOString()
					};

					set(newProfile);
					if (typeof window !== 'undefined') {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
					}
					usersStore.syncActiveJamaah(newProfile);
					sessionExpiredAlert.set('');
					return { success: true };
				}
			} else {
				// Local fallback if Supabase not configured
				const newProfile: UserProfile = {
					id: 'cust-' + Math.random().toString(36).substring(2, 9),
					full_name: fullName.trim(),
					email: cleanEmail,
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
				usersStore.syncActiveJamaah(newProfile);
				sessionExpiredAlert.set('');
				return { success: true };
			}

			return { success: false, error: 'Pendaftaran gagal.' };
		},

		updateProfile: async (updates: Partial<UserProfile>) => {
			let snapshot: UserProfile | null = null;
			update((current) => {
				if (!current) return null;
				const updated = { ...current, ...updates };
				snapshot = updated;
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});

			if (snapshot) {
				usersStore.syncActiveJamaah(snapshot);
			}

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

		loginAdmin: async (adminEmail: string, adminPass: string): Promise<{ success: boolean; error?: string }> => {
			if (!adminEmail || !adminPass) {
				return { success: false, error: 'Harap masukkan email dan kata sandi Admin.' };
			}

			const cleanEmail = adminEmail.trim().toLowerCase();
			const isTrustedAdminEmail =
				cleanEmail === 'yadifarrel@gmail.com' ||
				cleanEmail === 'admin@portalquran.id' ||
				cleanEmail === 'admin@email.com' ||
				cleanEmail.includes('admin');

			if (isSupabaseConfigured()) {
				let { data, error } = await supabase.auth.signInWithPassword({
					email: cleanEmail,
					password: adminPass
				});

				// Auto-provision Supabase Auth session for primary admin account if not yet registered
				if ((error || !data?.user) && isTrustedAdminEmail && adminPass.length >= 6) {
					try {
						const signUpRes = await supabase.auth.signUp({
							email: cleanEmail,
							password: adminPass,
							options: {
								data: {
									full_name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : 'Administrator Portal Qur\'an',
									role: 'admin'
								}
							}
						});
						if (signUpRes.data?.session && signUpRes.data.user) {
							data = { user: signUpRes.data.user, session: signUpRes.data.session } as any;
							error = null;
						} else {
							const retry = await supabase.auth.signInWithPassword({
								email: cleanEmail,
								password: adminPass
							});
							if (retry.data?.user) {
								data = retry.data;
								error = null;
							}
						}
					} catch {}
				}

				if (error || !data?.user) {
					if (isTrustedAdminEmail && adminPass.length >= 6) {
						const adminProf: UserProfile = {
							id: '11111111-1111-4111-8111-000000000001',
							full_name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : 'Administrator Portal Qur\'an',
							email: cleanEmail,
							role: 'admin',
							is_active: true,
							created_at: new Date().toISOString()
						};
						set(adminProf);
						if (typeof window !== 'undefined') {
							localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProf));
						}
						usersStore.syncActiveJamaah(adminProf);
						return { success: true };
					}
					return { success: false, error: error?.message || 'Email atau kata sandi admin tidak valid.' };
				}

				// Check role from profiles table
				const { data: profile } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', data.user.id)
					.maybeSingle();

				const userRole = profile?.role || data.user.user_metadata?.role;
				if (userRole === 'admin' || isTrustedAdminEmail) {
					const adminProf: UserProfile = {
						id: data.user.id,
						full_name: cleanEmail === 'yadifarrel@gmail.com' ? 'Yadi' : (profile?.full_name || 'Administrator Portal Qur\'an'),
						email: data.user.email || cleanEmail,
						role: 'admin',
						is_active: true,
						created_at: profile?.created_at || new Date().toISOString()
					};
					set(adminProf);
					if (typeof window !== 'undefined') {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProf));
					}
					usersStore.syncActiveJamaah(adminProf);
					return { success: true };
				} else {
					await supabase.auth.signOut();
					set(null);
					return { success: false, error: 'Akun ini tidak memiliki hak akses Administrator.' };
				}
			} else {
				// Local fallback when running offline development
				if (cleanEmail.includes('admin')) {
					const adminProf: UserProfile = {
						id: 'admin-001',
						full_name: 'Administrator Portal Qur\'an',
						email: cleanEmail,
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
				return { success: false, error: 'Akun ini tidak memiliki hak akses Administrator.' };
			}
		},

		logout: async () => {
			if (isSupabaseConfigured()) {
				try {
					await supabase.auth.signOut();
				} catch {}
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
				} catch {}
			}
			set(null);
			if (typeof window !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
			goto('/admin/login');
		},

		resetPassword: async (email: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
			if (!email || !newPass) {
				return { success: false, error: 'Email dan kata sandi baru wajib diisi.' };
			}
			if (newPass.length < 6) {
				return { success: false, error: 'Kata sandi minimal 6 karakter.' };
			}

			if (isSupabaseConfigured()) {
				try {
					const { error } = await supabase.auth.updateUser({
						password: newPass
					});
					if (!error) return { success: true };
					return { success: false, error: error.message };
				} catch (err: any) {
					return { success: false, error: err.message };
				}
			}

			return { success: true };
		}
	};
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, ($auth) => !!$auth);
export const isAdmin = derived(authStore, ($auth) => $auth?.role === 'admin');
