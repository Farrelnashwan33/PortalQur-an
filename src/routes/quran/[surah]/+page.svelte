<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { audioStore } from '$lib/stores/audio';
	import { qariStore } from '$lib/stores/qaris';
	import { QARI_LIST } from '$lib/data/surahList';
	import { readerStore } from '$lib/stores/reader';
	import { progressStore } from '$lib/stores/progress';
	import type { AyahDetail } from '$lib/types/quran';
	import SurahInfoModal from '$lib/components/SurahInfoModal.svelte';
	import AyahTafsirModal from '$lib/components/AyahTafsirModal.svelte';
	import AyahWordByWordModal from '$lib/components/AyahWordByWordModal.svelte';
	import AddToCollectionModal from '$lib/components/AddToCollectionModal.svelte';
	import { 
		Play, 
		Pause, 
		Bookmark, 
		BookmarkCheck, 
		FolderPlus, 
		Copy, 
		Share2, 
		Info, 
		BookOpen, 
		Layers, 
		FileText, 
		ArrowLeft, 
		ArrowRight, 
		Check, 
		Volume2,
		Headphones,
		SlidersHorizontal,
		UserCheck,
		ChevronDown
	} from 'lucide-svelte';

	export let data: PageData;
	$: surah = data.surah;
	$: prevSurah = data.prevSurah;
	$: nextSurah = data.nextSurah;

	const bookmarks = progressStore.bookmarks;
	const progress = progressStore.progress;

	// Modals state
	let isInfoModalOpen = false;
	let isTafsirModalOpen = false;
	let isWordModalOpen = false;
	let isCollectionModalOpen = false;
	let qariHeaderDropdownOpen = false;
	let activeAyahForModal: AyahDetail | null = null;
	let copiedAyahNumber: number | null = null;

	$: availableQaris = ($qariStore && $qariStore.length > 0 ? $qariStore : QARI_LIST).filter(q => q.is_active !== false);

	// Auto scroll interval for manual auto-scroll feature
	let autoScrollInterval: any = null;

	// Track last scrolled ayah during audio playback to prevent scroll thrashing
	let lastScrolledAyah: number | null = null;

	// Progressive rendering for instantaneous transition on large surahs (e.g. 286 ayahs in Al-Baqarah)
	let renderLimit = 35;
	let renderTimer: any = null;

	$: if (surah) {
		renderLimit = Math.min(35, surah.ayahs.length);
		if (typeof window !== 'undefined') {
			if (renderTimer) cancelAnimationFrame(renderTimer);
			
			const renderNextBatch = () => {
				if (renderLimit < surah.ayahs.length) {
					renderLimit = Math.min(renderLimit + 35, surah.ayahs.length);
					if (renderLimit < surah.ayahs.length) {
						renderTimer = requestAnimationFrame(renderNextBatch);
					}
				}
			};
			
			if (surah.ayahs.length > 35) {
				renderTimer = requestAnimationFrame(renderNextBatch);
			}
		}
	}

	function scrollToAyah(ayahNumber: number) {
		if (typeof window === 'undefined') return;
		if (ayahNumber > renderLimit) {
			renderLimit = Math.max(renderLimit, ayahNumber + 10);
		}
		tick().then(() => {
			const el = document.getElementById(`ayah-${ayahNumber}`);
			if (el) {
				el.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
		});
	}

	onMount(() => {
		// Record initial progress when opened
		progressStore.progress.setLastRead(surah.number, surah.name_latin, 1, surah.ayahs[0]?.juz_number || 1);

		// Handle hash scroll (e.g. #ayah-10)
		if (typeof window !== 'undefined' && window.location.hash) {
			const id = window.location.hash.replace('#', '');
			const ayahNumMatch = id.match(/ayah-(\d+)/);
			if (ayahNumMatch) {
				const num = parseInt(ayahNumMatch[1], 10);
				if (num > renderLimit) {
					renderLimit = Math.max(renderLimit, num + 10);
				}
			}
			setTimeout(() => {
				const el = document.getElementById(id);
				if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 300);
		}

		return () => {
			if (renderTimer && typeof window !== 'undefined') {
				cancelAnimationFrame(renderTimer);
			}
		};
	});

	// 1. AUTO SCROLL TO ACTIVE AYAH WHEN AUDIO PLAYS OR ADVANCES
	$: if ($audioStore.surahNumber === surah.number && $audioStore.ayahNumber) {
		const currentAyahNum = $audioStore.ayahNumber;
		if (currentAyahNum > renderLimit) {
			renderLimit = Math.max(renderLimit, currentAyahNum + 10);
		}
		if (currentAyahNum !== lastScrolledAyah) {
			lastScrolledAyah = currentAyahNum;
			scrollToAyah(currentAyahNum);
		}
	}

	// 2. AUTO NEXT SURAH ROUTE TRANSITION (WHEN ADVANCING FROM SURAH 1 -> 2, ETC.)
	$: if ($audioStore.isPlaying && $audioStore.surahNumber && $audioStore.surahNumber !== surah.number) {
		lastScrolledAyah = null;
		goto(`/quran/${$audioStore.surahNumber}`, { noScroll: true });
	}

	// Handle Manual Auto-Scroll feature
	$: if ($readerStore.autoScroll) {
		if (!autoScrollInterval && typeof window !== 'undefined') {
			autoScrollInterval = setInterval(() => {
				window.scrollBy({ top: 1, behavior: 'smooth' });
			}, 50 / $readerStore.autoScrollSpeed);
		}
	} else {
		if (autoScrollInterval) {
			clearInterval(autoScrollInterval);
			autoScrollInterval = null;
		}
	}

	// Dynamic Theme Styles
	$: themeClasses = {
		cream: 'bg-[#F8F3EC] text-[#3E2723]',
		sand: 'bg-[#FAF6F0] text-[#3E2723]',
		sepia: 'bg-[#EFE4D5] text-[#3E2723]',
		dark: 'bg-[#3E2723] text-[#F8F3EC]'
	}[$readerStore.theme];

	$: cardThemeClasses = {
		cream: 'bg-white border-[#E3D3C4]/70 shadow-sm',
		sand: 'bg-white border-[#E8D5B5]/70 shadow-sm',
		sepia: 'bg-[#F8F3EC] border-[#C9A66B]/50 shadow-sm',
		dark: 'bg-[#5D4037]/50 border-[#6F4E37] text-white shadow-md'
	}[$readerStore.theme];

	function handleCopy(ayah: AyahDetail) {
		const text = `QS. ${surah.name_latin} [${surah.number}:${ayah.ayah_number}]\n\n${ayah.text_arabic}\n\nArtinya: "${ayah.text_id}"\n\n(Portal Qur'an v3.3)`;
		navigator.clipboard.writeText(text);
		copiedAyahNumber = ayah.ayah_number;
		setTimeout(() => (copiedAyahNumber = null), 2000);
	}

	function handleShare(ayah: AyahDetail) {
		const shareData = {
			title: `Portal Qur'an - Surah ${surah.name_latin} Ayat ${ayah.ayah_number}`,
			text: `${ayah.text_arabic}\n\n"${ayah.text_id}"\n(QS. ${surah.name_latin}:${ayah.ayah_number})`,
			url: window.location.href
		};
		if (navigator.share) {
			navigator.share(shareData).catch(() => {});
		} else {
			handleCopy(ayah);
		}
	}

	function openTafsir(ayah: AyahDetail) {
		activeAyahForModal = ayah;
		isTafsirModalOpen = true;
	}

	function openWordByWord(ayah: AyahDetail) {
		activeAyahForModal = ayah;
		isWordModalOpen = true;
	}

	function openAddToCollection(ayah: AyahDetail) {
		activeAyahForModal = ayah;
		isCollectionModalOpen = true;
	}

	function playAyah(ayahNumber: number) {
		audioStore.playAyah(surah.number, surah.name_latin, ayahNumber, surah.number_of_ayahs);
		progressStore.progress.setLastRead(surah.number, surah.name_latin, ayahNumber, surah.ayahs[ayahNumber - 1]?.juz_number || 1);
		scrollToAyah(ayahNumber);
	}
</script>

<svelte:head>
	<title>Surah {surah.name_latin} ({surah.name_arabic}) - Portal Qur'an v3.3</title>
</svelte:head>

<div class="min-h-screen {themeClasses} pb-32 transition-colors duration-200">
	
	<!-- Surah Header Banner -->
	<div class="bg-gradient-luxury text-quran-cream border-b border-quran-gold/40 relative overflow-hidden">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-quran-gold/15 blur-3xl pointer-events-none"></div>
		
		<div class="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8 relative z-10 space-y-4 sm:space-y-6">
			
			<!-- Top Navigation bar in header -->
			<div class="flex items-center justify-between gap-2 min-w-0">
				<a 
					href="/quran" 
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-quran-gold transition flex-shrink-0"
				>
					<ArrowLeft class="w-3.5 h-3.5" />
					<span class="text-xs">Daftar Surah</span>
				</a>

				<div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
					<!-- Pilihan Qari / Audio Murattal -->
					<div class="relative">
						<button 
							on:click={() => qariHeaderDropdownOpen = !qariHeaderDropdownOpen}
							class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-quran-gold border border-quran-gold/30 transition shadow-sm"
							title="Pilih Syeikh / Audio Qari"
							aria-label="Pilih Syeikh / Audio Qari"
						>
							<UserCheck class="w-3.5 h-3.5 text-quran-gold" />
							<span class="max-w-[75px] sm:max-w-[140px] truncate">{$audioStore.currentQari.name.split(' ')[0]}</span>
							<ChevronDown class="w-3 h-3 text-quran-goldLight" />
						</button>

						{#if qariHeaderDropdownOpen}
							<div 
								class="fixed inset-0 z-40" 
								on:click={() => qariHeaderDropdownOpen = false}
								on:keydown={(e) => e.key === 'Escape' && (qariHeaderDropdownOpen = false)}
								role="button"
								tabindex="0"
								aria-label="Tutup Qari Menu"
							></div>
							<div class="absolute right-0 mt-2 w-64 max-h-64 overflow-y-auto bg-quran-dark text-quran-cream rounded-2xl border border-quran-gold/40 shadow-luxury-hover p-1.5 z-50 animate-in fade-in zoom-in-95 text-left">
								<div class="px-2.5 py-1.5 text-[10px] font-bold text-quran-gold uppercase border-b border-quran-chocolate tracking-wider">
									Pilihan Syeikh / Audio Qari
								</div>
								{#each availableQaris as qari}
									<button 
										on:click={() => {
											audioStore.setQari(qari);
											qariHeaderDropdownOpen = false;
										}}
										class="w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between {$audioStore.currentQari.id === qari.id ? 'bg-quran-primary text-quran-gold font-bold' : 'text-quran-cream hover:bg-quran-chocolate/60'}"
									>
										<div class="truncate mr-2">
											<div class="font-medium text-white truncate">{qari.name}</div>
											<div class="arabic-text text-[10px] text-quran-goldLight">{qari.arabic_name}</div>
										</div>
										{#if $audioStore.currentQari.id === qari.id}
											<span class="text-[10px] text-quran-gold font-bold px-1.5 py-0.5 rounded bg-quran-gold/20 border border-quran-gold/40">Aktif</span>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Info Surah Button -->
					<button 
						on:click={() => isInfoModalOpen = true}
						class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
						title="Info Surah"
					>
						<Info class="w-3.5 h-3.5 text-quran-gold" />
						<span class="hidden xs:inline">Info</span>
					</button>

					<!-- Full Surah Audio Button -->
					<button 
						on:click={() => audioStore.playSurahFull(surah.number, surah.name_latin, surah.number_of_ayahs)}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-gold text-quran-dark text-xs font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex-shrink-0"
						title="Putar Murottal Full Surah"
					>
						<Play class="w-3.5 h-3.5 fill-current" />
						<span class="hidden xs:inline">Putar Full</span>
					</button>
				</div>
			</div>

			<!-- Surah Title & Arabic Calligraphy -->
			<div class="text-center space-y-1.5 sm:space-y-2">
				<span class="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-quran-gold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 border border-quran-gold/30">
					Surah ke-{surah.number} • {surah.revelation_type} • {surah.number_of_ayahs} Ayat
				</span>

				<h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
					{surah.name_latin}
				</h1>
				<p class="text-[11px] sm:text-xs text-quran-goldLight">Arti: "{surah.name_id}"</p>

				<div class="pt-1 sm:pt-2">
					<div class="arabic-text text-3xl sm:text-5xl text-quran-gold text-shadow-gold leading-normal">
						{surah.name_arabic}
					</div>
				</div>
			</div>

			<!-- Bismillah Card (Shown for all except Surah 9 At-Taubah and Surah 1 Al-Fatihah where ayah 1 is bismillah) -->
			{#if surah.number !== 9 && surah.number !== 1}
				<div class="mt-4 sm:mt-8 max-w-md mx-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-quran-gold/40 text-center shadow-gold">
					<p class="arabic-text text-xl sm:text-2xl text-quran-gold font-bold leading-normal">
						بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
					</p>
					<p class="text-[10px] sm:text-[11px] text-quran-cream/80 mt-1">
						Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
					</p>
				</div>
			{/if}

		</div>
	</div>

	<!-- Ayahs Reader Stream Container -->
	<div class="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 min-w-0">
		
		{#each surah.ayahs.slice(0, renderLimit) as ayah (ayah.ayah_number)}
			{@const isCurrentAyah = $audioStore.surahNumber === surah.number && $audioStore.ayahNumber === ayah.ayah_number}
			{@const isPlayingThisAyah = isCurrentAyah && $audioStore.isPlaying}
			{@const isBookmarked = $bookmarks.some(b => b.surah_number === surah.number && b.ayah_number === ayah.ayah_number)}

			<!-- Ayah Card with Distinctive Luxury Active Highlight & Proper Scroll Margin -->
			<article 
				id="ayah-{ayah.ayah_number}" 
				class="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 transition-all duration-300 border relative scroll-mt-24 sm:scroll-mt-36 min-w-0 w-full {cardThemeClasses} {
					isCurrentAyah 
						? 'ring-2 ring-quran-gold shadow-gold-lg bg-amber-50/40 border-quran-gold' 
						: 'hover:border-quran-gold/50'
				}"
			>
				<!-- Ayah Top Bar: Number Tag & Action Buttons -->
				<div class="flex items-center justify-between gap-2 pb-3 mb-3 sm:pb-4 sm:mb-4 border-b border-quran-border/60 min-w-0">
					
					<!-- Left: Ayah Number Tag with Highlight -->
					<div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
						<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs flex items-center justify-center transition-all {
							isCurrentAyah 
								? 'bg-gradient-gold text-quran-dark font-extrabold border-quran-gold shadow-gold' 
								: 'bg-quran-sand border-quran-border text-quran-dark font-extrabold'
						}">
							{surah.number}:{ayah.ayah_number}
						</div>
						<span class="text-[10px] sm:text-[11px] font-semibold text-quran-warm hidden xs:inline">
							Juz {ayah.juz_number}
						</span>
						{#if isCurrentAyah}
							<span class="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase {isPlayingThisAyah ? 'bg-emerald-100 text-emerald-800' : 'bg-quran-gold/20 text-quran-chocolate border border-quran-gold/40'}">
								{isPlayingThisAyah ? 'Diputar' : 'Aktif'}
							</span>
						{/if}
					</div>

					<!-- Right: Interactive Action Buttons Toolbar -->
					<div class="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
						
						<!-- Play this Ayah Audio -->
						<button 
							on:click={() => playAyah(ayah.ayah_number)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition {isCurrentAyah ? 'bg-quran-gold text-quran-dark font-bold shadow-sm' : 'text-quran-warm hover:text-quran-dark hover:bg-quran-sand'}"
							title={isPlayingThisAyah ? 'Jeda Audio' : 'Putar Ayat Ini'}
						>
							{#if isPlayingThisAyah}
								<Volume2 class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-quran-dark animate-pulse" />
							{:else}
								<Play class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							{/if}
						</button>

						<!-- Tafsir Modal Trigger -->
						<button 
							on:click={() => openTafsir(ayah)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
							title="Buka Tafsir Ringkas Kemenag"
						>
							<FileText class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</button>

						<!-- Word-by-Word Modal Trigger -->
						<button 
							on:click={() => openWordByWord(ayah)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
							title="Arti Per Kata (Mufradat)"
						>
							<Layers class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</button>

						<!-- Add to Collection -->
						<button 
							on:click={() => openAddToCollection(ayah)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
							title="Simpan ke Folder Koleksi"
						>
							<FolderPlus class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</button>

						<!-- Bookmark Toggle -->
						<button 
							on:click={() => progressStore.bookmarks.toggleBookmark(surah.number, surah.name_latin, ayah.ayah_number, ayah.text_arabic, ayah.text_id)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition {isBookmarked ? 'text-quran-gold bg-quran-sand' : 'text-quran-warm hover:text-quran-dark hover:bg-quran-sand'}"
							title={isBookmarked ? 'Hapus Bookmark' : 'Bookmark Ayat'}
						>
							{#if isBookmarked}
								<BookmarkCheck class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-quran-gold" />
							{:else}
								<Bookmark class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							{/if}
						</button>

						<!-- Copy Ayah -->
						<button 
							on:click={() => handleCopy(ayah)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
							title="Salin Ayat & Terjemahan"
						>
							{#if copiedAyahNumber === ayah.ayah_number}
								<Check class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
							{:else}
								<Copy class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							{/if}
						</button>

						<!-- Share Ayah -->
						<button 
							on:click={() => handleShare(ayah)}
							class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
							title="Bagikan Ayat"
						>
							<Share2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</button>

					</div>
				</div>

				<!-- ================= MODE 1: MUSHAF MODE (Pure Arabic Text Focus) ================= -->
				{#if $readerStore.mode === 'mushaf'}
					<div class="text-right py-3">
						<p 
							class="arabic-text leading-loose" 
							style="font-size: {$readerStore.arabicFontSize}px; font-family: '{$readerStore.arabicFontFamily}', serif;"
						>
							{ayah.text_arabic}
							<span class="inline-block text-quran-gold text-lg mx-1 font-bold font-serif">
								﴿{ayah.ayah_number}﴾
							</span>
						</p>
					</div>

				<!-- ================= MODE 4: PER KATA / WORD-BY-WORD INLINE ================= -->
				{:else if $readerStore.mode === 'per-kata'}
					<div class="space-y-4">
						<div class="flex flex-wrap flex-row-reverse gap-3 items-stretch justify-start py-2">
							{#if ayah.words && ayah.words.length > 0}
								{#each ayah.words as word}
									<div class="p-2.5 rounded-xl bg-quran-sand/50 border border-quran-border text-center min-w-[90px] flex flex-col justify-between">
										<span 
											class="arabic-text font-bold block"
											style="font-size: {Math.max(22, $readerStore.arabicFontSize - 4)}px; font-family: '{$readerStore.arabicFontFamily}', serif;"
										>
											{word.arabic}
										</span>
										<span class="text-[11px] font-medium text-quran-chocolate border-t border-quran-border/60 pt-1 mt-1 block">
											{word.translation}
										</span>
									</div>
								{/each}
							{:else}
								<p class="arabic-text text-right w-full" style="font-size: {$readerStore.arabicFontSize}px">
									{ayah.text_arabic}
								</p>
							{/if}
						</div>

						<div class="text-xs text-quran-warm border-t border-quran-border/50 pt-2 leading-relaxed" style="font-size: {$readerStore.translationFontSize}px">
							<span class="font-bold text-quran-chocolate">Terjemahan Lengkap:</span> {ayah.text_id}
						</div>
					</div>

				<!-- ================= MODE 3: TAFSIR INLINE ================= -->
				{:else if $readerStore.mode === 'tafsir'}
					<div class="space-y-4">
						<!-- Arabic -->
						<div class="text-right py-2">
							<p 
								class="arabic-text leading-loose" 
								style="font-size: {$readerStore.arabicFontSize}px; font-family: '{$readerStore.arabicFontFamily}', serif;"
							>
								{ayah.text_arabic}
							</p>
						</div>

						<!-- Translation -->
						<p class="text-xs sm:text-sm leading-relaxed" style="font-size: {$readerStore.translationFontSize}px">
							<span class="font-bold text-quran-chocolate">Artinya:</span> "{ayah.text_id}"
						</p>

						<!-- Inline Tafsir Box -->
						<div class="p-4 rounded-2xl bg-quran-sand/40 border border-quran-border/60 text-xs text-quran-dark space-y-1.5">
							<div class="flex items-center gap-1.5 font-bold text-quran-chocolate">
								<FileText class="w-3.5 h-3.5 text-quran-gold" />
								<span>Tafsir Ringkas Kemenag RI</span>
							</div>
							<p class="text-quran-warm leading-relaxed">
								{ayah.tafsir_ringkas || 'Memuat uraian makna dan hikmah ayat suci Al-Qur\'an untuk tadabbur mendalam.'}
							</p>
						</div>
					</div>

				<!-- ================= MODE 5: AUDIO KARAOKE HIGHLIGHT ================= -->
				{:else if $readerStore.mode === 'audio'}
					<div class="space-y-3 sm:space-y-4">
						<div class="text-right py-1 sm:py-2">
							<p 
								class="arabic-text leading-loose transition-colors duration-200 {isCurrentAyah ? 'text-quran-chocolate font-bold' : ''}" 
								style="font-size: {$readerStore.arabicFontSize}px; font-family: '{$readerStore.arabicFontFamily}', serif;"
							>
								{ayah.text_arabic}
							</p>
						</div>

						<p class="text-xs sm:text-sm leading-relaxed transition-colors duration-200 {isCurrentAyah ? 'text-quran-dark font-medium' : 'text-quran-dark'}" style="font-size: {$readerStore.translationFontSize}px">
							{ayah.text_id}
						</p>
					</div>

				<!-- ================= MODE 6: FOCUS MODE (Clean Typography) ================= -->
				{:else if $readerStore.mode === 'fokus'}
					<div class="text-right py-4">
						<p 
							class="arabic-text leading-loose" 
							style="font-size: {$readerStore.arabicFontSize + 2}px; font-family: '{$readerStore.arabicFontFamily}', serif;"
						>
							{ayah.text_arabic}
						</p>
					</div>

				<!-- ================= MODE 2: DEFAULT TERJEMAHAN (Classic Translation View) ================= -->
				{:else}
					<div class="space-y-4">
						<!-- Arabic -->
						<div class="text-right py-2">
							<p 
								class="arabic-text leading-loose" 
								style="font-size: {$readerStore.arabicFontSize}px; font-family: '{$readerStore.arabicFontFamily}', serif;"
							>
								{ayah.text_arabic}
							</p>
						</div>

						<!-- Translation -->
						<p class="text-xs sm:text-sm text-quran-dark leading-relaxed" style="font-size: {$readerStore.translationFontSize}px">
							{ayah.text_id}
						</p>
					</div>
				{/if}

			</article>
		{/each}

		<!-- Surah Navigation Footer Pagination (Prev / Next Surah) -->
		<div class="pt-6 sm:pt-8 border-t border-quran-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
			{#if prevSurah}
				<a 
					href="/quran/{prevSurah.number}"
					class="flex items-center gap-2.5 p-3 sm:p-4 rounded-2xl bg-quran-surface border border-quran-border hover:border-quran-gold text-xs font-bold text-quran-dark shadow-sm hover:shadow-gold transition group min-w-0"
				>
					<ArrowLeft class="w-4 h-4 text-quran-gold group-hover:-translate-x-1 transition-transform flex-shrink-0" />
					<div class="min-w-0 flex-1">
						<span class="text-[10px] text-quran-warm font-normal block">Surah Sebelumnya</span>
						<span class="text-xs sm:text-sm font-bold truncate block text-quran-dark">{prevSurah.name_latin} ({prevSurah.name_arabic})</span>
					</div>
				</a>
			{:else}
				<div class="hidden sm:block"></div>
			{/if}

			{#if nextSurah}
				<a 
					href="/quran/{nextSurah.number}"
					class="flex items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-quran-surface border border-quran-border hover:border-quran-gold text-xs font-bold text-quran-dark shadow-sm hover:shadow-gold transition group min-w-0"
				>
					<div class="text-left sm:text-right min-w-0 flex-1">
						<span class="text-[10px] text-quran-warm font-normal block">Surah Berikutnya</span>
						<span class="text-xs sm:text-sm font-bold truncate block text-quran-dark">{nextSurah.name_latin} ({nextSurah.name_arabic})</span>
					</div>
					<ArrowRight class="w-4 h-4 text-quran-gold group-hover:translate-x-1 transition-transform flex-shrink-0" />
				</a>
			{/if}
		</div>

	</div>

	<!-- Modals -->
	<SurahInfoModal 
		surah={surah} 
		isOpen={isInfoModalOpen} 
		onClose={() => isInfoModalOpen = false} 
	/>

	<AyahTafsirModal 
		ayah={activeAyahForModal} 
		surahName={surah.name_latin} 
		isOpen={isTafsirModalOpen} 
		onClose={() => isTafsirModalOpen = false} 
	/>

	<AyahWordByWordModal 
		ayah={activeAyahForModal} 
		surahName={surah.name_latin} 
		isOpen={isWordModalOpen} 
		onClose={() => isWordModalOpen = false} 
	/>

	<AddToCollectionModal 
		ayah={activeAyahForModal} 
		surahName={surah.name_latin} 
		isOpen={isCollectionModalOpen} 
		onClose={() => isCollectionModalOpen = false} 
	/>

</div>
