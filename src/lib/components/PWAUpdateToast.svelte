<script lang="ts">
	import { pwaStore, showUpdateToast, isUpdateAvailable, isUpdating } from '$lib/stores/pwa';
	import { Sparkles, RefreshCw, X, ArrowUpCircle } from 'lucide-svelte';

	function handleUpdate() {
		pwaStore.applyUpdate();
	}

	function handleDismiss() {
		pwaStore.dismissUpdateToast();
	}
</script>

{#if $showUpdateToast && $isUpdateAvailable}
	<div 
		class="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
		role="alert"
		aria-live="polite"
	>
		<div class="p-4 rounded-2xl bg-quran-surface/95 backdrop-blur-xl border-2 border-quran-gold/60 shadow-gold text-quran-dark overflow-hidden relative">
			<!-- Subtle glow background effect -->
			<div class="absolute -top-10 -right-10 w-28 h-28 bg-quran-gold/15 rounded-full blur-2xl pointer-events-none"></div>

			<div class="flex items-start gap-3">
				<!-- Icon Badge -->
				<div class="w-10 h-10 rounded-xl bg-gradient-luxury text-quran-gold flex items-center justify-center flex-shrink-0 shadow-sm border border-quran-gold/40 mt-0.5">
					<Sparkles class="w-5 h-5 animate-pulse" />
				</div>

				<div class="flex-1 min-w-0 pr-6">
					<div class="flex items-center gap-2">
						<h4 class="font-bold text-sm sm:text-base text-quran-dark tracking-tight">
							Pembaruan Tersedia!
						</h4>
						<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-quran-gold/20 text-quran-goldDark uppercase tracking-wider font-mono">
							UPDATE
						</span>
					</div>
					<p class="text-xs text-quran-warm mt-0.5 leading-relaxed">
						Versi terbaru Portal Qur'an telah siap dengan pembaruan tampilan dan performa.
					</p>

					<!-- Action Buttons -->
					<div class="flex items-center gap-2 mt-3">
						<button
							on:click={handleUpdate}
							disabled={$isUpdating}
							class="px-4 py-2 rounded-xl bg-gradient-luxury text-quran-gold hover:brightness-110 active:scale-[0.97] font-bold text-xs shadow-gold flex items-center gap-1.5 transition cursor-pointer border border-quran-gold/50"
						>
							<RefreshCw class="w-3.5 h-3.5 {$isUpdating ? 'animate-spin' : ''}" />
							<span>{$isUpdating ? 'Memperbarui...' : 'Perbarui Sekarang'}</span>
						</button>

						<button
							on:click={handleDismiss}
							class="px-3 py-2 rounded-xl text-xs font-semibold text-quran-chocolate hover:bg-quran-sand transition cursor-pointer"
						>
							Nanti
						</button>
					</div>
				</div>

				<!-- Close button in top right -->
				<button
					on:click={handleDismiss}
					class="absolute top-3 right-3 p-1.5 rounded-lg text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition cursor-pointer"
					aria-label="Tutup notifikasi update"
				>
					<X class="w-4 h-4" />
				</button>
			</div>
		</div>
	</div>
{/if}
