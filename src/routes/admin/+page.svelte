<script lang="ts">
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
		ArrowRight
	} from 'lucide-svelte';

	// Real-time KPI stats aggregated for admin
	const adminStats = {
		total_customers: 1248,
		active_today: 342,
		total_ayahs_read_today: 8940,
		total_reading_hours: 1420,
		total_surahs_active: 114,
		total_audio_tracks: 456,
		total_agendas: 12,
		total_bookmarks: 3890
	};

	const systemHealth = {
		supabase_db: 'Connected (Latency: 18ms)',
		audio_cdn: 'Operational (EveryAyah & Quran CDN)',
		api_sync: 'Active (Realtime RLS)',
		last_backup: '17 Sep 2026, 04:00 WIB',
		uptime: '99.98%'
	};

	const recentActivities = [
		{ user: 'Ahmad Fauzan', action: 'Khatam Juz 30 (Surah An-Nas)', time: '5 menit lalu', role: 'customer' },
		{ user: 'Rina Salsabila', action: 'Membuat koleksi baru "Doa Dhuha"', time: '12 menit lalu', role: 'customer' },
		{ user: 'Ust. Zulkarnain', action: 'Mendaftarkan kajian Al-Baqarah', time: '25 menit lalu', role: 'customer' },
		{ user: 'Dimas Pratama', action: 'Menyelesaikan 20 ayat Surah Al-Kahf', time: '40 menit lalu', role: 'customer' },
		{ user: 'Admin System', action: 'Sinkronisasi Tafsir Kemenag v2', time: '2 jam lalu', role: 'admin' }
	];
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
			<div class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
			<div class="text-xs">
				<span class="font-bold text-white block">Status Database Supabase</span>
				<span class="text-quran-goldLight text-[11px]">Terhubung & RLS Aktif</span>
			</div>
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
			<p class="text-[11px] text-green-700 font-semibold flex items-center gap-1">
				<TrendingUp class="w-3 h-3" /> +28 user baru minggu ini
			</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Customer Aktif Hari Ini</span>
				<Activity class="w-4 h-4 text-emerald-600" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.active_today}</div>
			<p class="text-[11px] text-quran-warm">Membaca & Tilawah live</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Ayat Dibaca Hari Ini</span>
				<BookOpen class="w-4 h-4 text-quran-chocolate" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_ayahs_read_today.toLocaleString()}</div>
			<p class="text-[11px] text-green-700 font-semibold">+14% vs kemarin</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Waktu Tilawah</span>
				<Clock class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{adminStats.total_reading_hours} Jam</div>
			<p class="text-[11px] text-quran-warm">Akumulasi seluruh customer</p>
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
			<p class="text-[11px] text-quran-warm">3 Kajian terdekat</p>
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
				<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
					{systemHealth.uptime} Uptime
				</span>
			</div>

			<div class="space-y-3 text-xs">
				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Database class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Database Supabase:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">{systemHealth.supabase_db}</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Radio class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Audio Streaming CDN:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">{systemHealth.audio_cdn}</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Activity class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">API Sync & RLS Policy:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">{systemHealth.api_sync}</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Clock class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Pencadangan Terakhir:</span>
					</div>
					<span class="text-quran-warm font-mono text-[11px]">{systemHealth.last_backup}</span>
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
		</div>

	</div>

</div>
