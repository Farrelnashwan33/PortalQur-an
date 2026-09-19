<script lang="ts">
	import { progressStore } from '$lib/stores/progress';
	import { audioStore } from '$lib/stores/audio';
	import { 
		Bookmark, 
		BookmarkCheck, 
		FolderPlus, 
		Folder, 
		Trash2, 
		Play, 
		ArrowRight, 
		Plus, 
		BookOpen, 
		Sparkles,
		Clock
	} from 'lucide-svelte';

	let activeTab: 'collections' | 'bookmarks' | 'last_read' = 'collections';
	const collections = progressStore.collections;
	const bookmarks = progressStore.bookmarks;
	const progress = progressStore.progress;

	let selectedColId: string = '';
	let newColModalOpen = false;
	let newColTitle = '';
	let newColDesc = '';

	$: if ($collections.length > 0 && !selectedColId) {
		selectedColId = $collections[0].id;
	}

	$: activeCollection = $collections.find(c => c.id === selectedColId) || $collections[0];

	function createCollection() {
		if (!newColTitle.trim()) return;
		progressStore.collections.createCollection(newColTitle.trim(), newColDesc.trim());
		newColTitle = '';
		newColDesc = '';
		newColModalOpen = false;
	}

	function deleteCol(id: string) {
		if (confirm('Yakin ingin menghapus folder koleksi ini?')) {
			progressStore.collections.deleteCollection(id);
			if (selectedColId === id) {
				selectedColId = $collections[0]?.id || '';
			}
		}
	}
</script>

<svelte:head>
	<title>Koleksi & Bookmark Saya - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
	
	<!-- Header Banner -->
	<div class="relative overflow-hidden rounded-3xl bg-gradient-luxury text-quran-cream p-6 sm:p-8 shadow-luxury border border-quran-gold/40">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="relative z-10 max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-xs font-semibold text-quran-gold mb-2">
				<BookmarkCheck class="w-3.5 h-3.5" />
				<span>Koleksi Pribadi & Bookmark</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Koleksi & Catatan Ayat
			</h1>
			<p class="text-xs sm:text-sm text-quran-goldLight mt-1.5 leading-relaxed">
				Simpan ayat-ayat favorit, kelompokkan dalam folder tadabbur, dan lanjutkan bacaan terakhir dengan mudah.
			</p>
		</div>
	</div>

	<!-- Navigation Tabs -->
	<div class="flex items-center gap-2 border-b border-quran-border/60 pb-3">
		<button 
			on:click={() => activeTab = 'collections'}
			class="px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'collections' ? 'bg-gradient-luxury text-quran-gold shadow-gold' : 'bg-quran-surface text-quran-dark border border-quran-border hover:bg-quran-sand'}"
		>
			<Folder class="w-4 h-4" />
			<span>Folder Koleksi ({$collections.length})</span>
		</button>

		<button 
			on:click={() => activeTab = 'bookmarks'}
			class="px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'bookmarks' ? 'bg-gradient-luxury text-quran-gold shadow-gold' : 'bg-quran-surface text-quran-dark border border-quran-border hover:bg-quran-sand'}"
		>
			<Bookmark class="w-4 h-4" />
			<span>Bookmark Ayat ({$bookmarks.length})</span>
		</button>

		<button 
			on:click={() => activeTab = 'last_read'}
			class="px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'last_read' ? 'bg-gradient-luxury text-quran-gold shadow-gold' : 'bg-quran-surface text-quran-dark border border-quran-border hover:bg-quran-sand'}"
		>
			<Clock class="w-4 h-4" />
			<span>Terakhir Dibaca</span>
		</button>
	</div>

	<!-- ================= TAB 1: COLLECTIONS ================= -->
	{#if activeTab === 'collections'}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
			
			<!-- Left: Collections Sidebar List (4 cols) -->
			<div class="lg:col-span-4 space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate">Folder Saya</h3>
					<button 
						on:click={() => newColModalOpen = true}
						class="flex items-center gap-1 text-xs font-bold text-quran-gold hover:text-quran-dark transition"
					>
						<Plus class="w-4 h-4" />
						<span>Folder Baru</span>
					</button>
				</div>

				<div class="space-y-2">
					{#each $collections as col}
						<div 
							class="w-full text-left p-4 rounded-2xl border transition flex items-center justify-between group {selectedColId === col.id ? 'bg-quran-surface border-quran-gold shadow-gold text-quran-dark font-bold' : 'bg-quran-surface/60 border-quran-border hover:bg-quran-surface text-quran-dark'}"
						>
							<button 
								type="button"
								on:click={() => selectedColId = col.id}
								class="flex items-center gap-3 truncate flex-1 text-left"
							>
								<div class="w-9 h-9 rounded-xl bg-quran-sand flex items-center justify-center text-quran-primary flex-shrink-0">
									<Folder class="w-4 h-4 text-quran-gold" />
								</div>
								<div class="truncate">
									<div class="text-xs font-bold truncate">{col.title}</div>
									<div class="text-[11px] text-quran-warm">{col.items_count || (col.items?.length || 0)} Ayat</div>
								</div>
							</button>

							<button 
								type="button"
								on:click={() => deleteCol(col.id)}
								class="p-1.5 text-quran-warm hover:text-red-600 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
								title="Hapus Folder"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Collection Items View (8 cols) -->
			<div class="lg:col-span-8 space-y-4">
				{#if activeCollection}
					<div class="bg-quran-surface p-6 rounded-3xl border border-quran-border/80 shadow-luxury space-y-4">
						<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
							<div>
								<h2 class="text-base font-bold text-quran-dark">{activeCollection.title}</h2>
								<p class="text-xs text-quran-warm">{activeCollection.description || 'Kumpulan ayat pilihan pribadi'}</p>
							</div>
							<span class="text-xs font-bold px-3 py-1 rounded-full bg-quran-sand text-quran-dark border border-quran-border">
								{activeCollection.items?.length || 0} Ayat
							</span>
						</div>

						{#if activeCollection.items && activeCollection.items.length > 0}
							<div class="space-y-3">
								{#each activeCollection.items as item}
									<div class="p-4 rounded-2xl bg-quran-sand/50 border border-quran-border/60 space-y-3 hover:border-quran-gold transition">
										<div class="flex items-center justify-between">
											<a href="/quran/{item.surah_number}#ayah-{item.ayah_number}" class="text-xs font-bold text-quran-dark hover:text-quran-primary flex items-center gap-1.5">
												<span>Surah {item.surah_name} : Ayat {item.ayah_number}</span>
												<ArrowRight class="w-3 h-3 text-quran-gold" />
											</a>
											<div class="flex items-center gap-1">
												<button 
													on:click={() => audioStore.playAyah(item.surah_number, item.surah_name, item.ayah_number)}
													class="p-1.5 text-quran-warm hover:text-quran-dark rounded-lg transition"
													title="Putar Audio"
												>
													<Play class="w-3.5 h-3.5 text-quran-gold" />
												</button>
												<button 
													on:click={() => progressStore.collections.removeItemFromCollection(activeCollection.id, item.id)}
													class="p-1.5 text-quran-warm hover:text-red-600 rounded-lg transition"
													title="Hapus dari Koleksi"
												>
													<Trash2 class="w-3.5 h-3.5" />
												</button>
											</div>
										</div>

										<p class="arabic-text text-xl text-right text-quran-dark leading-loose">
											{item.text_arabic}
										</p>
										<p class="text-xs text-quran-dark leading-relaxed">
											"{item.text_id}"
										</p>

										{#if item.notes}
											<div class="p-2.5 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200/60 italic">
												<span class="font-bold">Catatan:</span> {item.notes}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-12">
								<FolderPlus class="w-10 h-10 text-quran-gold mx-auto mb-2 opacity-60" />
								<p class="text-xs text-quran-warm">Folder ini masih kosong.</p>
								<p class="text-[11px] text-quran-muted mt-1">Buka pembaca Al-Qur'an dan klik tombol folder untuk menyimpan ayat ke sini.</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>

		</div>

	<!-- ================= TAB 2: BOOKMARKS ================= -->
	{:else if activeTab === 'bookmarks'}
		<div class="space-y-3">
			{#if $bookmarks.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each $bookmarks as bm}
						<div class="p-5 rounded-3xl bg-quran-surface border border-quran-border/80 shadow-luxury space-y-3 hover:border-quran-gold transition">
							<div class="flex items-center justify-between">
								<a href="/quran/{bm.surah_number}#ayah-{bm.ayah_number}" class="text-xs font-bold text-quran-dark hover:text-quran-primary flex items-center gap-1.5">
									<BookmarkCheck class="w-4 h-4 text-quran-gold" />
									<span>Surah {bm.surah_name} : {bm.ayah_number}</span>
									<ArrowRight class="w-3.5 h-3.5 text-quran-gold" />
								</a>
								<div class="flex items-center gap-1">
									<button 
										on:click={() => audioStore.playAyah(bm.surah_number, bm.surah_name, bm.ayah_number)}
										class="p-1.5 text-quran-warm hover:text-quran-dark transition"
										title="Putar Audio"
									>
										<Play class="w-3.5 h-3.5 text-quran-gold" />
									</button>
									<button 
										on:click={() => progressStore.bookmarks.removeBookmark(bm.id)}
										class="p-1.5 text-quran-warm hover:text-red-600 transition"
										title="Hapus Bookmark"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</div>

							{#if bm.text_arabic}
								<p class="arabic-text text-xl text-right text-quran-dark leading-loose">
									{bm.text_arabic}
								</p>
							{/if}

							{#if bm.text_id}
								<p class="text-xs text-quran-dark leading-relaxed line-clamp-2">
									"{bm.text_id}"
								</p>
							{/if}

							{#if bm.notes}
								<p class="text-[11px] text-quran-warm bg-quran-sand p-2 rounded-xl italic">
									Catatan: {bm.notes}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-16 bg-quran-surface rounded-3xl border border-quran-border">
					<Bookmark class="w-10 h-10 text-quran-gold mx-auto mb-2 opacity-60" />
					<h3 class="text-sm font-bold text-quran-dark">Belum ada ayat yang ditandai</h3>
					<p class="text-xs text-quran-warm mt-1">Tandai ayat favorit Anda saat membaca untuk akses instan di sini.</p>
				</div>
			{/if}
		</div>

	<!-- ================= TAB 3: LAST READ ================= -->
	{:else}
		<div class="max-w-xl mx-auto p-8 rounded-3xl bg-quran-surface border border-quran-gold/40 shadow-luxury text-center space-y-4">
			<div class="w-14 h-14 rounded-2xl bg-gradient-luxury text-quran-gold mx-auto flex items-center justify-center shadow-gold">
				<Clock class="w-7 h-7" />
			</div>

			<div>
				<span class="text-xs font-bold uppercase tracking-wider text-quran-gold">Penanda Baca Terakhir</span>
				<h2 class="text-2xl font-extrabold text-quran-dark mt-1">
					Surah {$progress.surah_name} : Ayat {$progress.ayah_number}
				</h2>
				<p class="text-xs text-quran-warm mt-1">
					Juz {$progress.juz_number} • Tersimpan otomatis saat Anda membaca
				</p>
			</div>

			<div class="pt-4 flex items-center justify-center gap-3">
				<a 
					href="/quran/{$progress.surah_number}#ayah-{$progress.ayah_number}"
					class="px-6 py-3 rounded-2xl bg-gradient-gold text-quran-dark font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
				>
					<span>Buka Bacaan Sekarang</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>
	{/if}

	<!-- Create Collection Modal -->
	{#if newColModalOpen}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => newColModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (newColModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Buat Folder"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-md w-full border border-quran-gold/40 p-6 shadow-luxury space-y-4"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<h3 class="text-base font-bold text-quran-dark">Buat Folder Koleksi Baru</h3>
				<div>
					<label for="new-col-name" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Folder</label>
					<input 
						id="new-col-name"
						type="text" 
						placeholder="Misal: Doa Mustajab, Ayat Penenang" 
						bind:value={newColTitle}
						class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>
				<div>
					<label for="new-col-desc" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Singkat</label>
					<textarea 
						id="new-col-desc"
						rows="2" 
						placeholder="Keterangan isi folder..." 
						bind:value={newColDesc}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>
				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => newColModalOpen = false} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={createCollection} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Buat</button>
				</div>
			</div>
		</div>
	{/if}

</div>
