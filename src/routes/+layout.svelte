<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore, authInitialized } from '$lib/stores/auth';
	import { audioStore } from '$lib/stores/audio';
	import { pwaStore } from '$lib/stores/pwa';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import ReaderSettingsDrawer from '$lib/components/ReaderSettingsDrawer.svelte';
	import InstallAppModal from '$lib/components/InstallAppModal.svelte';
	import PWAUpdateToast from '$lib/components/PWAUpdateToast.svelte';

	let isMobileMenuOpen = false;
	let isSearchOpen = false;
	let isSettingsOpen = false;

	onMount(() => {
		authStore.init();

		// Initialize PWA store (handles installation prompt, update checking, SW lifecycle)
		pwaStore.init();

		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				isSearchOpen = !isSearchOpen;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});

	// Route identification
	$: isAuthRoute = $page.url.pathname === '/login' || $page.url.pathname === '/register' || $page.url.pathname === '/admin/login' || $page.url.pathname === '/';
	$: isAdminRoute = $page.url.pathname.startsWith('/admin');

	// Authentication & Role Route Guard
	$: if ($authInitialized && typeof window !== 'undefined') {
		const currentPath = $page.url.pathname;
		const host = window.location.hostname.toLowerCase();
		const isAdminHost = host.startsWith('admin.') || host.startsWith('admin-') || host.includes('admin-portalquran');

		// 1. If accessing via dedicated Admin domain
		if (isAdminHost) {
			if (!$authStore) {
				if (currentPath !== '/admin/login') {
					goto('/admin/login');
				}
			} else if ($authStore.role !== 'admin') {
				// Customer cannot access admin domain
				if (currentPath !== '/admin/login') {
					goto('/admin/login');
				}
			} else if (currentPath === '/' || currentPath === '/login' || currentPath === '/admin/login') {
				goto('/admin');
			}
		} 
		// 2. If accessing via regular customer domain
		else {
			// If not authenticated
			if (!$authStore) {
				if (currentPath.startsWith('/admin')) {
					if (currentPath !== '/admin/login') {
						goto('/admin/login');
					}
				} else if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
					goto('/login');
				}
			} 
			// If authenticated customer trying to access /admin
			else if ($authStore.role === 'customer' && isAdminRoute) {
				goto('/quran');
			}
			// If authenticated and on auth pages -> redirect to appropriate home
			else if (currentPath === '/login' || currentPath === '/register' || (currentPath === '/admin/login' && $authStore.role === 'admin')) {
				if ($authStore.role === 'admin') {
					goto('/admin');
				} else {
					goto('/quran');
				}
			}
		}
	}
</script>

<svelte:head>
	<title>Portal Qur'an v3.3 - Temukan Ketenangan Dalam Setiap Ayat</title>
</svelte:head>

{#if isAuthRoute && !$authStore}
	<!-- Auth pages (Split-screen login / register) shown when not authenticated -->
	<main class="min-h-screen">
		<slot />
	</main>
{:else if isAdminRoute && $authStore?.role === 'admin'}
	<!-- Admin Dashboard Layout (Strict Admin Role) -->
	<div class="min-h-screen bg-quran-cream">
		<slot />
	</div>
{:else if $authStore}
	<!-- Standard Customer Quran Dashboard & Reader Layout -->
	<div class="min-h-screen bg-quran-cream flex flex-col">
		
		<!-- Desktop Sidebar -->
		<Sidebar 
			isMobileOpen={isMobileMenuOpen} 
			onCloseMobile={() => isMobileMenuOpen = false} 
		/>

		<!-- Main Content Wrapper with Sidebar offset on Desktop -->
		<div class="lg:pl-64 flex-1 flex flex-col transition-all min-w-0 max-w-full overflow-x-hidden">
			
			<!-- Navbar -->
			<Navbar 
				onOpenSearch={() => isSearchOpen = true}
				onOpenSettings={() => isSettingsOpen = true}
				onToggleMobileMenu={() => isMobileMenuOpen = !isMobileMenuOpen}
			/>

			<!-- Page Body with dynamic padding when floating audio player is active -->
			<main class="flex-1 {$audioStore.isVisible && $audioStore.audioUrl ? 'pb-48 lg:pb-24' : 'pb-32 lg:pb-12'} min-w-0 transition-all">
				<slot />
			</main>

			<!-- Mobile Bottom Navigation -->
			<MobileNav />
		</div>

		<!-- Global Audio Murattal Floating Bar -->
		<AudioPlayer />

		<!-- Global Modals & Drawers -->
		<SearchModal 
			isOpen={isSearchOpen} 
			onClose={() => isSearchOpen = false} 
		/>

		<ReaderSettingsDrawer 
			isOpen={isSettingsOpen} 
			onClose={() => isSettingsOpen = false} 
		/>
	</div>
{:else}
	<!-- Fallback loading during auth initial check -->
	<main class="min-h-screen flex items-center justify-center bg-quran-cream">
		<slot />
	</main>
{/if}

<!-- Global PWA Installation Modal & Update Toast -->
<InstallAppModal />
<PWAUpdateToast />

