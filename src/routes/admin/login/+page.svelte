<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, isAdmin } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { 
		ShieldCheck, 
		Lock, 
		Mail, 
		ArrowRight, 
		AlertCircle, 
		Eye, 
		EyeOff, 
		BookOpen, 
		CheckCircle2, 
		ShieldAlert
	} from 'lucide-svelte';

	let adminEmail = 'admin@portalquran.id';
	let adminPassword = 'AdminQuran2026!';
	let showPassword = false;
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

	function fillDemoCredentials() {
		adminEmail = 'admin@portalquran.id';
		adminPassword = 'AdminQuran2026!';
	}

	onMount(() => {
		if ($isAdmin) {
			goto('/admin');
		}
	});

	$: if ($isAdmin) {
		goto('/admin');
	}

	async function handleAdminLogin() {
		errorMessage = '';
		successMessage = '';
		
		if (!adminEmail || !adminPassword) {
			errorMessage = 'Harap masukkan email dan kata sandi Admin.';
			return;
		}

		isLoading = true;
		try {
			const res = await authStore.loginAdmin(adminEmail, adminPassword);
			if (res.success) {
				successMessage = 'Autentikasi berhasil! Membuka Portal Admin...';
				setTimeout(() => {
					goto('/admin');
				}, 600);
			} else {
				errorMessage = res.error || 'Autentikasi gagal. Akun tidak memiliki hak Administrator.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'Terjadi kesalahan sistem.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Portal Login - Portal Qur'an</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-[#1b1510] via-[#241c14] to-[#120e0b] text-quran-cream flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-amber-500 selection:text-black">
	<!-- Background Pattern -->
	<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
	
	<!-- Top Bar -->
	<header class="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
		<div class="flex items-center gap-3">
			<img 
				src="/logo.png" 
				alt="Portal Qur'an Logo" 
				class="w-10 h-10 rounded-full object-cover shadow-gold border border-amber-400/40"
			/>
			<div>
				<div class="flex items-center gap-1.5">
					<span class="font-extrabold text-sm text-white tracking-tight">Portal Qur'an</span>
					<span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
						Admin System
					</span>
				</div>
				<p class="text-[10px] text-quran-goldLight">Akses Panel Pengelolaan & Database</p>
			</div>
		</div>

		<a
			href="/quran"
			class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-quran-goldLight hover:text-white transition backdrop-blur-sm"
		>
			<BookOpen class="w-3.5 h-3.5 text-quran-gold" />
			<span>Halaman Pengguna</span>
		</a>
	</header>

	<!-- Main Form Area -->
	<main class="relative z-10 max-w-md mx-auto w-full my-8">
		<div class="bg-[#2a2118]/90 backdrop-blur-xl rounded-3xl border border-amber-600/30 p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
			
			<!-- Security Badge Header -->
			<div class="text-center space-y-2">
				<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400/30 shadow-gold p-1 mb-1">
					<img 
						src="/logo.png" 
						alt="Logo" 
						class="w-full h-full rounded-full object-cover"
					/>
				</div>
				<h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
					Autentikasi Administrator
				</h1>
				<p class="text-xs text-quran-muted leading-relaxed">
					Portal khusus pengelola. Masuk menggunakan akun terverifikasi dengan hak role Admin.
				</p>
			</div>

			<!-- Demo Credentials Box -->
			<div class="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs space-y-2">
				<div class="flex items-center justify-between">
					<span class="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
						<ShieldCheck class="w-3.5 h-3.5 text-amber-400" />
						Kredensial Akun Administrator:
					</span>
					<button 
						type="button" 
						on:click={fillDemoCredentials}
						class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer"
					>
						⚡ Isi Otomatis
					</button>
				</div>
				<div class="grid grid-cols-1 gap-1 font-mono text-[11px] text-stone-300 bg-black/40 p-2.5 rounded-xl border border-amber-900/30">
					<div class="flex justify-between items-center">
						<span class="text-stone-400">Email:</span>
						<span class="text-amber-200 font-semibold select-all">admin@portalquran.id</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-stone-400">Password:</span>
						<span class="text-amber-200 font-semibold select-all">AdminQuran2026!</span>
					</div>
				</div>
			</div>

			<!-- Alerts -->
			{#if errorMessage}
				<div class="p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
					<AlertCircle class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
					<div class="leading-snug">{errorMessage}</div>
				</div>
			{/if}

			{#if successMessage}
				<div class="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
					<CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
					<div class="font-semibold">{successMessage}</div>
				</div>
			{/if}

			<!-- Login Form -->
			<form on:submit|preventDefault={handleAdminLogin} class="space-y-4">
				<!-- Admin Email -->
				<div>
					<label for="admin-email" class="block text-xs font-bold text-quran-goldLight uppercase tracking-wider mb-1.5">
						Email Administrator
					</label>
					<div class="relative">
						<Mail class="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							id="admin-email"
							type="email"
							bind:value={adminEmail}
							placeholder="admin@email.com"
							class="w-full bg-[#1b1510] border border-amber-700/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
							required
						/>
					</div>
				</div>

				<!-- Admin Password -->
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<label for="admin-pass" class="block text-xs font-bold text-quran-goldLight uppercase tracking-wider">
							Kata Sandi Akun
						</label>
					</div>
					<div class="relative">
						<Lock class="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							id="admin-pass"
							type={showPassword ? 'text' : 'password'}
							bind:value={adminPassword}
							placeholder="Masukkan kata sandi admin..."
							class="w-full bg-[#1b1510] border border-amber-700/40 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
							required
						/>
						<button
							type="button"
							on:click={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition"
							aria-label="Tampilkan Password"
						>
							{#if showPassword}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full mt-2 py-3 rounded-xl bg-gradient-gold text-quran-dark font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
				>
					{#if isLoading}
						<div class="w-4 h-4 border-2 border-quran-dark border-t-transparent rounded-full animate-spin"></div>
						<span>Memvalidasi Role Admin...</span>
					{:else}
						<span>Masuk ke Panel Admin</span>
						<ArrowRight class="w-4 h-4" />
					{/if}
				</button>
			</form>

		</div>
	</main>

	<!-- Footer Notice -->
	<footer class="relative z-10 text-center text-[10px] text-stone-500 max-w-md mx-auto w-full">
		<div class="flex items-center justify-center gap-1.5 mb-1 text-stone-400">
			<ShieldAlert class="w-3.5 h-3.5 text-amber-500" />
			<span>Akses Terbatas: Hanya untuk akun dengan role Admin</span>
		</div>
		<p>© 2026 Portal Qur'an. Keamanan Role-Based Supabase RLS.</p>
	</footer>
</div>
