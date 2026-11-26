import { writable, get } from 'svelte/store';
import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

export interface PortalSettings {
	appName: string;
	tagline: string;
	hijriDate: string;
	maintenanceMode: boolean;
	maintenanceMessage: string;
	// Banner Info & Pengumuman Jamaah (tampil di Beranda Home & Beranda Qur'an)
	infoEnabled: boolean;
	infoBadge: string;
	infoTitle: string;
	infoMessage: string;
	infoCtaText: string;
	infoCtaUrl: string;
	// Hero Beranda Jamaah (/dashboard)
	heroGreetingBadge: string;
	heroQuote: string;
	heroQuoteSource: string;
	// Hero Halaman Al-Qur'an (/quran)
	quranBannerBadge: string;
	quranBannerTitle: string;
	quranBannerSubtitle: string;
	// Ayat Pilihan Hari Ini (/dashboard)
	votdSurahNumber: number;
	votdSurahName: string;
	votdAyahNumber: number;
	votdTheme: string;
	votdArabic: string;
	votdTranslation: string;
	updatedAt?: string;
}

const LOCAL_SETTINGS_KEY = 'pq_portal_live_settings_v34';
const SUPABASE_SETTINGS_KEY = 'portal_live_config';

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
	appName: "Portal Qur'an",
	tagline: 'Temukan ketenangan dalam setiap ayat.',
	hijriDate: "14 Rabi'ul Awwal 1448 H",
	maintenanceMode: false,
	maintenanceMessage: 'Portal sedang dalam pemeliharaan singkat untuk peningkatan layanan tilawah jamaah.',
	infoEnabled: true,
	infoBadge: 'INFO JAMAAH',
	infoTitle: "Pengingat Jum'at & Tadabbur Pekan Ini",
	infoMessage: 'Mari hidupkan sunnah membaca Surah Al-Kahfi setiap hari Jum\'at dan ikuti jadwal kajian rutin bersama asatidz Portal Qur\'an.',
	infoCtaText: 'Buka Surah Al-Kahfi',
	infoCtaUrl: '/quran/18',
	heroGreetingBadge: "Bismillah, Awali Harimu Dengan Qur'an",
	heroQuote: 'Sebaik-baik kalian adalah orang yang belajar Al-Qur\'an dan mengajarkannya.',
	heroQuoteSource: '(HR. Bukhari)',
	quranBannerBadge: 'Koleksi Lengkap 114 Surah',
	quranBannerTitle: "Al-Qur'an Al-Karim",
	quranBannerSubtitle: 'Membaca, mentadabburi tafsir Bahasa Indonesia, mendengarkan lantunan merdu, dan menelusuri arti per kata secara interaktif.',
	votdSurahNumber: 2,
	votdSurahName: 'Al-Baqarah',
	votdAyahNumber: 186,
	votdTheme: 'Kedekatan Allah & Pengabulan Doa',
	votdArabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
	votdTranslation: 'Dan apabila hamba-hamba-Ku bertanya kepadamu (Muhammad) tentang Aku, maka sesungguhnya Aku dekat. Aku mengabulkan permohonan orang yang berdoa apabila dia berdoa kepada-Ku.'
};

function createPortalSettingsStore() {
	let initial: PortalSettings = { ...DEFAULT_PORTAL_SETTINGS };

	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
			if (raw) {
				initial = { ...DEFAULT_PORTAL_SETTINGS, ...JSON.parse(raw) };
			}
		} catch {}
	}

	const { subscribe, set, update } = writable<PortalSettings>(initial);
	let channelInitialized = false;
	let bc: BroadcastChannel | null = null;

	function saveLocal(next: PortalSettings) {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(next));
			} catch {}
		}
	}

	async function refreshFromSupabase() {
		if (!isSupabaseConfigured()) return;
		try {
			const { data, error } = await supabase
				.from('app_settings')
				.select('value')
				.eq('key', SUPABASE_SETTINGS_KEY)
				.maybeSingle();

			if (!error && data?.value && typeof data.value === 'object') {
				const merged: PortalSettings = {
					...DEFAULT_PORTAL_SETTINGS,
					...(data.value as Partial<PortalSettings>)
				};
				set(merged);
				saveLocal(merged);
			}
		} catch {}
	}

	function initRealtime() {
		if (typeof window === 'undefined' || channelInitialized) return;
		channelInitialized = true;

		// Instant cross-tab sync on same browser
		try {
			if ('BroadcastChannel' in window) {
				bc = new BroadcastChannel('pq_portal_settings_sync');
				bc.onmessage = (ev) => {
					if (ev?.data && typeof ev.data === 'object') {
						const merged = { ...DEFAULT_PORTAL_SETTINGS, ...ev.data };
						set(merged);
						saveLocal(merged);
					}
				};
			}
		} catch {}

		// Storage event fallback across tabs
		window.addEventListener('storage', (e) => {
			if (e.key === LOCAL_SETTINGS_KEY && e.newValue) {
				try {
					set({ ...DEFAULT_PORTAL_SETTINGS, ...JSON.parse(e.newValue) });
				} catch {}
			}
		});

		// Refresh when user switches back to tab / app on phone
		window.addEventListener('focus', () => refreshFromSupabase());
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') refreshFromSupabase();
		});

		refreshFromSupabase();

		if (isSupabaseConfigured()) {
			try {
				supabase
					.channel('public:app_settings_portal_live')
					.on(
						'postgres_changes',
						{ event: '*', schema: 'public', table: 'app_settings', filter: `key=eq.${SUPABASE_SETTINGS_KEY}` },
						(payload: any) => {
							const val = payload?.new?.value;
							if (val && typeof val === 'object') {
								const merged = { ...DEFAULT_PORTAL_SETTINGS, ...val };
								set(merged);
								saveLocal(merged);
							}
						}
					)
					.subscribe();
			} catch {}
		}
	}

	if (typeof window !== 'undefined') {
		initRealtime();
	}

	return {
		subscribe,
		init: initRealtime,
		refresh: refreshFromSupabase,
		saveSettings: async (updates: Partial<PortalSettings>): Promise<{ syncedCloud: boolean }> => {
			const next: PortalSettings = {
				...get({ subscribe }),
				...updates,
				updatedAt: new Date().toISOString()
			};
			set(next);
			saveLocal(next);

			try {
				bc?.postMessage(next);
			} catch {}

			if (isSupabaseConfigured()) {
				try {
					const { error } = await supabase.from('app_settings').upsert(
						{
							key: SUPABASE_SETTINGS_KEY,
							value: next,
							description: 'Pengaturan live beranda & informasi jamaah Portal Qur\'an',
							updated_at: new Date().toISOString()
						},
						{ onConflict: 'key' }
					);
					return { syncedCloud: !error };
				} catch {
					return { syncedCloud: false };
				}
			}
			return { syncedCloud: false };
		},
		resetDefaults: async () => {
			const fresh = { ...DEFAULT_PORTAL_SETTINGS, updatedAt: new Date().toISOString() };
			set(fresh);
			saveLocal(fresh);
			try {
				bc?.postMessage(fresh);
			} catch {}
			if (isSupabaseConfigured()) {
				try {
					await supabase.from('app_settings').upsert(
						{
							key: SUPABASE_SETTINGS_KEY,
							value: fresh,
							description: 'Pengaturan live beranda & informasi jamaah Portal Qur\'an',
							updated_at: new Date().toISOString()
						},
						{ onConflict: 'key' }
					);
				} catch {}
			}
		}
	};
}

export const portalSettingsStore = createPortalSettingsStore();
