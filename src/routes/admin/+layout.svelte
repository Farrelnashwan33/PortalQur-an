<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AdminSidebar from '$lib/components/AdminSidebar.svelte';
	import { authStore, isAdmin } from '$lib/stores/auth';
	import { Menu, ShieldCheck, User, Bell, ExternalLink } from 'lucide-svelte';

	let isMobileAdminOpen = false;

	// Route Protection
	$: if (browser && $page.url.pathname !== '/admin/login' && !$isAdmin) {
		goto('/admin/login');
	}
</script>

{#if $page.url.pathname === '/admin/login'}
	<slot />
{:else if $isAdmin}
	<div class="min-h-screen bg-quran-cream flex flex-col animate-in fade-in duration-150">
		
		<!-- Admin Sidebar -->
		<AdminSidebar 
			isMobileOpen={isMobileAdminOpen} 
			onCloseMobile={() => isMobileAdminOpen = false} 
		/>

		<!-- Admin Main Content Wrapper with Sidebar Offset -->
		<div class="lg:pl-64 flex-1 flex flex-col">
			
			<!-- Admin Top Header Bar -->
			<header class="sticky top-0 z-30 bg-quran-surface/90 backdrop-blur-md border-b border-quran-border/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
				
				<div class="flex items-center gap-3">
					<button 
						on:click={() => isMobileAdminOpen = true}
						class="lg:hidden p-2 rounded-xl text-quran-dark hover:bg-quran-sand transition"
						aria-label="Buka Menu Admin"
					>
						<Menu class="w-5 h-5" />
					</button>

					<div class="flex items-center gap-2.5">
						<img src="/logo.png" alt="Logo" class="w-7 h-7 rounded-full object-cover border border-amber-400/40 shadow-sm" />
						<span class="text-xs font-bold text-quran-chocolate">Portal Qur'an Admin Remote</span>
						<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
							Live
						</span>
					</div>
				</div>

				<!-- Admin profile badge -->
				<div class="flex items-center gap-3">
					<a 
						href="/quran" 
						class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-quran-sand border border-quran-border text-xs font-semibold text-quran-dark hover:bg-quran-beige transition"
					>
						<ExternalLink class="w-3.5 h-3.5 text-quran-gold" />
						<span>Pratinjau Pengguna</span>
					</a>

					<div class="flex items-center gap-2 pl-2 border-l border-quran-border">
						{#if $authStore?.avatar_url}
							<img 
								src={$authStore.avatar_url} 
								alt="Avatar" 
								class="w-8 h-8 rounded-xl object-cover border border-amber-400/50 shadow-gold flex-shrink-0" 
							/>
						{:else}
							<div class="w-8 h-8 rounded-xl bg-gradient-gold text-quran-dark font-extrabold text-xs flex items-center justify-center shadow-gold flex-shrink-0">
								{$authStore?.full_name ? $authStore.full_name.charAt(0).toUpperCase() : 'A'}
							</div>
						{/if}
						<div class="hidden sm:block text-left leading-tight">
							<div class="text-xs font-bold text-quran-dark">{$authStore?.full_name || 'Admin Utama'}</div>
							<div class="text-[10px] text-quran-warm font-mono">{$authStore?.email || 'admin@portalquran.id'}</div>
						</div>
					</div>
				</div>

			</header>

			<!-- Admin View Body -->
			<main class="flex-1 p-4 sm:p-6 lg:p-8">
				<slot />
			</main>

		</div>

	</div>
{:else}
	<!-- Unauthorized Redirecting View -->
	<div class="min-h-screen bg-[#1b1510] flex flex-col items-center justify-center text-quran-cream space-y-3">
		<div class="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
		<p class="text-xs text-amber-300/80 font-mono">Mengalihkan ke Portal Autentikasi Admin...</p>
	</div>
{/if}
