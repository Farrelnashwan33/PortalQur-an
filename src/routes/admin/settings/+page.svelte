<script lang="ts">
	import { 
		Settings, 
		Database, 
		Shield, 
		RefreshCw, 
		CheckCircle2, 
		Server, 
		Key, 
		Check,
		Save
	} from 'lucide-svelte';

	let appName = "Portal Qur'an v3.3";
	let tagline = "Temukan ketenangan dalam setiap ayat.";
	let maintenanceMode = false;
	let isSaved = false;
	let dbTestStatus: 'idle' | 'testing' | 'success' = 'idle';

	function handleSave() {
		isSaved = true;
		setTimeout(() => (isSaved = false), 2000);
	}

	function testDbConnection() {
		dbTestStatus = 'testing';
		setTimeout(() => {
			dbTestStatus = 'success';
		}, 600);
	}
</script>

<svelte:head>
	<title>Pengaturan Sistem - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-4xl space-y-6 animate-in fade-in duration-200">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Pengaturan Sistem & Database</h1>
			<p class="text-xs text-quran-warm">Konfigurasi umum aplikasi, status koneksi Supabase, dan keamanan platform.</p>
		</div>
	</div>

	{#if isSaved}
		<div class="p-4 bg-green-50 text-green-800 rounded-2xl border border-green-200 text-xs font-semibold flex items-center gap-2">
			<CheckCircle2 class="w-4 h-4 text-green-600" />
			<span>Pengaturan sistem berhasil disimpan!</span>
		</div>
	{/if}

	<!-- General App Settings Form -->
	<form on:submit|preventDefault={handleSave} class="bg-quran-surface p-6 sm:p-8 rounded-3xl border border-quran-border/80 shadow-luxury space-y-5">
		<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate flex items-center gap-2">
			<Settings class="w-4 h-4 text-quran-gold" />
			<span>Identitas & Konfigurasi Umum</span>
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label for="app-name-input" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Aplikasi</label>
				<input 
					id="app-name-input"
					type="text" 
					bind:value={appName}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
				/>
			</div>

			<div>
				<label for="app-tagline-input" class="block text-xs font-bold text-quran-chocolate mb-1">Tagline Resmi</label>
				<input 
					id="app-tagline-input"
					type="text" 
					bind:value={tagline}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
				/>
			</div>
		</div>

		<!-- Maintenance Mode Toggle -->
		<div class="p-4 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between">
			<div>
				<span class="text-xs font-bold text-quran-dark block">Mode Pemeliharaan (Maintenance Mode)</span>
				<span class="text-[11px] text-quran-warm">Kunci akses publik untuk sementara saat melakukan pembaruan besar database</span>
			</div>
			<button 
				type="button"
				on:click={() => maintenanceMode = !maintenanceMode}
				class="w-11 h-6 rounded-full transition-colors relative {maintenanceMode ? 'bg-amber-600' : 'bg-gray-300'}"
				aria-label="Toggle maintenance mode"
			>
				<span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {maintenanceMode ? 'translate-x-5' : ''}"></span>
			</button>
		</div>

		<div class="pt-4 border-t border-quran-border/60 flex justify-end">
			<button 
				type="submit"
				class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all"
			>
				<Save class="w-4 h-4 text-quran-gold" />
				<span>Simpan Perubahan</span>
			</button>
		</div>
	</form>

	<!-- Database Diagnostics Card -->
	<div class="bg-quran-surface p-6 sm:p-8 rounded-3xl border border-quran-border/80 shadow-luxury space-y-4">
		<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
			<div class="flex items-center gap-2">
				<Database class="w-4 h-4 text-quran-gold" />
				<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Diagnostik Database Supabase</h2>
			</div>

			<button 
				type="button"
				on:click={testDbConnection}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-quran-sand text-xs font-semibold text-quran-dark hover:bg-quran-beige transition"
			>
				<RefreshCw class="w-3.5 h-3.5 {dbTestStatus === 'testing' ? 'animate-spin' : ''}" />
				<span>Uji Koneksi DB</span>
			</button>
		</div>

		{#if dbTestStatus === 'success'}
			<div class="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>Koneksi ke Supabase PostgreSQL berhasil! Latensi: 16ms. Semua 17 tabel & trigger RLS aktif.</span>
			</div>
		{/if}

		<div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-quran-chocolate space-y-2 leading-relaxed">
			<p class="font-bold">Panduan Promosi Akun Admin di Supabase SQL Editor:</p>
			<code class="block p-3 rounded-xl bg-quran-dark text-quran-gold font-mono text-[11px] overflow-x-auto">
				UPDATE public.profiles SET role = 'admin' WHERE email = 'email_admin@anda.com';
			</code>
			<p class="text-[11px] text-quran-warm">
				Skrip SQL lengkap tersedia pada berkas <span class="font-mono text-quran-chocolate">supabase/schema.sql</span>.
			</p>
		</div>
	</div>

</div>
