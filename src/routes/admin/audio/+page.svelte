<script lang="ts">
	import { qariStore } from '$lib/stores/qaris';
	import type { Qari } from '$lib/types/quran';
	import { 
		Headphones, 
		Plus, 
		Play, 
		Check, 
		X, 
		CheckCircle2, 
		Radio, 
		Trash2 
	} from 'lucide-svelte';

	let addModalOpen = false;
	let newName = '';
	let newArabic = '';
	let newSourceUrl = '';
	let newAvatar = '';

	function toggleActive(qariId: number) {
		qariStore.toggleActive(qariId);
	}

	function handleDeleteQari(qariId: number, name: string) {
		if (confirm(`Yakin ingin menghapus qari "${name}"? Audio qari ini tidak akan lagi muncul di pemutar audio portal customer.`)) {
			qariStore.deleteQari(qariId);
		}
	}

	function handleAddQari() {
		if (!newName || !newSourceUrl) return;
		const newQari: Qari = {
			id: Date.now(),
			name: newName,
			arabic_name: newArabic || newName,
			avatar_url: newAvatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop',
			source_url: newSourceUrl.endsWith('/') ? newSourceUrl : newSourceUrl + '/',
			is_active: true
		};
		qariStore.addQari(newQari);
		newName = '';
		newArabic = '';
		newSourceUrl = '';
		newAvatar = '';
		addModalOpen = false;
	}
</script>

<svelte:head>
	<title>Audio Management - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	
	<!-- Top Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Manajemen Audio Murattal (Qari & Reciters)</h1>
			<p class="text-xs text-quran-warm">Kelola daftar qari terpercaya, server audio CDN, dan status keaktifan streaming audio secara real-time.</p>
		</div>

		<div class="flex items-center gap-3">
			<span class="text-xs font-bold px-3 py-1.5 rounded-2xl bg-quran-sand text-quran-dark border border-quran-border">
				Total: {$qariStore.length} Qari
			</span>

			<button 
				on:click={() => addModalOpen = true}
				class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
			>
				<Plus class="w-4 h-4 text-quran-gold" />
				<span>Tambah Syeikh / Qari</span>
			</button>
		</div>
	</div>

	<!-- Qari Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		{#each $qariStore as qari (qari.id)}
			<div class="bg-quran-surface rounded-3xl p-6 border border-quran-border/80 shadow-luxury flex flex-col justify-between hover:border-quran-gold transition space-y-4">
				
				<div class="flex items-start gap-4">
					<img 
						src={qari.avatar_url} 
						alt={qari.name} 
						class="w-16 h-16 rounded-2xl object-cover border-2 border-quran-border shadow-sm flex-shrink-0"
					/>
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between">
							<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase {qari.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
								{qari.is_active ? 'Aktif' : 'Nonaktif'}
							</span>
							<button 
								on:click={() => handleDeleteQari(qari.id, qari.name)}
								class="p-1 text-quran-warm hover:text-red-600 rounded-lg hover:bg-red-50 transition"
								title="Hapus Qari"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</div>

						<h3 class="text-base font-bold text-quran-dark mt-1 truncate">{qari.name}</h3>
						<p class="arabic-text text-lg text-quran-chocolate font-bold">{qari.arabic_name}</p>
					</div>
				</div>

				<div class="p-3.5 rounded-2xl bg-quran-sand border border-quran-border space-y-1">
					<span class="text-[10px] font-bold uppercase text-quran-warm block">Sumber URL Audio Base:</span>
					<p class="text-xs font-mono text-quran-dark truncate">{qari.source_url}</p>
				</div>

				<div class="pt-3 border-t border-quran-border/60 flex items-center justify-between">
					<button 
						on:click={() => {
							const audio = new Audio(`${qari.source_url}001001.mp3`);
							audio.play().catch(() => alert('Gagal memuat cuplikan audio.'));
						}}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-quran-sand text-xs font-semibold text-quran-chocolate hover:bg-quran-beige transition"
					>
						<Play class="w-3.5 h-3.5 text-quran-gold" />
						<span>Uji Suara (Al-Fatihah:1)</span>
					</button>

					<button 
						on:click={() => toggleActive(qari.id)}
						class="px-3 py-1.5 rounded-xl text-xs font-bold transition {qari.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}"
					>
						{qari.is_active ? 'Nonaktifkan' : 'Aktifkan'}
					</button>
				</div>

			</div>
		{/each}
	</div>

	<!-- Add Qari Modal -->
	{#if addModalOpen}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => addModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (addModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Tambah Qari"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-md w-full border border-quran-gold/40 shadow-luxury overflow-hidden p-6 space-y-4"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<h3 class="text-base font-bold text-quran-dark">Tambah Syeikh / Qari Baru</h3>

				<div>
					<label for="new-qari-name" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Qari</label>
					<input 
						id="new-qari-name"
						type="text" 
						placeholder="Misal: Syeikh Ali Jaber" 
						bind:value={newName}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-qari-arabic" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Arab (Lafazh)</label>
					<input 
						id="new-qari-arabic"
						type="text" 
						placeholder="علي جابر" 
						bind:value={newArabic}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark text-right font-serif focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-qari-url" class="block text-xs font-bold text-quran-chocolate mb-1">Base URL Audio EveryAyah / CDN</label>
					<input 
						id="new-qari-url"
						type="text" 
						placeholder="https://everyayah.com/data/Ali_Jaber_64kbps/" 
						bind:value={newSourceUrl}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-mono focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => addModalOpen = false} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleAddQari} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Qari</button>
				</div>
			</div>
		</div>
	{/if}

</div>
