<script lang="ts">
	import { tafsirStore } from '$lib/stores/surahs';
	import { FileText, Search, Edit3, Check, Trash2, Plus, X } from 'lucide-svelte';

	let selectedAyah: any = null;
	let editTafsir = '';
	let editTranslation = '';
	let isSaved = false;

	let addModalOpen = false;
	let newSurah = 1;
	let newAyah = 1;
	let newArabic = '';
	let newTranslation = '';
	let newTafsir = '';

	function editItem(item: any) {
		selectedAyah = { ...item };
		editTafsir = item.tafsir_ringkas;
		editTranslation = item.text_id;
	}

	function saveItem() {
		if (!selectedAyah) return;
		tafsirStore.updateTafsir(selectedAyah.surah_number, selectedAyah.ayah_number, editTranslation, editTafsir);
		isSaved = true;
		setTimeout(() => {
			isSaved = false;
			selectedAyah = null;
		}, 800);
	}

	function handleDelete(surah: number, ayah: number) {
		if (confirm(`Hapus tafsir & terjemahan khusus untuk Surah ${surah}:${ayah}?`)) {
			tafsirStore.deleteTafsir(surah, ayah);
			if (selectedAyah?.surah_number === surah && selectedAyah?.ayah_number === ayah) {
				selectedAyah = null;
			}
		}
	}

	function handleAddTafsir() {
		if (!newTranslation || !newTafsir) return;
		tafsirStore.updateTafsir(Number(newSurah), Number(newAyah), newTranslation, newTafsir);
		newTranslation = '';
		newTafsir = '';
		addModalOpen = false;
	}
</script>

<svelte:head>
	<title>Tafsir & Translation Management - Admin Portal Qur'an</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Tafsir & Translation Management</h1>
			<p class="text-xs text-quran-warm">Kelola naskah Tafsir Ibnu Katsir dan terjemahan per ayat secara real-time.</p>
		</div>

		<button 
			on:click={() => addModalOpen = true}
			class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
		>
			<Plus class="w-4 h-4 text-quran-gold" />
			<span>Tambah Naskah Tafsir</span>
		</button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<div class="lg:col-span-6 space-y-3">
			<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Daftar Naskah Tafsir ({$tafsirStore.length})</h3>
			<div class="space-y-2">
				{#each $tafsirStore as item (item.surah_number + '-' + item.ayah_number)}
					<div 
						class="p-4 rounded-2xl bg-quran-surface border border-quran-border/80 hover:border-quran-gold transition space-y-2 {selectedAyah?.ayah_number === item.ayah_number && selectedAyah?.surah_number === item.surah_number ? 'border-quran-gold shadow-gold ring-1 ring-quran-gold' : ''}"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-quran-dark">Surah {item.surah_number} : Ayat {item.ayah_number}</span>
							<div class="flex items-center gap-2">
								<span class="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Tafsir Ibnu Katsir</span>
								<button 
									on:click={() => handleDelete(item.surah_number, item.ayah_number)}
									class="p-1 text-quran-warm hover:text-red-600 rounded-lg hover:bg-red-50 transition"
									title="Hapus Tafsir"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
						{#if item.text_arabic}
							<p class="arabic-text text-lg text-right text-quran-dark">{item.text_arabic}</p>
						{/if}
						<p class="text-xs text-quran-warm line-clamp-2">"{item.text_id}"</p>
						<button 
							on:click={() => editItem(item)}
							class="text-xs font-bold text-quran-gold hover:underline pt-1 inline-block"
						>
							Edit Tafsir & Terjemahan &rarr;
						</button>
					</div>
				{/each}
			</div>
		</div>

		<div class="lg:col-span-6">
			{#if selectedAyah}
				<div class="bg-quran-surface p-6 rounded-3xl border border-quran-gold/40 shadow-luxury space-y-4">
					<h3 class="text-sm font-bold text-quran-dark border-b border-quran-border/60 pb-2">
						Edit Terjemahan & Tafsir [Surah {selectedAyah.surah_number}:{selectedAyah.ayah_number}]
					</h3>

					{#if isSaved}
						<div class="p-3 bg-green-50 text-green-800 rounded-xl text-xs font-semibold flex items-center gap-2">
							<Check class="w-4 h-4 text-green-600" />
							<span>Tafsir & Terjemahan berhasil diperbarui dan tersinkron!</span>
						</div>
					{/if}

					<div>
						<label for="edit-tafsir-trans" class="block text-xs font-bold text-quran-chocolate mb-1">Teks Terjemahan Bahasa Indonesia</label>
						<textarea 
							id="edit-tafsir-trans"
							rows="3" 
							bind:value={editTranslation}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
						></textarea>
					</div>

					<div>
						<label for="edit-tafsir-detail" class="block text-xs font-bold text-quran-chocolate mb-1">Uraian Tafsir Ringkas</label>
						<textarea 
							id="edit-tafsir-detail"
							rows="4" 
							bind:value={editTafsir}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
						></textarea>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<button on:click={() => selectedAyah = null} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
						<button on:click={saveItem} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Perubahan</button>
					</div>
				</div>
			{:else}
				<div class="bg-quran-surface p-12 rounded-3xl border border-quran-border text-center">
					<FileText class="w-10 h-10 text-quran-gold mx-auto mb-2 opacity-60" />
					<p class="text-xs text-quran-warm">Pilih ayat di sebelah kiri untuk melihat dan mengedit tafsir.</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Add Modal -->
	{#if addModalOpen}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => addModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (addModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Tambah Tafsir"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-md w-full border border-quran-gold/40 shadow-luxury overflow-hidden p-6 space-y-4"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="flex items-center justify-between border-b border-quran-border/60 pb-2">
					<h3 class="font-bold text-sm text-quran-dark">Tambah Catatan Tafsir Ayat</h3>
					<button on:click={() => addModalOpen = false} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="new-tafsir-surah" class="block text-xs font-bold text-quran-chocolate mb-1">Nomor Surah</label>
						<input 
							id="new-tafsir-surah"
							type="number" 
							min="1" 
							max="114" 
							bind:value={newSurah}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="new-tafsir-ayah" class="block text-xs font-bold text-quran-chocolate mb-1">Nomor Ayat</label>
						<input 
							id="new-tafsir-ayah"
							type="number" 
							min="1" 
							max="286" 
							bind:value={newAyah}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="new-tafsir-trans" class="block text-xs font-bold text-quran-chocolate mb-1">Terjemahan Ayat</label>
					<textarea 
						id="new-tafsir-trans"
						rows="2" 
						placeholder="Terjemahan ayat..." 
						bind:value={newTranslation}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

				<div>
					<label for="new-tafsir-body" class="block text-xs font-bold text-quran-chocolate mb-1">Uraian Tafsir Ringkas</label>
					<textarea 
						id="new-tafsir-body"
						rows="3" 
						placeholder="Catatan tafsir dari mufassir..." 
						bind:value={newTafsir}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => addModalOpen = false} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleAddTafsir} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Tafsir</button>
				</div>
			</div>
		</div>
	{/if}
</div>
