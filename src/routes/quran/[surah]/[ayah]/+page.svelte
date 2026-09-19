<script lang="ts">
	import type { PageData } from './$types';
	import { audioStore } from '$lib/stores/audio';
	import { progressStore } from '$lib/stores/progress';
	import AyahTafsirModal from '$lib/components/AyahTafsirModal.svelte';
	import AyahWordByWordModal from '$lib/components/AyahWordByWordModal.svelte';
	import AddToCollectionModal from '$lib/components/AddToCollectionModal.svelte';
	import { 
		ArrowLeft, 
		Play, 
		Bookmark, 
		BookmarkCheck, 
		FileText, 
		Layers, 
		FolderPlus, 
		Copy, 
		Check, 
		Share2 
	} from 'lucide-svelte';

	export let data: PageData;
	$: surah = data.surah;
	$: ayah = data.ayah;

	const bookmarks = progressStore.bookmarks;
	let isTafsirOpen = false;
	let isWordOpen = false;
	let isColOpen = false;
	let copied = false;

	function handleCopy() {
		const text = `QS. ${surah.name_latin} [${surah.number}:${ayah.ayah_number}]\n\n${ayah.text_arabic}\n\nArtinya: "${ayah.text_id}"\n\n(Portal Qur'an v3.3)`;
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Surah {surah.name_latin} : {ayah.ayah_number} - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
	
	<!-- Top Bar Navigation Back -->
	<div class="flex items-center justify-between">
		<a 
			href="/quran/{surah.number}#ayah-{ayah.ayah_number}" 
			class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-quran-surface border border-quran-border text-xs font-bold text-quran-dark hover:bg-quran-sand transition shadow-sm"
		>
			<ArrowLeft class="w-4 h-4 text-quran-gold" />
			<span>Kembali ke Surah {surah.name_latin}</span>
		</a>

		<span class="text-xs font-bold px-3 py-1 rounded-full bg-quran-sand text-quran-dark border border-quran-border">
			Juz {ayah.juz_number}
		</span>
	</div>

	<!-- Ayah Hero Card -->
	<div class="bg-quran-surface rounded-3xl p-6 sm:p-8 border border-quran-border shadow-luxury space-y-6">
		<div class="flex items-center justify-between border-b border-quran-border/60 pb-4">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-gradient-luxury text-quran-gold font-extrabold text-sm flex items-center justify-center shadow-gold">
					{surah.number}:{ayah.ayah_number}
				</div>
				<div>
					<h1 class="text-base font-extrabold text-quran-dark">Surah {surah.name_latin}</h1>
					<p class="text-xs text-quran-warm">{surah.name_id} • Ayat ke-{ayah.ayah_number}</p>
				</div>
			</div>

			<button 
				on:click={() => audioStore.playAyah(surah.number, surah.name_latin, ayah.ayah_number, surah.number_of_ayahs)}
				class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-gold text-quran-dark font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all"
			>
				<Play class="w-4 h-4 fill-current" />
				<span>Putar Audio</span>
			</button>
		</div>

		<!-- Arabic Text -->
		<div class="p-6 rounded-2xl bg-quran-sand/60 border border-quran-border text-right">
			<p class="arabic-text text-3xl sm:text-4xl text-quran-dark leading-loose">
				{ayah.text_arabic}
			</p>
			{#if ayah.text_latin}
				<p class="text-xs font-mono text-quran-warm mt-4 text-left italic">
					{ayah.text_latin}
				</p>
			{/if}
		</div>

		<!-- Indonesian Translation -->
		<div class="space-y-2">
			<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Terjemahan Bahasa Indonesia</h2>
			<p class="text-sm sm:text-base text-quran-dark leading-relaxed bg-quran-cream/50 p-4 rounded-2xl border border-quran-border/60">
				"{ayah.text_id}"
			</p>
		</div>

		<!-- Tafsir Ibnu Katsir -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Tafsir Ibnu Katsir</h2>
				<span class="text-[10px] font-semibold text-quran-warm">Sumber: Tafsir Ibnu Katsir</span>
			</div>
			<div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-quran-dark leading-relaxed whitespace-pre-line">
				{ayah.tafsir_ringkas || 'Tafsir Ibnu Katsir untuk ayat ini memberikan petunjuk dan hikmah ketakwaan bagi setiap insan beriman.'}
			</div>
		</div>

		<!-- Word by Word Section -->
		{#if ayah.words && ayah.words.length > 0}
			<div class="space-y-2">
				<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Rincian Arti Per Kata</h2>
				<div class="flex flex-wrap flex-row-reverse gap-2.5 items-stretch justify-start">
					{#each ayah.words as word}
						<div class="p-3 rounded-xl bg-quran-sand/50 border border-quran-border text-center min-w-[90px]">
							<span class="arabic-text text-xl font-bold block text-quran-dark">{word.arabic}</span>
							<span class="text-[11px] font-medium text-quran-chocolate border-t border-quran-border/60 pt-1 mt-1 block">
								{word.translation}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Action Toolbar -->
		<div class="pt-6 border-t border-quran-border/60 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<button 
					on:click={() => progressStore.bookmarks.toggleBookmark(surah.number, surah.name_latin, ayah.ayah_number, ayah.text_arabic, ayah.text_id)}
					class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-quran-sand text-quran-chocolate hover:bg-quran-beige transition"
				>
					<Bookmark class="w-4 h-4 text-quran-gold" />
					<span>Bookmark</span>
				</button>
				<button 
					on:click={() => isColOpen = true}
					class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-quran-sand text-quran-chocolate hover:bg-quran-beige transition"
				>
					<FolderPlus class="w-4 h-4 text-quran-gold" />
					<span>Koleksi</span>
				</button>
			</div>

			<div class="flex items-center gap-2">
				<button 
					on:click={handleCopy}
					class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-quran-sand text-quran-dark hover:bg-quran-beige transition"
				>
					{#if copied}
						<Check class="w-4 h-4 text-green-600" />
						<span class="text-green-700">Tersalin</span>
					{:else}
						<Copy class="w-4 h-4" />
						<span>Salin Teks</span>
					{/if}
				</button>
			</div>
		</div>

	</div>

	<!-- Modals -->
	<AddToCollectionModal 
		ayah={ayah} 
		surahName={surah.name_latin} 
		isOpen={isColOpen} 
		onClose={() => isColOpen = false} 
	/>

</div>
