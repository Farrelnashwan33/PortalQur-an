<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import LoginPage from './login/+page.svelte';

	onMount(() => {
		if ($authStore) {
			if ($authStore.role === 'admin') {
				goto('/admin');
			} else {
				goto('/quran');
			}
		}
	});

	$: if ($authStore) {
		if ($authStore.role === 'admin') {
			goto('/admin');
		} else {
			goto('/quran');
		}
	}
</script>

{#if !$authStore}
	<!-- First time visitor: show Split-Screen Login page first -->
	<LoginPage />
{/if}
