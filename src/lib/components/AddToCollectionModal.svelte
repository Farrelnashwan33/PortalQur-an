<script lang="ts">
	import { progressStore } from '$lib/stores/progress';
	import type { AyahDetail } from '$lib/types/quran';
	import { X, FolderPlus, Plus, BookmarkCheck } from 'lucide-svelte';

	export let ayah: AyahDetail | null = null;
	export let surahName: string = '';
	export let isOpen: boolean = false;
	export let onClose: () => void = () => {};

	const collections = progressStore.collections;
	let selectedCollectionId = '';
	let notes = '';
	let newColTitle = '';
	let showCreateNew = false;
	let successMsg = '';

	$: if ($collections.length > 0 && !selectedCollectionId) {
		selectedCollectionId = $collections[0].id;
	}

	function handleSave() {
		if (!ayah || !selectedCollectionId) return;

		progressStore.collections.addAyahToCollection(
			selectedCollectionId,
			ayah.surah_number,
			surahName,
			ayah.ayah_number,
			ayah.text_arabic,
			ayah.text_id,
			notes
		);

		successMsg = 'Ayat berhasil ditambahkan ke koleksi!';
		setTimeout(() => {
			successMsg = '';
			notes = '';
			onClose();
		}, 1000);
	}

	function handleCreateCollection() {
		if (!newColTitle.trim()) return;
		progressStore.collections.createCollection(newColTitle.trim());
		newColTitle = '';
		showCreateNew = false;
	}
</script>

{#if isOpen && ayah}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Tutup Simpan Koleksi"
	>
		<div 
			class="bg-quran-surface rounded-3xl max-w-md w-full border border-quran-gold/40 shadow-luxury-hover overflow-hidden animate-in zoom-in-95 duration-150"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="bg-gradient-luxury p-5 text-quran-cream flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-quran-gold/20 flex items-center justify-center text-quran-gold">
						<FolderPlus class="w-4 h-4" />
					</div>
					<div>
						<h3 class="font-bold text-sm text-white">Simpan ke Koleksi</h3>
						<p class="text-xs text-quran-goldLight">{surahName} : Ayat {ayah.ayah_number}</p>
					</div>
				</div>

				<button 
					on:click={onClose}
					class="p-2 text-quran-goldLight hover:text-white transition"
					aria-label="Tutup"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="p-5 space-y-4">
				{#if successMsg}
					<div class="p-3 rounded-xl bg-green-50 text-green-800 border border-green-200 text-xs font-semibold flex items-center gap-2">
						<BookmarkCheck class="w-4 h-4 text-green-600" />
						<span>{successMsg}</span>
					</div>
				{/if}

				<!-- Choose existing collection -->
				<div>
					<label for="collection-select" class="block text-xs font-bold text-quran-chocolate mb-1.5">
						Pilih Folder Koleksi
					</label>
					<select 
						id="collection-select"
						bind:value={selectedCollectionId}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
					>
						{#each $collections as col}
							<option value={col.id}>{col.title} ({col.items_count || 0} ayat)</option>
						{/each}
					</select>
				</div>

				<!-- Button to toggle new collection input -->
				{#if !showCreateNew}
					<button 
						on:click={() => showCreateNew = true}
						class="text-xs font-semibold text-quran-gold hover:text-quran-dark flex items-center gap-1 transition"
					>
						<Plus class="w-3.5 h-3.5" />
						<span>Buat folder koleksi baru</span>
					</button>
				{:else}
					<div class="p-3 rounded-xl bg-quran-sand/70 border border-quran-border space-y-2">
						<input 
							type="text" 
							placeholder="Nama koleksi baru (misal: Doa Pagi)" 
							bind:value={newColTitle}
							class="w-full px-3 py-1.5 rounded-lg bg-white border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
						<div class="flex justify-end gap-2">
							<button 
								on:click={() => showCreateNew = false}
								class="px-2.5 py-1 rounded text-[11px] text-quran-warm hover:bg-quran-beige/50 transition"
							>
								Batal
							</button>
							<button 
								on:click={handleCreateCollection}
								class="px-3 py-1 rounded-lg bg-quran-primary text-white text-[11px] font-bold hover:bg-quran-dark transition"
							>
								Buat Folder
							</button>
						</div>
					</div>
				{/if}

				<!-- Reflection notes -->
				<div>
					<label for="ayah-notes" class="block text-xs font-bold text-quran-chocolate mb-1.5">
						Catatan / Tadabbur Pribadi (Opsional)
					</label>
					<textarea 
						id="ayah-notes"
						rows="3" 
						placeholder="Tuliskan renungan atau alasan menyimpan ayat ini..."
						bind:value={notes}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

			</div>

			<div class="p-4 bg-quran-sand/70 border-t border-quran-border flex justify-end gap-2">
				<button 
					on:click={onClose}
					class="px-4 py-2 rounded-xl text-xs font-semibold text-quran-warm hover:bg-quran-beige/50 transition"
				>
					Batal
				</button>
				<button 
					on:click={handleSave}
					class="px-5 py-2 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-105 active:scale-95 transition-all"
				>
					Simpan Ayat
				</button>
			</div>
		</div>
	</div>
{/if}
