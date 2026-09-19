<script lang="ts">
	import type { SurahMeta } from '$lib/types/quran';
	import { 
		X, 
		BookOpen, 
		MapPin, 
		ListOrdered, 
		Layers, 
		Sparkles, 
		Compass,
		ArrowRight
	} from 'lucide-svelte';

	export let surah: SurahMeta | null = null;
	export let isOpen: boolean = false;
	export let onClose: () => void = () => {};
	export let onStartReading: (surahNumber: number) => void = () => {};
</script>

{#if isOpen && surah}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Tutup Info Surah"
	>
		<div 
			class="bg-quran-surface rounded-3xl max-w-xl w-full border border-quran-gold/40 shadow-luxury-hover overflow-hidden animate-in zoom-in-95 duration-150"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Header with Luxury Brown Banner -->
			<div class="relative bg-gradient-luxury p-6 text-quran-cream overflow-hidden">
				<div class="absolute -right-8 -bottom-8 opacity-10 text-8xl font-serif text-quran-gold pointer-events-none select-none">
					{surah.name_arabic}
				</div>

				<div class="flex items-start justify-between relative z-10">
					<div class="flex items-center gap-3">
						<div class="w-12 h-12 rounded-2xl bg-quran-gold/20 border border-quran-gold/40 flex items-center justify-center text-quran-gold shadow-gold">
							<BookOpen class="w-6 h-6" />
						</div>
						<div>
							<div class="flex items-center gap-2">
								<h2 class="text-xl font-bold text-white tracking-tight">{surah.name_latin}</h2>
								<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-quran-gold text-quran-dark">
									Surah ke-{surah.number}
								</span>
							</div>
							<p class="text-xs text-quran-goldLight">Arti: "{surah.name_id}"</p>
						</div>
					</div>

					<button 
						on:click={onClose}
						class="p-2 rounded-xl text-quran-goldLight/80 hover:text-white hover:bg-white/10 transition"
						aria-label="Tutup Modal"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<!-- Arabic Large Banner -->
				<div class="mt-4 pt-4 border-t border-quran-warm/30 text-center">
					<div class="arabic-text text-4xl text-quran-gold text-shadow-gold">
						{surah.name_arabic}
					</div>
				</div>
			</div>

			<!-- Body: Key Statistics & Virtues -->
			<div class="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
				
				<!-- Quick Meta Grid -->
				<div class="grid grid-cols-3 gap-3">
					<div class="p-3 rounded-2xl bg-quran-sand border border-quran-border text-center">
						<div class="flex items-center justify-center text-quran-gold mb-1">
							<MapPin class="w-4 h-4" />
						</div>
						<div class="text-[10px] uppercase font-bold text-quran-warm">Golongan</div>
						<div class="text-xs font-bold text-quran-dark mt-0.5">{surah.revelation_type}</div>
					</div>

					<div class="p-3 rounded-2xl bg-quran-sand border border-quran-border text-center">
						<div class="flex items-center justify-center text-quran-gold mb-1">
							<ListOrdered class="w-4 h-4" />
						</div>
						<div class="text-[10px] uppercase font-bold text-quran-warm">Jumlah Ayat</div>
						<div class="text-xs font-bold text-quran-dark mt-0.5">{surah.number_of_ayahs} Ayat</div>
					</div>

					<div class="p-3 rounded-2xl bg-quran-sand border border-quran-border text-center">
						<div class="flex items-center justify-center text-quran-gold mb-1">
							<Layers class="w-4 h-4" />
						</div>
						<div class="text-[10px] uppercase font-bold text-quran-warm">Urutan Turun</div>
						<div class="text-xs font-bold text-quran-dark mt-0.5">Ke-{surah.revelation_order}</div>
					</div>
				</div>

				<!-- Description / Ringkasan Isi -->
				<div>
					<div class="flex items-center gap-2 text-xs font-bold text-quran-chocolate mb-1.5">
						<Compass class="w-4 h-4 text-quran-gold" />
						<span>Ringkasan & Tema Pokok</span>
					</div>
					<p class="text-xs text-quran-dark/90 leading-relaxed bg-quran-cream/50 p-3.5 rounded-2xl border border-quran-border/60">
						{surah.description || 'Surah mulia yang memuat petunjuk keimanan, hikmah ketakwaan, serta hukum-hukum Allah SWT bagi umat manusia.'}
					</p>
				</div>

				<!-- Virtues / Keutamaan -->
				<div>
					<div class="flex items-center gap-2 text-xs font-bold text-quran-chocolate mb-1.5">
						<Sparkles class="w-4 h-4 text-quran-gold" />
						<span>Keutamaan Membaca</span>
					</div>
					<p class="text-xs text-quran-warm italic bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60 leading-relaxed">
						{surah.virtues || 'Membaca setiap huruf Al-Qur\'an mendatangkan sepuluh kebaikan, menjadi syafaat di hari kiamat, dan menentramkan hati yang gundah.'}
					</p>
				</div>

			</div>

			<!-- Footer Action -->
			<div class="p-4 bg-quran-sand/70 border-t border-quran-border flex items-center justify-between gap-3">
				<button 
					on:click={onClose}
					class="px-4 py-2.5 rounded-xl text-xs font-semibold text-quran-warm hover:bg-quran-beige/50 transition"
				>
					Tutup
				</button>

				<button 
					on:click={() => {
						onStartReading(surah.number);
						onClose();
					}}
					class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-105 active:scale-95 transition-all"
				>
					<span>Mulai Membaca</span>
					<ArrowRight class="w-4 h-4 text-quran-gold" />
				</button>
			</div>
		</div>
	</div>
{/if}
