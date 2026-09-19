<script lang="ts">
	import { authStore, isAdmin } from '$lib/stores/auth';
	import { audioStore } from '$lib/stores/audio';
	import { qariStore } from '$lib/stores/qaris';
	import { QARI_LIST } from '$lib/data/surahList';
	import { progressStore } from '$lib/stores/progress';
	import { pwaStore, isAppInstalled } from '$lib/stores/pwa';
	import { 
		BookOpen, 
		Flame, 
		Volume2, 
		ShieldCheck, 
		User, 
		LogOut, 
		Search, 
		Calendar, 
		Menu,
		SlidersHorizontal,
		Headphones,
		ChevronDown,
		Smartphone,
		Download
	} from 'lucide-svelte';

	export let onOpenSearch: () => void = () => {};
	export let onOpenSettings: () => void = () => {};
	export let onToggleMobileMenu: () => void = () => {};

	const stats = progressStore.stats;
	let userDropdownOpen = false;
	let qariNavDropdownOpen = false;

	$: availableQaris = ($qariStore && $qariStore.length > 0 ? $qariStore : QARI_LIST).filter(q => q.is_active !== false);

	// Calculate Today's Hijri Date Estimate
	function getIslamicDate() {
		return '14 Rabi\'ul Awwal 1448 H';
	}
</script>

<header class="sticky top-0 z-30 bg-quran-surface/90 backdrop-blur-md border-b border-quran-border/60 transition-all">
	<div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-4">
		
		<!-- Left: Mobile Menu Toggle & Brand Mobile -->
		<div class="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-shrink">
			<button 
				on:click={onToggleMobileMenu}
				class="lg:hidden p-1.5 rounded-xl text-quran-dark hover:bg-quran-beige/50 transition flex-shrink-0"
				aria-label="Buka Menu"
			>
				<Menu class="w-5 h-5" />
			</button>

			<a href="/quran" class="flex items-center gap-1.5 sm:gap-2.5 group min-w-0">
				<img 
					src="/logo.png" 
					alt="Portal Qur'an Logo" 
					class="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover shadow-gold border border-quran-gold/40 group-hover:scale-105 transition-transform flex-shrink-0" 
				/>
				<div class="leading-tight min-w-0">
					<div class="flex items-center gap-1">
						<span class="font-bold text-sm sm:text-base md:text-lg text-quran-dark tracking-tight truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">Portal Qur'an</span>
						<span class="hidden md:inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-quran-gold/20 text-quran-dark border border-quran-gold/40">v3.3</span>
					</div>
					<p class="text-xs text-quran-warm font-medium hidden lg:block">Ketenangan Dalam Setiap Ayat</p>
				</div>
			</a>
		</div>

		<!-- Center: Hijri Date Badge & Quick Search Trigger -->
		<div class="hidden md:flex items-center gap-3">
			<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-quran-sand border border-quran-border text-xs text-quran-chocolate font-medium">
				<Calendar class="w-3.5 h-3.5 text-quran-gold" />
				<span>{getIslamicDate()}</span>
			</div>

			<button 
				on:click={onOpenSearch}
				class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-quran-cream border border-quran-border text-xs text-quran-warm hover:border-quran-gold hover:text-quran-dark transition group shadow-sm"
			>
				<Search class="w-3.5 h-3.5 text-quran-gold group-hover:scale-110 transition-transform" />
				<span>Cari surah, ayat, atau topik...</span>
				<kbd class="ml-2 px-1.5 py-0.5 rounded bg-quran-beige text-[10px] font-mono text-quran-dark">⌘K</kbd>
			</button>
		</div>

		<!-- Right: Quick Actions & Profile -->
		<div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
			
			<!-- Download Apps Button -->
			{#if !$isAppInstalled}
				<button 
					on:click={() => pwaStore.openModal()}
					class="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-quran-sand to-quran-cream hover:from-quran-cream hover:to-quran-beige/80 border border-quran-gold/40 text-quran-dark text-xs font-bold hover:shadow-gold transition-all duration-200 group cursor-pointer flex-shrink-0"
					title="Download & Install Aplikasi Portal Qur'an"
					aria-label="Download Aplikasi"
				>
					<div class="w-4 h-4 rounded-lg bg-quran-gold/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-quran-primary group-hover:text-quran-gold transition-all">
						<Smartphone class="w-3.5 h-3.5 text-quran-dark group-hover:text-quran-gold" />
					</div>
					<span class="hidden xs:inline font-bold tracking-tight text-quran-dark text-xs">App</span>
					<span class="hidden sm:inline font-bold tracking-tight text-quran-dark text-xs">Download</span>
				</button>
			{/if}

			<!-- Reading Streak Badge -->
			<a 
				href="/statistics"
				class="flex items-center gap-1 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-100/70 to-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:shadow-gold transition flex-shrink-0"
				title="Streak Membaca"
			>
				<Flame class="w-3.5 h-3.5 text-orange-600 fill-orange-500 flex-shrink-0" />
				<span class="text-xs font-bold">{$stats.current_streak_days}<span class="hidden sm:inline"> Hari</span></span>
			</a>

			<!-- Pilihan Audio / Qari Quick Trigger in Navbar -->
			<div class="relative">
				<button 
					on:click={() => qariNavDropdownOpen = !qariNavDropdownOpen}
					class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition shadow-sm {$audioStore.isPlaying ? 'bg-quran-primary text-quran-gold border-quran-gold shadow-gold' : 'bg-quran-sand border-quran-border text-quran-chocolate hover:border-quran-gold hover:text-quran-dark'}"
					title="Pilih Syeikh / Audio Qari"
					aria-label="Pilih Syeikh / Audio Qari"
				>
					<Headphones class="w-3.5 h-3.5 {$audioStore.isPlaying ? 'text-quran-gold animate-pulse' : 'text-quran-gold'}" />
					<span class="max-w-[90px] truncate font-semibold">{$audioStore.currentQari.name.split(' ')[0]}</span>
					<ChevronDown class="w-3 h-3 {$audioStore.isPlaying ? 'text-quran-goldLight' : 'text-quran-warm'}" />
				</button>

				{#if qariNavDropdownOpen}
					<div 
						class="fixed inset-0 z-40" 
						on:click={() => qariNavDropdownOpen = false}
						on:keydown={(e) => e.key === 'Escape' && (qariNavDropdownOpen = false)}
						role="button"
						tabindex="0"
						aria-label="Tutup Qari Menu"
					></div>
					<div class="absolute right-0 mt-2 w-64 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-luxury-hover border border-quran-border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
						<div class="px-2.5 py-1.5 text-[10px] font-bold text-quran-chocolate uppercase border-b border-quran-border/60 tracking-wider">
							Pilihan Syeikh / Audio Qari
						</div>
						{#each availableQaris as qari}
							<button 
								on:click={() => {
									audioStore.setQari(qari);
									qariNavDropdownOpen = false;
								}}
								class="w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between {$audioStore.currentQari.id === qari.id ? 'bg-quran-primary text-quran-gold font-bold' : 'text-quran-dark hover:bg-quran-sand/60'}"
							>
								<div class="truncate mr-2">
									<div class="font-medium truncate">{qari.name}</div>
									<div class="arabic-text text-[10px] text-quran-warm opacity-80">{qari.arabic_name}</div>
								</div>
								{#if $audioStore.currentQari.id === qari.id}
									<span class="text-[10px] text-quran-gold font-bold px-1.5 py-0.5 rounded bg-quran-gold/20 border border-quran-gold/40">Aktif</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Reader Settings Quick Button -->
			<button 
				on:click={onOpenSettings}
				class="p-1.5 sm:p-2 rounded-xl text-quran-chocolate hover:bg-quran-beige/60 transition flex-shrink-0"
				title="Pengaturan Tampilan & Font"
			>
				<SlidersHorizontal class="w-4 h-4 text-quran-dark" />
			</button>

			<!-- Admin Badge Link (if role admin) -->
			{#if $isAdmin}
				<a 
					href="/admin" 
					class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-quran-dark text-quran-gold text-xs font-semibold border border-quran-gold/40 hover:shadow-gold transition"
				>
					<ShieldCheck class="w-3.5 h-3.5" />
					<span>Admin Panel</span>
				</a>
			{/if}

			<!-- User Profile Dropdown -->
			<div class="relative flex-shrink-0">
				<button 
					on:click={() => userDropdownOpen = !userDropdownOpen}
					class="flex items-center p-1 rounded-xl hover:bg-quran-beige/50 border border-transparent hover:border-quran-border transition cursor-pointer"
					aria-label="Menu Pengguna"
				>
					{#if $authStore?.avatar_url}
						<img 
							src={$authStore.avatar_url} 
							alt="PP" 
							class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-sm border border-quran-gold/50" 
						/>
					{:else}
						<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-quran-primary text-quran-gold flex items-center justify-center font-bold text-xs shadow-sm">
							{$authStore ? $authStore.full_name.charAt(0).toUpperCase() : 'U'}
						</div>
					{/if}
				</button>

				{#if userDropdownOpen}
					<!-- Backdrop -->
					<div 
						class="fixed inset-0 z-40" 
						on:click={() => userDropdownOpen = false}
						on:keydown={(e) => e.key === 'Escape' && (userDropdownOpen = false)}
						role="button"
						tabindex="0"
						aria-label="Tutup Menu"
					></div>

					<!-- Dropdown menu -->
					<div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury-hover border border-quran-border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
						<div class="px-3 py-2 border-b border-quran-border/60">
							<p class="font-semibold text-xs text-quran-dark truncate">
								{$authStore?.full_name || 'Hamba Allah'}
							</p>
							<p class="text-[11px] text-quran-warm font-mono truncate">
								{$authStore?.phone || $authStore?.email || '081234567890'}
							</p>
							<span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full {$authStore?.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-quran-cream text-quran-chocolate'}">
								Role: {$authStore?.role || 'customer'}
							</span>
						</div>

						<div class="py-1">
							<button 
								on:click={() => {
									userDropdownOpen = false;
									pwaStore.openModal();
								}}
								class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-quran-dark rounded-xl hover:bg-quran-cream transition text-left cursor-pointer"
							>
								<Smartphone class="w-4 h-4 text-quran-gold" />
								<span>Download & Install App</span>
							</button>
							<a 
								href="/dashboard" 
								on:click={() => userDropdownOpen = false}
								class="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-quran-dark rounded-xl hover:bg-quran-cream transition"
							>
								<User class="w-4 h-4 text-quran-warm" />
								<span>Customer Dashboard</span>
							</a>
							<a 
								href="/profile" 
								on:click={() => userDropdownOpen = false}
								class="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-quran-dark rounded-xl hover:bg-quran-cream transition"
							>
								<User class="w-4 h-4 text-quran-warm" />
								<span>Profil & Target</span>
							</a>
							{#if $isAdmin}
								<a 
									href="/admin" 
									on:click={() => userDropdownOpen = false}
									class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-quran-dark bg-amber-50/60 rounded-xl hover:bg-amber-100/60 transition"
								>
									<ShieldCheck class="w-4 h-4 text-amber-700" />
									<span>Admin Dashboard</span>
								</a>
							{/if}
						</div>

						<div class="pt-1 border-t border-quran-border/60">
							<button 
								on:click={() => {
									userDropdownOpen = false;
									authStore.logout();
								}}
								class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-700 rounded-xl hover:bg-red-50 transition"
							>
								<LogOut class="w-4 h-4" />
								<span>Keluar</span>
							</button>
						</div>
					</div>
				{/if}
			</div>

		</div>
	</div>
</header>
