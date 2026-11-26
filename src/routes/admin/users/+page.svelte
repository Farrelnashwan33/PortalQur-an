<script lang="ts">
	import { onMount } from 'svelte';
	import { usersStore, type ManagedUser } from '$lib/stores/users';
	import { authStore } from '$lib/stores/auth';
	import {
		Users,
		Search,
		ShieldCheck,
		UserCheck,
		UserX,
		Trash2,
		Flame,
		BookOpen,
		CheckCircle,
		XCircle,
		Filter,
		Plus,
		X,
		KeyRound,
		Eye,
		EyeOff,
		Sparkles,
		CheckCircle2,
		AlertCircle,
		RefreshCw,
		Database,
		Edit3,
		Phone
	} from 'lucide-svelte';

	let searchQuery = '';
	let roleFilter = 'all';
	let addModalOpen = false;
	let editModalOpen = false;
	let isLoading = true;
	let syncSuccessMsg = '';

	let newName = '';
	let newEmail = '';
	let newPhone = '';
	let newRole: 'customer' | 'admin' = 'customer';

	// Edit User State
	let editingUser: ManagedUser | null = null;

	// Reset Password State
	let resetModalOpen = false;
	let selectedUserForReset: ManagedUser | null = null;
	let newPassword = '';
	let showPassword = false;
	let isResetting = false;
	let resetSuccessMsg = '';
	let resetErrorMsg = '';

	onMount(async () => {
		isLoading = true;
		await usersStore.fetchUsers();
		isLoading = false;
	});

	$: filteredUsers = $usersStore.filter((u) => {
		const q = searchQuery.toLowerCase();
		const matchSearch =
			u.name.toLowerCase().includes(q) ||
			(u.email || '').toLowerCase().includes(q) ||
			(u.phone || '').toLowerCase().includes(q) ||
			(u.last_surah || '').toLowerCase().includes(q);
		if (!matchSearch) return false;
		if (roleFilter === 'all') return true;
		return u.role === roleFilter;
	});

	$: totalActiveUsers = $usersStore.filter((u) => u.is_active).length;
	$: totalJamaahOnly = $usersStore.filter((u) => u.role === 'customer').length;
	$: totalAyahsAcrossUsers = $usersStore.reduce((acc, u) => acc + (u.ayahs_read || 0), 0);

	async function handleSyncDatabase() {
		isLoading = true;
		await usersStore.importDatabaseSeeds();
		await usersStore.fetchUsers();
		isLoading = false;
		syncSuccessMsg = `Berhasil menyinkronkan ${$usersStore.length} data jamaah dari database ke panel admin!`;
		setTimeout(() => (syncSuccessMsg = ''), 3500);
	}

	function toggleActive(userId: string) {
		usersStore.toggleActive(userId);
	}

	function toggleRole(userId: string) {
		usersStore.toggleRole(userId);
	}

	function handleDelete(userId: string, userName: string) {
		if (confirm(`Yakin ingin menghapus jamaah "${userName}"? Data pengguna akan dihapus dari daftar manajemen.`)) {
			usersStore.deleteUser(userId);
		}
	}

	function handleAddUser() {
		if (!newName || !newEmail) return;
		usersStore.addUser({
			name: newName.trim(),
			email: newEmail.trim().toLowerCase(),
			phone: newPhone.trim(),
			role: newRole,
			is_active: true,
			ayahs_read: 10,
			streak: 1,
			last_surah: 'Al-Fatihah : 1',
			created_at: new Date().toISOString().split('T')[0]
		});
		newName = '';
		newEmail = '';
		newPhone = '';
		newRole = 'customer';
		addModalOpen = false;
	}

	function openEditUser(user: ManagedUser) {
		editingUser = { ...user };
		editModalOpen = true;
	}

	async function handleSaveEditUser() {
		if (!editingUser) return;
		await usersStore.updateUser(editingUser.id, {
			name: editingUser.name,
			email: editingUser.email,
			phone: editingUser.phone,
			role: editingUser.role,
			is_active: editingUser.is_active,
			ayahs_read: Number(editingUser.ayahs_read) || 0,
			streak: Number(editingUser.streak) || 0,
			last_surah: editingUser.last_surah
		});
		editModalOpen = false;
		editingUser = null;
	}

	function openResetPassword(user: ManagedUser) {
		selectedUserForReset = user;
		newPassword = '';
		resetSuccessMsg = '';
		resetErrorMsg = '';
		showPassword = false;
		resetModalOpen = true;
	}

	function generateRandomPassword() {
		const prefixes = ['Qurani', 'Berkah', 'Sakinah', 'Tilawah', 'Amanah', 'Istiqlal'];
		const randPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
		const randNum = Math.floor(100 + Math.random() * 900);
		newPassword = `${randPrefix}${randNum}!`;
	}

	async function handleSaveNewPassword() {
		if (!selectedUserForReset) return;
		if (!newPassword || newPassword.length < 6) {
			resetErrorMsg = 'Kata sandi baru minimal harus 6 karakter.';
			return;
		}

		isResetting = true;
		resetErrorMsg = '';
		resetSuccessMsg = '';

		try {
			const userEmail = selectedUserForReset.email || `${selectedUserForReset.id}@portalquran.id`;
			await authStore.resetPassword(userEmail, newPassword);

			resetSuccessMsg = `Kata sandi untuk ${selectedUserForReset.name} berhasil diperbarui!`;
			setTimeout(() => {
				resetModalOpen = false;
			}, 1500);
		} catch (err: any) {
			resetErrorMsg = err.message || 'Gagal mengubah kata sandi.';
		} finally {
			isResetting = false;
		}
	}
</script>

<svelte:head>
	<title>Manajemen Jamaah & Pengguna - Admin Portal Qur'an v3.3</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<!-- Top Bar -->
	<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Manajemen Jamaah & Pengguna</h1>
			<p class="text-xs text-quran-warm mt-0.5">
				Seluruh jamaah yang masuk/menggunakan aplikasi serta data jamaah dari database SQL otomatis tercatat secara real-time di sini.
			</p>
		</div>

		<div class="flex items-center gap-2 sm:gap-2.5 flex-wrap">
			<button
				on:click={handleSyncDatabase}
				disabled={isLoading}
				class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-quran-sand hover:bg-quran-beige text-quran-dark font-bold text-xs border border-quran-gold/40 transition cursor-pointer disabled:opacity-50"
				title="Muat & Sinkronkan seluruh jamaah dari Database SQL"
			>
				<Database class="w-3.5 h-3.5 text-quran-gold {isLoading ? 'animate-pulse' : ''}" />
				<span>Sinkron Database Jamaah</span>
			</button>

			<button
				on:click={async () => {
					isLoading = true;
					await usersStore.fetchUsers();
					isLoading = false;
				}}
				disabled={isLoading}
				class="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-quran-surface hover:bg-quran-sand text-quran-dark font-bold text-xs border border-quran-border transition cursor-pointer disabled:opacity-50"
				title="Segarkan Daftar Jamaah"
			>
				<RefreshCw class="w-3.5 h-3.5 text-quran-gold {isLoading ? 'animate-spin' : ''}" />
				<span>Refresh</span>
			</button>

			<button
				on:click={() => (addModalOpen = true)}
				class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all cursor-pointer"
			>
				<Plus class="w-4 h-4 text-quran-gold" />
				<span>Tambah Jamaah</span>
			</button>
		</div>
	</div>

	{#if syncSuccessMsg}
		<div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
			<CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
			<span>{syncSuccessMsg}</span>
		</div>
	{/if}

	<!-- Quick Summary KPI Strip -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
		<div class="p-4 rounded-2xl bg-quran-surface border border-quran-border/80 shadow-sm">
			<div class="flex items-center justify-between text-[11px] font-bold uppercase text-quran-warm">
				<span>Total Terdaftar</span>
				<Users class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark mt-1">{$usersStore.length} <span class="text-xs font-normal text-quran-warm">Akun</span></div>
		</div>

		<div class="p-4 rounded-2xl bg-quran-surface border border-quran-border/80 shadow-sm">
			<div class="flex items-center justify-between text-[11px] font-bold uppercase text-quran-warm">
				<span>Jamaah Aktif</span>
				<CheckCircle class="w-4 h-4 text-emerald-600" />
			</div>
			<div class="text-2xl font-extrabold text-emerald-700 mt-1">{totalActiveUsers} <span class="text-xs font-normal text-quran-warm">Aktif</span></div>
		</div>

		<div class="p-4 rounded-2xl bg-quran-surface border border-quran-border/80 shadow-sm">
			<div class="flex items-center justify-between text-[11px] font-bold uppercase text-quran-warm">
				<span>Jamaah Tilawah</span>
				<ShieldCheck class="w-4 h-4 text-quran-chocolate" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark mt-1">{totalJamaahOnly} <span class="text-xs font-normal text-quran-warm">Jamaah</span></div>
		</div>

		<div class="p-4 rounded-2xl bg-quran-surface border border-quran-border/80 shadow-sm">
			<div class="flex items-center justify-between text-[11px] font-bold uppercase text-quran-warm">
				<span>Total Tilawah Jamaah</span>
				<BookOpen class="w-4 h-4 text-quran-gold" />
			</div>
			<div class="text-2xl font-extrabold text-quran-dark mt-1">{totalAyahsAcrossUsers.toLocaleString('id-ID')} <span class="text-xs font-normal text-quran-warm">Ayat</span></div>
		</div>
	</div>

	<!-- Filter & Search Toolbar -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-quran-surface p-4 rounded-3xl border border-quran-border/80 shadow-luxury">
		<div class="relative flex-1 max-w-md">
			<Search class="w-4 h-4 text-quran-gold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
			<input
				type="text"
				placeholder="Cari nama jamaah, email, no. HP, atau surah..."
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
			/>
		</div>

		<div class="flex items-center gap-2">
			<Filter class="w-4 h-4 text-quran-warm" />
			<select
				bind:value={roleFilter}
				class="px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
			>
				<option value="all">Semua ({$usersStore.length})</option>
				<option value="customer">Jamaah / Customer ({totalJamaahOnly})</option>
				<option value="admin">Administrator ({$usersStore.length - totalJamaahOnly})</option>
			</select>
		</div>
	</div>

	<!-- User Table (Responsive Mobile & Desktop) -->
	<div class="bg-quran-surface rounded-3xl border border-quran-border/80 shadow-luxury overflow-x-auto">
		<table class="w-full text-left text-xs text-quran-dark">
			<thead class="bg-quran-sand/70 text-quran-chocolate border-b border-quran-border text-[11px] font-bold uppercase tracking-wider">
				<tr>
					<th class="p-4">Data Jamaah</th>
					<th class="p-4">Role & Sumber</th>
					<th class="p-4">Status</th>
					<th class="p-4">Bacaan Terakhir & Tilawah</th>
					<th class="p-4">Terdaftar</th>
					<th class="p-4 text-right">Aksi Admin</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-quran-border/60">
				{#if isLoading}
					<tr>
						<td colspan="6" class="p-8 text-center text-quran-warm">
							<div class="w-6 h-6 border-2 border-quran-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
							<span>Memuat & menyinkronkan data jamaah dari database...</span>
						</td>
					</tr>
				{:else if filteredUsers.length === 0}
					<tr>
						<td colspan="6" class="p-8 text-center text-quran-warm">
							<p class="font-bold text-sm text-quran-dark">Tidak ada jamaah yang cocok dengan pencarian</p>
							<p class="text-xs text-quran-warm mt-1">Klik "Sinkron Database Jamaah" untuk memuat ulang seluruh data jamaah.</p>
						</td>
					</tr>
				{:else}
					{#each filteredUsers as user (user.id)}
						<tr class="hover:bg-quran-sand/30 transition">
							<td class="p-4">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl bg-gradient-luxury text-quran-gold font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
										{user.name ? user.name.charAt(0).toUpperCase() : 'J'}
									</div>
									<div class="min-w-0">
										<div class="font-bold text-quran-dark truncate">{user.name}</div>
										<div class="text-[11px] text-quran-warm font-mono truncate">{user.email || '-'}</div>
										{#if user.phone}
											<div class="text-[10px] text-quran-muted font-mono flex items-center gap-1 mt-0.5">
												<Phone class="w-2.5 h-2.5 text-quran-gold" />
												<span>{user.phone}</span>
											</div>
										{/if}
									</div>
								</div>
							</td>

							<td class="p-4">
								<div class="flex flex-col items-start gap-1">
									<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase {user.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-quran-sand text-quran-chocolate border border-quran-border'}">
										{user.role === 'admin' ? 'Admin' : 'Jamaah'}
									</span>
									<span class="text-[10px] font-semibold {user.source === 'live' ? 'text-emerald-700' : 'text-quran-warm'}">
										{user.source === 'live' ? '● Sesi Aplikasi Live' : '● Database SQL'}
									</span>
								</div>
							</td>

							<td class="p-4">
								{#if user.is_active}
									<span class="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
										<CheckCircle class="w-3.5 h-3.5" /> Aktif
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 text-red-600 font-semibold text-[11px]">
										<XCircle class="w-3.5 h-3.5" /> Nonaktif
									</span>
								{/if}
							</td>

							<td class="p-4">
								<div class="space-y-1">
									<div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-quran-sand/80 border border-quran-border text-[11px] font-semibold text-quran-dark">
										<BookOpen class="w-3 h-3 text-quran-gold" />
										<span>{user.last_surah || 'Al-Fatihah : 1'}</span>
									</div>
									<div class="flex items-center gap-3 text-[11px]">
										<span class="text-quran-warm font-medium">{user.ayahs_read} ayat</span>
										<span class="flex items-center gap-0.5 text-orange-600 font-semibold">
											<Flame class="w-3 h-3" /> {user.streak} hari
										</span>
									</div>
								</div>
							</td>

							<td class="p-4 text-quran-warm font-mono text-[11px] whitespace-nowrap">
								{user.created_at}
							</td>

							<td class="p-4 text-right">
								<div class="flex items-center justify-end gap-1">
									<button
										on:click={() => openEditUser(user)}
										class="p-1.5 rounded-lg text-xs font-semibold text-quran-chocolate bg-quran-sand hover:bg-quran-beige border border-quran-border transition"
										title="Edit Data Jamaah"
									>
										<Edit3 class="w-3.5 h-3.5" />
									</button>

									<button
										on:click={() => openResetPassword(user)}
										class="p-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 transition"
										title="Ubah / Reset Kata Sandi"
									>
										<KeyRound class="w-3.5 h-3.5 text-amber-700" />
									</button>

									<button
										on:click={() => toggleRole(user.id)}
										class="px-2 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap {user.role === 'admin' ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100' : 'bg-quran-sand text-quran-dark border border-quran-border hover:bg-quran-beige'}"
										title="Ubah Role"
									>
										{user.role === 'admin' ? 'Admin' : 'Jamaah'}
									</button>

									<button
										on:click={() => toggleActive(user.id)}
										class="p-1.5 rounded-lg text-xs font-semibold transition {user.is_active ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'}"
										title={user.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
									>
										{#if user.is_active}
											<UserX class="w-3.5 h-3.5" />
										{:else}
											<UserCheck class="w-3.5 h-3.5" />
										{/if}
									</button>

									<button
										on:click={() => handleDelete(user.id, user.name)}
										class="p-1.5 rounded-lg text-xs font-semibold text-quran-warm hover:text-red-600 hover:bg-red-50 transition"
										title="Hapus Jamaah"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Add User Modal -->
	{#if addModalOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => (addModalOpen = false)}
			on:keydown={(e) => e.key === 'Escape' && (addModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Tambah Pengguna"
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
					<h3 class="text-sm font-bold text-quran-dark">Tambah Jamaah / Pengguna Baru</h3>
					<button on:click={() => (addModalOpen = false)} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div>
					<label for="new-user-name" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Lengkap Jamaah</label>
					<input
						id="new-user-name"
						type="text"
						placeholder="Misal: H. Abdullah Gymnastiar"
						bind:value={newName}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-user-email" class="block text-xs font-bold text-quran-chocolate mb-1">Email Jamaah</label>
					<input
						id="new-user-email"
						type="email"
						placeholder="jamaah@email.com"
						bind:value={newEmail}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-user-phone" class="block text-xs font-bold text-quran-chocolate mb-1">Nomor WhatsApp / HP</label>
					<input
						id="new-user-phone"
						type="text"
						placeholder="0812xxxxxxxx"
						bind:value={newPhone}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="new-user-role" class="block text-xs font-bold text-quran-chocolate mb-1">Hak Akses (Role)</label>
					<select
						id="new-user-role"
						bind:value={newRole}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					>
						<option value="customer">Jamaah / Customer</option>
						<option value="admin">Administrator</option>
					</select>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => (addModalOpen = false)} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleAddUser} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Jamaah</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Edit User Modal -->
	{#if editModalOpen && editingUser}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => (editModalOpen = false)}
			on:keydown={(e) => e.key === 'Escape' && (editModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Edit Jamaah"
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
					<h3 class="text-sm font-bold text-quran-dark">Edit Data Jamaah</h3>
					<button on:click={() => (editModalOpen = false)} class="text-quran-warm hover:text-quran-dark" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div>
					<label for="edit-user-name" class="block text-xs font-bold text-quran-chocolate mb-1">Nama Lengkap</label>
					<input
						id="edit-user-name"
						type="text"
						bind:value={editingUser.name}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="edit-user-email" class="block text-xs font-bold text-quran-chocolate mb-1">Email</label>
						<input
							id="edit-user-email"
							type="email"
							bind:value={editingUser.email}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="edit-user-phone" class="block text-xs font-bold text-quran-chocolate mb-1">No. HP / WA</label>
						<input
							id="edit-user-phone"
							type="text"
							bind:value={editingUser.phone}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-user-ayahs" class="block text-xs font-bold text-quran-chocolate mb-1">Total Ayat Dibaca</label>
						<input
							id="edit-user-ayahs"
							type="number"
							min="0"
							bind:value={editingUser.ayahs_read}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>

					<div>
						<label for="edit-user-streak" class="block text-xs font-bold text-quran-chocolate mb-1">Streak (Hari)</label>
						<input
							id="edit-user-streak"
							type="number"
							min="0"
							bind:value={editingUser.streak}
							class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="edit-user-surah" class="block text-xs font-bold text-quran-chocolate mb-1">Bacaan Terakhir</label>
					<input
						id="edit-user-surah"
						type="text"
						placeholder="Al-Kahf : 10"
						bind:value={editingUser.last_surah}
						class="w-full px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
					/>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button on:click={() => (editModalOpen = false)} class="px-4 py-2 text-xs text-quran-warm">Batal</button>
					<button on:click={handleSaveEditUser} class="px-5 py-2 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold">Simpan Perubahan</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Reset Password Modal -->
	{#if resetModalOpen && selectedUserForReset}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => (resetModalOpen = false)}
			on:keydown={(e) => e.key === 'Escape' && (resetModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Ubah Kata Sandi"
		>
			<div
				class="bg-quran-surface rounded-3xl max-w-md w-full border border-amber-500/40 shadow-luxury overflow-hidden p-6 space-y-4 animate-in zoom-in-95"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
					<div class="flex items-center gap-2.5">
						<div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-300 shadow-sm">
							<KeyRound class="w-4 h-4 text-amber-700" />
						</div>
						<div>
							<h3 class="text-sm font-bold text-quran-dark">Ubah Kata Sandi Jamaah</h3>
							<p class="text-[10px] text-quran-warm">Reset kata sandi akun jamaah secara langsung</p>
						</div>
					</div>
					<button on:click={() => (resetModalOpen = false)} class="text-quran-warm hover:text-quran-dark p-1 rounded-lg" aria-label="Tutup">
						<X class="w-4 h-4" />
					</button>
				</div>

				<div class="p-3 rounded-2xl bg-quran-sand/80 border border-quran-border flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-gradient-luxury text-quran-gold font-extrabold flex items-center justify-center text-sm shadow-gold flex-shrink-0">
						{selectedUserForReset.name.charAt(0).toUpperCase()}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between gap-1">
							<span class="text-xs font-bold text-quran-dark truncate">{selectedUserForReset.name}</span>
							<span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white text-quran-chocolate border border-quran-border/60">
								{selectedUserForReset.role}
							</span>
						</div>
						<span class="text-[11px] text-quran-warm font-mono block truncate">{selectedUserForReset.email || selectedUserForReset.phone}</span>
					</div>
				</div>

				{#if resetErrorMsg}
					<div class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
						<AlertCircle class="w-4 h-4 text-red-600 flex-shrink-0" />
						<span>{resetErrorMsg}</span>
					</div>
				{/if}

				{#if resetSuccessMsg}
					<div class="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-in fade-in">
						<CheckCircle2 class="w-4 h-4 text-green-600 flex-shrink-0" />
						<span class="font-semibold">{resetSuccessMsg}</span>
					</div>
				{/if}

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<label for="admin-reset-newpass" class="block text-xs font-bold text-quran-chocolate">
							Kata Sandi Baru
						</label>
						<button
							type="button"
							on:click={generateRandomPassword}
							class="text-[10px] font-bold text-amber-900 hover:text-black flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 transition"
						>
							<Sparkles class="w-3 h-3 text-amber-700" />
							<span>Buat Acak</span>
						</button>
					</div>

					<div class="relative">
						<input
							id="admin-reset-newpass"
							type={showPassword ? 'text' : 'password'}
							placeholder="Masukkan kata sandi baru (min. 6 karakter)..."
							bind:value={newPassword}
							class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-quran-border text-xs text-quran-dark focus:border-amber-600 focus:outline-none shadow-sm"
						/>
						<button
							type="button"
							on:click={() => (showPassword = !showPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-quran-warm hover:text-quran-dark p-1"
							aria-label="Tampilkan Kata Sandi"
						>
							{#if showPassword}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-2 border-t border-quran-border/60">
					<button
						on:click={() => (resetModalOpen = false)}
						class="px-4 py-2 text-xs font-medium text-quran-warm hover:text-quran-dark transition"
					>
						Batal
					</button>
					<button
						on:click={handleSaveNewPassword}
						disabled={isResetting || !newPassword}
						class="px-5 py-2.5 bg-gradient-gold text-quran-dark font-extrabold text-xs rounded-xl shadow-gold hover:opacity-95 active:scale-98 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
					>
						{#if isResetting}
							<div class="w-3.5 h-3.5 border-2 border-quran-dark border-t-transparent rounded-full animate-spin"></div>
							<span>Menyimpan...</span>
						{:else}
							<span>Simpan Kata Sandi</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
