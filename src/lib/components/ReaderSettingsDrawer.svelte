<script lang="ts">
	import { readerStore } from '$lib/stores/reader';
	import { audioStore } from '$lib/stores/audio';
	import { qariStore } from '$lib/stores/qaris';
	import { QARI_LIST } from '$lib/data/surahList';
	import type { ReadingMode, ThemeMode, ArabicFontFamily } from '$lib/types/quran';
	import { 
		X, 
		Sliders, 
		BookOpen, 
		Languages, 
		FileText, 
		Layers, 
		Headphones, 
		Eye, 
		Type, 
		Palette, 
		PlayCircle,
		RotateCcw,
		UserCheck
	} from 'lucide-svelte';

	export let isOpen: boolean = false;
	export let onClose: () => void = () => {};

	$: availableQaris = ($qariStore && $qariStore.length > 0 ? $qariStore : QARI_LIST).filter(q => q.is_active !== false);

	const modes: { id: ReadingMode; label: string; desc: string; icon: any }[] = [
		{ id: 'terjemahan', label: 'Mode Terjemahan', desc: 'Teks Arab lengkap beserta terjemahan Bahasa Indonesia', icon: Languages },
		{ id: 'mushaf', label: 'Mode Mushaf', desc: 'Fokus teks Arab murni seperti lembaran mushaf Madinah', icon: BookOpen },
		{ id: 'tafsir', label: 'Mode Tafsir', desc: 'Teks Arab, terjemahan, dan uraian tafsir ringkas Kemenag', icon: FileText },
		{ id: 'per-kata', label: 'Mode Per Kata', desc: 'Menampilkan arti setiap mufradat/kata tepat di bawah lafazh Arab', icon: Layers },
		{ id: 'audio', label: 'Mode Audio Karaoke', desc: 'Tampilan tilawah interaktif dengan sorotan ayat yang sedang dilantunkan', icon: Headphones },
		{ id: 'fokus', label: 'Mode Fokus Membaca', desc: 'Tampilan bersih bebas distraksi untuk tadabbur mendalam', icon: Eye }
	];

	const themes: { id: ThemeMode; label: string; bg: string; border: string }[] = [
		{ id: 'cream', label: 'Cream Luxury', bg: 'bg-[#F8F3EC]', border: 'border-[#E3D3C4]' },
		{ id: 'sand', label: 'Soft Sand', bg: 'bg-[#FAF6F0]', border: 'border-[#E8D5B5]' },
		{ id: 'sepia', label: 'Warm Sepia', bg: 'bg-[#EFE4D5]', border: 'border-[#C9A66B]' },
		{ id: 'dark', label: 'Dark Islamic', bg: 'bg-[#3E2723]', border: 'border-[#6F4E37]' }
	];
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 bg-quran-dark/60 backdrop-blur-sm transition-opacity"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Tutup Pengaturan"
	></div>

	<aside class="fixed top-0 bottom-0 right-0 z-50 w-full max-w-md bg-quran-surface border-l border-quran-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
		
		<!-- Drawer Header -->
		<div class="h-16 px-6 bg-gradient-luxury text-quran-cream flex items-center justify-between border-b border-quran-border/30">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-lg bg-quran-gold/20 flex items-center justify-center text-quran-gold">
					<Sliders class="w-4 h-4" />
				</div>
				<div>
					<h3 class="font-bold text-sm text-white">Pengaturan Membaca</h3>
					<p class="text-[11px] text-quran-goldLight">Kustomisasi Tampilan & Font</p>
				</div>
			</div>

			<button 
				on:click={onClose}
				class="p-2 rounded-xl text-quran-goldLight hover:text-white hover:bg-white/10 transition"
				aria-label="Tutup"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Drawer Scrollable Body -->
		<div class="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
			
			<!-- 1. Pilihan 6 Mode Membaca -->
			<div>
				<span class="block text-xs font-bold text-quran-chocolate uppercase tracking-wider mb-2.5">
					Mode Membaca Al-Qur'an (6 Pilihan)
				</span>
				<div class="space-y-2">
					{#each modes as m}
						<button 
							on:click={() => readerStore.setMode(m.id)}
							class="w-full text-left p-3 rounded-2xl border transition flex items-start gap-3 {$readerStore.mode === m.id ? 'bg-gradient-to-r from-quran-sand to-quran-cream border-quran-gold shadow-gold text-quran-dark font-bold' : 'bg-quran-sand/50 border-quran-border hover:bg-quran-cream text-quran-dark'}"
						>
							<div class="p-2 rounded-xl {$readerStore.mode === m.id ? 'bg-quran-primary text-quran-gold' : 'bg-quran-beige text-quran-chocolate'} mt-0.5">
								<svelte:component this={m.icon} class="w-4 h-4" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-quran-dark">{m.label}</span>
									{#if $readerStore.mode === m.id}
										<span class="w-2 h-2 rounded-full bg-quran-gold shadow-gold"></span>
									{/if}
								</div>
								<p class="text-[11px] text-quran-warm mt-0.5 leading-snug font-normal">{m.desc}</p>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- 2. Ukuran Font Arab & Terjemahan -->
			<div class="p-4 rounded-2xl bg-quran-sand/70 border border-quran-border space-y-4">
				<div class="flex items-center gap-2 text-xs font-bold text-quran-chocolate">
					<Type class="w-4 h-4 text-quran-gold" />
					<span>Ukuran & Tipografi Teks</span>
				</div>

				<!-- Arabic font size slider -->
				<div>
					<div class="flex justify-between text-xs text-quran-dark mb-1">
						<span>Ukuran Font Arab</span>
						<span class="font-bold text-quran-primary">{$readerStore.arabicFontSize}px</span>
					</div>
					<input 
						type="range" 
						min="22" 
						max="48" 
						value={$readerStore.arabicFontSize}
						on:input={(e) => readerStore.setArabicFontSize(parseInt(e.currentTarget.value))}
						class="w-full accent-quran-primary h-1.5 cursor-pointer"
						aria-label="Ukuran font Arab"
					/>
					<div class="mt-2 p-2 rounded-lg bg-white border border-quran-border text-center">
						<span class="arabic-text text-quran-dark" style="font-size: {$readerStore.arabicFontSize}px">
							بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
						</span>
					</div>
				</div>

				<!-- Translation font size slider -->
				<div>
					<div class="flex justify-between text-xs text-quran-dark mb-1">
						<span>Ukuran Font Terjemahan</span>
						<span class="font-bold text-quran-primary">{$readerStore.translationFontSize}px</span>
					</div>
					<input 
						type="range" 
						min="12" 
						max="22" 
						value={$readerStore.translationFontSize}
						on:input={(e) => readerStore.setTranslationFontSize(parseInt(e.currentTarget.value))}
						class="w-full accent-quran-primary h-1.5 cursor-pointer"
						aria-label="Ukuran font terjemahan"
					/>
				</div>

				<!-- Arabic Font Family -->
				<div>
					<label for="font-family-select" class="block text-xs text-quran-dark mb-1">Jenis Huruf Arab</label>
					<select 
						id="font-family-select"
						value={$readerStore.arabicFontFamily}
						on:change={(e) => readerStore.setArabicFontFamily(e.currentTarget.value as ArabicFontFamily)}
						class="w-full px-3 py-2 rounded-xl bg-white border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
					>
						<option value="Scheherazade New">Scheherazade New (Mushaf Standar Kemenag)</option>
						<option value="Amiri">Amiri (Klasik Naskh Modern)</option>
					</select>
				</div>
			</div>

			<!-- 3. Pilihan Syeikh / Audio Murattal -->
			<div class="p-4 rounded-2xl bg-quran-sand/70 border border-quran-border space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2 text-xs font-bold text-quran-chocolate">
						<Headphones class="w-4 h-4 text-quran-gold" />
						<span>Pilihan Syeikh / Audio Qari</span>
					</div>
					<span class="text-[10px] font-bold text-quran-gold bg-quran-primary px-2 py-0.5 rounded-full">
						{$audioStore.currentQari.name.split(' ')[0]}
					</span>
				</div>

				<div class="space-y-1.5">
					{#each availableQaris as qari}
						<button 
							on:click={() => audioStore.setQari(qari)}
							class="w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between {$audioStore.currentQari.id === qari.id ? 'bg-quran-primary text-quran-gold border-quran-gold shadow-gold font-bold' : 'bg-white border-quran-border hover:bg-quran-cream text-quran-dark'}"
						>
							<div class="min-w-0 flex-1 mr-2">
								<div class="text-xs font-medium truncate">{qari.name}</div>
								<div class="arabic-text text-[10px] opacity-75">{qari.arabic_name}</div>
							</div>
							{#if $audioStore.currentQari.id === qari.id}
								<span class="text-[10px] px-2 py-0.5 rounded bg-quran-gold/20 text-quran-gold font-bold border border-quran-gold/30">Dipilih</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- 4. Tema Warna Baca -->
			<div>
				<div class="flex items-center gap-2 text-xs font-bold text-quran-chocolate uppercase tracking-wider mb-2.5">
					<Palette class="w-4 h-4 text-quran-gold" />
					<span>Nuansa Warna Latar</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					{#each themes as t}
						<button 
							on:click={() => readerStore.setTheme(t.id)}
							class="p-3 rounded-xl border flex items-center gap-2.5 transition {$readerStore.theme === t.id ? 'border-quran-gold shadow-gold bg-quran-sand' : 'border-quran-border bg-white hover:bg-quran-sand/50'}"
						>
							<span class="w-5 h-5 rounded-full {t.bg} border {t.border} shadow-sm"></span>
							<span class="text-xs font-medium text-quran-dark">{t.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- 5. Auto-Scroll Toggle -->
			<div class="p-4 rounded-2xl bg-quran-sand/50 border border-quran-border flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<PlayCircle class="w-4 h-4 text-quran-gold" />
					<div>
						<span class="text-xs font-bold text-quran-dark block">Gulir Otomatis (Auto-Scroll)</span>
						<span class="text-[10px] text-quran-warm">Membaca mengalir tanpa perlu menyentuh layar</span>
					</div>
				</div>
				<button 
					on:click={() => readerStore.toggleAutoScroll()}
					class="w-11 h-6 rounded-full transition-colors relative {$readerStore.autoScroll ? 'bg-quran-primary' : 'bg-gray-300'}"
					aria-label="Toggle auto scroll"
				>
					<span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {$readerStore.autoScroll ? 'translate-x-5' : ''}"></span>
				</button>
			</div>

		</div>

		<!-- Drawer Footer -->
		<div class="p-4 bg-quran-sand border-t border-quran-border flex items-center justify-between">
			<button 
				on:click={() => readerStore.reset()}
				class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-quran-warm hover:text-quran-dark hover:bg-quran-beige/50 transition"
			>
				<RotateCcw class="w-3.5 h-3.5" />
				<span>Reset Bawaan</span>
			</button>

			<button 
				on:click={onClose}
				class="px-5 py-2 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-105 active:scale-95 transition-all"
			>
				Terapkan
			</button>
		</div>

	</aside>
{/if}
