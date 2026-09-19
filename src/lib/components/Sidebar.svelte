<script lang="ts">
	import { page } from '$app/stores';
	import { authStore, isAdmin } from '$lib/stores/auth';
	import { pwaStore, isAppInstalled } from '$lib/stores/pwa';
	import { 
		LayoutDashboard, 
		BookOpen, 
		FileText, 
		Headphones, 
		CalendarDays, 
		Compass, 
		BookmarkCheck, 
		BarChart3, 
		User, 
		LogOut,
		ShieldCheck,
		Sparkles,
		Smartphone
	} from 'lucide-svelte';

	export let isMobileOpen: boolean = false;
	export let onCloseMobile: () => void = () => {};

	const navItems = [
		{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Baca Al-Qur\'an', href: '/quran', icon: BookOpen },
		{ name: 'Tafsir Ringkas', href: '/quran?mode=tafsir', icon: FileText },
		{ name: 'Audio Murattal', href: '/quran?mode=audio', icon: Headphones },
		{ name: 'Agenda Kajian', href: '/agenda', icon: CalendarDays },
		{ name: 'Topik Quran', href: '/topik', icon: Compass },
		{ name: 'Koleksi & Catatan', href: '/koleksi', icon: BookmarkCheck },
		{ name: 'Statistik Bacaan', href: '/statistics', icon: BarChart3 },
		{ name: 'Profil Saya', href: '/profile', icon: User }
	];
	function isItemActive(href: string, pathname: string, search: string, mode: string | null) {
		const fullUrl = pathname + search;
		if (href.includes('?')) {
			return fullUrl === href;
		}
		if (href === '/quran') {
			return (pathname === '/quran' || pathname.startsWith('/quran/')) && !['tafsir', 'audio'].includes(mode || '');
		}
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<!-- Mobile Overlay -->
{#if isMobileOpen}
	<div 
		class="fixed inset-0 z-40 bg-quran-dark/60 backdrop-blur-sm lg:hidden transition-opacity"
		on:click={onCloseMobile}
		on:keydown={(e) => e.key === 'Escape' && onCloseMobile()}
		role="button"
		tabindex="0"
		aria-label="Tutup Navigasi"
	></div>
{/if}

<aside class="
	fixed top-0 bottom-0 left-0 z-40 w-64 bg-quran-surface border-r border-quran-border/60 flex flex-col justify-between
	transition-transform duration-300 ease-in-out lg:translate-x-0
	{isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
">
	<!-- Top: Logo & Brand -->
	<div>
		<div class="h-16 px-6 flex items-center gap-3 border-b border-quran-border/60 bg-quran-sand/50">
			<img 
				src="/logo.png" 
				alt="Portal Qur'an Logo" 
				class="w-9 h-9 rounded-full object-cover shadow-gold border border-quran-gold/40 flex-shrink-0"
			/>
			<div>
				<div class="flex items-center gap-1.5">
					<span class="font-bold text-sm text-quran-dark tracking-tight">Portal Qur'an</span>
					<span class="text-[9px] font-extrabold px-1 rounded bg-quran-gold/20 text-quran-dark border border-quran-gold/40">v3.3</span>
				</div>
				<p class="text-[10px] text-quran-warm font-medium">Digital Quran Ecosystem</p>
			</div>
		</div>

		<!-- Navigation Links -->
		<nav class="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
			<div class="px-3 py-1.5 text-[10px] font-bold text-quran-muted uppercase tracking-wider">
				Menu Utama
			</div>

			{#each navItems as item}
				{@const active = isItemActive(item.href, $page.url.pathname, $page.url.search, $page.url.searchParams.get('mode'))}
				<a
					href={item.href}
					on:click={onCloseMobile}
					class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group {
						active 
							? 'bg-gradient-luxury text-quran-cream shadow-md' 
							: 'text-quran-dark hover:bg-quran-cream/70 hover:text-quran-chocolate'
					}"
				>
					<svelte:component 
						this={item.icon} 
						class="w-4 h-4 transition-transform group-hover:scale-110 {active ? 'text-quran-gold' : 'text-quran-warm'}" 
					/>
					<span>{item.name}</span>
				</a>
			{/each}

			{#if !$isAppInstalled}
				<div class="pt-2">
					<button
						on:click={() => {
							onCloseMobile();
							pwaStore.openModal();
						}}
						class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-quran-dark bg-gradient-to-r from-quran-sand to-quran-cream hover:from-quran-cream hover:to-quran-beige/80 border border-quran-gold/40 hover:shadow-gold transition-all group text-left cursor-pointer"
					>
						<Smartphone class="w-4 h-4 text-quran-primary group-hover:scale-110 transition-transform" />
						<div class="flex-1">
							<span class="font-bold text-quran-dark block">Download App</span>
							<span class="text-[10px] text-quran-warm block">Install ke perangkat</span>
						</div>
					</button>
				</div>
			{/if}

			{#if $isAdmin}
				<div class="pt-2">
					<div class="px-3 py-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
						Panel Admin
					</div>
					<a
						href="https://admin-portalquran.vercel.app"
						on:click={onCloseMobile}
						class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100/70 border border-amber-300 hover:bg-amber-200/70 transition shadow-sm"
					>
						<ShieldCheck class="w-4 h-4 text-amber-700" />
						<span>Admin Dashboard</span>
					</a>
				</div>
			{/if}
		</nav>
	</div>

	<!-- Bottom: Khatam Booster Card & Logout -->
	<div class="p-3 border-t border-quran-border/60 bg-quran-cream/40">
		<div class="p-3 rounded-xl bg-gradient-to-br from-quran-sand to-quran-cream border border-quran-gold/40 mb-2">
			<div class="flex items-center gap-2 text-xs font-bold text-quran-chocolate mb-1">
				<Sparkles class="w-3.5 h-3.5 text-quran-gold" />
				<span>Target Harian</span>
			</div>
			<p class="text-[11px] text-quran-warm leading-tight">
				Baca minimal 10 ayat hari ini untuk menjaga istiqomah.
			</p>
		</div>

		<button
			on:click={() => {
				onCloseMobile();
				authStore.logout();
			}}
			class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition border border-transparent hover:border-red-200"
		>
			<LogOut class="w-4 h-4" />
			<span>Keluar Akun</span>
		</button>
	</div>
</aside>
