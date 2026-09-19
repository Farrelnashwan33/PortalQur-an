<script lang="ts">
	import { pwaStore, showInstallModal, canDirectInstall, isAppInstalled } from '$lib/stores/pwa';
	import { 
		Download, 
		Smartphone, 
		Share2, 
		PlusSquare, 
		CheckCircle2, 
		X, 
		Sparkles, 
		Laptop,
		ArrowDownToLine,
		Info,
		Check,
		Apple
	} from 'lucide-svelte';

	let isInstalling = false;
	let activeTab: 'android' | 'ios' | 'desktop' = 'android';
	let alertMessage: string | null = null;
	let alertType: 'success' | 'info' | 'warning' = 'info';

	// Auto-detect tab on open
	$: if ($showInstallModal) {
		if ($pwaStore.isIOS) {
			activeTab = 'ios';
		} else if ($pwaStore.isAndroid) {
			activeTab = 'android';
		} else {
			activeTab = 'desktop';
		}
	}

	async function handleInstallClick() {
		isInstalling = true;
		alertMessage = null;

		try {
			const result = await pwaStore.promptInstall();

			if (result === 'accepted') {
				alertType = 'success';
				alertMessage = 'Alhamdulillah! Portal Qur\'an berhasil dipasang di perangkat Anda.';
			} else if (result === 'already_installed') {
				alertType = 'info';
				alertMessage = 'Portal Qur\'an sudah terpasang di perangkat Anda.';
			} else if (result === 'dismissed') {
				alertType = 'warning';
				alertMessage = 'Pemasangan dibatalkan.';
			} else {
				// No native prompt available -> switch to device tab
				if ($pwaStore.isIOS) {
					activeTab = 'ios';
					alertType = 'info';
					alertMessage = 'Di Safari iPhone: Tekan tombol Bagikan (Share) lalu "Tambah ke Layar Utama".';
				} else {
					activeTab = 'desktop';
					alertType = 'info';
					alertMessage = 'Klik ikon Install (➕ / ⬇️) di sisi kanan URL bar browser Anda.';
				}
			}
		} catch (e) {
			console.error('Install error:', e);
		} finally {
			isInstalling = false;
		}
	}

	function closeModal() {
		alertMessage = null;
		pwaStore.closeModal();
	}
</script>

{#if $showInstallModal}
	<div 
		class="fixed inset-0 z-50 overflow-y-auto bg-quran-dark/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-6 animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
		aria-labelledby="install-app-title"
	>
		<!-- Backdrop click to dismiss -->
		<div 
			class="fixed inset-0" 
			on:click={closeModal}
			on:keydown={(e) => e.key === 'Escape' && closeModal()}
			role="button"
			tabindex="0"
			aria-label="Tutup Dialog"
		></div>

		<!-- Modal Card -->
		<div class="relative w-full max-w-md bg-quran-surface rounded-3xl shadow-luxury-hover border border-quran-gold/40 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
			
			<!-- 1. Header Compact -->
			<div class="relative bg-gradient-luxury p-4 sm:p-5 text-quran-cream overflow-hidden flex-shrink-0">
				<!-- Ambient Glow -->
				<div class="absolute -top-10 -right-10 w-32 h-32 bg-quran-gold/20 rounded-full blur-2xl pointer-events-none"></div>
				
				<!-- Close Button -->
				<button 
					on:click={closeModal}
					class="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
					aria-label="Tutup"
				>
					<X class="w-4 h-4" />
				</button>

				<div class="flex items-center gap-3">
					<div class="relative flex-shrink-0">
						<img 
							src="/logo.png" 
							alt="Portal Qur'an" 
							class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-gold border-2 border-quran-gold/50 bg-quran-dark"
						/>
						<div class="absolute -bottom-1 -right-1 p-0.5 bg-quran-gold rounded-full text-quran-dark shadow-sm">
							<Sparkles class="w-2.5 h-2.5" />
						</div>
					</div>

					<div class="min-w-0 flex-1 pr-6">
						<div class="flex items-center gap-1.5">
							<h3 id="install-app-title" class="font-black text-base sm:text-lg text-white tracking-tight truncate">
								Portal Qur'an
							</h3>
							<span class="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-quran-gold text-quran-dark uppercase font-mono">
								APP
							</span>
						</div>
						<p class="text-[11px] text-quran-goldLight mt-0.5 truncate">
							Aplikasi Ringan & Bebas Iklan
						</p>
					</div>
				</div>
			</div>

			<!-- 2. Body Scrollable Content -->
			<div class="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">

				<!-- Notification Alert if message is present -->
				{#if alertMessage}
					<div class="p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-150 {
						alertType === 'success' 
							? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
							: alertType === 'warning'
							? 'bg-amber-50 text-amber-900 border border-amber-200'
							: 'bg-quran-sand text-quran-dark border border-quran-border'
					}">
						<Info class="w-4 h-4 flex-shrink-0 mt-0.5 text-quran-goldDark" />
						<span class="leading-snug">{alertMessage}</span>
					</div>
				{/if}

				<!-- MAIN CTA BUTTON -->
				{#if !$isAppInstalled}
					<div class="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-quran-sand via-quran-cream to-quran-sand border border-quran-gold/40 shadow-sm space-y-2.5">
						<div class="flex items-center justify-between text-xs sm:text-sm font-bold text-quran-dark">
							<span class="flex items-center gap-1.5">
								<ArrowDownToLine class="w-4 h-4 text-quran-goldDark" />
								Pasang Aplikasi Sekarang
							</span>
							<span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
								Gratis
							</span>
						</div>

						<p class="text-xs text-quran-warm leading-relaxed">
							Nikmati akses satu klik, tampilan layar penuh tanpa URL bar, dan performa lebih cepat.
						</p>

						<button
							on:click={handleInstallClick}
							disabled={isInstalling}
							class="w-full py-3 px-4 min-h-[46px] rounded-xl bg-gradient-luxury text-quran-gold hover:brightness-110 active:scale-[0.98] font-bold text-xs sm:text-sm shadow-gold flex items-center justify-center gap-2 transition-all cursor-pointer border border-quran-gold/50"
						>
							<Download class="w-4 h-4 text-quran-gold flex-shrink-0" />
							<span>{isInstalling ? 'Memproses...' : 'Download & Install App'}</span>
						</button>
					</div>
				{:else}
					<!-- Already installed state -->
					<div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
						<CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
						<div class="text-xs leading-relaxed">
							<div class="font-bold text-emerald-900">Aplikasi Sudah Terpasang!</div>
							<p class="text-emerald-800/90 mt-0.5">Siap dibuka langsung dari Home Screen atau menu aplikasi HP Anda.</p>
						</div>
					</div>
				{/if}

				<!-- Device Specific Instructions -->
				<div class="space-y-2 pt-1">
					<span class="text-[11px] font-bold text-quran-chocolate uppercase tracking-wider block">
						Panduan Pemasangan:
					</span>

					<!-- Clean Tabs -->
					<div class="grid grid-cols-3 gap-1 p-1 bg-quran-sand rounded-xl border border-quran-border text-xs">
						<button
							on:click={() => activeTab = 'android'}
							class="py-1.5 px-2 rounded-lg font-bold transition text-center flex items-center justify-center gap-1 {activeTab === 'android' ? 'bg-quran-primary text-quran-gold shadow-sm' : 'text-quran-chocolate hover:text-quran-dark'}"
						>
							<Smartphone class="w-3.5 h-3.5" />
							<span>Android</span>
						</button>
						<button
							on:click={() => activeTab = 'ios'}
							class="py-1.5 px-2 rounded-lg font-bold transition text-center flex items-center justify-center gap-1 {activeTab === 'ios' ? 'bg-quran-primary text-quran-gold shadow-sm' : 'text-quran-chocolate hover:text-quran-dark'}"
						>
							<span class="font-mono text-xs">iOS</span>
							<span>iPhone</span>
						</button>
						<button
							on:click={() => activeTab = 'desktop'}
							class="py-1.5 px-2 rounded-lg font-bold transition text-center flex items-center justify-center gap-1 {activeTab === 'desktop' ? 'bg-quran-primary text-quran-gold shadow-sm' : 'text-quran-chocolate hover:text-quran-dark'}"
						>
							<Laptop class="w-3.5 h-3.5" />
							<span>Laptop</span>
						</button>
					</div>

					<!-- Tab Contents -->
					{#if activeTab === 'android'}
						<div class="p-3 rounded-xl bg-quran-sand/70 border border-quran-border text-xs text-quran-dark space-y-2 animate-in fade-in duration-150">
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
								<div class="leading-tight font-medium">Tekan tombol <strong>"Download & Install App"</strong> di atas.</div>
							</div>
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
								<div class="leading-tight font-medium">Atau tekan menu titik tiga <strong>(⋮)</strong> di Chrome lalu pilih <strong>"Install App"</strong> / <strong>"Tambahkan ke Layar Utama"</strong>.</div>
							</div>
						</div>
					{:else if activeTab === 'ios'}
						<div class="p-3 rounded-xl bg-quran-sand/70 border border-quran-border text-xs text-quran-dark space-y-2 animate-in fade-in duration-150">
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
								<div class="leading-tight font-medium">Buka di browser Safari, tekan tombol <strong>Bagikan (Share)</strong> <Share2 class="w-3 h-3 inline text-quran-primary mx-0.5" />.</div>
							</div>
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
								<div class="leading-tight font-medium">Pilih opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare class="w-3 h-3 inline text-quran-primary mx-0.5" />.</div>
							</div>
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
								<div class="leading-tight font-medium">Tekan tombol <strong>"Tambah" (Add)</strong> di pojok kanan atas.</div>
							</div>
						</div>
					{:else}
						<div class="p-3 rounded-xl bg-quran-sand/70 border border-quran-border text-xs text-quran-dark space-y-2 animate-in fade-in duration-150">
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
								<div class="leading-tight font-medium"><strong>Chrome / Edge:</strong> Klik tombol download di atas atau klik ikon <strong>Install Aplikasi</strong> <Download class="w-3 h-3 inline text-quran-primary mx-0.5" /> di address bar browser.</div>
							</div>
							<div class="flex items-start gap-2">
								<div class="w-4 h-4 rounded-full bg-quran-primary text-quran-gold font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
								<div class="leading-tight font-medium"><strong>Safari macOS:</strong> Menu <strong>File</strong> $\rightarrow$ <strong>"Add to Dock..."</strong>.</div>
							</div>
						</div>
					{/if}
				</div>

			</div>

			<!-- 3. Footer Action -->
			<div class="p-3 sm:p-4 bg-quran-sand/50 border-t border-quran-border/60 flex items-center justify-between flex-shrink-0">
				<span class="text-[11px] text-quran-warm">Portal Qur'an Ecosystem v3.3</span>
				<button
					on:click={closeModal}
					class="px-4 py-1.5 rounded-xl text-xs font-bold text-quran-dark bg-quran-surface hover:bg-quran-beige border border-quran-border transition cursor-pointer shadow-sm"
				>
					Tutup
				</button>
			</div>

		</div>
	</div>
{/if}
