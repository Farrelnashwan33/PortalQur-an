<script lang="ts">
	import type { AyahDetail } from '$lib/types/quran';
	import { X, BookOpen, Share2, Copy, Bookmark, Check } from 'lucide-svelte';
	import { progressStore } from '$lib/stores/progress';

	export let ayah: AyahDetail | null = null;
	export let surahName: string = '';
	export let isOpen: boolean = false;
	export let onClose: () => void = () => {};

	const bookmarks = progressStore.bookmarks;
	let copied = false;

	function handleCopy() {
		if (!ayah) return;
		const text = `Surah ${surahName} [${ayah.surah_number}:${ayah.ayah_number}]\n\n${ayah.text_arabic}\n\nArtinya: "${ayah.text_id}"\n\nTafsir Ringkas:\n${ayah.tafsir_ringkas || 'Tafsir Ibnu Katsir'}\n\n(Dikutip via Portal Qur'an v3.3)`;
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

{#if isOpen && ayah}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Tutup Tafsir Ayat"
	>
		<div 
			class="bg-quran-surface rounded-3xl max-w-2xl w-full border border-quran-gold/40 shadow-luxury-hover overflow-hidden animate-in zoom-in-95 duration-150"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="bg-gradient-luxury p-5 text-quran-cream flex items-center justify-between border-b border-quran-border/30">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-quran-gold/20 border border-quran-gold/40 flex items-center justify-center text-quran-gold">
						<BookOpen class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-sm text-white">Tafsir & Penjelasan Ayat</h3>
						<p class="text-xs text-quran-goldLight">Surah {surahName} : Ayat {ayah.ayah_number}</p>
					</div>
				</div>

				<button 
					on:click={onClose}
					class="p-2 rounded-xl text-quran-goldLight/80 hover:text-white hover:bg-white/10 transition"
					aria-label="Tutup"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
				
				<!-- Arabic Text Banner -->
				<div class="p-5 rounded-2xl bg-quran-sand border border-quran-border/80 text-right">
					<p class="arabic-text text-2xl text-quran-dark leading-loose">
						{ayah.text_arabic}
					</p>
					{#if ayah.text_latin}
						<p class="text-xs text-quran-warm font-mono mt-3 text-left italic">
							{ayah.text_latin}
						</p>
					{/if}
				</div>

				<!-- Indonesian Translation -->
				<div>
					<h4 class="text-xs font-bold text-quran-chocolate uppercase tracking-wider mb-2">Terjemahan</h4>
					<p class="text-sm text-quran-dark leading-relaxed bg-quran-cream/50 p-4 rounded-2xl border border-quran-border/60">
						"{ayah.text_id}"
					</p>
				</div>

				<!-- Tafsir Ibnu Katsir -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<h4 class="text-xs font-bold text-quran-chocolate uppercase tracking-wider">Tafsir Ibnu Katsir</h4>
						<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-quran-gold/20 text-quran-chocolate border border-quran-gold/30">
							Tafsir Ibnu Katsir
						</span>
					</div>
					<div class="text-xs text-quran-dark leading-relaxed p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
						<p class="whitespace-pre-line">
							{ayah.tafsir_ringkas || 'Tafsir Ibnu Katsir untuk ayat ini menjelaskan kandungan makna ayat, asbabun nuzul, serta penegasan syariat dan keimanan.'}
						</p>
						<div class="pt-2 border-t border-amber-200/60 text-[11px] text-quran-warm font-medium">
							Sumber: <span class="font-bold text-quran-chocolate">Tafsir Ibnu Katsir</span>
						</div>
					</div>
				</div>

			</div>

			<!-- Footer Actions -->
			<div class="p-4 bg-quran-sand/70 border-t border-quran-border flex items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<button 
						on:click={handleCopy}
						class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-quran-dark bg-white border border-quran-border hover:bg-quran-beige/50 transition"
					>
						{#if copied}
							<Check class="w-3.5 h-3.5 text-green-600" />
							<span class="text-green-700">Tersalin</span>
						{:else}
							<Copy class="w-3.5 h-3.5 text-quran-warm" />
							<span>Salin Tafsir</span>
						{/if}
					</button>

					<button 
						on:click={() => progressStore.bookmarks.toggleBookmark(ayah.surah_number, surahName, ayah.ayah_number, ayah.text_arabic, ayah.text_id)}
						class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-quran-dark bg-white border border-quran-border hover:bg-quran-beige/50 transition"
					>
						<Bookmark class="w-3.5 h-3.5 text-quran-gold" />
						<span>Bookmark</span>
					</button>
				</div>

				<button 
					on:click={onClose}
					class="px-4 py-2 rounded-xl bg-quran-primary text-white text-xs font-bold hover:bg-quran-dark transition"
				>
					Selesai
				</button>
			</div>
		</div>
	</div>
{/if}
