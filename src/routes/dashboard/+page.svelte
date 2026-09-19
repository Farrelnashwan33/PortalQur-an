<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAdmin } from '$lib/stores/auth';
	import { progressStore } from '$lib/stores/progress';
	import { audioStore } from '$lib/stores/audio';
	import { agendaStore } from '$lib/stores/agenda';
	import { topicStore } from '$lib/stores/topics';
	import { 
		BookOpen, 
		Flame, 
		Clock, 
		CheckCircle2, 
		Play, 
		Bookmark, 
		ArrowRight, 
		CalendarDays, 
		Sparkles, 
		Compass, 
		Layers,
		TrendingUp,
		Share2
	} from 'lucide-svelte';

	onMount(() => {
		if (typeof window !== 'undefined') {
			const host = window.location.hostname.toLowerCase();
			if (host.startsWith('admin.') || host.startsWith('admin-') || host.includes('admin-portalquran')) {
				if ($isAdmin) {
					goto('/admin');
				} else {
					goto('/admin/login');
				}
			}
		}
	});

	const progress = progressStore.progress;
	const stats = progressStore.stats;
	const bookmarks = progressStore.bookmarks;

	// Verse of the day
	const verseOfTheDay = {
		surah_number: 2,
		surah_name: 'Al-Baqarah',
		ayah_number: 186,
		text_arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
		text_id: 'Dan apabila hamba-hamba-Ku bertanya kepadamu (Muhammad) tentang Aku, maka sesungguhnya Aku dekat. Aku mengabulkan permohonan orang yang berdoa apabila dia berdoa kepada-Ku.',
		theme: 'Kedekatan Allah & Pengabulan Doa'
	};
</script>

<svelte:head>
	<title>Customer Dashboard - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
	
	<!-- 1. Hero Greeting Banner (Full width on Mobile, Split on Desktop) -->
	<div class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-luxury text-quran-cream p-5 sm:p-7 md:p-8 lg:p-9 shadow-luxury border border-quran-gold/30">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="absolute -right-16 -bottom-16 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-quran-gold/15 blur-3xl pointer-events-none"></div>
		<div class="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>

		<div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
			
			<!-- Greeting Left -->
			<div class="w-full lg:max-w-xl flex items-start gap-4">
				<img 
					src="/logo.png" 
					alt="Portal Qur'an Avatar Logo" 
					class="hidden sm:block w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-gold border-2 border-quran-gold/50 flex-shrink-0 animate-float"
				/>
				<div class="flex-1 min-w-0">
					<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-[11px] sm:text-xs font-semibold text-quran-goldLight mb-2.5">
						<Sparkles class="w-3.5 h-3.5 text-quran-gold" />
						<span>Bismillah, Awali Harimu Dengan Qur'an</span>
					</div>

					<h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
						Assalamu'alaikum, <span class="text-quran-goldLight">{$authStore?.full_name || 'Sahabat Qur\'an'}</span>
					</h1>
					<p class="text-xs sm:text-sm text-quran-cream/80 mt-2 leading-relaxed italic">
						"Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya." <span class="text-quran-goldLight/70 font-sans not-italic text-[11px]">(HR. Bukhari)</span>
					</p>

					<!-- Compact 2-Column Stats Grid in Hero -->
					<div class="grid grid-cols-2 gap-3 mt-4 sm:mt-5">
						<div class="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-3 hover:bg-black/25 transition">
							<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
								<Flame class="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 fill-orange-400" />
							</div>
							<div class="min-w-0">
								<span class="text-[10px] uppercase font-bold tracking-wider text-quran-goldLight/70 block">Streak</span>
								<span class="text-xs sm:text-sm font-extrabold text-white truncate block">{$stats.current_streak_days} Hari</span>
							</div>
						</div>

						<div class="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-3 hover:bg-black/25 transition">
							<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-quran-gold/20 border border-quran-gold/30 flex items-center justify-center flex-shrink-0">
								<BookOpen class="w-4 h-4 sm:w-5 sm:h-5 text-quran-goldLight" />
							</div>
							<div class="min-w-0">
								<span class="text-[10px] uppercase font-bold tracking-wider text-quran-goldLight/70 block">Ayat Dibaca</span>
								<span class="text-xs sm:text-sm font-extrabold text-white truncate block">{$stats.total_ayahs_read} Selesai</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Continue Reading Card (100% width on Mobile, max-w-sm on Desktop) -->
			<div class="w-full lg:max-w-sm bg-black/25 backdrop-blur-lg border border-quran-gold/35 p-4 sm:p-5 rounded-2xl shadow-luxury mt-1 lg:mt-0">
				<div class="flex items-center justify-between text-xs text-quran-goldLight mb-2">
					<span class="font-bold uppercase tracking-wider text-[10px] text-quran-gold flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
						Lanjutkan Bacaan Terakhir
					</span>
					<span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-quran-goldLight">Juz {$progress.juz_number}</span>
				</div>

				<div class="text-base sm:text-lg font-bold text-white mb-0.5 truncate">
					{$progress.surah_name} : Ayat {$progress.ayah_number}
				</div>
				<p class="text-[11px] text-quran-cream/70 mb-4 flex items-center gap-1.5">
					<Clock class="w-3 h-3 text-quran-goldLight/60" />
					<span>Terakhir dibaca baru saja</span>
				</p>

				<div class="flex items-center gap-2.5">
					<a 
						href="/quran/{$progress.surah_number}#ayah-{$progress.ayah_number}"
						class="flex-1 h-11 px-4 rounded-xl bg-gradient-gold text-quran-dark font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-lg hover:brightness-105 active:scale-98 transition-all"
					>
						<span>Buka Ayat Ini</span>
						<ArrowRight class="w-4 h-4" />
					</a>
					<button 
						on:click={() => audioStore.playAyah($progress.surah_number, $progress.surah_name, $progress.ayah_number)}
						class="h-11 w-11 rounded-xl bg-white/10 hover:bg-white/20 text-quran-goldLight hover:text-white border border-white/15 flex items-center justify-center transition flex-shrink-0 active:scale-95"
						title="Putar Audio"
					>
						<Play class="w-4 h-4 fill-current ml-0.5" />
					</button>
				</div>
			</div>

		</div>
	</div>

	<!-- 2. Target & Progress Metric Cards (3 Cards) -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
		
		<!-- Card 1: Progress Khatam -->
		<div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div class="space-y-1">
				<span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-quran-warm">Progress Khatam</span>
				<div class="text-xl sm:text-2xl font-extrabold text-quran-dark">
					Juz {$stats.completed_juz.length} <span class="text-xs font-normal text-quran-warm">/ 30 Juz</span>
				</div>
				<div class="w-28 sm:w-36 h-2 rounded-full bg-quran-sand overflow-hidden mt-1.5">
					<div 
						class="h-full bg-gradient-luxury rounded-full" 
						style="width: {Math.max(5, ($stats.completed_juz.length / 30) * 100)}%"
					></div>
				</div>
			</div>
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-quran-cream border border-quran-border text-quran-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
				<Layers class="w-5 h-5 sm:w-6 sm:h-6 text-quran-chocolate" />
			</div>
		</div>

		<!-- Card 2: Total Ayat Dibaca -->
		<div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div class="space-y-1">
				<span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-quran-warm">Total Ayat Dibaca</span>
				<div class="text-xl sm:text-2xl font-extrabold text-quran-dark">
					{$stats.total_ayahs_read} <span class="text-xs font-normal text-quran-warm">Ayat</span>
				</div>
				<p class="text-[10px] sm:text-[11px] text-green-700 font-medium flex items-center gap-1">
					<TrendingUp class="w-3 h-3" /> +15 ayat hari ini
				</p>
			</div>
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-quran-cream border border-quran-border text-quran-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
				<BookOpen class="w-5 h-5 sm:w-6 sm:h-6 text-quran-primary" />
			</div>
		</div>

		<!-- Card 3: Streak Membaca -->
		<div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury flex items-center justify-between group hover:border-quran-gold transition">
			<div class="space-y-1">
				<span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-quran-warm">Streak Membaca</span>
				<div class="text-xl sm:text-2xl font-extrabold text-quran-dark flex items-center gap-1.5">
					{$stats.current_streak_days} <span class="text-xs font-normal text-quran-warm">Hari</span>
				</div>
				<p class="text-[10px] sm:text-[11px] text-amber-800 font-semibold">
					Pertahankan istiqomah!
				</p>
			</div>
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-orange-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
				<Flame class="w-5 h-5 sm:w-6 sm:h-6 fill-orange-500" />
			</div>
		</div>

	</div>

	<!-- 3. Verse of the Day & Weekly Progress Chart Split -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
		
		<!-- Left: Verse of the Day (7 cols) -->
		<div class="lg:col-span-7 bg-quran-surface rounded-2xl sm:rounded-3xl border border-quran-border/80 p-5 sm:p-6 shadow-luxury flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-quran-gold/20 flex items-center justify-center text-quran-chocolate flex-shrink-0">
							<Sparkles class="w-3.5 h-3.5 text-quran-gold" />
						</div>
						<div>
							<h3 class="font-bold text-xs uppercase tracking-wider text-quran-chocolate">Ayat Pilihan Hari Ini</h3>
							<p class="text-[10px] sm:text-[11px] text-quran-warm">{verseOfTheDay.theme}</p>
						</div>
					</div>

					<span class="text-xs font-bold px-2.5 py-1 rounded-xl bg-quran-sand border border-quran-border text-quran-dark">
						{verseOfTheDay.surah_name} : {verseOfTheDay.ayah_number}
					</span>
				</div>

				<!-- Arabic Scripture Display -->
				<div class="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-quran-sand/60 border border-quran-border/70 my-3 sm:my-4 text-right">
					<p class="arabic-text text-xl sm:text-2xl md:text-3xl text-quran-dark leading-loose">
						{verseOfTheDay.text_arabic}
					</p>
				</div>

				<p class="text-xs sm:text-sm text-quran-dark leading-relaxed">
					"{verseOfTheDay.text_id}"
				</p>
			</div>

			<div class="pt-4 sm:pt-5 mt-4 border-t border-quran-border/60 flex items-center justify-between flex-wrap gap-2">
				<div class="flex items-center gap-2">
					<button 
						on:click={() => audioStore.playAyah(verseOfTheDay.surah_number, verseOfTheDay.surah_name, verseOfTheDay.ayah_number)}
						class="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-quran-sand text-xs font-semibold text-quran-chocolate hover:bg-quran-beige/70 transition"
					>
						<Play class="w-3.5 h-3.5 text-quran-gold" />
						<span>Dengarkan</span>
					</button>

					<button 
						on:click={() => progressStore.bookmarks.toggleBookmark(verseOfTheDay.surah_number, verseOfTheDay.surah_name, verseOfTheDay.ayah_number, verseOfTheDay.text_arabic, verseOfTheDay.text_id)}
						class="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-quran-sand text-xs font-semibold text-quran-chocolate hover:bg-quran-beige/70 transition"
					>
						<Bookmark class="w-3.5 h-3.5 text-quran-gold" />
						<span>Bookmark</span>
					</button>
				</div>

				<a 
					href="/quran/{verseOfTheDay.surah_number}#ayah-{verseOfTheDay.ayah_number}" 
					class="text-xs font-bold text-quran-chocolate hover:text-quran-dark flex items-center gap-1 group"
				>
					<span>Buka Surah</span>
					<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-quran-gold" />
				</a>
			</div>
		</div>

		<!-- Right: Quick Reading Activity Heatmap & Top Surahs (5 cols) -->
		<div class="lg:col-span-5 bg-quran-surface rounded-2xl sm:rounded-3xl border border-quran-border/80 p-5 sm:p-6 shadow-luxury flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-3 sm:mb-4">
					<div class="flex items-center gap-2">
						<Clock class="w-4 h-4 text-quran-gold" />
						<h3 class="font-bold text-xs uppercase tracking-wider text-quran-chocolate">Aktivitas 7 Hari Terakhir</h3>
					</div>
					<a href="/statistics" class="text-xs font-semibold text-quran-gold hover:underline">Detail</a>
				</div>

				<!-- Bar chart representation -->
				<div class="grid grid-cols-7 gap-1.5 sm:gap-2 items-end h-28 sm:h-32 pt-3 border-b border-quran-border/60 pb-3">
					{#each $stats.weekly_activity as day}
						<div class="flex flex-col items-center gap-1.5 h-full justify-end">
							<div class="text-[9px] font-mono text-quran-warm">{day.count}</div>
							<div 
								class="w-full max-w-[20px] sm:max-w-[24px] rounded-t-lg bg-gradient-luxury hover:bg-gradient-gold transition-all"
								style="height: {Math.max(15, (day.count / 70) * 100)}%"
								title="{day.day}: {day.count} ayat"
							></div>
							<span class="text-[9px] sm:text-[10px] font-bold text-quran-chocolate">{day.day}</span>
						</div>
					{/each}
				</div>

				<!-- Most Read Surahs -->
				<div class="mt-3.5 sm:mt-4">
					<div class="text-[10px] sm:text-[11px] font-bold text-quran-warm uppercase tracking-wider mb-1.5 sm:mb-2">
						Surah Paling Sering Dibaca
					</div>
					<div class="space-y-1.5">
						{#each $stats.top_surahs.slice(0, 3) as s}
							<div class="flex items-center justify-between p-2 rounded-xl bg-quran-sand/50 text-xs">
								<span class="font-bold text-quran-dark">{s.name}</span>
								<span class="text-quran-warm font-mono text-[11px]">{s.count}x dibaca</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="pt-3.5 sm:pt-4">
				<a 
					href="/quran" 
					class="w-full py-2.5 px-4 rounded-xl bg-quran-sand border border-quran-border text-center font-bold text-xs text-quran-dark hover:bg-quran-beige/50 transition block"
				>
					Jelajahi 114 Surah Al-Qur'an
				</a>
			</div>
		</div>

	</div>

	<!-- 4. Thematic Topics Grid Highlights (Bound to topicStore) -->
	<div>
		<div class="flex items-center justify-between mb-3 sm:mb-4">
			<div>
				<h2 class="text-base sm:text-lg font-bold text-quran-dark">Eksplorasi Topik Tematik Qur'an</h2>
				<p class="text-[11px] sm:text-xs text-quran-warm">Temukan panduan ayat-ayat suci berdasarkan kebutuhan hidup</p>
			</div>
			<a href="/topik" class="text-xs font-bold text-quran-chocolate hover:text-quran-dark flex items-center gap-1">
				<span>Semua ({$topicStore.length})</span>
				<ArrowRight class="w-3.5 h-3.5 text-quran-gold" />
			</a>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
			{#each $topicStore.slice(0, 6) as topic}
				<a 
					href="/topik#{topic.slug}" 
					class="p-3.5 sm:p-4 rounded-2xl bg-quran-surface border border-quran-border/80 hover:border-quran-gold hover:shadow-gold transition flex flex-col justify-between group text-center"
				>
					<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-quran-sand mx-auto flex items-center justify-center text-quran-primary group-hover:scale-105 transition-transform">
						<Compass class="w-4 h-4 sm:w-5 sm:h-5 text-quran-gold" />
					</div>
					<div class="mt-2.5">
						<h3 class="text-xs font-bold text-quran-dark group-hover:text-quran-primary transition truncate">
							{topic.category}
						</h3>
						<p class="text-[10px] text-quran-warm mt-0.5 font-mono">
							{topic.ayahs.length} Ayat
						</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- 5. Upcoming Agendas Preview (Live bound to agendaStore) -->
	<div>
		<div class="flex items-center justify-between mb-3 sm:mb-4">
			<div>
				<h2 class="text-base sm:text-lg font-bold text-quran-dark">Agenda Kajian & Tilawah Terdekat</h2>
				<p class="text-[11px] sm:text-xs text-quran-warm">Ikuti majelis ilmu dan kegiatan simaan bersama komunitas</p>
			</div>
			<a href="/agenda" class="text-xs font-bold text-quran-chocolate hover:text-quran-dark flex items-center gap-1">
				<span>Semua ({$agendaStore.length})</span>
				<ArrowRight class="w-3.5 h-3.5 text-quran-gold" />
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
			{#each $agendaStore.slice(0, 3) as item}
				<div class="bg-quran-surface rounded-2xl sm:rounded-3xl border border-quran-border/80 p-4 sm:p-5 shadow-luxury flex flex-col justify-between hover:border-quran-gold transition">
					<div>
						<div class="flex items-center justify-between mb-2">
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-quran-gold/20 text-quran-chocolate border border-quran-gold/30">
								{item.category}
							</span>
							<span class="text-[11px] text-quran-warm font-mono">
								{new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
							</span>
						</div>

						<h3 class="font-bold text-xs sm:text-sm text-quran-dark line-clamp-2 mb-1.5">
							{item.title}
						</h3>
						<p class="text-xs text-quran-warm line-clamp-2 leading-relaxed">
							{item.description}
						</p>
					</div>

					<div class="pt-3.5 mt-3 border-t border-quran-border/60 flex items-center justify-between text-xs text-quran-chocolate">
						<span class="truncate text-[11px]">{item.speaker || item.location}</span>
						<a href="/agenda" class="text-quran-gold font-bold hover:underline flex-shrink-0">
							Detail
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

</div>
