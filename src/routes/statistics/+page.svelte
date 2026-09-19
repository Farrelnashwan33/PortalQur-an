<script lang="ts">
	import { progressStore } from '$lib/stores/progress';
	import { 
		BarChart3, 
		Flame, 
		Clock, 
		BookOpen, 
		Layers, 
		TrendingUp, 
		Calendar, 
		Sparkles, 
		Award,
		ArrowRight
	} from 'lucide-svelte';

	const stats = progressStore.stats;
	const progress = progressStore.progress;

	// Calculate reading minutes to hours
	$: readingHours = Math.floor($stats.total_reading_minutes / 60);
	$: readingMinsRemaining = $stats.total_reading_minutes % 60;

	// Khatam progress percentage (based on 30 Juz)
	$: khatamPercent = Math.min(100, Math.round(($stats.completed_juz.length / 30) * 100));
</script>

<svelte:head>
	<title>Statistik & Progres Bacaan - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
	
	<!-- Header Banner -->
	<div class="relative overflow-hidden rounded-3xl bg-gradient-luxury text-quran-cream p-6 sm:p-8 shadow-luxury border border-quran-gold/40">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="relative z-10 max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-xs font-semibold text-quran-gold mb-2">
				<BarChart3 class="w-3.5 h-3.5" />
				<span>Analisis Aktivitas Tilawah</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Statistik & Target Bacaan
			</h1>
			<p class="text-xs sm:text-sm text-quran-goldLight mt-1.5 leading-relaxed">
				Pantau perkembangan tilawah harian Anda, pertahankan streak membaca, dan raih target khatam 30 Juz.
			</p>
		</div>
	</div>

	<!-- 4 Major KPI Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		
		<!-- 1. Total Ayat -->
		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div>
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Ayat Dibaca</span>
				<div class="text-2xl font-extrabold text-quran-dark mt-1">{$stats.total_ayahs_read}</div>
				<p class="text-[11px] text-green-700 font-semibold flex items-center gap-1 mt-1">
					<TrendingUp class="w-3 h-3" /> Aktif terbaca
				</p>
			</div>
			<div class="w-12 h-12 rounded-2xl bg-quran-sand text-quran-primary flex items-center justify-center group-hover:scale-110 transition-transform">
				<BookOpen class="w-6 h-6 text-quran-chocolate" />
			</div>
		</div>

		<!-- 2. Streak Membaca -->
		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div>
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Streak Istiqomah</span>
				<div class="text-2xl font-extrabold text-quran-dark mt-1">{$stats.current_streak_days} Hari</div>
				<p class="text-[11px] text-amber-800 font-semibold mt-1">
					Menjaga konsistensi
				</p>
			</div>
			<div class="w-12 h-12 rounded-2xl bg-amber-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
				<Flame class="w-6 h-6 fill-orange-500" />
			</div>
		</div>

		<!-- 3. Total Waktu -->
		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div>
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Waktu Membaca</span>
				<div class="text-2xl font-extrabold text-quran-dark mt-1">
					{readingHours > 0 ? `${readingHours}j ` : ''}{readingMinsRemaining}m
				</div>
				<p class="text-[11px] text-quran-warm font-medium mt-1">
					Tadabbur waktu penuh
				</p>
			</div>
			<div class="w-12 h-12 rounded-2xl bg-quran-sand text-quran-gold flex items-center justify-center group-hover:scale-110 transition-transform">
				<Clock class="w-6 h-6" />
			</div>
		</div>

		<!-- 4. Progress Khatam -->
		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div>
				<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Target Khatam</span>
				<div class="text-2xl font-extrabold text-quran-dark mt-1">
					{khatamPercent}%
				</div>
				<p class="text-[11px] text-quran-chocolate font-semibold mt-1">
					{$stats.completed_juz.length} dari 30 Juz
				</p>
			</div>
			<div class="w-12 h-12 rounded-2xl bg-gradient-luxury text-quran-gold flex items-center justify-center group-hover:scale-110 transition-transform shadow-gold">
				<Award class="w-6 h-6" />
			</div>
		</div>

	</div>

	<!-- 30 Juz Khatam Visual Heatmap Matrix -->
	<div class="bg-quran-surface rounded-3xl p-6 sm:p-7 border border-quran-border/80 shadow-luxury space-y-4">
		<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
			<div class="flex items-center gap-2">
				<Layers class="w-5 h-5 text-quran-gold" />
				<div>
					<h3 class="text-sm font-bold text-quran-dark">Peta 30 Juz Al-Qur'an (Khatam Tracker)</h3>
					<p class="text-[11px] text-quran-warm">Klik kotak juz untuk langsung mulai membaca</p>
				</div>
			</div>
			<span class="text-xs font-bold text-quran-primary">
				{$stats.completed_juz.length} / 30 Juz Selesai
			</span>
		</div>

		<!-- 30 Juz Grid -->
		<div class="grid grid-cols-5 sm:grid-cols-10 gap-2.5 pt-2">
			{#each Array.from({ length: 30 }, (_, i) => i + 1) as juzNum}
				{@const isDone = $stats.completed_juz.includes(juzNum)}
				<a 
					href="/quran"
					class="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 group {isDone ? 'bg-gradient-luxury border-quran-gold text-quran-gold shadow-gold' : 'bg-quran-sand/60 border-quran-border text-quran-dark hover:border-quran-gold hover:bg-quran-cream'}"
					title="Juz {juzNum} - {isDone ? 'Selesai Dibaca' : 'Belum Selesai'}"
				>
					<span class="text-[9px] uppercase font-bold text-quran-warm {isDone ? 'text-quran-goldLight' : ''}">JUZ</span>
					<span class="text-base font-extrabold group-hover:scale-110 transition-transform">{juzNum}</span>
					<span class="w-1.5 h-1.5 rounded-full {isDone ? 'bg-quran-gold shadow-gold' : 'bg-gray-300'}"></span>
				</a>
			{/each}
		</div>
	</div>

	<!-- 2-Column Split: Activity Chart & Reading History Timeline -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		
		<!-- Left: Weekly Chart (7 cols) -->
		<div class="lg:col-span-7 bg-quran-surface rounded-3xl border border-quran-border/80 p-6 shadow-luxury flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4 border-b border-quran-border/60 pb-3">
					<div class="flex items-center gap-2">
						<Calendar class="w-4 h-4 text-quran-gold" />
						<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Aktivitas Ayat Mingguan</h3>
					</div>
					<span class="text-xs font-bold text-quran-warm">7 Hari Terakhir</span>
				</div>

				<!-- Activity Bars -->
				<div class="h-48 flex items-end justify-between gap-3 pt-6 pb-2">
					{#each $stats.weekly_activity as day}
						<div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
							<span class="text-[10px] font-mono text-quran-warm opacity-0 group-hover:opacity-100 transition">{day.count}</span>
							<div 
								class="w-full max-w-[36px] rounded-2xl bg-gradient-luxury group-hover:bg-gradient-gold shadow-sm transition-all"
								style="height: {Math.max(12, (day.count / 75) * 100)}%"
							></div>
							<span class="text-[11px] font-bold text-quran-chocolate">{day.day}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Top Surahs -->
			<div class="pt-4 border-t border-quran-border/60">
				<h4 class="text-xs font-bold text-quran-chocolate mb-2">Surah Paling Sering Diulang</h4>
				<div class="space-y-1.5">
					{#each $stats.top_surahs as ts}
						<div class="flex items-center justify-between p-2.5 rounded-xl bg-quran-sand/50 text-xs">
							<span class="font-bold text-quran-dark">{ts.name}</span>
							<span class="text-quran-warm font-mono">{ts.count}x dibaca</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right: Recent Reading History Timeline (5 cols) -->
		<div class="lg:col-span-5 bg-quran-surface rounded-3xl border border-quran-border/80 p-6 shadow-luxury flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4 border-b border-quran-border/60 pb-3">
					<div class="flex items-center gap-2">
						<Clock class="w-4 h-4 text-quran-gold" />
						<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Riwayat Tilawah Terakhir</h3>
					</div>
				</div>

				<div class="space-y-3">
					{#each $stats.recent_history as h}
						<a 
							href="/quran/{h.surah_number}#ayah-{h.ayah_number}" 
							class="p-3 rounded-2xl bg-quran-sand/50 border border-quran-border/60 flex items-center justify-between hover:border-quran-gold hover:bg-quran-cream transition group"
						>
							<div>
								<div class="text-xs font-bold text-quran-dark group-hover:text-quran-primary transition">
									{h.surah_name} : Ayat {h.ayah_number}
								</div>
								<div class="text-[10px] text-quran-warm mt-0.5">{h.timestamp}</div>
							</div>
							<ArrowRight class="w-3.5 h-3.5 text-quran-gold group-hover:translate-x-1 transition-transform" />
						</a>
					{/each}
				</div>
			</div>

			<div class="pt-6">
				<a 
					href="/quran/{$progress.surah_number}#ayah-{$progress.ayah_number}"
					class="w-full py-3 rounded-2xl bg-gradient-gold text-quran-dark text-xs font-bold shadow-gold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
				>
					<span>Lanjutkan Bacaan Terakhir</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>

	</div>

</div>
