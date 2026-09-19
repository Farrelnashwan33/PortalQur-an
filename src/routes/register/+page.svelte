<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoginPage from '../login/+page.svelte';
	import AdminLoginPage from '../admin/login/+page.svelte';

	let isAdminHost = false;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const host = window.location.hostname.toLowerCase();
			if (host.startsWith('admin.') || host.startsWith('admin-') || host.includes('admin-portalquran')) {
				isAdminHost = true;
				goto('/admin/login');
			}
		}
	});
</script>

<svelte:head>
	<title>{isAdminHost ? 'Admin Portal Login - Portal Qur\'an' : 'Daftar Akun Baru - Portal Qur\'an v3.3'}</title>
</svelte:head>

{#if isAdminHost}
	<AdminLoginPage />
{:else}
	<LoginPage isRegisterMode={true} />
{/if}
