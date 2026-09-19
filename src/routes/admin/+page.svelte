<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Users, 
		BookOpen, 
		Headphones, 
		CalendarDays, 
		Bookmark, 
		Activity, 
		CheckCircle2, 
		TrendingUp, 
		Server, 
		Database, 
		Radio, 
		Clock, 
		ShieldCheck,
		ArrowRight,
		RefreshCw
	} from 'lucide-svelte';
	import { supabase, isSupabaseConfigured } from '$lib/supabase/client';

	let loading = true;
	let dbLatency = 'Memeriksa...';
	let isDbConnected = false;

	let adminStats = {
		total_customers: 0,
		active_today: 0,
		total_ayahs_read_today: 0,
		total_reading_hours: 0,
		total_surahs_active: 114,
		total_audio_tracks: 456,
		total_agendas: 0,
		total_bookmarks: 0
	};

	let recentActivities: Array<{ user: string; action: string; time: string; role: string }> = [];

	async function fetchDashboardData() {
		loading = true;
		if (!isSupabaseConfigured()) {
			isDbConnected = false;
			dbLatency = 'Belum Dikonfigurasi';
			loading = false;
			return;
		}

		const startTime = performance.now();
		try {
			// 1. Fetch total profiles
			const { data: profiles, count: profileCount, error: profErr } = await supabase
				.from('profiles')
				.select('id, full_name, role, created_at, last_login_at', { count: 'exact' });

			const endTime = performance.now();
			dbLatency = `${Math.round(endTime - startTime)}ms`;
			isDbConnected = !profErr;

			if (profiles) {
				adminStats.total_customers = profileCount || profiles.length;
				
				// Active today: last_login_at within last 24h
				const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
				adminStats.active_today = profiles.filter((p: any) => p.last_login_at && p.last_login_at >= oneDayAgo).length;
			}

			// 2. Fetch agendas count
			const { count: agendaCount } = await supabase
				.from('agendas')
				.select('id', { count: 'exact', head: true });
			if (typeof agendaCount === 'number') {
				adminStats.total_agendas = agendaCount;
			}

			// 3. Fetch bookmarks count
			const { count: bookmarkCount } = await supabase
				.from('bookmarks')
				.select('id', { count: 'exact', head: true });
			if (typeof bookmarkCount === 'number') {
				adminStats.total_bookmarks = bookmarkCount;
			}

			// 4. Fetch reading progress / sessions
			const { data: readingSessions } = await supabase
				.from('reading_sessions')
				.select('duration_seconds, ayahs_read_count, created_at')
				.limit(100);

			if (readingSessions && readingSessions.length > 0) {
				const totalSeconds = readingSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
				adminStats.total_reading_hours = Math.round(totalSeconds / 3600);
				adminStats.total_ayahs_read_today = readingSessions.reduce((acc, s) => acc + (s.ayahs_read_count || 0), 0);
			}

			// 5. Fetch recent activities from reading progress & profiles
			const { data: recentProgress } = await supabase
				.from('reading_progress')
				.select('surah_number, ayah_number, updated_at, user_id, profiles(full_name, role)')
				.order('updated_at', { ascending: false })
				.limit(5);

			if (recentProgress && recentProgress.length > 0) {
				recentActivities = recentProgress.map((item: any) => {
					const profileName = item.profiles?.full_name || 'Pengguna';
					const userRole = item.profiles?.role || 'customer';
					const date = new Date(item.updated_at);
					const timeAgo = formatTimeAgo(date);
					return {
						user: profileName,
						action: `Membaca Surah ${item.surah_number} Ayat ${item.ayah_number}`,
						time: timeAgo,
						role: userRole
					};
				});
			} else {
				recentActivities = [];
			}
		} catch (e) {
			console.warn('Dashboard fetch error:', e);
		} finally {
			loading = false;
		}
	}

	function formatTimeAgo(date: Date): string {
		const diffMins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
		if (diffMins < 1) return 'Baru saja';
		if (diffMins < 60) return `${diffMins} menit lalu`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours} jam lalu`;
		return `${Math.floor(diffHours / 24)} hari lalu`;
	}

	onMount(() => {
		fetchDashboardData();
	});
</script>

<svelte:head>
	<title>Admin Dashboard - Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-8 animate-in fade-in duration-200">
	
	<!-- Top Banner -->
	<div class="bg-gradient-luxury rounded-3xl p-6 sm:p-8 text-quran-cream border border-quran-gold/40 shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div class="flex items-start gap-4">
			<img 
				src="/logo.png" 
				alt="Portal Qur'an Admin Logo" 
				class="hidden sm:block w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-gold border-2 border-quran-gold/50 flex-shrink-0 animate-float"
			/>
			<div class="flex-1">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-quran-gold/30 text-xs font-semibold text-quran-gold mb-2">
					<ShieldCheck class="w-3.5 h-3.5" />
					<span>Panel Kontrol & Pemantauan Sistem</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
					Dashboard Eksekutif Admin
				</h1>
				<p class="text-xs sm:text-sm text-quran-goldLight mt-1">
					Pantau interaksi customer, kelola konten Al-Qur'an, audio murattal, dan performa website dari perangkat desktop maupun HP.
				</p>
			</div>
		</div>

		<!-- Quick Remote Status Badge -->
		<div class="bg-white/10 backdrop-blur-md border border-quran-gold/40 p-4 rounded-2xl flex items-center gap-3 flex-shrink-0">
			<div class="w-3 h-3 rounded-full {isDbConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}"></div>
			<div class="text-xs">
				<span class="font-bold text-white block">Status Database Supabase</span>
				<span class="text-quran-goldLight text-[11px]">
					{isDbConnected ? `Terhubung (${dbLatency})` : 'Belum Terhubung / Standby'}
				</span>
			</div>
			<button 
				on:click={fetchDashboardData}
				class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-quran-gold transition ml-2"
				title="Segarkan Data"
			>
				<RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" />
			</button>
		</div>
	</div>

	<!-- 8 Major Admin KPI Metric Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		
		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Pengguna</span>
				<Users class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_customers.toLocaleString()}</div>
			<p class="text-[11px] text-quran-warm font-semibold">
				Pengguna terdaftar
			</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Customer Aktif Hari Ini</span>
				<Activity class="w-4 h-4 text-emerald-600" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.active_today}</div>
			<p class="text-[11px] text-quran-warm">Login dalam 24 jam</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Ayat Dibaca</span>
				<BookOpen class="w-4 h-4 text-quran-chocolate" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_ayahs_read_today.toLocaleString()}</div>
			<p class="text-[11px] text-quran-warm">Total riwayat tilawah</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Waktu Tilawah</span>
				<Clock class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_reading_hours} Jam</div>
			<p class="text-[11px] text-quran-warm">Akumulasi seluruh pengguna</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Surah Tersedia</span>
				<BookOpen class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_surahs_active} Surah</div>
			<p class="text-[11px] text-emerald-700 font-semibold">100% Lengkap (6236 Ayat)</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Trek Audio Qari</span>
				<Headphones class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_audio_tracks}</div>
			<p class="text-[11px] text-quran-warm">4 Qari Utama Aktif</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Agenda Terbit</span>
				<CalendarDays class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_agendas} Event</div>
			<p class="text-[11px] text-quran-warm">Jadwal kajian aktif</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Bookmark Disimpan</span>
				<Bookmark class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_bookmarks.toLocaleString()}</div>
			<p class="text-[11px] text-quran-warm">Tersimpan di Supabase</p>
		</div>

	</div>

	<!-- 2-Column Split: System Health Monitoring & Live Activity Stream -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		
		<!-- Left: Remote System Health & Server Status (5 cols) -->
		<div class="lg:col-span-5 bg-quran-surface rounded-3xl border border-quran-border/80 p-6 shadow-luxury space-y-5">
			<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
				<div class="flex items-center gap-2">
					<Server class="w-4 h-4 text-quran-gold" />
					<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Status Kesehatan Sistem (Remote)</h2>
				</div>
				<span class="text-[10px] font-bold px-2 py-0.5 rounded {isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
					{isDbConnected ? '99.9% Uptime' : 'Offline / Standby'}
				</span>
			</div>

			<div class="space-y-3 text-xs">
				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Database class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Database Supabase:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">
						{isDbConnected ? `Terhubung (${dbLatency})` : 'Standby / Local'}
					</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Radio class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Audio Streaming CDN:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">Operational (EveryAyah & Quran CDN)</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Activity class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">API Sync & RLS Policy:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">Active (Realtime RLS)</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Clock class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Tafsir Source:</span>
					</div>
					<span class="text-quran-warm font-mono text-[11px]">Tafsir Ibnu Katsir</span>
				</div>
			</div>

			<div class="pt-2">
				<a 
					href="/admin/settings"
					class="w-full py-2.5 px-4 rounded-xl bg-quran-sand border border-quran-border text-xs font-bold text-quran-dark hover:bg-quran-beige text-center block transition"
				>
					Konfigurasi Lanjutan
				</a>
			</div>
		</div>

		<!-- Right: Recent Customer Activity Feed (7 cols) -->
		<div class="lg:col-span-7 bg-quran-surface rounded-3xl border border-quran-border/80 p-6 shadow-luxury space-y-4">
			<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
				<div class="flex items-center gap-2">
					<Activity class="w-4 h-4 text-quran-gold" />
					<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Aktivitas Live Customer</h2>
				</div>
				<a href="/admin/statistics" class="text-xs font-bold text-quran-gold hover:underline">Semua Log</a>
			</div>

			{#if recentActivities.length === 0}
				<div class="py-10 text-center space-y-2">
					<Activity class="w-8 h-8 text-quran-warm/40 mx-auto" />
					<p class="text-xs font-semibold text-quran-dark">Belum ada aktivitas terbaru</p>
					<p class="text-[11px] text-quran-warm">Aktivitas tilawah dan interaksi pengguna akan tercatat di sini secara realtime.</p>
				</div>
			{:else}
				<div class="divide-y divide-quran-border/60">
					{#each recentActivities as act}
						<div class="py-3 flex items-center justify-between gap-3 text-xs">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 rounded-xl bg-quran-sand text-quran-chocolate font-bold flex items-center justify-center flex-shrink-0">
									{act.user.charAt(0)}
								</div>
								<div>
									<div class="flex items-center gap-1.5">
										<span class="font-bold text-quran-dark">{act.user}</span>
										<span class="text-[9px] px-1.5 py-0.2 rounded bg-quran-sand text-quran-warm font-mono">{act.role}</span>
									</div>
									<p class="text-quran-warm text-[11px] mt-0.5">{act.action}</p>
								</div>
							</div>
							<span class="text-[10px] text-quran-muted font-mono flex-shrink-0">{act.time}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

	</div>

</div>

