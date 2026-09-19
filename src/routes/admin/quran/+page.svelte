<script lang="ts">
	import { surahStore } from '$lib/stores/surahs';
	import type { SurahMeta } from '$lib/types/quran';
	import { 
		BookOpen, 
		Search, 
		Edit3, 
		Check, 
		X, 
		CheckCircle2, 
		Eye
	} from 'lucide-svelte';

	let searchQuery = '';
	let editingSurah: SurahMeta | null = null;
	let editModalOpen = false;
	let editSuccess = false;

	$: filtered = $surahStore.filter(s => 
		s.name_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
		s.name_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
		s.number.toString() === searchQuery.trim()
	);

	function startEdit(s: SurahMeta) {
		editingSurah = { ...s };
		editModalOpen = true;
	}

	function saveEdit() {
		if (!editingSurah) return;
		surahStore.updateSurah(editingSurah.number, editingSurah);
		editSuccess = true;
		setTimeout(() => {
			editSuccess = false;
			editModalOpen = false;
		}, 600);
	}
</script>

<svelte:head>
	<title>Quran Management - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	
	<!-- Top Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Manajemen Konten Qur'an (114 Surah)</h1>
			<p class="text-xs text-quran-warm">Kelola teks nama surah, terjemahan nama, ringkasan tema, dan keutamaan membaca secara real-time.</p>
		</div>

		<span class="text-xs font-bold px-3 py-1.5 rounded-2xl bg-quran-sand text-quran-dark border border-quran-border self-start sm:self-auto">
			Status: 114 Surah Terpublikasi
		</span>
	</div>

	<!-- Search Bar -->
	<div class="bg-quran-surface p-4 rounded-3xl border border-quran-border/80 shadow-luxury">
		<div class="relative max-w-md">
			<Search class="w-4 h-4 text-quran-gold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
			<input 
				type="text" 
				placeholder="Cari nomor atau nama surah..." 
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
			/>
		</div>
	</div>

	<!-- Surahs Table -->
	<div class="bg-quran-surface rounded-3xl border border-quran-border/80 shadow-luxury overflow-x-auto">
		<table class="w-full text-left text-xs text-quran-dark">
			<thead class="bg-quran-sand/70 text-quran-chocolate border-b border-quran-border text-[11px] font-bold uppercase tracking-wider">
				<tr>
					<th class="p-4">No</th>
					<th class="p-4">Nama Latin & Arti</th>
					<th class="p-4">Nama Arab</th>
					<th class="p-4">Golongan & Ayat</th>
					<th class="p-4">Status Publikasi</th>
					<th class="p-4 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-quran-border/60">
				{#each filtered as surah (surah.number)}
					<tr class="hover:bg-quran-sand/30 transition">
						<td class="p-4 font-bold text-quran-chocolate font-mono">
							{surah.number}
						</td>

						<td class="p-4">
							<div class="font-bold text-quran-dark">{surah.name_latin}</div>
							<div class="text-[11px] text-quran-warm font-medium">"{surah.name_id}"</div>
						</td>

						<td class="p-4 arabic-text text-xl text-quran-dark font-bold">
							{surah.name_arabic}
						</td>

						<td class="p-4">
							<span class="font-semibold text-quran-dark">{surah.revelation_type}</span>
							<span class="text-quran-warm block text-[11px]">{surah.number_of_ayahs} Ayat</span>
						</td>

						<td class="p-4">
							<span class="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
								<CheckCircle2 class="w-3.5 h-3.5" /> Published
							</span>
						</td>

						<td class="p-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<a 
									href="/quran/{surah.number}" 
									target="_blank"
									class="p-2 rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
									title="Buka Pembaca"
								>
									<Eye class="w-4 h-4" />
								</a>
								<button 
									on:click={() => startEdit(surah)}
									class="px-3 py-1.5 rounded-xl bg-quran-sand text-quran-chocolate hover:bg-quran-beige font-bold text-xs transition flex items-center gap-1"
								>
									<Edit3 class="w-3.5 h-3.5 text-quran-gold" />
									<span>Edit</span>
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Edit Modal -->
	{#if editModalOpen && editingSurah}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => editModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (editModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Edit Surah"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-lg w-full border border-quran-gold/40 shadow-luxury overflow-hidden"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="bg-gradient-luxury p-5 text-quran-cream flex items-center justify-between">
					<h3 class="font-bold text-sm text-white">Edit Informasi Surah {editingSurah.name_latin}</h3>
					<button on:click={() => editModalOpen = false} class="text-quran-goldLight hover:text-white" aria-label="Tutup">
						<X class="w-5 h-5" />
					</button>
				</div>

				<div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
					{#if editSuccess}
						<div class="p-3 bg-green-50 text-green-800 rounded-xl text-xs font-semibold flex items-center gap-2">
							<Check class="w-4 h-4 text-green-600" />
							<span>Perubahan berhasil disimpan dan langsung sinkron!</span>
						</div>
					{/if}

					<div>
						<label for="edit-name-latin" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Latin</label>
						<input 
							id="edit-name-latin"
							type="text" 
							bind:value={editingSurah.name_latin}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="edit-name-id" class="block text-xs font-bold text-quran-chocolate mb-1">Arti Nama Surah (Bahasa Indonesia)</label>
						<input 
							id="edit-name-id"
							type="text" 
							bind:value={editingSurah.name_id}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="edit-description" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Ringkasan & Tema</label>
						<textarea 
							id="edit-description"
							rows="3" 
							bind:value={editingSurah.description}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none resize-none"
						></textarea>
					</div>

					<div>
						<label for="edit-virtues" class="block text-xs font-bold text-quran-chocolate mb-1">Keutamaan Membaca (Hadits Sahih)</label>
						<textarea 
							id="edit-virtues"
							rows="2" 
							bind:value={editingSurah.virtues}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none resize-none"
						></textarea>
					</div>
				</div>

				<div class="p-4 bg-quran-sand border-t border-quran-border flex justify-end gap-2">
					<button on:click={() => editModalOpen = false} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={saveEdit} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Perubahan</button>
				</div>
			</div>
		</div>
	{/if}

</div>
