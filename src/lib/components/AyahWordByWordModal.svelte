<script lang="ts">
	import type { AyahDetail } from '$lib/types/quran';
	import { X, Languages, Volume2 } from 'lucide-svelte';

	export let ayah: AyahDetail | null = null;
	export let surahName: string = '';
	export let isOpen: boolean = false;
	export let onClose: () => void = () => {};
</script>

{#if isOpen && ayah}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Tutup Arti Per Kata"
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
						<Languages class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-sm text-white">Arti Per Kata (Mufradat)</h3>
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

			<!-- Word-by-Word Cards Flow (RTL Order) -->
			<div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
				
				<!-- Full Translation Reference -->
				<div class="p-3.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark leading-relaxed">
					<span class="font-bold text-quran-chocolate">Terjemahan Ayat:</span> "{ayah.text_id}"
				</div>

				<div class="text-xs font-bold text-quran-warm uppercase tracking-wider">
					Rincian Tiap Kata (Mulai dari Kanan)
				</div>

				<div class="flex flex-wrap flex-row-reverse gap-3 items-stretch justify-start">
					{#if ayah.words && ayah.words.length > 0}
						{#each ayah.words as word}
							<div class="flex-1 min-w-[120px] max-w-[160px] p-3 rounded-2xl bg-quran-cream/70 border border-quran-border hover:border-quran-gold hover:shadow-gold transition text-center flex flex-col justify-between">
								<div class="arabic-text text-2xl text-quran-dark font-bold mb-1">
									{word.arabic}
								</div>
								{#if word.latin}
									<div class="text-[10px] font-mono text-quran-warm italic mb-1">
										{word.latin}
									</div>
								{/if}
								<div class="text-[11px] font-medium text-quran-chocolate border-t border-quran-border/60 pt-1">
									{word.translation}
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-xs text-quran-warm">Rincian per kata sedang dimuat...</p>
					{/if}
				</div>

			</div>

			<!-- Footer -->
			<div class="p-4 bg-quran-sand/70 border-t border-quran-border flex justify-end">
				<button 
					on:click={onClose}
					class="px-5 py-2 rounded-xl bg-quran-primary text-white text-xs font-bold hover:bg-quran-dark transition"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}
