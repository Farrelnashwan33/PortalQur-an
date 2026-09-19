<script lang="ts">
	import { 
		X, 
		Lock, 
		KeyRound, 
		Eye, 
		EyeOff, 
		CheckCircle2, 
		AlertCircle, 
		ArrowRight, 
		Phone, 
		RefreshCw,
		ShieldCheck,
		ExternalLink
	} from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';

	export let isOpen: boolean = false;
	export let initialPhone: string = '';
	export let onClose: () => void = () => {};
	export let onSuccess: (newPhone: string, newPass: string) => void = () => {};

	let step: 'phone' | 'otp' | 'success' = 'phone';
	let resetPhone = '';
	let generatedOtp = '';
	let inputOtp = '';
	let newPassword = '';
	let confirmPassword = '';
	let showNewPassword = false;
	let showConfirmPassword = false;

	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';
	let countdown = 0;
	let countdownTimer: any = null;

	$: if (isOpen) {
		step = 'phone';
		resetPhone = initialPhone || '';
		inputOtp = '';
		newPassword = '';
		confirmPassword = '';
		errorMessage = '';
		successMessage = '';
	}

	function startCountdown(seconds: number = 60) {
		countdown = seconds;
		if (countdownTimer) clearInterval(countdownTimer);
		countdownTimer = setInterval(() => {
			if (countdown > 0) {
				countdown -= 1;
			} else {
				clearInterval(countdownTimer);
			}
		}, 1000);
	}

	function formatIntlPhone(rawPhone: string): string {
		let clean = rawPhone.trim().replace(/[\s-+]/g, '');
		if (clean.startsWith('0')) {
			clean = '62' + clean.slice(1);
		} else if (!clean.startsWith('62')) {
			clean = '62' + clean;
		}
		return clean;
	}

	function generate6DigitOtp(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	function sendOtpToWhatsApp() {
		errorMessage = '';
		const cleanPhone = resetPhone.trim().replace(/[\s-]/g, '');
		
		if (!cleanPhone || cleanPhone.length < 9) {
			errorMessage = 'Masukkan nomor WhatsApp yang valid (minimal 9 digit).';
			return;
		}

		isLoading = true;
		const otp = generate6DigitOtp();
		generatedOtp = otp;
		const intlNumber = formatIntlPhone(cleanPhone);

		// Format WhatsApp Message
		const messageText = 
`*PORTAL QUR'AN - KODE RESET KATA SANDI*

Assalamu'alaikum Warahmatullahi Wabarakatuh,

Berikut adalah kode verifikasi reset kata sandi akun Portal Qur'an Anda:
🔑 *${otp}*

_Gunakan kode ini di aplikasi Portal Qur'an untuk membuat kata sandi baru. Demi keamanan akun Anda, jangan berikan kode ini kepada siapa pun._

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

		const waUrl = `https://api.whatsapp.com/send?phone=${intlNumber}&text=${encodeURIComponent(messageText)}`;

		// Open WhatsApp
		if (typeof window !== 'undefined') {
			window.open(waUrl, '_blank');
		}

		setTimeout(() => {
			isLoading = false;
			step = 'otp';
			startCountdown(60);
		}, 600);
	}

	function resendOtp() {
		if (countdown > 0) return;
		sendOtpToWhatsApp();
	}

	async function handleResetPassword() {
		errorMessage = '';

		if (inputOtp.trim() !== generatedOtp.trim()) {
			errorMessage = 'Kode verifikasi OTP WhatsApp salah atau tidak sesuai.';
			return;
		}

		if (newPassword.length < 6) {
			errorMessage = 'Kata sandi baru minimal 6 karakter.';
			return;
		}

		if (newPassword !== confirmPassword) {
			errorMessage = 'Konfirmasi kata sandi tidak cocok.';
			return;
		}

		isLoading = true;
		try {
			const res = await authStore.resetPassword(resetPhone, newPassword);
			if (res.success) {
				step = 'success';
				successMessage = 'Kata sandi akun Anda berhasil diperbarui!';
				setTimeout(() => {
					onSuccess(resetPhone, newPassword);
					handleClose();
				}, 2200);
			} else {
				errorMessage = res.error || 'Gagal mereset kata sandi. Silakan coba lagi.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'Terjadi kesalahan sistem.';
		} finally {
			isLoading = false;
		}
	}

	function handleClose() {
		if (countdownTimer) clearInterval(countdownTimer);
		onClose();
	}
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
		on:click|self={handleClose}
		on:keydown={(e) => e.key === 'Escape' && handleClose()}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
	>
		<div 
			class="bg-quran-surface w-full max-w-md rounded-3xl border border-quran-border/80 shadow-2xl overflow-hidden relative transform transition-all animate-in zoom-in-95 duration-200"
		>
			<!-- Decorative Top Islamic Gold Bar -->
			<div class="h-2 w-full bg-gradient-luxury"></div>

			<!-- Modal Header -->
			<div class="p-5 sm:p-6 pb-4 border-b border-quran-border/60 flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-sm">
						{#if step === 'phone'}
							<!-- WhatsApp Brand Custom SVG Icon -->
							<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
								<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
								<path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95a1 1 0 001.218 1.218l4.782-1.388A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.066-1.112l-.291-.173-3.027.879.879-3.027-.173-.291A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
							</svg>
						{:else if step === 'otp'}
							<KeyRound class="w-6 h-6 text-amber-600" />
						{:else}
							<CheckCircle2 class="w-6 h-6 text-emerald-600" />
						{/if}
					</div>
					<div>
						<h3 class="text-base sm:text-lg font-bold text-quran-dark">
							{#if step === 'phone'}
								Reset Kata Sandi via WhatsApp
							{:else if step === 'otp'}
								Verifikasi Kode & Sandi Baru
							{:else}
								Kata Sandi Berhasil Direset!
							{/if}
						</h3>
						<p class="text-xs text-quran-chocolate">
							{#if step === 'phone'}
								Kirim kode reset otomatis ke nomor WhatsApp Anda
							{:else if step === 'otp'}
								Periksa pesan WhatsApp yang baru masuk
							{:else}
								Silakan gunakan kata sandi baru untuk masuk
							{/if}
						</p>
					</div>
				</div>

				<button 
					on:click={handleClose}
					class="p-2 rounded-xl text-quran-warm hover:text-quran-dark hover:bg-quran-sand transition"
					aria-label="Tutup Modal"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Error Alert -->
			{#if errorMessage}
				<div class="mx-5 sm:mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
					<AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
					<span class="font-medium">{errorMessage}</span>
				</div>
			{/if}

			<!-- Success Alert -->
			{#if successMessage}
				<div class="mx-5 sm:mx-6 mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
					<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
					<span class="font-medium">{successMessage}</span>
				</div>
			{/if}

			<!-- Modal Body -->
			<div class="p-5 sm:p-6 space-y-4">
				
				<!-- STEP 1: INPUT NO WHATSAPP -->
				{#if step === 'phone'}
					<form on:submit|preventDefault={sendOtpToWhatsApp} class="space-y-4">
						<div>
							<label for="reset-wa-phone" class="block text-xs font-bold text-quran-chocolate mb-1.5">
								Nomor WhatsApp Terdaftar
							</label>
							<div class="relative">
								<div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-quran-chocolate font-bold text-xs">
									<span>🇮🇩</span>
									<span>+62</span>
								</div>
								<input 
									id="reset-wa-phone"
									type="tel" 
									required
									placeholder="81234567890" 
									bind:value={resetPhone}
									class="w-full pl-16 pr-4 py-3 rounded-xl bg-quran-sand border border-quran-border text-sm text-quran-dark font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition font-mono"
								/>
							</div>
							<p class="mt-2 text-[11px] text-quran-warm leading-relaxed">
								Sistem akan membuka obrolan WhatsApp dan membuat <strong>kode verifikasi 6-digit</strong> secara otomatis ke nomor Anda.
							</p>
						</div>

						<div class="pt-2">
							<button 
								type="submit" 
								disabled={isLoading}
								class="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2.5 disabled:opacity-70"
							>
								{#if isLoading}
									<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span>Menyiapkan WhatsApp...</span>
								{:else}
									<!-- WhatsApp icon -->
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
										<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
										<path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95a1 1 0 001.218 1.218l4.782-1.388A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.066-1.112l-.291-.173-3.027.879.879-3.027-.173-.291A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
									</svg>
									<span>Kirim Kode Reset ke WhatsApp</span>
									<ArrowRight class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</form>

				<!-- STEP 2: INPUT OTP & NEW PASSWORD -->
				{:else if step === 'otp'}
					<form on:submit|preventDefault={handleResetPassword} class="space-y-4">
						
						<!-- Target Phone Info & Reopen WhatsApp -->
						<div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
							<div class="flex items-center gap-2 text-emerald-900">
								<ShieldCheck class="w-4 h-4 text-emerald-600" />
								<span>Terkirim ke: <strong>{resetPhone}</strong></span>
							</div>
							<button 
								type="button" 
								on:click={() => sendOtpToWhatsApp()}
								class="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 underline"
							>
								<span>Buka WA</span>
								<ExternalLink class="w-3 h-3" />
							</button>
						</div>

						<!-- OTP 6-Digit Field -->
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<label for="input-otp" class="text-xs font-bold text-quran-chocolate">
									Kode Verifikasi 6-Digit (OTP)
								</label>
								<button 
									type="button" 
									on:click={resendOtp}
									disabled={countdown > 0}
									class="text-[11px] font-bold text-amber-800 hover:text-amber-950 disabled:opacity-50 flex items-center gap-1"
								>
									{#if countdown > 0}
										<span>Kirim ulang ({countdown}s)</span>
									{:else}
										<RefreshCw class="w-3 h-3" />
										<span>Kirim Ulang Kode</span>
									{/if}
								</button>
							</div>
							<div class="relative">
								<KeyRound class="w-4 h-4 text-quran-warm absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="input-otp"
									type="text" 
									required
									maxlength="6"
									placeholder="Contoh: 849201" 
									bind:value={inputOtp}
									class="w-full pl-10 pr-4 py-3 rounded-xl bg-quran-sand border border-quran-border text-base text-center font-bold tracking-[0.25em] text-quran-dark focus:border-quran-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-quran-gold/20 transition font-mono"
								/>
							</div>
						</div>

						<!-- New Password -->
						<div>
							<label for="reset-new-password" class="block text-xs font-bold text-quran-chocolate mb-1.5">
								Kata Sandi Baru
							</label>
							<div class="relative">
								<Lock class="w-4 h-4 text-quran-warm absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="reset-new-password"
									type={showNewPassword ? 'text' : 'password'} 
									required
									minlength="6"
									placeholder="Minimal 6 karakter" 
									bind:value={newPassword}
									class="w-full pl-10 pr-11 py-3 rounded-xl bg-quran-sand border border-quran-border text-xs sm:text-sm text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-quran-gold/20 transition"
								/>
								<button 
									type="button" 
									on:click={() => showNewPassword = !showNewPassword}
									class="absolute right-3.5 top-1/2 -translate-y-1/2 text-quran-warm hover:text-quran-dark p-1 transition"
									aria-label="Tampilkan sandi baru"
								>
									{#if showNewPassword}
										<EyeOff class="w-4 h-4" />
									{:else}
										<Eye class="w-4 h-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Confirm New Password -->
						<div>
							<label for="reset-confirm-password" class="block text-xs font-bold text-quran-chocolate mb-1.5">
								Ulangi Kata Sandi Baru
							</label>
							<div class="relative">
								<Lock class="w-4 h-4 text-quran-warm absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input 
									id="reset-confirm-password"
									type={showConfirmPassword ? 'text' : 'password'} 
									required
									minlength="6"
									placeholder="Ulangi kata sandi baru" 
									bind:value={confirmPassword}
									class="w-full pl-10 pr-11 py-3 rounded-xl bg-quran-sand border border-quran-border text-xs sm:text-sm text-quran-dark font-medium focus:border-quran-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-quran-gold/20 transition"
								/>
								<button 
									type="button" 
									on:click={() => showConfirmPassword = !showConfirmPassword}
									class="absolute right-3.5 top-1/2 -translate-y-1/2 text-quran-warm hover:text-quran-dark p-1 transition"
									aria-label="Tampilkan konfirmasi sandi"
								>
									{#if showConfirmPassword}
										<EyeOff class="w-4 h-4" />
									{:else}
										<Eye class="w-4 h-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Submit Reset Button -->
						<div class="pt-2 flex items-center gap-3">
							<button 
								type="button" 
								on:click={() => step = 'phone'}
								class="px-4 py-3.5 rounded-xl bg-quran-sand border border-quran-border text-quran-dark font-bold text-xs hover:bg-quran-beige transition"
							>
								Kembali
							</button>

							<button 
								type="submit" 
								disabled={isLoading}
								class="flex-1 py-3.5 px-5 rounded-xl bg-gradient-luxury text-quran-cream font-bold text-xs sm:text-sm shadow-gold hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70"
							>
								{#if isLoading}
									<div class="w-4 h-4 border-2 border-quran-gold border-t-transparent rounded-full animate-spin"></div>
									<span>Menyimpan Sandi...</span>
								{:else}
									<span>Simpan Kata Sandi Baru</span>
									<ArrowRight class="w-4 h-4 text-quran-gold" />
								{/if}
							</button>
						</div>
					</form>

				<!-- STEP 3: SUCCESS STATE -->
				{:else if step === 'success'}
					<div class="py-6 text-center space-y-3">
						<div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
							<CheckCircle2 class="w-10 h-10" />
						</div>
						<h4 class="text-base font-bold text-quran-dark">
							Alhamdulillah! Berhasil
						</h4>
						<p class="text-xs text-quran-chocolate max-w-xs mx-auto">
							Kata sandi Anda telah berhasil diperbarui. Mengalihkan Anda masuk ke akun Portal Qur'an...
						</p>
					</div>
				{/if}

			</div>

			<!-- Footer notes -->
			<div class="px-6 py-3 bg-quran-sand/50 border-t border-quran-border/60 flex items-center justify-between text-[11px] text-quran-warm">
				<span>Portal Qur'an ID Protection</span>
				<span>Enkripsi 256-Bit</span>
			</div>
		</div>
	</div>
{/if}
