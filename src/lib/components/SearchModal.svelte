<script lang="ts">
	import { goto } from '$app/navigation';
	import { SURAH_LIST } from '$lib/data/surahList';
	import { QURAN_TOPICS } from '$lib/data/topicsData';
	import { 
		Search, 
		X, 
		BookOpen, 
		Compass, 
		ArrowRight, 
		Flame 
	} from 'lucide-svelte';

	export let isOpen: boolean = false;
	export let onClose: () => void = () => {};

	let searchQuery = '';
	let inputEl: HTMLInputElement;

	$: if (isOpen && typeof window !== 'undefined') {
		setTimeout(() => inputEl?.focus(), 100);
	}

	$: filteredSurahs = searchQuery.trim() 
		? SURAH_LIST.filter(s => 
			s.name_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.name_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.number.toString() === searchQuery.trim()
		).slice(0, 6)
		: [];

	$: filteredTopics = searchQuery.trim()
		? QURAN_TOPICS.filter(t => 
			t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.description.toLowerCase().includes(searchQuery.toLowerCase())
		).slice(0, 4)
		: [];

	function handleSelectSurah(num: number) {
		onClose();
		searchQuery = '';
		goto(`/quran/${num}`);
	}

	function handleSelectTopic(slug: string) {
		onClose();
		searchQuery = '';
		goto(`/topik#${slug}`);
	}
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-150"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Tutup Pencarian"
	>
		<div 
			class="bg-quran-surface rounded-3xl max-w-2xl w-full border border-quran-gold/50 shadow-luxury-hover overflow-hidden animate-in zoom-in-95 duration-150"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Search Input Box -->
			<div class="p-4 border-b border-quran-border/80 flex items-center gap-3 bg-quran-sand/50">
				<Search class="w-5 h-5 text-quran-gold" />
				<input 
					bind:this={inputEl}
					bind:value={searchQuery}
					type="text" 
					placeholder="Ketik nama surah (misal: Al-Kahf, Yasin, 18), arti, atau topik..."
					class="w-full bg-transparent text-sm text-quran-dark placeholder:text-quran-warm/70 focus:outline-none font-medium"
				/>
				{#if searchQuery}
					<button 
						on:click={() => searchQuery = ''}
						class="p-1 rounded-lg text-quran-warm hover:text-quran-dark transition"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}
				<button 
					on:click={onClose}
					class="px-2.5 py-1 rounded-lg bg-quran-beige text-xs font-semibold text-quran-dark hover:bg-quran-border transition"
				>
					Esc
				</button>
			</div>

			<!-- Search Results / Suggestions -->
			<div class="p-4 max-h-[60vh] overflow-y-auto space-y-4">
				
				{#if !searchQuery.trim()}
					<!-- Popular Quick Links -->
					<div>
						<div class="text-[11px] font-bold text-quran-warm uppercase tracking-wider mb-2 flex items-center gap-1.5">
							<Flame class="w-3.5 h-3.5 text-orange-600" />
							<span>Surah Pilihan Sering Dibaca</span>
						</div>
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
							{#each [
								{ num: 18, name: 'Al-Kahf', count: '110 ayat' },
								{ num: 36, name: 'Ya Sin', count: '83 ayat' },
								{ num: 55, name: 'Ar-Rahman', count: '78 ayat' },
								{ num: 56, name: 'Al-Waqi\'ah', count: '96 ayat' },
								{ num: 67, name: 'Al-Mulk', count: '30 ayat' },
								{ num: 1, name: 'Al-Fatihah', count: '7 ayat' },
								{ num: 2, name: 'Al-Baqarah', count: '286 ayat' },
								{ num: 112, name: 'Al-Ikhlas', count: '4 ayat' }
							] as s}
								<button 
									on:click={() => handleSelectSurah(s.num)}
									class="p-2.5 rounded-xl bg-quran-sand/70 border border-quran-border/70 hover:border-quran-gold hover:shadow-gold text-left transition"
								>
									<div class="text-xs font-bold text-quran-dark truncate">{s.num}. {s.name}</div>
									<div class="text-[10px] text-quran-warm">{s.count}</div>
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<!-- Surahs Results -->
					{#if filteredSurahs.length > 0}
						<div>
							<div class="text-[11px] font-bold text-quran-chocolate uppercase tracking-wider mb-2 flex items-center gap-1.5">
								<BookOpen class="w-3.5 h-3.5 text-quran-gold" />
								<span>Daftar Surah ({filteredSurahs.length})</span>
							</div>
							<div class="space-y-1.5">
								{#each filteredSurahs as s}
									<button 
										on:click={() => handleSelectSurah(s.number)}
										class="w-full p-3 rounded-2xl bg-quran-cream/50 border border-quran-border/60 hover:bg-quran-sand hover:border-quran-gold transition flex items-center justify-between text-left group"
									>
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 rounded-xl bg-quran-primary text-quran-gold flex items-center justify-center font-bold text-xs">
												{s.number}
											</div>
											<div>
												<div class="text-xs font-bold text-quran-dark group-hover:text-quran-primary transition">
													{s.name_latin}
												</div>
												<div class="text-[11px] text-quran-warm">
													{s.name_id} • {s.number_of_ayahs} Ayat ({s.revelation_type})
												</div>
											</div>
										</div>
										<div class="text-right">
											<div class="arabic-text text-lg text-quran-dark font-bold">{s.name_arabic}</div>
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Topics Results -->
					{#if filteredTopics.length > 0}
						<div>
							<div class="text-[11px] font-bold text-quran-chocolate uppercase tracking-wider mb-2 flex items-center gap-1.5">
								<Compass class="w-3.5 h-3.5 text-quran-gold" />
								<span>Topik Quran Terkait</span>
							</div>
							<div class="space-y-1.5">
								{#each filteredTopics as top}
									<button 
										on:click={() => handleSelectTopic(top.slug)}
										class="w-full p-3 rounded-2xl bg-quran-cream/50 border border-quran-border/60 hover:bg-quran-sand hover:border-quran-gold transition flex items-center justify-between text-left group"
									>
										<div>
											<div class="text-xs font-bold text-quran-dark group-hover:text-quran-primary transition">
												{top.title}
											</div>
											<div class="text-[11px] text-quran-warm line-clamp-1">
												{top.description}
											</div>
										</div>
										<ArrowRight class="w-4 h-4 text-quran-gold group-hover:translate-x-1 transition-transform" />
									</button>
								{/each}
							</div>
						</div>
					{/if}

					{#if filteredSurahs.length === 0 && filteredTopics.length === 0}
						<div class="text-center py-10">
							<p class="text-xs text-quran-warm font-medium">Tidak ada hasil ditemukan untuk "{searchQuery}".</p>
							<p class="text-[11px] text-quran-muted mt-1">Coba gunakan nama surah lain atau nomor surah (1-114).</p>
						</div>
					{/if}
				{/if}

			</div>

			<!-- Footer -->
			<div class="p-3 bg-quran-sand/70 border-t border-quran-border text-[11px] text-quran-warm flex justify-between items-center">
				<span>Navigasi cepat dengan keyboard</span>
				<span>Portal Qur'an v3.3</span>
			</div>
		</div>
	</div>
{/if}
