<script lang="ts">
	import { topicStore } from '$lib/stores/topics';
	import type { QuranTopic } from '$lib/types/quran';
	import { Compass, Plus, Edit3, Trash2, BookOpen, X, Sparkles, Check } from 'lucide-svelte';

	let addModalOpen = false;
	let editModalOpen = false;
	let editingTopic: QuranTopic | null = null;

	let newCategory = '';
	let newTitle = '';
	let newSlug = '';
	let newDescription = '';
	let newAyahSurah = 1;
	let newAyahNumber = 1;

	function handleAddTopic() {
		if (!newCategory || !newTitle || !newDescription) return;
		const slug = newSlug || newCategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
		
		const created: QuranTopic = {
			id: 'topic-' + Date.now(),
			slug,
			category: newCategory,
			title: newTitle,
			description: newDescription,
			icon: 'Compass',
			color: 'emerald',
			ayahs: [
				{
					surah_number: Number(newAyahSurah) || 1,
					surah_name: 'Al-Fatihah',
					ayah_number: Number(newAyahNumber) || 1,
					text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
					text_id: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
					explanation: 'Ayat pembuka surat Al-Fatihah.'
				}
			]
		};

		topicStore.addTopic(created);
		newCategory = '';
		newTitle = '';
		newSlug = '';
		newDescription = '';
		addModalOpen = false;
	}

	function startEdit(topic: QuranTopic) {
		editingTopic = { ...topic };
		editModalOpen = true;
	}

	function handleSaveEdit() {
		if (!editingTopic) return;
		topicStore.updateTopic(editingTopic.slug, editingTopic);
		editModalOpen = false;
		editingTopic = null;
	}

	function handleDelete(slug: string, title: string) {
		if (confirm(`Yakin ingin menghapus topik "${title}"? Topik akan langsung terhapus dari seluruh portal customer.`)) {
			topicStore.deleteTopic(slug);
		}
	}
</script>

<svelte:head>
	<title>Topics Management - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Manajemen Topik Tematik Qur'an</h1>
			<p class="text-xs text-quran-warm">Kelola tema pokok Al-Qur'an secara real-time. Penambahan & penghapusan langsung terupdate di portal customer.</p>
		</div>

		<div class="flex items-center gap-3">
			<span class="text-xs font-bold px-3 py-1.5 rounded-2xl bg-quran-sand text-quran-dark border border-quran-border">
				Total: {$topicStore.length} Kategori
			</span>

			<button 
				on:click={() => addModalOpen = true}
				class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all"
			>
				<Plus class="w-4 h-4 text-quran-gold" />
				<span>Buat Topik Baru</span>
			</button>
		</div>
	</div>

	<!-- Topics Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each $topicStore as topic (topic.slug)}
			<div class="bg-quran-surface p-6 rounded-3xl border border-quran-border/80 shadow-luxury flex flex-col justify-between hover:border-quran-gold transition space-y-4">
				<div>
					<div class="flex items-center justify-between">
						<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-quran-sand text-quran-chocolate border border-quran-border">
							{topic.category}
						</span>
						<span class="text-xs font-bold text-quran-gold">{topic.ayahs.length} Ayat Kunci</span>
					</div>

					<h2 class="text-base font-bold text-quran-dark mt-2">{topic.title}</h2>
					<p class="text-xs text-quran-warm mt-1 line-clamp-2">{topic.description}</p>
				</div>

				<div class="pt-3 border-t border-quran-border/60 flex items-center justify-between">
					<a href="/topik" target="_blank" class="text-xs font-bold text-quran-chocolate hover:underline flex items-center gap-1">
						<BookOpen class="w-3.5 h-3.5" />
						<span>Pratinjau</span>
					</a>

					<div class="flex items-center gap-1.5">
						<button 
							on:click={() => startEdit(topic)}
							class="p-2 rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
							title="Edit Topik"
						>
							<Edit3 class="w-4 h-4" />
						</button>

						<button 
							on:click={() => handleDelete(topic.slug, topic.title)}
							class="p-2 rounded-xl text-quran-warm hover:text-red-600 hover:bg-red-50 transition"
							title="Hapus Topik Langsung"
						>
							<Trash2 class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Add Modal -->
	{#if addModalOpen}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => addModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (addModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Tambah Topik"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-lg w-full border border-quran-gold/40 shadow-luxury overflow-hidden p-6 space-y-4"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="flex items-center justify-between border-b border-quran-border/60 pb-2">
					<h3 class="font-bold text-sm text-quran-dark">Tambah Topik Tematik Baru (Live)</h3>
					<button on:click={() => addModalOpen = false} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div>
					<label for="new-topic-cat" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Kategori Ringkas</label>
					<input 
						id="new-topic-cat"
						type="text" 
						placeholder="Misal: Muamalah & Perniagaan" 
						bind:value={newCategory}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-topic-title" class="block text-xs font-bold text-quran-chocolate mb-1">Judul Lengkap Tema</label>
					<input 
						id="new-topic-title"
						type="text" 
						placeholder="Misal: Etika Transaksi Halal dan Berkah" 
						bind:value={newTitle}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-topic-desc" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Ringkasan Tema</label>
					<textarea 
						id="new-topic-desc"
						rows="3" 
						placeholder="Uraian panduan Al-Qur'an seputar topik ini..." 
						bind:value={newDescription}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => addModalOpen = false} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleAddTopic} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Publikasikan Langsung</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Edit Modal -->
	{#if editModalOpen && editingTopic}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => editModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (editModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Edit Topik"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-lg w-full border border-quran-gold/40 shadow-luxury overflow-hidden p-6 space-y-4"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="flex items-center justify-between border-b border-quran-border/60 pb-2">
					<h3 class="font-bold text-sm text-quran-dark">Edit Topik {editingTopic.category}</h3>
					<button on:click={() => editModalOpen = false} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div>
					<label for="edit-topic-cat" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Kategori</label>
					<input 
						id="edit-topic-cat"
						type="text" 
						bind:value={editingTopic.category}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="edit-topic-title" class="block text-xs font-bold text-quran-chocolate mb-1">Judul Topik</label>
					<input 
						id="edit-topic-title"
						type="text" 
						bind:value={editingTopic.title}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="edit-topic-desc" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Topik</label>
					<textarea 
						id="edit-topic-desc"
						rows="3" 
						bind:value={editingTopic.description}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => editModalOpen = false} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleSaveEdit} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Perubahan</button>
				</div>
			</div>
		</div>
	{/if}
</div>
