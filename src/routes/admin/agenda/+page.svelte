<script lang="ts">
	import { agendaStore } from '$lib/stores/agenda';
	import type { Agenda } from '$lib/types/quran';
	import { Plus, Edit3, Trash2, CheckCircle2, X, Image } from 'lucide-svelte';

	let addModalOpen = false;
	let editModalOpen = false;
	let editingAgenda: Agenda | null = null;
	let editDateLocal = '';

	let newTitle = '';
	let newCategory: Agenda['category'] = 'Kajian';
	let newDesc = '';
	let newDate = '';
	let newLoc = '';
	let newSpeaker = '';
	let newImageUrl = '';

	function toDatetimeLocal(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso);
		if (isNaN(d.getTime())) return '';
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function handleAddAgenda() {
		if (!newTitle || !newDate || !newLoc) return;
		const newItem: Agenda = {
			id: 'ag-' + Date.now(),
			title: newTitle,
			category: newCategory,
			description: newDesc,
			event_date: new Date(newDate).toISOString(),
			location: newLoc,
			speaker: newSpeaker,
			image_url: newImageUrl.trim() || undefined,
			status: 'published'
		};
		agendaStore.addAgenda(newItem);
		newTitle = '';
		newDesc = '';
		newDate = '';
		newLoc = '';
		newSpeaker = '';
		newImageUrl = '';
		addModalOpen = false;
	}

	function startEdit(item: Agenda) {
		editingAgenda = { ...item };
		editDateLocal = toDatetimeLocal(item.event_date);
		editModalOpen = true;
	}

	function handleSaveEdit() {
		if (!editingAgenda || !editingAgenda.title || !editingAgenda.location) return;
		agendaStore.updateAgenda(editingAgenda.id, {
			title: editingAgenda.title,
			category: editingAgenda.category,
			description: editingAgenda.description,
			event_date: editDateLocal ? new Date(editDateLocal).toISOString() : editingAgenda.event_date,
			location: editingAgenda.location,
			speaker: editingAgenda.speaker,
			image_url: editingAgenda.image_url?.trim() || undefined
		});
		editModalOpen = false;
		editingAgenda = null;
	}

	function deleteAgenda(id: string) {
		if (confirm('Yakin ingin menghapus agenda ini? Agenda akan langsung terhapus dari portal jamaah.')) {
			agendaStore.deleteAgenda(id);
		}
	}
</script>

<svelte:head>
	<title>Manajemen Agenda - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Manajemen Agenda & Event Qur'an</h1>
			<p class="text-xs text-quran-warm">Tambah, edit, dan publikasikan jadwal kajian, tilawah simaan, dan pengingat secara live ke beranda & halaman agenda jamaah.</p>
		</div>

		<button
			on:click={() => (addModalOpen = true)}
			class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
		>
			<Plus class="w-4 h-4 text-quran-gold" />
			<span>Buat Agenda Baru</span>
		</button>
	</div>

	<!-- Agendas Table -->
	<div class="bg-quran-surface rounded-3xl border border-quran-border/80 shadow-luxury overflow-x-auto">
		<table class="w-full text-left text-xs text-quran-dark">
			<thead class="bg-quran-sand/70 text-quran-chocolate border-b border-quran-border text-[11px] font-bold uppercase tracking-wider">
				<tr>
					<th class="p-4">Judul & Banner Agenda</th>
					<th class="p-4">Kategori</th>
					<th class="p-4">Waktu Pelaksanaan</th>
					<th class="p-4">Lokasi / Media</th>
					<th class="p-4">Status</th>
					<th class="p-4 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-quran-border/60">
				{#each $agendaStore as item (item.id)}
					<tr class="hover:bg-quran-sand/30 transition">
						<td class="p-4 font-bold text-quran-dark max-w-xs">
							<div class="flex items-center gap-3">
								{#if item.image_url}
									<img src={item.image_url} alt={item.title} class="w-12 h-9 rounded-lg object-cover border border-quran-border flex-shrink-0" />
								{/if}
								<div class="min-w-0">
									<div class="truncate">{item.title}</div>
									{#if item.speaker}
										<div class="text-[11px] text-quran-warm font-normal truncate">Narasumber: {item.speaker}</div>
									{/if}
								</div>
							</div>
						</td>

						<td class="p-4">
							<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-quran-sand text-quran-chocolate border border-quran-border">
								{item.category}
							</span>
						</td>

						<td class="p-4 text-quran-dark font-medium whitespace-nowrap">
							{new Date(item.event_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
						</td>

						<td class="p-4 text-quran-warm">
							{item.location}
						</td>

						<td class="p-4">
							<span class="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
								<CheckCircle2 class="w-3.5 h-3.5" /> Published
							</span>
						</td>

						<td class="p-4 text-right">
							<div class="flex items-center justify-end gap-1.5">
								<button
									on:click={() => startEdit(item)}
									class="p-2 text-quran-chocolate hover:text-quran-dark rounded-lg bg-quran-sand hover:bg-quran-beige transition"
									title="Edit Agenda"
								>
									<Edit3 class="w-4 h-4" />
								</button>
								<button
									on:click={() => deleteAgenda(item.id)}
									class="p-2 text-quran-warm hover:text-red-600 rounded-lg hover:bg-red-50 transition"
									title="Hapus Agenda Langsung"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Add Modal -->
	{#if addModalOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => (addModalOpen = false)}
			on:keydown={(e) => e.key === 'Escape' && (addModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Tambah Agenda"
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
					<h3 class="font-bold text-sm text-quran-dark">Tambah Agenda Baru (Live Update)</h3>
					<button on:click={() => (addModalOpen = false)} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div>
					<label for="agenda-title" class="block text-xs font-bold text-quran-chocolate mb-1">Judul Agenda</label>
					<input
						id="agenda-title"
						type="text"
						placeholder="Misal: Kajian Bulanan Tafsir Surah Al-Kahf"
						bind:value={newTitle}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="agenda-cat" class="block text-xs font-bold text-quran-chocolate mb-1">Kategori</label>
						<select
							id="agenda-cat"
							bind:value={newCategory}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						>
							<option value="Kajian">Kajian</option>
							<option value="Tilawah">Tilawah</option>
							<option value="Event">Event</option>
							<option value="Pengingat">Pengingat</option>
						</select>
					</div>

					<div>
						<label for="agenda-date" class="block text-xs font-bold text-quran-chocolate mb-1">Tanggal & Waktu</label>
						<input
							id="agenda-date"
							type="datetime-local"
							bind:value={newDate}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="agenda-speaker" class="block text-xs font-bold text-quran-chocolate mb-1">Narasumber / Asatidz</label>
						<input
							id="agenda-speaker"
							type="text"
							placeholder="Ust. Fulan, Lc"
							bind:value={newSpeaker}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="agenda-loc" class="block text-xs font-bold text-quran-chocolate mb-1">Lokasi / Tautan</label>
						<input
							id="agenda-loc"
							type="text"
							placeholder="Masjid / Zoom Meeting"
							bind:value={newLoc}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="agenda-img" class="block text-xs font-bold text-quran-chocolate mb-1">URL Gambar Banner (Opsional, kosongkan untuk gambar Islami otomatis)</label>
					<input
						id="agenda-img"
						type="text"
						placeholder="/images/agendas/alkahfi-friday.jpg"
						bind:value={newImageUrl}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs font-mono text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="agenda-desc" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Kegiatan</label>
					<textarea
						id="agenda-desc"
						rows="3"
						placeholder="Uraian isi agenda..."
						bind:value={newDesc}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => (addModalOpen = false)} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleAddAgenda} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Publikasikan Langsung</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Edit Modal -->
	{#if editModalOpen && editingAgenda}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => (editModalOpen = false)}
			on:keydown={(e) => e.key === 'Escape' && (editModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Edit Agenda"
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
					<h3 class="font-bold text-sm text-quran-dark">Edit Agenda Kajian / Event</h3>
					<button on:click={() => (editModalOpen = false)} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div>
					<label for="edit-agenda-title" class="block text-xs font-bold text-quran-chocolate mb-1">Judul Agenda</label>
					<input
						id="edit-agenda-title"
						type="text"
						bind:value={editingAgenda.title}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-agenda-cat" class="block text-xs font-bold text-quran-chocolate mb-1">Kategori</label>
						<select
							id="edit-agenda-cat"
							bind:value={editingAgenda.category}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						>
							<option value="Kajian">Kajian</option>
							<option value="Tilawah">Tilawah</option>
							<option value="Event">Event</option>
							<option value="Pengingat">Pengingat</option>
						</select>
					</div>

					<div>
						<label for="edit-agenda-date" class="block text-xs font-bold text-quran-chocolate mb-1">Tanggal & Waktu</label>
						<input
							id="edit-agenda-date"
							type="datetime-local"
							bind:value={editDateLocal}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-agenda-speaker" class="block text-xs font-bold text-quran-chocolate mb-1">Narasumber</label>
						<input
							id="edit-agenda-speaker"
							type="text"
							bind:value={editingAgenda.speaker}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="edit-agenda-loc" class="block text-xs font-bold text-quran-chocolate mb-1">Lokasi / Media</label>
						<input
							id="edit-agenda-loc"
							type="text"
							bind:value={editingAgenda.location}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="edit-agenda-img" class="block text-xs font-bold text-quran-chocolate mb-1">URL Gambar Banner</label>
					<input
						id="edit-agenda-img"
						type="text"
						bind:value={editingAgenda.image_url}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs font-mono text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="edit-agenda-desc" class="block text-xs font-bold text-quran-chocolate mb-1">Deskripsi Kegiatan</label>
					<textarea
						id="edit-agenda-desc"
						rows="3"
						bind:value={editingAgenda.description}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none resize-none"
					></textarea>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => (editModalOpen = false)} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleSaveEdit} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Perubahan</button>
				</div>
			</div>
		</div>
	{/if}
</div>
