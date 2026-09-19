<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, authInitialized } from '$lib/stores/auth';
	import LoginPage from './login/+page.svelte';
	import AdminLoginPage from './admin/login/+page.svelte';

	let isAdminHost = false;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const host = window.location.hostname.toLowerCase();
			isAdminHost = host.startsWith('admin.') || host.startsWith('admin-') || host.includes('admin-portalquran');
		}
	});

	$: if ($authInitialized) {
		if ($authStore) {
			if ($authStore.role === 'admin') {
				goto('/admin');
			} else {
				if (isAdminHost) {
					goto('/admin/login');
				} else {
					goto('/quran');
				}
			}
		} else if (isAdminHost) {
			goto('/admin/login');
		}
	}
</script>

{#if $authInitialized}
	{#if !$authStore}
		{#if isAdminHost}
			<AdminLoginPage />
		{:else}
			<!-- First time visitor: show Split-Screen Login page first -->
			<LoginPage />
		{/if}
	{/if}
{:else}
	<!-- Minimal luxury splash during instant session hydration (eliminates login flash) -->
	<div class="min-h-screen bg-quran-cream flex items-center justify-center">
		<div class="flex flex-col items-center gap-4 animate-in fade-in duration-300">
			<img src="/logo.png" alt="Portal Qur'an" class="w-16 h-16 rounded-full shadow-gold animate-float" />
			<div class="w-6 h-6 rounded-full border-2 border-quran-gold border-t-transparent animate-spin"></div>
		</div>
	</div>
{/if}


