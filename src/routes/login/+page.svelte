<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore, sessionExpiredAlert } from '$lib/stores/auth';
	import { 
		BookOpen, 
		Eye, 
		EyeOff, 
		Lock, 
		Mail, 
		User, 
		ArrowRight, 
		CheckCircle2, 
		Sparkles, 
		ShieldCheck, 
		AlertCircle 
	} from 'lucide-svelte';

	export let isRegisterMode = false;

	$: if ($page.url.pathname === '/register') {
		isRegisterMode = true;
	} else if ($page.url.pathname === '/login') {
		isRegisterMode = false;
	}

	let showPassword = false;
	let showConfirmPassword = false;

	// Login form fields (empty, no hardcoded dummy data)
	let loginEmail = '';
	let loginPassword = '';
	let rememberMe = true;

	// Register form fields (empty, user creates own account)
	let regFullName = '';
	let regEmail = '';
	let regPassword = '';
	let regConfirmPassword = '';
	let agreeTerms = false;

	// Status states
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

	// Reactive session expiry alert
	$: if ($sessionExpiredAlert && !errorMessage) {
		errorMessage = $sessionExpiredAlert;
	}

	async function handleLogin() {
		errorMessage = '';
		successMessage = '';
		sessionExpiredAlert.set('');

		if (!loginEmail || !loginPassword) {
			errorMessage = 'Harap isi email dan kata sandi Anda.';
			return;
		}

		isLoading = true;

		try {
			const res = await authStore.login(loginEmail, loginPassword, rememberMe);
			if (res.success) {
				successMessage = 'Berhasil masuk! Membuka Al-Qur\'an...';
				setTimeout(() => {
					if (res.role === 'admin') {
						goto('/admin');
					} else {
						goto('/quran');
					}
				}, 400);
			} else {
				errorMessage = res.error || 'Gagal masuk. Periksa email dan kata sandi.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'Terjadi kesalahan sistem.';
		} finally {
			isLoading = false;
		}
	}

	async function handleRegister() {
		errorMessage = '';
		successMessage = '';

		if (!regFullName || !regEmail || !regPassword || !regConfirmPassword) {
			errorMessage = 'Semua kolom pendaftaran wajib diisi.';
			return;
		}

		if (regPassword.length < 6) {
			errorMessage = 'Kata sandi minimal harus 6 karakter.';
			return;
		}

		if (regPassword !== regConfirmPassword) {
			errorMessage = 'Konfirmasi kata sandi tidak cocok.';
			return;
		}

		if (!agreeTerms) {
			errorMessage = 'Harap setujui syarat & ketentuan layanan.';
			return;
		}

		isLoading = true;
		try {
			const res = await authStore.register(regFullName, regEmail, regPassword);
			if (res.success) {
				successMessage = 'Pendaftaran berhasil! Mengalihkan ke pembaca Al-Qur\'an...';
				setTimeout(() => {
					goto('/quran');
				}, 1000);
			} else {
				errorMessage = res.error || 'Gagal mendaftar. Silakan coba lagi.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'Terjadi kesalahan sistem.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{isRegisterMode ? 'Daftar Akun Baru' : 'Masuk ke Akun'} - Portal Qur'an v3.3</title>
</svelte:head>

<div class="min-h-screen w-full bg-quran-cream flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
	
	<!-- LEFT PANEL / MAIN MOBILE FORM CONTAINER (Fills 100% height on mobile) -->
	<div class="w-full lg:w-1/2 min-h-screen lg:min-h-0 flex flex-col justify-between bg-quran-surface px-6 py-8 sm:px-10 sm:py-10 lg:p-12 xl:p-16 lg:h-full lg:overflow-y-auto">
		
		<!-- 1. Logo Portal Qur'an v3.3 -->
		<div class="w-full max-w-md mx-auto lg:mx-0">
			<a href="/quran" class="inline-flex items-center gap-3 group">
				<img 
					src="/logo.png" 
					alt="Portal Qur'an Logo" 
					class="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover shadow-gold border border-quran-gold/40 group-hover:scale-105 transition-transform flex-shrink-0"
				/>
				<div class="leading-tight">
					<div class="flex items-center gap-1.5">
						<span class="font-extrabold text-lg sm:text-xl text-quran-dark tracking-tight">Portal Qur'an</span>
						<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-quran-gold/20 text-quran-dark border border-quran-gold/40 font-mono">v3.3</span>
					</div>
					<p class="text-xs text-quran-warm font-medium">Digital Quran Ecosystem</p>
				</div>
			</a>
		</div>

		<!-- 2. Form Box with Smooth Mode Switch Transition -->
		<div class="max-w-md w-full mx-auto lg:mx-0 my-6 lg:my-auto">
			
			{#if errorMessage}
				<div class="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-3 animate-in fade-in">
					<AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
					<span>{errorMessage}</span>
				</div>
			{/if}

			{#if successMessage}
				<div class="mb-5 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in">
					<CheckCircle2 class="w-5 h-5 text-green-600 flex-shrink-0" />
					<span>{successMessage}</span>
				</div>
			{/if}

			{#if !isRegisterMode}
				<!-- ================= LOGIN FORM ================= -->
				<div class="animate-in fade-in slide-in-from-left-4 duration-300">
					<!-- Title & Subtitle -->
					<div class="mb-6 sm:mb-8">
						<h1 class="text-2xl sm:text-3xl font-black text-quran-dark tracking-tight">
							Selamat Datang di Portal Qur'an
						</h1>
						<p class="text-sm text-quran-warm mt-2 leading-relaxed">
							Baca, pahami, dan dekatkan hati dengan lantunan suci Al-Qur'an.
						</p>
					</div>

					<form on:submit|preventDefault={handleLogin} class="space-y-4">
						<!-- Email -->
						<div>
							<label for="login-email" class="block text-xs sm:text-sm font-bold text-quran-chocolate mb-1.5">
								Alamat Email
							</label>
							<div class="relative">
								<Mail class="w-5 h-5 text-quran-warm absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="login-email"
									type="email" 
									required
									placeholder="nama@email.com" 
									bind:value={loginEmail}
									class="w-full pl-11 pr-4 py-3.5 sm:py-4 rounded-2xl bg-quran-sand border border-quran-border text-sm sm:text-base text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-quran-gold/20 transition"
								/>
							</div>
						</div>

						<!-- Password -->
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<label for="login-password" class="text-xs sm:text-sm font-bold text-quran-chocolate">
									Kata Sandi
								</label>
							</div>
							<div class="relative">
								<Lock class="w-5 h-5 text-quran-warm absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="login-password"
									type={showPassword ? 'text' : 'password'} 
									required
									placeholder="Masukkan kata sandi..." 
									bind:value={loginPassword}
									class="w-full pl-11 pr-12 py-3.5 sm:py-4 rounded-2xl bg-quran-sand border border-quran-border text-sm sm:text-base text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-quran-gold/20 transition"
								/>
								<button 
									type="button" 
									on:click={() => showPassword = !showPassword}
									class="absolute right-4 top-1/2 -translate-y-1/2 text-quran-warm hover:text-quran-dark p-1.5 transition"
									aria-label="Tampilkan kata sandi"
								>
									{#if showPassword}
										<EyeOff class="w-5 h-5" />
									{:else}
										<Eye class="w-5 h-5" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Remember Me -->
						<div class="flex items-center justify-between pt-1">
							<label class="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-quran-chocolate font-medium">
								<input 
									type="checkbox" 
									bind:checked={rememberMe}
									class="rounded-md border-quran-border text-quran-primary focus:ring-quran-gold w-4 h-4 cursor-pointer"
								/>
								<span>Ingat saya di perangkat ini</span>
							</label>
						</div>

						<!-- Submit Login Button -->
						<button 
							type="submit" 
							disabled={isLoading}
							class="w-full mt-2 py-4 px-6 min-h-[54px] rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-sm sm:text-base shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 cursor-pointer border border-quran-gold/50"
						>
							{#if isLoading}
								<div class="w-5 h-5 border-2 border-quran-gold border-t-transparent rounded-full animate-spin"></div>
								<span>Memproses Masuk...</span>
							{:else}
								<span>Masuk ke Akun</span>
								<ArrowRight class="w-5 h-5 text-quran-gold" />
							{/if}
						</button>
					</form>

					<!-- Switch to Register Link -->
					<div class="mt-5 text-center">
						<p class="text-xs sm:text-sm text-quran-warm">
							Belum memiliki akun?
							<button 
								type="button" 
								on:click={() => {
									isRegisterMode = true;
									errorMessage = '';
									successMessage = '';
								}}
								class="font-bold text-quran-chocolate hover:text-quran-dark ml-1 underline transition cursor-pointer"
							>
								Daftar Sekarang
							</button>
						</p>
					</div>
				</div>

			{:else}
				<!-- ================= REGISTER FORM ================= -->
				<div class="animate-in fade-in slide-in-from-right-4 duration-300">
					<!-- Title & Subtitle -->
					<div class="mb-5 sm:mb-6">
						<h1 class="text-2xl sm:text-3xl font-black text-quran-dark tracking-tight">
							Daftar Akun Baru
						</h1>
						<p class="text-sm text-quran-warm mt-2 leading-relaxed">
							Simpan bookmark, lacak statistik bacaan, dan kelola target tilawah pribadi.
						</p>
					</div>

					<form on:submit|preventDefault={handleRegister} class="space-y-3.5">
						<!-- Nama Lengkap -->
						<div>
							<label for="reg-fullname" class="block text-xs sm:text-sm font-bold text-quran-chocolate mb-1">
								Nama Lengkap
							</label>
							<div class="relative">
								<User class="w-5 h-5 text-quran-warm absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="reg-fullname"
									type="text" 
									required
									placeholder="Nama lengkap Anda" 
									bind:value={regFullName}
									class="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl bg-quran-sand border border-quran-border text-xs sm:text-sm text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none transition"
								/>
							</div>
						</div>

						<!-- Email -->
						<div>
							<label for="reg-email" class="block text-xs sm:text-sm font-bold text-quran-chocolate mb-1">
								Alamat Email
							</label>
							<div class="relative">
								<Mail class="w-5 h-5 text-quran-warm absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="reg-email"
									type="email" 
									required
									placeholder="nama@email.com" 
									bind:value={regEmail}
									class="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl bg-quran-sand border border-quran-border text-xs sm:text-sm text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none transition"
								/>
							</div>
						</div>

						<!-- Password -->
						<div>
							<label for="reg-password" class="block text-xs sm:text-sm font-bold text-quran-chocolate mb-1">
								Kata Sandi
							</label>
							<div class="relative">
								<Lock class="w-5 h-5 text-quran-warm absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="reg-password"
									type={showPassword ? 'text' : 'password'} 
									required
									placeholder="Minimal 6 karakter" 
									bind:value={regPassword}
									class="w-full pl-11 pr-12 py-3 sm:py-3.5 rounded-2xl bg-quran-sand border border-quran-border text-xs sm:text-sm text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none transition"
								/>
								<button 
									type="button" 
									on:click={() => showPassword = !showPassword}
									class="absolute right-4 top-1/2 -translate-y-1/2 text-quran-warm hover:text-quran-dark p-1.5 transition"
									aria-label="Tampilkan kata sandi"
								>
									{#if showPassword}
										<EyeOff class="w-5 h-5" />
									{:else}
										<Eye class="w-5 h-5" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Konfirmasi Password -->
						<div>
							<label for="reg-conf-password" class="block text-xs sm:text-sm font-bold text-quran-chocolate mb-1">
								Konfirmasi Kata Sandi
							</label>
							<div class="relative">
								<Lock class="w-5 h-5 text-quran-warm absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="reg-conf-password"
									type={showConfirmPassword ? 'text' : 'password'} 
									required
									placeholder="Ulangi kata sandi" 
									bind:value={regConfirmPassword}
									class="w-full pl-11 pr-12 py-3 sm:py-3.5 rounded-2xl bg-quran-sand border border-quran-border text-xs sm:text-sm text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none transition"
								/>
								<button 
									type="button" 
									on:click={() => showConfirmPassword = !showConfirmPassword}
									class="absolute right-4 top-1/2 -translate-y-1/2 text-quran-warm hover:text-quran-dark p-1.5 transition"
									aria-label="Tampilkan konfirmasi kata sandi"
								>
									{#if showConfirmPassword}
										<EyeOff class="w-5 h-5" />
									{:else}
										<Eye class="w-5 h-5" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Checkbox Syarat -->
						<div class="pt-0.5">
							<label class="flex items-start gap-2.5 cursor-pointer text-xs text-quran-warm">
								<input 
									type="checkbox" 
									bind:checked={agreeTerms}
									class="mt-0.5 rounded-md border-quran-border text-quran-primary focus:ring-quran-gold w-4 h-4"
								/>
								<span>Saya menyetujui Syarat & Ketentuan Layanan serta Kebijakan Privasi Portal Qur'an.</span>
							</label>
						</div>

						<!-- Tombol Daftar -->
						<button 
							type="submit" 
							disabled={isLoading}
							class="w-full mt-2 py-4 px-6 min-h-[54px] rounded-2xl bg-gradient-luxury text-quran-cream font-bold text-sm sm:text-base shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 cursor-pointer border border-quran-gold/50"
						>
							{#if isLoading}
								<div class="w-5 h-5 border-2 border-quran-gold border-t-transparent rounded-full animate-spin"></div>
								<span>Mendaftarkan Akun...</span>
							{:else}
								<span>Daftar Akun Baru</span>
								<ArrowRight class="w-5 h-5 text-quran-gold" />
							{/if}
						</button>
					</form>

					<!-- Switch to Login Link -->
					<div class="mt-4 text-center">
						<p class="text-xs sm:text-sm text-quran-warm">
							Sudah memiliki akun?
							<button 
								type="button" 
								on:click={() => {
									isRegisterMode = false;
									errorMessage = '';
									successMessage = '';
								}}
								class="font-bold text-quran-chocolate hover:text-quran-dark ml-1 underline transition cursor-pointer"
							>
								Masuk di sini
							</button>
						</p>
					</div>
				</div>
			{/if}

		</div>

		<!-- 3. COMPACT MOBILE BROWN SECTION (Only shown on mobile/tablet < 1024px) -->
		<div class="block lg:hidden w-full max-w-md mx-auto my-4">
			<div class="bg-gradient-luxury text-quran-cream rounded-3xl p-5 sm:p-6 border border-quran-gold/40 shadow-luxury overflow-hidden relative">
				<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
				<div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-quran-gold/20 blur-xl pointer-events-none"></div>
				
				<div class="relative z-10 flex flex-col items-center text-center space-y-3.5">
					<!-- Compact Stylized Holy Quran Card -->
					<div class="w-32 h-22 bg-gradient-to-br from-quran-cream to-quran-sand rounded-2xl shadow-lg border border-quran-gold p-2.5 flex flex-col justify-between transform -rotate-1">
						<div class="flex items-center justify-between border-b border-quran-gold/40 pb-0.5 text-[8px] font-bold text-quran-chocolate">
							<span>سُورَةُ الفَاتِحَة</span>
							<span>جُزْء ١</span>
						</div>
						<div class="text-center py-1">
							<p class="arabic-text text-base text-quran-dark font-bold">
								بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
							</p>
						</div>
						<div class="flex items-center justify-between border-t border-quran-gold/40 pt-0.5 text-[7px] text-quran-warm font-mono">
							<span>PORTAL QUR'AN</span>
							<span class="w-1 h-1 rounded-full bg-quran-gold"></span>
							<span>V3.3</span>
						</div>
					</div>

					<!-- Verse & Quote -->
					<div>
						<p class="arabic-text text-lg font-bold text-quran-gold mb-1">
							أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
						</p>
						<p class="text-sm font-bold text-white tracking-tight">
							"Temukan ketenangan dalam setiap ayat."
						</p>
						<p class="text-xs text-quran-goldLight/80 mt-0.5">
							(QS. Ar-Ra'd : 28)
						</p>
					</div>

					<!-- Concise 3 Badges in 1 Line -->
					<div class="flex items-center justify-center gap-2 w-full pt-3 border-t border-white/10 text-xs text-quran-gold font-semibold">
						<span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">114 Surah</span>
						<span class="text-white/30">•</span>
						<span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Audio Qari HD</span>
						<span class="text-white/30">•</span>
						<span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Khatam Tracker</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 4. Footer Note -->
		<div class="w-full max-w-md mx-auto lg:mx-0 pt-4 pb-2 border-t border-quran-border/50 text-xs text-quran-warm flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
			<span>© 2026 Portal Qur'an v3.3</span>
			<div class="flex items-center gap-4">
				<span class="flex items-center gap-1.5 text-quran-chocolate font-medium">
					<ShieldCheck class="w-4 h-4 text-quran-gold" />
					<span>Supabase Security</span>
				</span>
			</div>
		</div>

	</div>

	<!-- RIGHT PANEL ON DESKTOP: Islamic Luxury Artwork & 3D Glowing Open Quran (Split Screen >= 1024px) -->
	<div class="hidden lg:flex lg:w-1/2 bg-gradient-luxury text-quran-cream relative flex-col justify-between p-12 xl:p-16 overflow-hidden border-l border-quran-border/30 h-full">
		
		<!-- Subtle Arabesque Background Pattern -->
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-30 pointer-events-none"></div>

		<!-- Radiant Gold Ambient Light Background -->
		<div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-quran-gold/20 blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-quran-gold/15 blur-3xl pointer-events-none"></div>

		<!-- Top Header Right -->
		<div class="relative z-10 flex items-center justify-between">
			<div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-xs font-semibold text-quran-gold">
				<Sparkles class="w-3.5 h-3.5" />
				<span>Edisi Luxury Islamic Modern</span>
			</div>
			<span class="text-xs font-mono text-quran-goldLight/70">1448 H</span>
		</div>

		<!-- Center: Glowing 3D Open Quran Artwork Component -->
		<div class="relative z-10 my-auto flex flex-col items-center text-center px-4 py-6">
			
			<!-- Luxury Quran Emblem Vector -->
			<div class="relative w-64 h-64 flex items-center justify-center animate-float">
				
				<!-- Glowing Outer Ring -->
				<div class="absolute inset-0 rounded-full border border-quran-gold/40 shadow-gold-lg animate-pulse-subtle"></div>
				<div class="absolute inset-4 rounded-full border border-dashed border-quran-gold/30"></div>

				<!-- Sacred Open Book Graphic (Luxury Islamic Kitab) -->
				<div class="relative w-44 h-36 bg-gradient-to-br from-quran-cream to-quran-sand rounded-2xl shadow-2xl border-2 border-quran-gold p-4 flex flex-col justify-between transform -rotate-2 hover:rotate-0 transition-transform duration-500">
					
					<!-- Quran Decorative Top Margin -->
					<div class="flex items-center justify-between border-b border-quran-gold/40 pb-1 text-[9px] font-bold text-quran-chocolate tracking-wider">
						<span>سُورَةُ الفَاتِحَة</span>
						<span>جُزْء ١</span>
					</div>

					<!-- Arabic Bismillah Calligraphy -->
					<div class="text-center py-2">
						<p class="arabic-text text-xl text-quran-dark font-bold text-shadow-gold">
							بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
						</p>
					</div>

					<!-- Bottom Bookmark Ribbon -->
					<div class="flex items-center justify-between border-t border-quran-gold/40 pt-1 text-[8px] text-quran-warm font-mono">
						<span>PORTAL QUR'AN</span>
						<span class="w-2 h-2 rounded-full bg-quran-gold"></span>
						<span>V3.3</span>
					</div>

					<!-- Luxury Gold Bookmark Ribbon hanging -->
					<div class="absolute -bottom-6 right-8 w-4 h-8 bg-gradient-gold rounded-b shadow-md"></div>
				</div>

			</div>

			<!-- Quran Verse of Comfort -->
			<div class="mt-8 max-w-sm">
				<p class="arabic-text text-2xl text-quran-gold font-bold mb-2">
					أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
				</p>
				<h2 class="text-lg font-bold text-white tracking-tight">
					"Temukan ketenangan dalam setiap ayat."
				</h2>
				<p class="text-xs text-quran-goldLight/80 mt-1">
					(QS. Ar-Ra'd : 28)
				</p>
			</div>

		</div>

		<!-- Bottom Features Pill List (Desktop) -->
		<div class="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-center">
			<div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
				<div class="text-xs font-bold text-quran-gold">114 Surah</div>
				<div class="text-[10px] text-quran-cream/80">Tafsir Ibnu Katsir</div>
			</div>
			<div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
				<div class="text-xs font-bold text-quran-gold">Audio Qari</div>
				<div class="text-[10px] text-quran-cream/80">High Definition</div>
			</div>
			<div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
				<div class="text-xs font-bold text-quran-gold">Statistik</div>
				<div class="text-[10px] text-quran-cream/80">Tracker Khatam</div>
			</div>
		</div>

	</div>

</div>
