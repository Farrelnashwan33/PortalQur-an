<script lang="ts">
	import { page } from '$app/stores';
	import { 
		LayoutDashboard, 
		BookOpen, 
		Headphones, 
		Compass, 
		User 
	} from 'lucide-svelte';

	const mobileTabs = [
		{ name: 'Home', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Qur\'an', href: '/quran', icon: BookOpen },
		{ name: 'Audio', href: '/quran?mode=audio', icon: Headphones },
		{ name: 'Topik', href: '/topik', icon: Compass },
		{ name: 'Profil', href: '/profile', icon: User }
	];

	function isTabActive(href: string, pathname: string, search: string, mode: string | null) {
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

<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-quran-surface/95 backdrop-blur-md border-t border-quran-border/70 px-1 py-1 sm:px-2 sm:py-1.5 shadow-lg pb-[env(safe-area-inset-bottom,0.25rem)]">
	<div class="max-w-md mx-auto flex items-center justify-around">
		{#each mobileTabs as tab}
			{@const active = isTabActive(tab.href, $page.url.pathname, $page.url.search, $page.url.searchParams.get('mode'))}
			<a
				href={tab.href}
				class="flex flex-col items-center justify-center py-1 px-0.5 sm:px-3 rounded-xl transition-all flex-1 min-w-0 {
					active ? 'text-quran-dark font-bold' : 'text-quran-warm hover:text-quran-chocolate'
				}"
			>
				<div class="p-1 rounded-lg transition-transform {active ? 'bg-quran-gold/20 scale-105' : ''}">
					<svelte:component this={tab.icon} class="w-4 h-4 sm:w-5 sm:h-5 {active ? 'text-quran-primary' : 'text-quran-muted'}" />
				</div>
				<span class="text-[10px] sm:text-xs font-semibold mt-0.5 tracking-tight truncate max-w-full">{tab.name}</span>
			</a>
		{/each}
	</div>
</nav>
