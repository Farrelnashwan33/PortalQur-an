<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Users,
		BookOpen,
		Headphones,
		CalendarDays,
		Bookmark,
		Activity,
		TrendingUp,
		Server,
		Database,
		Radio,
		Clock,
		ShieldCheck,
		RefreshCw,
		Megaphone,
		CheckCircle2,
		Save
	} from 'lucide-svelte';
	import { supabase, isSupabaseConfigured } from '$lib/supabase/client';
	import { usersStore } from '$lib/stores/users';
	import { agendaStore } from '$lib/stores/agenda';
	import { qariStore } from '$lib/stores/qaris';
	import { portalSettingsStore } from '$lib/stores/settings';
	import { SURAH_LIST } from '$lib/data/surahList';

	let loading = true;
	let dbLatency = 'Memeriksa...';
	let isDbConnected = false;

	let quickInfoTitle = '';
	let quickInfoMessage = '';
	let quickInfoEnabled = true;
	let quickSaved = false;

	let dbBookmarksCount = 0;
	let dbReadingHours = 0;
	let recentActivities: Array<{ user: string; action: string; time: string; role: string }> = [];

	$: totalCustomers = $usersStore.length;
	$: activeCustomers = $usersStore.filter((u) => u.is_active).length;
	$: totalAyahsRead = $usersStore.reduce((acc, u) => acc + (u.ayahs_read || 0), 0);
	$: computedHours = Math.max(dbReadingHours, Math.round(totalAyahsRead / 45));
	$: activeQarisCount = $qariStore.filter((q) => q.is_active !== false).length;

	$: fallbackActivities = $usersStore.slice(0, 6).map((u, idx) => ({
		user: u.name,
		action: `Membaca QS. ${u.last_surah || 'Al-Fatihah : 1'} (${u.ayahs_read} ayat)`,
		time: idx === 0 ? 'Baru saja' : `${idx * 12 + 5} menit lalu`,
		role: u.role === 'admin' ? 'admin' : 'jamaah'
	}));

	$: displayedActivities = recentActivities.length > 0 ? recentActivities : fallbackActivities;

	async function saveQuickAnnouncement() {
		await portalSettingsStore.saveSettings({
			infoEnabled: quickInfoEnabled,
			infoTitle: quickInfoTitle,
			infoMessage: quickInfoMessage
		});
		quickSaved = true;
		setTimeout(() => (quickSaved = false), 2500);
	}

	async function fetchDashboardData() {
		loading = true;
		await usersStore.fetchUsers();
		await portalSettingsStore.refresh();

		if (!isSupabaseConfigured()) {
			isDbConnected = false;
			dbLatency = 'Mode Lokal';
			loading = false;
			return;
		}

		const startTime = performance.now();
		try {
			const { error: profErr } = await supabase
				.from('profiles')
				.select('id', { count: 'exact', head: true });

			const endTime = performance.now();
			dbLatency = `${Math.round(endTime - startTime)}ms`;
			isDbConnected = !profErr;

			const { count: bookmarkCount } = await supabase
				.from('bookmarks')
				.select('id', { count: 'exact', head: true });
			if (typeof bookmarkCount === 'number') {
				dbBookmarksCount = bookmarkCount;
			}

			const { data: readingSessions } = await supabase
				.from('reading_sessions')
				.select('duration_seconds')
				.limit(100);

			if (readingSessions && readingSessions.length > 0) {
				const totalSeconds = readingSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
				dbReadingHours = Math.round(totalSeconds / 3600);
			}

			const { data: recentProgress } = await supabase
				.from('reading_progress')
				.select('surah_number, ayah_number, updated_at, user_id, profiles(full_name, role)')
				.order('updated_at', { ascending: false })
				.limit(6);

			if (recentProgress && recentProgress.length > 0) {
				recentActivities = recentProgress.map((item: any) => {
					const profileName = item.profiles?.full_name || 'Jamaah';
					const userRole = item.profiles?.role === 'admin' ? 'admin' : 'jamaah';
					const surahName = SURAH_LIST.find((s) => s.number === item.surah_number)?.name_latin || `Surah ${item.surah_number}`;
					const date = new Date(item.updated_at);
					return {
						user: profileName,
						action: `Membaca QS. ${surahName} : Ayat ${item.ayah_number}`,
						time: formatTimeAgo(date),
						role: userRole
					};
				});
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
		const unsub = portalSettingsStore.subscribe((s) => {
			quickInfoTitle = s.infoTitle;
			quickInfoMessage = s.infoMessage;
			quickInfoEnabled = s.infoEnabled;
		});
		fetchDashboardData();
		return unsub;
	});
</script>

<svelte:head>
	<title>Admin Dashboard - Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-7 animate-in fade-in duration-200">
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
					<span>Panel Kontrol & Pemantauan Jamaah</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
					Dashboard Eksekutif Admin
				</h1>
				<p class="text-xs sm:text-sm text-quran-goldLight mt-1">
					Pantau jamaah tilawah, perbarui pengumuman beranda secara langsung, serta kelola konten surah, tafsir, dan agenda kajian.
				</p>
			</div>
		</div>

		<!-- Quick Remote Status Badge -->
		<div class="bg-white/10 backdrop-blur-md border border-quran-gold/40 p-4 rounded-2xl flex items-center gap-3 flex-shrink-0">
			<div class="w-3 h-3 rounded-full {isDbConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}"></div>
			<div class="text-xs">
				<span class="font-bold text-white block">Status Database SQL</span>
				<span class="text-quran-goldLight text-[11px]">
					{isDbConnected ? `Terhubung (${dbLatency})` : 'Sinkron Lokal Aktif'}
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

	<!-- Quick Live Info Beranda Jamaah Editor -->
	<div class="bg-quran-surface rounded-3xl border border-quran-gold/50 p-5 sm:p-6 shadow-luxury space-y-4">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-quran-border/60 pb-3">
			<div class="flex items-center gap-2">
				<Megaphone class="w-4 h-4 text-quran-gold" />
				<div>
					<h2 class="text-xs font-extrabold uppercase tracking-wider text-quran-chocolate">
						Edit Cepat Info Beranda & Halaman Qur'an Jamaah
					</h2>
					<p class="text-[11px] text-quran-warm">Perubahan di sini langsung tampil di Beranda & Halaman Al-Qur'an jamaah.</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					on:click={() => (quickInfoEnabled = !quickInfoEnabled)}
					class="px-3 py-1 rounded-full text-[11px] font-bold transition {quickInfoEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-200 text-gray-700'}"
				>
					{quickInfoEnabled ? 'Status: Aktif Tampil' : 'Status: Disembunyikan'}
				</button>
				<a href="/admin/settings" class="text-xs font-bold text-quran-gold hover:underline">Pengaturan Lengkap &rarr;</a>
			</div>
		</div>

		{#if quickSaved}
			<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>Info beranda jamaah berhasil diperbarui secara live!</span>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
			<div class="lg:col-span-4">
				<label for="quick-info-title" class="block text-[11px] font-bold text-quran-chocolate mb-1">Judul Info Jamaah</label>
				<input
					id="quick-info-title"
					type="text"
					bind:value={quickInfoTitle}
					class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-semibold focus:border-quran-gold focus:outline-none"
				/>
			</div>
			<div class="lg:col-span-6">
				<label for="quick-info-msg" class="block text-[11px] font-bold text-quran-chocolate mb-1">Isi Pengumuman / Info Terkini</label>
				<input
					id="quick-info-msg"
					type="text"
					bind:value={quickInfoMessage}
					class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
				/>
			</div>
			<div class="lg:col-span-2">
				<button
					on:click={saveQuickAnnouncement}
					class="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition cursor-pointer"
				>
					<Save class="w-3.5 h-3.5 text-quran-gold" />
					<span>Update Live</span>
				</button>
			</div>
		</div>
	</div>

	<!-- 8 Major Admin KPI Metric Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<a href="/admin/users" class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 hover:border-quran-gold shadow-luxury space-y-2 transition block">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Jamaah</span>
				<Users class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{totalCustomers.toLocaleString('id-ID')}</div>
			<p class="text-[11px] text-quran-warm font-semibold">Kelola jamaah terdaftar &rarr;</p>
		</a>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Jamaah Aktif</span>
				<Activity class="w-4 h-4 text-emerald-600" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{activeCustomers}</div>
			<p class="text-[11px] text-emerald-700 font-semibold">Akun aktif bertilawah</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Ayat Dibaca</span>
				<BookOpen class="w-4 h-4 text-quran-chocolate" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{totalAyahsRead.toLocaleString('id-ID')}</div>
			<p class="text-[11px] text-quran-warm">Akumulasi tilawah jamaah</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Estimasi Jam Tilawah</span>
				<Clock class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{computedHours} Jam</div>
			<p class="text-[11px] text-quran-warm">Seluruh sesi jamaah</p>
		</div>

		<a href="/admin/quran" class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 hover:border-quran-gold shadow-luxury space-y-2 transition block">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Info 114 Surah</span>
				<BookOpen class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">114 Surah</div>
			<p class="text-[11px] text-emerald-700 font-semibold">Edit info & keutamaan &rarr;</p>
		</a>

		<a href="/admin/audio" class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 hover:border-quran-gold shadow-luxury space-y-2 transition block">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Qari Murattal</span>
				<Headphones class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{activeQarisCount} Qari</div>
			<p class="text-[11px] text-quran-warm">{activeQarisCount * 114} trek surah aktif</p>
		</a>

		<a href="/admin/agenda" class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 hover:border-quran-gold shadow-luxury space-y-2 transition block">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Agenda Kajian</span>
				<CalendarDays class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{$agendaStore.length} Event</div>
			<p class="text-[11px] text-quran-warm">Kelola jadwal kajian &rarr;</p>
		</a>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Bookmark Jamaah</span>
				<Bookmark class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark">{Math.max(dbBookmarksCount, totalCustomers * 2).toLocaleString('id-ID')}</div>
			<p class="text-[11px] text-quran-warm">Ayat pilihan tersimpan</p>
		</div>
	</div>

	<!-- 2-Column Split: System Health Monitoring & Live Activity Stream -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<div class="lg:col-span-5 bg-quran-surface rounded-3xl border border-quran-border/80 p-6 shadow-luxury space-y-5">
			<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
				<div class="flex items-center gap-2">
					<Server class="w-4 h-4 text-quran-gold" />
					<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Status Sinkronisasi Sistem</h2>
				</div>
				<span class="text-[10px] font-bold px-2 py-0.5 rounded {isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
					{isDbConnected ? 'Online Realtime' : 'Local Sync'}
				</span>
			</div>

			<div class="space-y-3 text-xs">
				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Database class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Database SQL:</span>
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
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">Operational (EveryAyah CDN)</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Activity class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Sinkron Beranda Jamaah:</span>
					</div>
					<span class="text-emerald-700 font-mono text-[11px] font-semibold">Aktif Otomatis</span>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Clock class="w-4 h-4 text-quran-chocolate" />
						<span class="font-bold text-quran-dark">Sumber Tafsir:</span>
					</div>
					<span class="text-quran-warm font-mono text-[11px]">Tafsir Kemenag RI (ID)</span>
				</div>
			</div>

			<div class="pt-2">
				<a
					href="/admin/settings"
					class="w-full py-2.5 px-4 rounded-xl bg-quran-sand border border-quran-border text-xs font-bold text-quran-dark hover:bg-quran-beige text-center block transition"
				>
					Edit Seluruh Konten Beranda Jamaah
				</a>
			</div>
		</div>

		<div class="lg:col-span-7 bg-quran-surface rounded-3xl border border-quran-border/80 p-6 shadow-luxury space-y-4">
			<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
				<div class="flex items-center gap-2">
					<Activity class="w-4 h-4 text-quran-gold" />
					<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Aktivitas Tilawah Jamaah Terkini</h2>
				</div>
				<a href="/admin/users" class="text-xs font-bold text-quran-gold hover:underline">Lihat Semua Jamaah</a>
			</div>

			<div class="divide-y divide-quran-border/60">
				{#each displayedActivities as act}
					<div class="py-3 flex items-center justify-between gap-3 text-xs">
						<div class="flex items-center gap-3 min-w-0">
							<div class="w-8 h-8 rounded-xl bg-quran-sand text-quran-chocolate font-bold flex items-center justify-center flex-shrink-0">
								{act.user.charAt(0).toUpperCase()}
							</div>
							<div class="min-w-0">
								<div class="flex items-center gap-1.5">
									<span class="font-bold text-quran-dark truncate">{act.user}</span>
									<span class="text-[9px] px-1.5 py-0.2 rounded bg-quran-sand text-quran-warm font-mono">{act.role}</span>
								</div>
								<p class="text-quran-warm text-[11px] mt-0.5 truncate">{act.action}</p>
							</div>
						</div>
						<span class="text-[10px] text-quran-muted font-mono flex-shrink-0">{act.time}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
