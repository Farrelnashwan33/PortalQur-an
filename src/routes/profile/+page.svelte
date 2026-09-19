<script lang="ts">
	import { authStore, isAdmin } from '$lib/stores/auth';
	import { 
		User, 
		Phone, 
		ShieldCheck, 
		Target, 
		Award, 
		Lock, 
		LogOut, 
		Sparkles, 
		CheckCircle2, 
		Layers,
		Save,
		Camera,
		Upload,
		Image as ImageIcon,
		X,
		RefreshCw
	} from 'lucide-svelte';

	let fullName = $authStore?.full_name || 'Hamba Allah';
	let targetJuz = $authStore?.reading_target_juz || 30;
	let dailyTarget = $authStore?.daily_target_ayahs || 10;
	let avatarUrl = $authStore?.avatar_url || '/logo.png';
	let isSaved = false;

	// Avatar Modal state
	let isAvatarModalOpen = false;
	let customUrlInput = '';
	let fileInputEl: HTMLInputElement;

	const presetAvatars = [
		{ name: 'Maskot Portal Qur\'an', url: '/logo.png' },
		{ name: 'Santriwan Qari', url: 'https://images.unsplash.com/photo-1597934678749-015b67a151b4?w=200&auto=format&fit=crop' },
		{ name: 'Pemuda Qur\'ani', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop' },
		{ name: 'Santriwati Hijab', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop' },
		{ name: 'Asatidz / Dai', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop' },
		{ name: 'Muslimah Muda', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop' }
	];

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const rawDataUrl = event.target?.result as string;
			// Compress image using canvas
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const maxDim = 320;
				let width = img.width;
				let height = img.height;
				if (width > height) {
					if (width > maxDim) {
						height = Math.round((height * maxDim) / width);
						width = maxDim;
					}
				} else {
					if (height > maxDim) {
						width = Math.round((width * maxDim) / height);
						height = maxDim;
					}
				}
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx?.drawImage(img, 0, 0, width, height);
				avatarUrl = canvas.toDataURL('image/jpeg', 0.85);
				isAvatarModalOpen = false;
				handleSaveProfile();
			};
			img.src = rawDataUrl;
		};
		reader.readAsDataURL(file);
	}

	function handleSelectPreset(url: string) {
		avatarUrl = url;
		isAvatarModalOpen = false;
		handleSaveProfile();
	}

	function handleApplyCustomUrl() {
		if (customUrlInput.trim()) {
			avatarUrl = customUrlInput.trim();
			customUrlInput = '';
			isAvatarModalOpen = false;
			handleSaveProfile();
		}
	}

	function handleSaveProfile() {
		authStore.updateProfile({
			full_name: fullName,
			avatar_url: avatarUrl,
			reading_target_juz: targetJuz,
			daily_target_ayahs: dailyTarget
		});
		isSaved = true;
		setTimeout(() => (isSaved = false), 2500);
	}
</script>

<svelte:head>
	<title>Profil Saya & Target Tilawah - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
	
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-extrabold text-quran-dark">Profil & Pengaturan Akun</h1>
			<p class="text-xs text-quran-warm">Kelola informasi pribadi, foto profil, dan target pencapaian tilawah Al-Qur'an Anda.</p>
		</div>
		<button 
			on:click={() => authStore.logout()}
			class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition cursor-pointer"
		>
			<LogOut class="w-3.5 h-3.5" />
			<span>Keluar</span>
		</button>
	</div>

	{#if isSaved}
		<div class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
			<CheckCircle2 class="w-4 h-4 text-green-600 flex-shrink-0" />
			<span>Perubahan profil, foto, dan target tilawah berhasil disimpan!</span>
		</div>
	{/if}

	<!-- Hidden File Input for Direct Upload -->
	<input 
		type="file" 
		accept="image/*" 
		class="hidden" 
		bind:this={fileInputEl} 
		on:change={handleFileUpload} 
	/>

	<!-- Profile Card Overview -->
	<div class="bg-quran-surface rounded-3xl p-6 sm:p-8 border border-quran-border/80 shadow-luxury flex flex-col sm:flex-row items-center sm:items-start gap-6">
		
		<!-- Interactive Editable Profile Picture -->
		<div class="relative group cursor-pointer" on:click={() => isAvatarModalOpen = true} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && (isAvatarModalOpen = true)}>
			<div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-gold flex-shrink-0 border-2 border-quran-gold/60 group-hover:border-quran-gold transition-all">
				<img 
					src={avatarUrl || $authStore?.avatar_url || '/logo.png'} 
					alt="Foto Profil" 
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
				/>
			</div>

			<!-- Hover / Edit Button Overlay -->
			<div class="absolute inset-0 rounded-3xl bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
				<Camera class="w-6 h-6 mb-1 text-quran-gold" />
				<span>Ubah Foto</span>
			</div>

			<!-- Quick Edit Badge Icon -->
			<button 
				type="button" 
				on:click|stopPropagation={() => isAvatarModalOpen = true}
				class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-luxury text-quran-gold border-2 border-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
				title="Ubah Foto Profil"
				aria-label="Ubah Foto Profil"
			>
				<Camera class="w-4 h-4" />
			</button>
		</div>

		<div class="flex-1 space-y-2 text-center sm:text-left">
			<div class="flex flex-col sm:flex-row sm:items-center gap-2">
				<h2 class="text-xl font-bold text-quran-dark">{$authStore?.full_name || 'Hamba Allah'}</h2>
				<span class="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full {$authStore?.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-quran-sand text-quran-chocolate border border-quran-border'}">
					{$authStore?.role === 'admin' ? 'Administrator' : 'Sahabat Tilawah'}
				</span>
			</div>
			<p class="text-xs text-quran-warm font-mono">{$authStore?.phone || $authStore?.email || '081234567890'}</p>
			<p class="text-[11px] text-quran-muted">Bergabung sejak: {new Date($authStore?.created_at || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>

			<!-- Quick Change PP Button below info -->
			<div class="pt-1.5">
				<button 
					type="button" 
					on:click={() => isAvatarModalOpen = true}
					class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-quran-sand hover:bg-quran-beige text-quran-dark text-xs font-semibold border border-quran-border transition shadow-xs"
				>
					<Camera class="w-3.5 h-3.5 text-quran-gold" />
					<span>Ganti Foto Profil</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Form Edit Profile & Reading Target -->
	<form on:submit|preventDefault={handleSaveProfile} class="bg-quran-surface rounded-3xl p-6 sm:p-8 border border-quran-border/80 shadow-luxury space-y-6">
		<h3 class="text-xs font-bold uppercase tracking-wider text-quran-chocolate flex items-center gap-2">
			<Target class="w-4 h-4 text-quran-gold" />
			<span>Target Tilawah & Informasi Diri</span>
		</h3>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<!-- Full Name -->
			<div>
				<label for="profile-fullname" class="block text-xs font-bold text-quran-chocolate mb-1.5">Nama Lengkap</label>
				<input 
					id="profile-fullname"
					type="text" 
					bind:value={fullName}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
				/>
			</div>

			<!-- Phone (Read Only) -->
			<div>
				<label for="profile-phone" class="block text-xs font-bold text-quran-chocolate mb-1.5">Nomor WhatsApp / HP (Akun)</label>
				<input 
					id="profile-phone"
					type="tel" 
					readonly
					value={$authStore?.phone || $authStore?.email || '081234567890'}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand/50 border border-quran-border text-xs text-quran-muted font-mono cursor-not-allowed"
				/>
			</div>

			<!-- Target Juz -->
			<div>
				<label for="profile-target-juz" class="block text-xs font-bold text-quran-chocolate mb-1.5">Target Khatam (Juz)</label>
				<input 
					id="profile-target-juz"
					type="number" 
					min="1" 
					max="30"
					bind:value={targetJuz}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
				/>
			</div>

			<!-- Daily Ayahs Target -->
			<div>
				<label for="profile-daily-target" class="block text-xs font-bold text-quran-chocolate mb-1.5">Target Ayat per Hari</label>
				<input 
					id="profile-daily-target"
					type="number" 
					min="1" 
					max="200"
					bind:value={dailyTarget}
					class="w-full px-3.5 py-2.5 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark font-medium focus:border-quran-gold focus:outline-none"
				/>
			</div>
		</div>

		<div class="pt-4 border-t border-quran-border/60 flex justify-end">
			<button 
				type="submit"
				class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-luxury text-quran-cream text-xs font-bold shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
			>
				<Save class="w-4 h-4 text-quran-gold" />
				<span>Simpan Pengaturan</span>
			</button>
		</div>
	</form>

	<!-- Modal Ubah Foto Profil (Avatar Modal) -->
	{#if isAvatarModalOpen}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in"
			on:click={() => isAvatarModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (isAvatarModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Pilihan Foto"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-lg w-full border border-quran-gold/40 shadow-luxury overflow-hidden p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<!-- Modal Header -->
				<div class="flex items-center justify-between border-b border-quran-border/60 pb-3">
					<div class="flex items-center gap-2.5">
						<div class="w-9 h-9 rounded-2xl bg-gradient-luxury text-quran-gold flex items-center justify-center shadow-gold">
							<Camera class="w-4 h-4" />
						</div>
						<div>
							<h3 class="text-base font-bold text-quran-dark">Ubah Foto Profil (PP)</h3>
							<p class="text-[11px] text-quran-warm">Pilih avatar karakter islami atau unggah foto Anda sendiri</p>
						</div>
					</div>
					<button on:click={() => isAvatarModalOpen = false} class="text-quran-warm hover:text-quran-dark p-1.5 rounded-xl hover:bg-quran-sand transition" aria-label="Tutup">
						<X class="w-5 h-5" />
					</button>
				</div>

				<!-- Section 1: Upload from Device -->
				<div>
					<span class="block text-xs font-bold text-quran-chocolate uppercase tracking-wider mb-2">
						1. Unggah dari Galeri / Kamera
					</span>
					<button 
						type="button" 
						on:click={() => fileInputEl?.click()}
						class="w-full p-4 rounded-2xl border-2 border-dashed border-quran-gold/60 hover:border-quran-gold bg-quran-sand/50 hover:bg-quran-sand flex flex-col sm:flex-row items-center justify-center gap-3 transition group cursor-pointer"
					>
						<div class="w-10 h-10 rounded-xl bg-quran-gold/20 flex items-center justify-center text-quran-chocolate group-hover:scale-110 transition-transform">
							<Upload class="w-5 h-5 text-quran-primary" />
						</div>
						<div class="text-center sm:text-left">
							<span class="text-xs font-bold text-quran-dark block group-hover:text-quran-chocolate transition">Pilih File Foto / Gambar</span>
							<span class="text-[10px] text-quran-warm">Mendukung JPG, PNG, WEBP (Otomatis dioptimalkan)</span>
						</div>
					</button>
				</div>

				<!-- Section 2: Preset Islamic Character Avatars -->
				<div>
					<span class="block text-xs font-bold text-quran-chocolate uppercase tracking-wider mb-2">
						2. Atau Pilih Karakter Avatar Islami
					</span>
					<div class="grid grid-cols-3 gap-3">
						{#each presetAvatars as preset}
							<button 
								type="button" 
								on:click={() => handleSelectPreset(preset.url)}
								class="p-2 rounded-2xl border transition-all text-center flex flex-col items-center gap-1.5 group {
									avatarUrl === preset.url 
										? 'bg-amber-100/70 border-amber-500 shadow-md ring-2 ring-amber-400/40' 
										: 'bg-white border-quran-border/80 hover:border-quran-gold hover:bg-quran-sand/50'
								}"
							>
								<div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
									<img src={preset.url} alt={preset.name} class="w-full h-full object-cover" />
								</div>
								<span class="text-[10px] font-semibold text-quran-dark truncate max-w-full block">
									{preset.name}
								</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Section 3: Custom URL Input (Optional) -->
				<div class="pt-2 border-t border-quran-border/60">
					<label for="custom-avatar-url" class="block text-xs font-bold text-quran-chocolate mb-1.5">
						3. Tautan URL Gambar Kustom (Opsional)
					</label>
					<div class="flex gap-2">
						<input 
							id="custom-avatar-url"
							type="url" 
							placeholder="https://example.com/foto-anda.jpg"
							bind:value={customUrlInput}
							class="flex-1 px-3.5 py-2 rounded-xl bg-quran-sand border border-quran-border text-xs text-quran-dark focus:border-quran-gold focus:outline-none"
						/>
						<button 
							type="button" 
							on:click={handleApplyCustomUrl}
							class="px-4 py-2 bg-quran-sand hover:bg-quran-beige text-quran-dark font-bold text-xs rounded-xl border border-quran-border transition cursor-pointer"
						>
							Terapkan
						</button>
					</div>
				</div>

				<!-- Footer Actions -->
				<div class="flex items-center justify-between pt-3 border-t border-quran-border/60">
					<button 
						type="button" 
						on:click={() => handleSelectPreset('/logo.png')}
						class="text-xs font-semibold text-quran-warm hover:text-quran-chocolate flex items-center gap-1"
					>
						<RefreshCw class="w-3.5 h-3.5" />
						<span>Kembalikan ke Default</span>
					</button>

					<button 
						type="button" 
						on:click={() => isAvatarModalOpen = false} 
						class="px-5 py-2.5 bg-gradient-luxury text-quran-cream font-bold text-xs rounded-xl shadow-gold hover:opacity-95 transition"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	{/if}

</div>
