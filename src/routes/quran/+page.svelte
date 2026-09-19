<script lang="ts">
	import { page } from '$app/stores';
	import { SURAH_LIST } from '$lib/data/surahList';
	import { audioStore } from '$lib/stores/audio';
	import { readerStore } from '$lib/stores/reader';
	import type { SurahMeta, ReadingMode } from '$lib/types/quran';
	import SurahInfoModal from '$lib/components/SurahInfoModal.svelte';
	import { 
		Search, 
		BookOpen, 
		Headphones, 
		FileText, 
		Layers, 
		Eye, 
		Sparkles, 
		Info, 
		Play, 
		Filter, 
		Grid, 
		List, 
		Compass,
		ArrowRight
	} from 'lucide-svelte';

	let searchQuery = '';
	let selectedFilter: 'all' | 'makkiyah' | 'madaniyah' | number = 'all';
	let isGridView = true;

	// Surah Info Modal state
	let selectedSurahForInfo: SurahMeta | null = null;
	let isInfoModalOpen = false;

	// Check query param for initial mode (e.g. ?mode=tafsir)
	$: if ($page.url.searchParams.get('mode')) {
		const m = $page.url.searchParams.get('mode') as ReadingMode;
		if (['mushaf', 'terjemahan', 'tafsir', 'per-kata', 'audio', 'fokus'].includes(m)) {
			readerStore.setMode(m);
		}
	}

	// Filtered Surahs
	$: filteredSurahs = SURAH_LIST.filter((s) => {
		// Search query filter
		const matchesSearch = 
			s.name_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.name_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.name_arabic.includes(searchQuery) ||
			s.number.toString() === searchQuery.trim();

		if (!matchesSearch) return false;

		// Category / Juz filter
		if (selectedFilter === 'all') return true;
		if (selectedFilter === 'makkiyah') return s.revelation_type === 'Makkiyah';
		if (selectedFilter === 'madaniyah') return s.revelation_type === 'Madaniyah';
		if (typeof selectedFilter === 'number') {
			return s.juz_start === selectedFilter;
		}

		return true;
	});

	function openInfo(surah: SurahMeta, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		selectedSurahForInfo = surah;
		isInfoModalOpen = true;
	}

	function playSurahAudio(surah: SurahMeta, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		audioStore.playSurahFull(surah.number, surah.name_latin, surah.number_of_ayahs);
	}
</script>

<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in duration-200 w-full min-w-0">
	
	<!-- Top Banner -->
	<div class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-luxury text-quran-cream p-3.5 sm:p-7 md:p-8 shadow-luxury border border-quran-gold/40 w-full min-w-0">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="absolute -right-6 -bottom-6 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-quran-gold/15 blur-2xl pointer-events-none"></div>
		
		<div class="relative z-10 flex items-center justify-between gap-3 sm:gap-6 min-w-0">
			<div class="flex-1 min-w-0">
				<div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-[10px] sm:text-xs font-semibold text-quran-gold mb-1.5 sm:mb-2 max-w-full">
					<BookOpen class="w-3 h-3 text-quran-gold flex-shrink-0" />
					<span class="truncate">Koleksi Lengkap 114 Surah</span>
				</div>
				<h1 class="text-base sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
					Al-Qur'an Al-Karim
				</h1>
				<p class="text-[11px] sm:text-sm text-quran-goldLight/95 mt-1 sm:mt-1.5 leading-snug sm:leading-relaxed">
					Membaca, mentadabburi tafsir, mendengarkan lantunan merdu, dan menelusuri arti per kata secara interaktif.
				</p>
			</div>
			<div class="flex-shrink-0 self-center">
				<img 
					src="/logo.png" 
					alt="Portal Qur'an Maskot" 
					class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover shadow-gold border-2 border-quran-gold/50 bg-quran-dark/60 animate-float" 
				/>
			</div>
		</div>
	</div>

	<!-- Mode Switcher Bar (6 Modes) -->
	<div class="w-full min-w-0 overflow-hidden rounded-2xl bg-quran-surface p-1.5 sm:p-2 border border-quran-border/80 shadow-sm">
		<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full min-w-0 py-0.5 overscroll-x-contain touch-pan-x">
			{#each [
				{ id: 'terjemahan', label: 'Terjemahan', icon: BookOpen },
				{ id: 'mushaf', label: 'Mushaf', icon: BookOpen },
				{ id: 'tafsir', label: 'Tafsir Ringkas', icon: FileText },
				{ id: 'per-kata', label: 'Arti Per Kata', icon: Layers },
				{ id: 'audio', label: 'Audio Murattal', icon: Headphones },
				{ id: 'fokus', label: 'Fokus Membaca', icon: Eye }
			] as m}
				<button 
					on:click={() => readerStore.setMode(m.id as ReadingMode)}
					class="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer {$readerStore.mode === m.id ? 'bg-gradient-luxury text-quran-gold shadow-sm' : 'text-quran-chocolate hover:bg-quran-sand'}"
				>
					<svelte:component this={m.icon} class="w-3.5 h-3.5 flex-shrink-0" />
					<span>{m.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Controls & Filter Toolbar -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0 w-full">
		
		<!-- Search input -->
		<div class="relative flex-1 min-w-0 w-full sm:max-w-md">
			<Search class="w-4 h-4 text-quran-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
			<input 
				type="text" 
				placeholder="Cari surah (misal: Al-Kahf, Yasin)..."
				bind:value={searchQuery}
				class="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-2xl bg-quran-surface border border-quran-border text-xs sm:text-sm text-quran-dark placeholder:text-quran-warm/80 focus:border-quran-gold focus:outline-none focus:ring-2 focus:ring-quran-gold/20 shadow-sm font-medium"
			/>
		</div>

		<!-- Filter Tabs (Semua, Makkiyah, Madaniyah) & View Toggle -->
		<div class="w-full sm:w-auto flex items-center justify-between gap-2 min-w-0">
			
			<div class="grid grid-cols-3 sm:flex items-center bg-quran-surface p-1 rounded-2xl border border-quran-border shadow-sm w-full sm:w-auto min-w-0">
				<button 
					on:click={() => selectedFilter = 'all'}
					class="px-1.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition text-center truncate {selectedFilter === 'all' ? 'bg-quran-primary text-white font-bold' : 'text-quran-warm hover:text-quran-dark'}"
				>
					Semua (114)
				</button>
				<button 
					on:click={() => selectedFilter = 'makkiyah'}
					class="px-1.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition text-center truncate {selectedFilter === 'makkiyah' ? 'bg-quran-primary text-white font-bold' : 'text-quran-warm hover:text-quran-dark'}"
				>
					Makkiyah
				</button>
				<button 
					on:click={() => selectedFilter = 'madaniyah'}
					class="px-1.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition text-center truncate {selectedFilter === 'madaniyah' ? 'bg-quran-primary text-white font-bold' : 'text-quran-warm hover:text-quran-dark'}"
				>
					Madaniyah
				</button>
			</div>

			<!-- Grid / List Switcher -->
			<div class="hidden sm:flex items-center bg-quran-surface p-1 rounded-2xl border border-quran-border shadow-sm flex-shrink-0">
				<button 
					on:click={() => isGridView = true}
					class="p-1.5 rounded-xl transition {isGridView ? 'bg-quran-primary text-white' : 'text-quran-warm hover:text-quran-dark'}"
					title="Tampilan Grid Kartu"
				>
					<Grid class="w-4 h-4" />
				</button>
				<button 
					on:click={() => isGridView = false}
					class="p-1.5 rounded-xl transition {!isGridView ? 'bg-quran-primary text-white' : 'text-quran-warm hover:text-quran-dark'}"
					title="Tampilan Daftar Rapi"
				>
					<List class="w-4 h-4" />
				</button>
			</div>

		</div>

	</div>

	<!-- Surahs Listing Grid / List -->
	{#if filteredSurahs.length > 0}
		{#if isGridView}
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
				{#each filteredSurahs as surah}
					<a 
						href="/quran/{surah.number}"
						class="bg-quran-surface rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-quran-border/80 hover:border-quran-gold hover:shadow-luxury-hover transition-all duration-200 flex flex-col justify-between group relative overflow-hidden w-full min-w-0"
					>
						<!-- Card Top: Number, Latin Name, and Arabic Calligraphy -->
						<div class="flex items-center justify-between gap-2 min-w-0">
							<div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
								<div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-quran-sand border border-quran-border text-quran-dark font-extrabold text-xs sm:text-sm flex items-center justify-center group-hover:bg-gradient-luxury group-hover:text-quran-gold group-hover:border-quran-gold transition-colors flex-shrink-0">
									{surah.number}
								</div>
								<div class="min-w-0 flex-1">
									<h2 class="font-bold text-xs sm:text-base text-quran-dark group-hover:text-quran-primary transition leading-snug truncate">
										{surah.name_latin}
									</h2>
									<p class="text-[10px] sm:text-xs text-quran-warm font-medium truncate mt-0.5">{surah.name_id}</p>
								</div>
							</div>

							<!-- Arabic Name -->
							<div class="arabic-text text-xl sm:text-2xl md:text-3xl font-bold text-quran-dark group-hover:text-quran-chocolate transition flex-shrink-0 text-right leading-none max-w-[42%] truncate">
								{surah.name_arabic}
							</div>
						</div>

						<!-- Card Bottom: Meta info & Action shortcuts -->
						<div class="pt-2.5 mt-2.5 sm:pt-3.5 sm:mt-3.5 border-t border-quran-border/60 flex items-center justify-between text-xs text-quran-warm gap-2 min-w-0">
							<div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
								<span class="px-2 py-0.5 rounded-md sm:rounded-lg bg-quran-sand text-[10px] sm:text-xs font-semibold text-quran-chocolate border border-quran-border/60 flex-shrink-0">
									{surah.revelation_type}
								</span>
								<span class="text-[10px] sm:text-xs font-medium text-quran-warm flex-shrink-0">{surah.number_of_ayahs} Ayat</span>
							</div>

							<div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
								<button 
									on:click={(e) => playSurahAudio(surah, e)}
									class="p-1.5 sm:p-2 rounded-xl bg-quran-sand/70 text-quran-chocolate hover:bg-quran-primary hover:text-white transition cursor-pointer"
									title="Putar Murottal Surah Ini"
									aria-label="Putar Audio"
								>
									<Play class="w-3.5 h-3.5 fill-current" />
								</button>
								<button 
									on:click={(e) => openInfo(surah, e)}
									class="p-1.5 sm:p-2 rounded-xl bg-quran-sand/70 text-quran-chocolate hover:bg-quran-primary hover:text-white transition cursor-pointer"
									title="Info Lengkap Surah"
									aria-label="Info Surah"
								>
									<Info class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<!-- Table / Compact List View -->
			<div class="bg-quran-surface rounded-2xl sm:rounded-3xl border border-quran-border/80 shadow-luxury overflow-hidden w-full min-w-0">
				<div class="divide-y divide-quran-border/60">
					{#each filteredSurahs as surah}
						<a 
							href="/quran/{surah.number}"
							class="p-3 sm:p-4 hover:bg-quran-sand/50 transition flex items-center justify-between gap-2.5 group min-w-0"
						>
							<div class="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
								<div class="w-8 h-8 rounded-xl bg-quran-sand border border-quran-border text-xs font-bold text-quran-dark flex items-center justify-center flex-shrink-0">
									{surah.number}
								</div>
								<div class="min-w-0 flex-1">
									<h2 class="text-xs sm:text-base font-bold text-quran-dark group-hover:text-quran-primary transition truncate">
										{surah.name_latin}
									</h2>
									<p class="text-[11px] sm:text-xs text-quran-warm font-medium truncate mt-0.5">{surah.name_id} • {surah.number_of_ayahs} Ayat ({surah.revelation_type})</p>
								</div>
							</div>

							<div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
								<div class="arabic-text text-lg sm:text-2xl text-quran-dark font-bold text-right max-w-[35%] truncate">
									{surah.name_arabic}
								</div>
								<div class="flex items-center gap-1 flex-shrink-0">
									<button 
										on:click={(e) => playSurahAudio(surah, e)}
										class="p-1.5 sm:p-2 rounded-xl text-quran-warm hover:bg-quran-beige/50 transition cursor-pointer"
										title="Putar Audio"
										aria-label="Putar Audio"
									>
										<Play class="w-3.5 h-3.5 fill-current" />
									</button>
									<button 
										on:click={(e) => openInfo(surah, e)}
										class="p-1.5 sm:p-2 rounded-xl text-quran-warm hover:bg-quran-beige/50 transition cursor-pointer"
										title="Info Surah"
										aria-label="Info Surah"
									>
										<Info class="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="text-center py-16 bg-quran-surface rounded-3xl border border-quran-border">
			<BookOpen class="w-10 h-10 text-quran-gold mx-auto mb-2" />
			<h3 class="text-sm font-bold text-quran-dark">Tidak ada surah yang cocok</h3>
			<p class="text-xs text-quran-warm mt-1">Coba kata kunci pencarian lain atau pilih filter "Semua".</p>
		</div>
	{/if}

	<!-- Surah Info Modal -->
	<SurahInfoModal 
		surah={selectedSurahForInfo} 
		isOpen={isInfoModalOpen} 
		onClose={() => isInfoModalOpen = false} 
		onStartReading={(num) => window.location.href = `/quran/${num}`}
	/>

</div>
