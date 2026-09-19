<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import { 
		LayoutDashboard, 
		Users, 
		BookOpen, 
		Headphones, 
		FileText, 
		CalendarDays, 
		Compass, 
		BarChart3, 
		Settings, 
		LogOut,
		ExternalLink,
		ShieldCheck,
		Activity,
		Database,
		X
	} from 'lucide-svelte';

	export let isMobileOpen: boolean = false;
	export let onCloseMobile: () => void = () => {};

	const adminNavItems = [
		{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
		{ name: 'User Management', href: '/admin/users', icon: Users },
		{ name: 'Quran Management', href: '/admin/quran', icon: BookOpen },
		{ name: 'Audio Management', href: '/admin/audio', icon: Headphones },
		{ name: 'Tafsir & Terjemahan', href: '/admin/tafsir', icon: FileText },
		{ name: 'Agenda Management', href: '/admin/agenda', icon: CalendarDays },
		{ name: 'Topik Management', href: '/admin/topics', icon: Compass },
		{ name: 'Statistik Bacaan', href: '/admin/statistics', icon: BarChart3 },
		{ name: 'Pengaturan Sistem', href: '/admin/settings', icon: Settings }
	];
</script>

<!-- Mobile Overlay -->
{#if isMobileOpen}
	<div 
		class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
		on:click={onCloseMobile}
		on:keydown={(e) => e.key === 'Escape' && onCloseMobile()}
		role="button"
		tabindex="0"
		aria-label="Tutup Admin Menu"
	></div>
{/if}

<aside class="
	fixed top-0 bottom-0 left-0 z-40 w-64 bg-quran-dark text-quran-cream border-r border-quran-chocolate flex flex-col justify-between
	transition-transform duration-300 ease-in-out lg:translate-x-0
	{isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
">
	<!-- Top: Admin Brand Header -->
	<div>
		<div class="h-16 px-6 flex items-center justify-between border-b border-quran-chocolate bg-quran-dark/80">
			<div class="flex items-center gap-3">
				<img 
					src="/logo.png" 
					alt="Portal Qur'an Logo" 
					class="w-9 h-9 rounded-full object-cover shadow-gold border border-amber-400/40 flex-shrink-0"
				/>
				<div>
					<div class="flex items-center gap-1.5">
						<span class="font-extrabold text-sm text-white tracking-tight">Admin Portal</span>
						<span class="text-[9px] font-extrabold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">v3.3</span>
					</div>
					<p class="text-[10px] text-quran-goldLight">Remote Management</p>
				</div>
			</div>

			<button on:click={onCloseMobile} class="lg:hidden p-1 text-quran-goldLight hover:text-white" aria-label="Tutup Navigasi">
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Admin Navigation Items -->
		<nav class="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
			<div class="px-3 py-1.5 text-[10px] font-bold text-quran-muted uppercase tracking-wider">
				Menu Manajemen
			</div>

			{#each adminNavItems as item}
				{@const active = $page.url.pathname === item.href}
				<a
					href={item.href}
					on:click={onCloseMobile}
					class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group {
						active 
							? 'bg-gradient-gold text-quran-dark font-bold shadow-gold' 
							: 'text-quran-cream hover:bg-quran-chocolate/60 hover:text-white'
					}"
				>
					<svelte:component 
						this={item.icon} 
						class="w-4 h-4 transition-transform group-hover:scale-110 {active ? 'text-quran-dark' : 'text-quran-gold'}" 
					/>
					<span>{item.name}</span>
				</a>
			{/each}
		</nav>
	</div>

	<!-- Bottom: System Status & User Return -->
	<div class="p-3 border-t border-quran-chocolate bg-quran-dark/95 space-y-2">
		<!-- System Live Indicator -->
		<div class="p-2.5 rounded-xl bg-quran-chocolate/50 border border-quran-warm/20 text-xs">
			<div class="flex items-center justify-between text-[11px] font-bold text-quran-goldLight mb-1">
				<span class="flex items-center gap-1.5">
					<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
					<span>Server & Database</span>
				</span>
				<span class="text-emerald-400 text-[10px]">Normal (99.9%)</span>
			</div>
			<p class="text-[10px] text-quran-muted">Sinkronisasi Supabase Aktif</p>
		</div>

		<!-- Back to Customer Quran view -->
		<a
			href="/quran"
			class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-quran-gold hover:bg-quran-chocolate transition border border-quran-gold/30"
		>
			<BookOpen class="w-4 h-4" />
			<span>Lihat Website Utama</span>
		</a>

		<button
			on:click={() => {
				onCloseMobile();
				authStore.logoutAdmin();
			}}
			class="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
		>
			<LogOut class="w-4 h-4" />
			<span>Keluar Admin</span>
		</button>
	</div>
</aside>
