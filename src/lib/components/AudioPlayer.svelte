<script lang="ts">
	import { audioStore } from '$lib/stores/audio';
	import { qariStore } from '$lib/stores/qaris';
	import { QARI_LIST } from '$lib/data/surahList';
	import { 
		Play, 
		Pause, 
		SkipBack, 
		SkipForward, 
		Repeat, 
		Repeat1, 
		Volume2, 
		ChevronDown, 
		X, 
		Headphones,
		Gauge,
		UserCheck
	} from 'lucide-svelte';

	let qariDropdownOpen = false;
	let speedDropdownOpen = false;

	$: availableQaris = ($qariStore && $qariStore.length > 0 ? $qariStore : QARI_LIST).filter(q => q.is_active !== false);

	function formatTime(seconds: number): string {
		if (isNaN(seconds) || seconds === 0) return '00:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = parseFloat(target.value);
		audioStore.seek(val);
	}

	function handleVolume(e: Event) {
		const target = e.target as HTMLInputElement;
		audioStore.setVolume(parseFloat(target.value));
	}

	function toggleRepeat() {
		if ($audioStore.repeatMode === 'none') {
			audioStore.setRepeatMode('ayah');
		} else if ($audioStore.repeatMode === 'ayah') {
			audioStore.setRepeatMode('surah');
		} else {
			audioStore.setRepeatMode('none');
		}
	}

	const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
</script>

{#if $audioStore.isVisible && $audioStore.audioUrl}
	<!-- Floating audio container with high z-index and sleek positioning -->
	<div class="fixed bottom-16 lg:bottom-4 left-2 right-2 sm:left-4 sm:right-4 max-w-4xl mx-auto z-40 animate-in slide-in-from-bottom-3 duration-200">
		<div class="bg-quran-dark/95 backdrop-blur-xl text-quran-cream rounded-2xl shadow-luxury-hover border border-quran-gold/50 overflow-hidden transition-all">
			
			<!-- Progress Bar Top Line (Seeking) -->
			<div class="relative w-full h-1.5 bg-quran-chocolate/80 group cursor-pointer">
				<div 
					class="absolute top-0 left-0 bottom-0 bg-gradient-gold transition-all duration-100"
					style="width: {($audioStore.duration > 0 ? ($audioStore.currentTime / $audioStore.duration) * 100 : 0)}%"
				></div>
				<input 
					type="range" 
					min="0" 
					max={$audioStore.duration || 100} 
					value={$audioStore.currentTime || 0}
					on:input={handleSeek}
					class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
					aria-label="Seek audio"
				/>
			</div>

			<!-- Unified Streamlined Player Row -->
			<div class="px-2.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 min-w-0">
				
				<!-- Left: Surah Title, Ayah Badge & Qari Trigger -->
				<div class="flex items-center gap-2 min-w-0 flex-1">
					<div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-quran-primary/90 border border-quran-gold/50 flex items-center justify-center text-quran-gold flex-shrink-0 shadow-gold">
						<Headphones class="w-4 h-4 {$audioStore.isPlaying ? 'animate-pulse' : ''}" />
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-1.5 min-w-0">
							<span class="font-bold text-xs sm:text-sm text-white truncate max-w-[85px] xs:max-w-[140px] sm:max-w-[200px]">
								{$audioStore.surahName}
							</span>
							<span class="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-quran-gold/20 text-quran-gold border border-quran-gold/30 whitespace-nowrap flex-shrink-0">
								{$audioStore.ayahNumber}/{$audioStore.totalAyahs}
							</span>
						</div>
						
						<!-- Qari name & Time duration -->
						<div class="flex items-center gap-2 text-[10px] sm:text-[11px] text-quran-goldLight/80 truncate mt-0.5">
							<span class="truncate max-w-[80px] xs:max-w-[120px]">{$audioStore.currentQari.name.split(' ')[0]}</span>
							<span class="font-mono text-quran-muted hidden xs:inline">• {formatTime($audioStore.currentTime)}/{formatTime($audioStore.duration)}</span>
						</div>
					</div>
				</div>

				<!-- Center: Playback Controls (Prev, Play, Next) -->
				<div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
					<!-- Prev Ayah -->
					<button 
						on:click={() => audioStore.prevAyah()}
						class="p-1.5 text-quran-goldLight hover:text-white transition rounded-lg hover:bg-quran-chocolate/50 active:scale-90"
						title="Ayat Sebelumnya"
						aria-label="Ayat Sebelumnya"
					>
						<SkipBack class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</button>

					<!-- Play / Pause Main Button -->
					<button 
						on:click={() => audioStore.togglePlay()}
						class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-gold text-quran-dark flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-all flex-shrink-0"
						title={$audioStore.isPlaying ? 'Jeda' : 'Putar'}
						aria-label={$audioStore.isPlaying ? 'Jeda' : 'Putar'}
					>
						{#if $audioStore.isLoading}
							<div class="w-3.5 h-3.5 border-2 border-quran-dark border-t-transparent rounded-full animate-spin"></div>
						{:else if $audioStore.isPlaying}
							<Pause class="w-4 h-4 fill-quran-dark" />
						{:else}
							<Play class="w-4 h-4 fill-quran-dark ml-0.5" />
						{/if}
					</button>

					<!-- Next Ayah -->
					<button 
						on:click={() => audioStore.nextAyah()}
						class="p-1.5 text-quran-goldLight hover:text-white transition rounded-lg hover:bg-quran-chocolate/50 active:scale-90"
						title="Ayat Berikutnya"
						aria-label="Ayat Berikutnya"
					>
						<SkipForward class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</button>

					<!-- Repeat Mode Toggle -->
					<button 
						on:click={toggleRepeat}
						class="p-1.5 rounded-lg transition active:scale-90 {$audioStore.repeatMode !== 'none' ? 'text-quran-gold bg-quran-chocolate/80 border border-quran-gold/40' : 'text-quran-muted hover:text-white hover:bg-quran-chocolate/50'}"
						title="Mode Ulang: {$audioStore.repeatMode === 'none' ? 'Mati' : $audioStore.repeatMode === 'ayah' ? 'Ulang Ayat' : 'Ulang Surah'}"
						aria-label="Mode Ulang"
					>
						{#if $audioStore.repeatMode === 'ayah'}
							<Repeat1 class="w-3.5 h-3.5 text-quran-gold" />
						{:else}
							<Repeat class="w-3.5 h-3.5" />
						{/if}
					</button>
				</div>

				<!-- Right: Qari Picker, Speed Rate & Close -->
				<div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
					
					<!-- Qari Selector Dropdown -->
					<div class="relative">
						<button 
							on:click={() => qariDropdownOpen = !qariDropdownOpen}
							class="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-quran-chocolate/80 text-xs text-quran-goldLight hover:text-white border border-quran-border/30 transition"
							title="Pilih Syeikh / Qari"
						>
							<UserCheck class="w-3 h-3 text-quran-gold" />
							<span class="max-w-[70px] truncate text-[10px]">{$audioStore.currentQari.name.split(' ')[0]}</span>
							<ChevronDown class="w-3 h-3 text-quran-muted" />
						</button>

						{#if qariDropdownOpen}
							<div 
								class="fixed inset-0 z-40" 
								on:click={() => qariDropdownOpen = false}
								on:keydown={(e) => e.key === 'Escape' && (qariDropdownOpen = false)}
								role="button"
								tabindex="0"
								aria-label="Tutup Qari Menu"
							></div>
							<div class="absolute right-0 bottom-full mb-2 w-64 max-h-64 overflow-y-auto bg-quran-dark rounded-xl border border-quran-gold/40 shadow-luxury-hover p-1.5 z-50 animate-in fade-in zoom-in-95">
								<div class="px-2 py-1 text-[10px] font-bold text-quran-gold uppercase border-b border-quran-chocolate">
									Pilihan Syeikh / Qari
								</div>
								{#each availableQaris as qari}
									<button 
										on:click={() => {
											audioStore.setQari(qari);
											qariDropdownOpen = false;
										}}
										class="w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center justify-between {$audioStore.currentQari.id === qari.id ? 'bg-quran-primary text-quran-gold font-bold' : 'text-quran-cream hover:bg-quran-chocolate/60'}"
									>
										<div class="truncate mr-2">
											<div class="font-medium text-white truncate">{qari.name}</div>
											<div class="arabic-text text-[10px] text-quran-goldLight">{qari.arabic_name}</div>
										</div>
										{#if $audioStore.currentQari.id === qari.id}
											<span class="text-[10px] text-quran-gold font-bold">Aktif</span>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Speed Picker Dropdown -->
					<div class="relative">
						<button 
							on:click={() => speedDropdownOpen = !speedDropdownOpen}
							class="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-quran-chocolate/60 text-[10px] sm:text-xs font-mono text-quran-gold hover:text-white transition"
							title="Kecepatan Audio"
							aria-label="Kecepatan Audio"
						>
							<Gauge class="w-3 h-3 text-quran-gold" />
							<span>{$audioStore.playbackRate}x</span>
						</button>

						{#if speedDropdownOpen}
							<div 
								class="fixed inset-0 z-40" 
								on:click={() => speedDropdownOpen = false}
								on:keydown={(e) => e.key === 'Escape' && (speedDropdownOpen = false)}
								role="button"
								tabindex="0"
								aria-label="Tutup Kecepatan Menu"
							></div>
							<div class="absolute right-0 bottom-full mb-2 w-24 bg-quran-dark rounded-xl border border-quran-gold/40 shadow-luxury-hover p-1 z-50">
								{#each speeds as sp}
									<button 
										on:click={() => {
											audioStore.setPlaybackRate(sp);
											speedDropdownOpen = false;
										}}
										class="w-full text-center px-2 py-1.5 rounded text-xs font-mono {$audioStore.playbackRate === sp ? 'bg-quran-gold text-quran-dark font-bold' : 'text-quran-cream hover:bg-quran-chocolate/60'}"
									>
										{sp}x
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Volume Slider (Desktop) -->
					<div class="hidden md:flex items-center gap-1 text-quran-goldLight">
						<Volume2 class="w-3.5 h-3.5 text-quran-gold" />
						<input 
							type="range" 
							min="0" 
							max="1" 
							step="0.05" 
							value={$audioStore.volume} 
							on:input={handleVolume}
							class="w-14 accent-quran-gold h-1 cursor-pointer"
							aria-label="Volume"
						/>
					</div>

					<!-- Close Button -->
					<button 
						on:click={() => audioStore.close()}
						class="p-1.5 rounded-lg text-quran-muted hover:text-white hover:bg-quran-chocolate/60 transition flex items-center justify-center flex-shrink-0"
						title="Tutup Pemutar Audio"
						aria-label="Tutup Pemutar Audio"
					>
						<X class="w-4 h-4" />
					</button>

				</div>

			</div>
		</div>
	</div>
{/if}
