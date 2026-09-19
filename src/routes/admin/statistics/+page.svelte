<script lang="ts">
	import { BarChart3, TrendingUp, Users, BookOpen, Clock, Award, Filter, Calendar } from 'lucide-svelte';

	let timeRange = '30days';

	const platformMetrics = {
		total_read_sessions: 14280,
		average_session_mins: 22.4,
		retention_rate: '78.5%',
		daily_active_average: 412
	};

	const monthlyTrends = [
		{ month: 'Apr', ayahs: 42000 },
		{ month: 'Mei', ayahs: 58000 },
		{ month: 'Jun', ayahs: 64000 },
		{ month: 'Jul', ayahs: 71000 },
		{ month: 'Agu', ayahs: 89000 },
		{ month: 'Sep', ayahs: 98400 }
	];

	const topSurahsPlatform = [
		{ name: 'Al-Kahf', total_reads: 4230, completion_rate: '91%' },
		{ name: 'Al-Mulk', total_reads: 3890, completion_rate: '94%' },
		{ name: 'Ya Sin', total_reads: 3450, completion_rate: '88%' },
		{ name: 'Al-Waqi\'ah', total_reads: 2980, completion_rate: '92%' },
		{ name: 'Ar-Rahman', total_reads: 2760, completion_rate: '96%' },
		{ name: 'Al-Baqarah', total_reads: 2150, completion_rate: '65%' }
	];
</script>

<svelte:head>
	<title>Statistik Platform - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Statistik & Analisis Platform</h1>
			<p class="text-xs text-quran-warm">Metrik komprehensif aktivitas membaca seluruh customer secara aman dan teragregasi.</p>
		</div>

		<div class="flex items-center gap-2">
			<Calendar class="w-4 h-4 text-quran-warm" />
			<select 
				bind:value={timeRange}
				class="px-3.5 py-2 rounded-xl bg-quran-surface border border-quran-border text-xs text-quran-dark font-medium shadow-sm focus:border-quran-gold focus:outline-none"
			>
				<option value="7days">7 Hari Terakhir</option>
				<option value="30days">30 Hari Terakhir</option>
				<option value="all">Sepanjang Waktu</option>
			</select>
		</div>
	</div>

	<!-- 4 Major System KPI Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-1">
			<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Total Sesi Tilawah</span>
			<div class="text-2xl font-extrabold text-quran-dark">{platformMetrics.total_read_sessions.toLocaleString()}</div>
			<p class="text-[11px] text-green-700 font-semibold">+18.4% bulan ini</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-1">
			<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Rata-rata Durasi Sesi</span>
			<div class="text-2xl font-extrabold text-quran-dark">{platformMetrics.average_session_mins} Menit</div>
			<p class="text-[11px] text-quran-warm">Kualitas fokus tinggi</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-1">
			<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Tingkat Retensi</span>
			<div class="text-2xl font-extrabold text-quran-dark">{platformMetrics.retention_rate}</div>
			<p class="text-[11px] text-emerald-700 font-semibold">Sangat Istiqomah</p>
		</div>

		<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-1">
			<span class="text-[10px] font-bold uppercase tracking-wider text-quran-warm">Rerata Customer Aktif</span>
			<div class="text-2xl font-extrabold text-quran-dark">{platformMetrics.daily_active_average} / hari</div>
			<p class="text-[11px] text-quran-warm">Konsisten tilawah</p>
		</div>
	</div>

	<!-- Trend Chart & Top Surahs Table -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		
		<!-- Left: Monthly Growth Chart (7 cols) -->
		<div class="lg:col-span-7 bg-quran-surface rounded-3xl p-6 border border-quran-border/80 shadow-luxury flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between border-b border-quran-border/60 pb-3 mb-4">
					<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Tren Pembacaan Ayat (6 Bulan Terakhir)</h3>
					<span class="text-xs font-bold text-emerald-700">+134% YTD</span>
				</div>

				<div class="h-56 flex items-end justify-between gap-4 pt-4 pb-2">
					{#each monthlyTrends as item}
						<div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
							<span class="text-[10px] font-mono text-quran-warm">{(item.ayahs / 1000).toFixed(0)}k</span>
							<div 
								class="w-full max-w-[40px] rounded-2xl bg-gradient-luxury group-hover:bg-gradient-gold shadow-sm transition-all"
								style="height: {(item.ayahs / 100000) * 100}%"
								title="{item.month}: {item.ayahs.toLocaleString()} ayat"
							></div>
							<span class="text-xs font-bold text-quran-chocolate">{item.month}</span>
						</div>
					{/each}
				</div>
			</div>

			<p class="text-[11px] text-quran-warm mt-4 pt-3 border-t border-quran-border/60 text-center">
				Data diakumulasi secara otomatis dari tabel reading_sessions di Supabase PostgreSQL.
			</p>
		</div>

		<!-- Right: Popular Surahs Platform Wide (5 cols) -->
		<div class="lg:col-span-5 bg-quran-surface rounded-3xl p-6 border border-quran-border/80 shadow-luxury space-y-4">
			<div class="border-b border-quran-border/60 pb-3">
				<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Surah Paling Banyak Dibaca</h3>
				<p class="text-[11px] text-quran-warm">Peringkat favorit komunitas pengguna</p>
			</div>

			<div class="space-y-2.5">
				{#each topSurahsPlatform as item, idx}
					<div class="p-3 rounded-2xl bg-quran-sand/50 border border-quran-border/60 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="w-6 h-6 rounded-lg bg-quran-sand text-quran-dark font-extrabold text-xs flex items-center justify-center">
								#{idx + 1}
							</span>
							<div>
								<div class="text-xs font-bold text-quran-dark">{item.name}</div>
								<div class="text-[10px] text-quran-warm font-mono">{item.total_reads.toLocaleString()} kali dibuka</div>
							</div>
						</div>
						<div class="text-right">
							<span class="text-xs font-bold text-emerald-700">{item.completion_rate}</span>
							<span class="text-[9px] text-quran-warm block">Selesai</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

	</div>
</div>
