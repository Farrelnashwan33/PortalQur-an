<script lang="ts">
	import { onMount } from 'svelte';
	import { portalSettingsStore, DEFAULT_PORTAL_SETTINGS, type PortalSettings } from '$lib/stores/settings';
	import { SURAH_LIST } from '$lib/data/surahList';
	import { supabase, isSupabaseConfigured } from '$lib/supabase/client';
	import {
		Settings,
		Database,
		RefreshCw,
		CheckCircle2,
		Save,
		Megaphone,
		Sparkles,
		BookOpen,
		RotateCcw,
		Eye
	} from 'lucide-svelte';

	let form: PortalSettings = { ...DEFAULT_PORTAL_SETTINGS };
	let isSaving = false;
	let isSaved = false;
	let savedNote = '';
	let dbTestStatus: 'idle' | 'testing' | 'success' | 'standby' = 'idle';
	let dbLatencyMs = 0;

	onMount(async () => {
		await portalSettingsStore.refresh();
		const unsub = portalSettingsStore.subscribe((val) => {
			form = { ...val };
		});
		return unsub;
	});

	function handleSurahSelectChange(e: Event) {
		const num = Number((e.currentTarget as HTMLSelectElement).value);
		const found = SURAH_LIST.find((s) => s.number === num);
		if (found) {
			form.votdSurahNumber = found.number;
			form.votdSurahName = found.name_latin;
		}
	}

	async function handleSave() {
		isSaving = true;
		const res = await portalSettingsStore.saveSettings(form);
		isSaving = false;
		isSaved = true;
		savedNote = res.syncedCloud
			? 'Perubahan berhasil disimpan ke Database & langsung tampil di Beranda Jamaah!'
			: 'Perubahan berhasil disimpan & langsung aktif di Beranda Jamaah!';
		setTimeout(() => (isSaved = false), 3500);
	}

	async function handleReset() {
		if (confirm('Kembalikan seluruh teks beranda & pengumuman ke pengaturan bawaan?')) {
			await portalSettingsStore.resetDefaults();
			isSaved = true;
			savedNote = 'Berhasil dikembalikan ke pengaturan awal.';
			setTimeout(() => (isSaved = false), 2500);
		}
	}

	async function testDbConnection() {
		dbTestStatus = 'testing';
		if (!isSupabaseConfigured()) {
			dbTestStatus = 'standby';
			return;
		}
		const t0 = performance.now();
		try {
			const { error } = await supabase.from('profiles').select('id', { head: true, count: 'exact' });
			dbLatencyMs = Math.max(8, Math.round(performance.now() - t0));
			dbTestStatus = error ? 'standby' : 'success';
		} catch {
			dbTestStatus = 'standby';
		}
	}
</script>

<svelte:head>
	<title>Edit Info Beranda & Sistem - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-5xl space-y-6 animate-in fade-in duration-200">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Kelola Beranda Jamaah, Info & Sistem</h1>
			<p class="text-xs text-quran-warm mt-0.5">
				Ubah pengumuman jamaah, teks banner Beranda & Al-Qur'an, serta Ayat Pilihan Hari Ini secara live.
			</p>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<a
				href="/dashboard"
				target="_blank"
				class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs font-bold text-quran-chocolate hover:bg-quran-beige transition"
			>
				<Eye class="w-3.5 h-3.5 text-quran-gold" />
				<span>Lihat Beranda</span>
			</a>
			<a
				href="/quran"
				target="_blank"
				class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs font-bold text-quran-chocolate hover:bg-quran-beige transition"
			>
				<BookOpen class="w-3.5 h-3.5 text-quran-gold" />
				<span>Lihat Qur'an</span>
			</a>
		</div>
	</div>

	{#if isSaved}
		<div class="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
			<CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
			<span>{savedNote}</span>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSave} class="space-y-6">
		<!-- 1. INFO & PENGUMUMAN TERKINI JAMAAH -->
		<div class="bg-quran-surface p-6 sm:p-7 rounded-3xl border border-quran-gold/40 shadow-luxury space-y-4">
			<div class="flex items-center justify-between border-b border-quran-border/60 pb-3 gap-2">
				<div class="flex items-center gap-2">
					<Megaphone class="w-4 h-4 text-quran-gold" />
					<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">
						1. Kartu Info & Pengumuman Jamaah (Tampil di Beranda & Halaman Qur'an)
					</h2>
				</div>

				<button
					type="button"
					on:click={() => (form.infoEnabled = !form.infoEnabled)}
					class="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold transition {form.infoEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-200 text-gray-700'}"
				>
					<span>{form.infoEnabled ? 'Tampil ke Jamaah' : 'Disembunyikan'}</span>
				</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label for="info-badge" class="block text-xs font-bold text-quran-chocolate mb-1">Label Badge</label>
					<input
						id="info-badge"
						type="text"
						placeholder="INFO JAMAAH"
						bind:value={form.infoBadge}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-semibold focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div class="sm:col-span-2">
					<label for="info-title" class="block text-xs font-bold text-quran-chocolate mb-1">Judul Informasi / Pengumuman</label>
					<input
						id="info-title"
						type="text"
						placeholder="Misal: Jadwal Kajian Ba'da Subuh & Simaan Al-Kahfi"
						bind:value={form.infoTitle}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-semibold focus:border-quran-gold focus:outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="info-msg" class="block text-xs font-bold text-quran-chocolate mb-1">Isi Pesan Informasi untuk Jamaah</label>
				<textarea
					id="info-msg"
					rows="2"
					bind:value={form.infoMessage}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
				></textarea>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="info-cta-text" class="block text-xs font-bold text-quran-chocolate mb-1">Teks Tombol Aksi (Opsional)</label>
					<input
						id="info-cta-text"
						type="text"
						placeholder="Buka Surah Al-Kahfi"
						bind:value={form.infoCtaText}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="info-cta-url" class="block text-xs font-bold text-quran-chocolate mb-1">Tujuan Tombol (Link Halaman)</label>
					<input
						id="info-cta-url"
						type="text"
						placeholder="/quran/18 atau /agenda"
						bind:value={form.infoCtaUrl}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs font-mono text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>
			</div>
		</div>

		<!-- 2. BANNER BERANDA QUR'AN & DASHBOARD JAMAAH -->
		<div class="bg-quran-surface p-6 sm:p-7 rounded-3xl border border-quran-border/80 shadow-luxury space-y-5">
			<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate flex items-center gap-2 border-b border-quran-border/60 pb-3">
				<BookOpen class="w-4 h-4 text-quran-gold" />
				<span>2. Teks Banner Beranda Al-Qur'an & Sapaan Home Jamaah</span>
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="quran-badge" class="block text-xs font-bold text-quran-chocolate mb-1">Badge Banner Halaman Qur'an</label>
					<input
						id="quran-badge"
						type="text"
						bind:value={form.quranBannerBadge}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="quran-title" class="block text-xs font-bold text-quran-chocolate mb-1">Judul Utama Banner Halaman Qur'an</label>
					<input
						id="quran-title"
						type="text"
						bind:value={form.quranBannerTitle}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-bold focus:border-quran-gold focus:outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="quran-sub" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Banner Halaman Qur'an</label>
				<textarea
					id="quran-sub"
					rows="2"
					bind:value={form.quranBannerSubtitle}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
				></textarea>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-quran-border/50">
				<div>
					<label for="hero-badge" class="block text-xs font-bold text-quran-chocolate mb-1">Sapaan Kecil Beranda Home</label>
					<input
						id="hero-badge"
						type="text"
						bind:value={form.heroGreetingBadge}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="hero-quote" class="block text-xs font-bold text-quran-chocolate mb-1">Kutipan Hadits / Motivasi Home</label>
					<input
						id="hero-quote"
						type="text"
						bind:value={form.heroQuote}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="hero-src" class="block text-xs font-bold text-quran-chocolate mb-1">Sumber Riwayat</label>
					<input
						id="hero-src"
						type="text"
						bind:value={form.heroQuoteSource}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>
			</div>
		</div>

		<!-- 3. AYAT PILIHAN HARI INI (BERANDA HOME JAMAAH) -->
		<div class="bg-quran-surface p-6 sm:p-7 rounded-3xl border border-quran-border/80 shadow-luxury space-y-4">
			<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate flex items-center gap-2 border-b border-quran-border/60 pb-3">
				<Sparkles class="w-4 h-4 text-quran-gold" />
				<span>3. Ayat Pilihan Hari Ini (Tampil di Beranda Home Jamaah)</span>
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label for="votd-surah" class="block text-xs font-bold text-quran-chocolate mb-1">Pilih Surah</label>
					<select
						id="votd-surah"
						value={form.votdSurahNumber}
						on:change={handleSurahSelectChange}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
					>
						{#each SURAH_LIST as s}
							<option value={s.number}>{s.number}. {s.name_latin}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="votd-ayah" class="block text-xs font-bold text-quran-chocolate mb-1">Nomor Ayat</label>
					<input
						id="votd-ayah"
						type="number"
						min="1"
						max="286"
						bind:value={form.votdAyahNumber}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="votd-theme" class="block text-xs font-bold text-quran-chocolate mb-1">Tema Hikmah Ayat</label>
					<input
						id="votd-theme"
						type="text"
						bind:value={form.votdTheme}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="votd-arabic" class="block text-xs font-bold text-quran-chocolate mb-1">Teks Lafazh Arab</label>
				<textarea
					id="votd-arabic"
					rows="2"
					dir="rtl"
					bind:value={form.votdArabic}
					class="w-full px-4 py-3 rounded-xl bg-quran-sand border border-quran-border text-lg arabic-text text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
				></textarea>
			</div>

			<div>
				<label for="votd-id" class="block text-xs font-bold text-quran-chocolate mb-1">Terjemahan Bahasa Indonesia</label>
				<textarea
					id="votd-id"
					rows="2"
					bind:value={form.votdTranslation}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
				></textarea>
			</div>
		</div>

		<!-- 4. IDENTITAS PORTAL & MODE PEMELIHARAAN -->
		<div class="bg-quran-surface p-6 sm:p-7 rounded-3xl border border-quran-border/80 shadow-luxury space-y-4">
			<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate flex items-center gap-2 border-b border-quran-border/60 pb-3">
				<Settings class="w-4 h-4 text-quran-gold" />
				<span>4. Identitas Portal, Tanggal Hijriyah & Mode Pemeliharaan</span>
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label for="app-name-input" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Aplikasi (Navbar)</label>
					<input
						id="app-name-input"
						type="text"
						bind:value={form.appName}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="app-tagline-input" class="block text-xs font-bold text-quran-chocolate mb-1">Tagline Resmi</label>
					<input
						id="app-tagline-input"
						type="text"
						bind:value={form.tagline}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="app-hijri-input" class="block text-xs font-bold text-quran-chocolate mb-1">Label Tanggal Hijriyah</label>
					<input
						id="app-hijri-input"
						type="text"
						bind:value={form.hijriDate}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
					/>
				</div>
			</div>

			<div class="p-4 rounded-2xl bg-quran-sand/60 border border-quran-border flex items-center justify-between gap-4">
				<div>
					<span class="text-xs font-bold text-quran-dark block">Banner Mode Pemeliharaan (Maintenance)</span>
					<span class="text-[11px] text-quran-warm">Tampilkan pemberitahuan pemeliharaan pada halaman jamaah</span>
				</div>
				<button
					type="button"
					on:click={() => (form.maintenanceMode = !form.maintenanceMode)}
					class="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 {form.maintenanceMode ? 'bg-amber-600' : 'bg-gray-300'}"
					aria-label="Toggle maintenance mode"
				>
					<span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {form.maintenanceMode ? 'translate-x-5' : ''}"></span>
				</button>
			</div>

			{#if form.maintenanceMode}
				<div>
					<label for="maint-msg" class="block text-xs font-bold text-quran-chocolate mb-1">Pesan Pemeliharaan</label>
					<input
						id="maint-msg"
						type="text"
						bind:value={form.maintenanceMessage}
						class="w-full px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>
			{/if}

			<div class="pt-4 border-t border-quran-border/60 flex items-center justify-between gap-3 flex-wrap">
				<button
					type="button"
					on:click={handleReset}
					class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
				>
					<RotateCcw class="w-3.5 h-3.5" />
					<span>Reset Bawaan</span>
				</button>

				<button
					type="submit"
					disabled={isSaving}
					class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
				>
					<Save class="w-4 h-4 text-quran-gold" />
					<span>{isSaving ? 'Menyimpan...' : 'Simpan & Terbitkan ke Beranda Jamaah'}</span>
				</button>
			</div>
		</div>
	</form>

	<!-- Database Diagnostics Card -->
	<div class="bg-quran-surface p-6 sm:p-7 rounded-3xl border border-quran-border/80 shadow-luxury space-y-4">
		<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
			<div class="flex items-center gap-2">
				<Database class="w-4 h-4 text-quran-gold" />
				<h2 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Diagnostik Database SQL (Supabase)</h2>
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
				<span>Koneksi ke Database SQL berhasil! Latensi: {dbLatencyMs}ms. Sinkronisasi beranda jamaah & direktori pengguna aktif.</span>
			</div>
		{:else if dbTestStatus === 'standby'}
			<div class="p-3.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
				Mode Penyimpanan Lokal Aktif — pastikan variabel environment Supabase terpasang di Vercel untuk sinkronisasi lintas perangkat.
			</div>
		{/if}
	</div>
</div>
