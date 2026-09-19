<script lang="ts">
	import { topicStore } from '$lib/stores/topics';
	import { audioStore } from '$lib/stores/audio';
	import { progressStore } from '$lib/stores/progress';
	import type { AyahDetail } from '$lib/types/quran';
	import AddToCollectionModal from '$lib/components/AddToCollectionModal.svelte';
	import { 
		Compass, 
		Play, 
		Bookmark, 
		BookmarkCheck, 
		FolderPlus, 
		Copy, 
		Check, 
		ArrowRight, 
		Sparkles 
	} from 'lucide-svelte';

	let activeSlug = '';
	$: if (!activeSlug && $topicStore.length > 0) {
		activeSlug = $topicStore[0].slug;
	} else if (activeSlug && !$topicStore.some(t => t.slug === activeSlug) && $topicStore.length > 0) {
		activeSlug = $topicStore[0].slug;
	}
	const bookmarks = progressStore.bookmarks;

	let isColModalOpen = false;
	let activeAyahForCol: any = null;
	let copiedKey: string | null = null;

	function handleCopy(surahName: string, surahNumber: number, ayahNumber: number, arabic: string, translation: string) {
		const text = `Topik Quran - QS. ${surahName} [${surahNumber}:${ayahNumber}]\n\n${arabic}\n\nArtinya: "${translation}"\n\n(Portal Qur'an v3.3)`;
		navigator.clipboard.writeText(text);
		copiedKey = `${surahNumber}:${ayahNumber}`;
		setTimeout(() => (copiedKey = null), 2000);
	}

	function openCollection(item: any) {
		activeAyahForCol = {
			surah_number: item.surah_number,
			ayah_number: item.ayah_number,
			text_arabic: item.text_arabic,
			text_id: item.text_id
		};
		isColModalOpen = true;
	}
</script>

<svelte:head>
	<title>Topik Tematik Al-Qur'an - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
	
	<!-- Header Banner -->
	<div class="relative overflow-hidden rounded-3xl bg-gradient-luxury text-quran-cream p-6 sm:p-8 shadow-luxury border border-quran-gold/40">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="relative z-10 max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-xs font-semibold text-quran-gold mb-2">
				<Compass class="w-3.5 h-3.5" />
				<span>Kompilasi Ayat Tematik</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Topik Tematik Al-Qur'an
			</h1>
			<p class="text-xs sm:text-sm text-quran-goldLight mt-1.5 leading-relaxed">
				Temukan bimbingan dan inspirasi wahyu Ilahi berdasarkan 11 tema pokok kehidupan manusia sehari-hari.
			</p>
		</div>
	</div>

	<!-- 11 Topic Quick Filter Pills -->
	<div class="flex items-center gap-2 overflow-x-auto pb-2">
		{#each $topicStore as topic}
			<button 
				on:click={() => activeSlug = topic.slug}
				class="px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 {activeSlug === topic.slug ? 'bg-gradient-luxury text-quran-gold shadow-gold' : 'bg-quran-surface text-quran-dark border border-quran-border hover:bg-quran-sand'}"
			>
				<span>{topic.category}</span>
				<span class="text-[10px] px-1.5 py-0.2 rounded-full {activeSlug === topic.slug ? 'bg-quran-gold/20 text-quran-gold' : 'bg-quran-sand text-quran-warm'}">
					{topic.ayahs.length}
				</span>
			</button>
		{/each}
	</div>

	<!-- Display Active Topic Content -->
	{#each $topicStore.filter(t => t.slug === activeSlug) as topic (topic.slug)}
		<div class="space-y-6 animate-in fade-in duration-200">
			
			<!-- Topic Overview Card -->
			<div class="p-6 rounded-3xl bg-quran-surface border border-quran-gold/40 shadow-luxury">
				<div class="flex items-start gap-4">
					<div class="w-12 h-12 rounded-2xl bg-gradient-luxury text-quran-gold flex items-center justify-center flex-shrink-0 shadow-gold">
						<Sparkles class="w-6 h-6" />
					</div>
					<div>
						<span class="text-xs font-bold uppercase tracking-wider text-quran-gold">Kategori: {topic.category}</span>
						<h2 class="text-xl font-bold text-quran-dark mt-0.5">{topic.title}</h2>
						<p class="text-xs sm:text-sm text-quran-warm mt-1.5 leading-relaxed">{topic.description}</p>
					</div>
				</div>
			</div>

			<!-- Ayah Cards List for this Topic -->
			<div class="space-y-4">
				{#each topic.ayahs as ayah}
					{@const isBookmarked = $bookmarks.some(b => b.surah_number === ayah.surah_number && b.ayah_number === ayah.ayah_number)}

					<div class="bg-quran-surface rounded-3xl p-6 border border-quran-border/80 shadow-luxury space-y-4 hover:border-quran-gold/60 transition">
						
						<!-- Top Ayah Reference -->
						<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
							<a 
								href="/quran/{ayah.surah_number}#ayah-{ayah.ayah_number}" 
								class="flex items-center gap-2 group"
							>
								<div class="w-7 h-7 rounded-xl bg-quran-sand text-quran-dark font-extrabold text-xs flex items-center justify-center group-hover:bg-quran-primary group-hover:text-white transition">
									{ayah.surah_number}:{ayah.ayah_number}
								</div>
								<span class="text-xs font-bold text-quran-dark group-hover:text-quran-primary transition">
									Surah {ayah.surah_name} : Ayat {ayah.ayah_number}
								</span>
								<ArrowRight class="w-3.5 h-3.5 text-quran-gold group-hover:translate-x-0.5 transition-transform" />
							</a>

							<!-- Audio & Actions -->
							<div class="flex items-center gap-1.5">
								<button 
									on:click={() => audioStore.playAyah(ayah.surah_number, ayah.surah_name, ayah.ayah_number)}
									class="p-2 rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
									title="Dengarkan Murottal"
								>
									<Play class="w-4 h-4 text-quran-gold" />
								</button>
								<button 
									on:click={() => progressStore.bookmarks.toggleBookmark(ayah.surah_number, ayah.surah_name, ayah.ayah_number, ayah.text_arabic, ayah.text_id)}
									class="p-2 rounded-xl transition {isBookmarked ? 'text-quran-gold bg-quran-sand' : 'text-quran-warm hover:text-quran-dark hover:bg-quran-sand'}"
									title="Bookmark Ayat"
								>
									{#if isBookmarked}
										<BookmarkCheck class="w-4 h-4 text-quran-gold" />
									{:else}
										<Bookmark class="w-4 h-4" />
									{/if}
								</button>
								<button 
									on:click={() => openCollection(ayah)}
									class="p-2 rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
									title="Simpan ke Koleksi"
								>
									<FolderPlus class="w-4 h-4" />
								</button>
								<button 
									on:click={() => handleCopy(ayah.surah_name, ayah.surah_number, ayah.ayah_number, ayah.text_arabic, ayah.text_id)}
									class="p-2 rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
									title="Salin Ayat"
								>
									{#if copiedKey === `${ayah.surah_number}:${ayah.ayah_number}`}
										<Check class="w-4 h-4 text-green-600" />
									{:else}
										<Copy class="w-4 h-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Arabic Scripture -->
						<div class="p-5 rounded-2xl bg-quran-sand/50 border border-quran-border/60 text-right">
							<p class="arabic-text text-2xl sm:text-3xl text-quran-dark leading-loose">
								{ayah.text_arabic}
							</p>
						</div>

						<!-- Indonesian Translation -->
						<p class="text-xs sm:text-sm text-quran-dark leading-relaxed">
							"{ayah.text_id}"
						</p>

						<!-- Contextual Explanation (Tadabbur) -->
						<div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-quran-dark leading-relaxed">
							<span class="font-bold text-quran-chocolate block mb-1 uppercase tracking-wider text-[10px]">Pelajaran & Hikmah Tematik:</span>
							{ayah.explanation}
						</div>

					</div>
				{/each}
			</div>

		</div>
	{/each}

	<!-- Add to collection modal -->
	<AddToCollectionModal 
		ayah={activeAyahForCol} 
		surahName="Topik Quran" 
		isOpen={isColModalOpen} 
		onClose={() => isColModalOpen = false} 
	/>

</div>
