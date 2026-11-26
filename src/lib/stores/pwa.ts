import { writable, derived, get } from 'svelte/store';

export interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed';
		platform: string;
	}>;
	prompt(): Promise<void>;
}

declare global {
	interface Window {
		__pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
	}
}

interface PWAState {
	deferredPrompt: BeforeInstallPromptEvent | null;
	isInstalled: boolean;
	isStandalone: boolean;
	isIOS: boolean;
	isAndroid: boolean;
	isSafari: boolean;
	isFirefox: boolean;
	isChromium: boolean;
	isInitialized: boolean;
	isUpdateAvailable: boolean;
	isUpdating: boolean;
	registration: ServiceWorkerRegistration | null;
}

const initialState: PWAState = {
	deferredPrompt: typeof window !== 'undefined' && window.__pwaDeferredPrompt ? window.__pwaDeferredPrompt : null,
	isInstalled: false,
	isStandalone: false,
	isIOS: false,
	isAndroid: false,
	isSafari: false,
	isFirefox: false,
	isChromium: false,
	isInitialized: false,
	isUpdateAvailable: false,
	isUpdating: false,
	registration: null
};

const state = writable<PWAState>(initialState);
export const showInstallModal = writable<boolean>(false);
export const showUpdateToast = writable<boolean>(false);

let updateCheckInterval: any = null;
let refreshing = false;
let listenersBound = false;

export const pwaStore = {
	subscribe: state.subscribe,

	init: () => {
		if (typeof window === 'undefined') return;

		const ua = window.navigator.userAgent.toLowerCase();
		const isIOS =
			/iphone|ipad|ipod/.test(ua) ||
			(window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
		const isAndroid = /android/.test(ua);
		const isFirefox = /firefox|fxios/.test(ua);
		const isChromium = /chrome|chromium|crios|edg|opr|brave/.test(ua) && !isFirefox;
		const isSafari = /safari/.test(ua) && !isChromium && !isFirefox && !isAndroid;

		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			window.matchMedia('(display-mode: minimal-ui)').matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true ||
			document.referrer.includes('android-app://');

		if (isStandalone) {
			try {
				localStorage.setItem('pq_pwa_installed', '1');
			} catch {}
		}

		// Pick up any prompt captured early in <head> before Svelte hydrated
		const earlyPrompt = window.__pwaDeferredPrompt || null;

		state.update((s) => ({
			...s,
			deferredPrompt: earlyPrompt || s.deferredPrompt,
			isIOS,
			isAndroid,
			isSafari,
			isFirefox,
			isChromium,
			isStandalone,
			isInstalled: isStandalone,
			isInitialized: true
		}));

		if (!listenersBound) {
			listenersBound = true;

			const syncPromptFromWindow = () => {
				if (window.__pwaDeferredPrompt) {
					state.update((s) => ({
						...s,
						deferredPrompt: window.__pwaDeferredPrompt || null
					}));
				}
			};

			window.addEventListener('pwa-install-ready', syncPromptFromWindow);

			window.addEventListener('beforeinstallprompt', (e: Event) => {
				e.preventDefault();
				const installEvent = e as BeforeInstallPromptEvent;
				window.__pwaDeferredPrompt = installEvent;
				state.update((s) => ({
					...s,
					deferredPrompt: installEvent
				}));
			});

			const handleAppInstalled = () => {
				window.__pwaDeferredPrompt = null;
				try {
					localStorage.setItem('pq_pwa_installed', '1');
				} catch {}
				state.update((s) => ({
					...s,
					deferredPrompt: null,
					isInstalled: true
				}));
				showInstallModal.set(false);
			};

			window.addEventListener('appinstalled', handleAppInstalled);
			window.addEventListener('pwa-app-installed', handleAppInstalled);
		}

		// Check related installed PWA apps on Chromium if supported
		try {
			const navAny = navigator as any;
			if (typeof navAny.getInstalledRelatedApps === 'function') {
				navAny.getInstalledRelatedApps().then((apps: any[]) => {
					if (Array.isArray(apps) && apps.length > 0) {
						state.update((s) => ({ ...s, isInstalled: true }));
					}
				}).catch(() => {});
			}
		} catch {}

		// Handle Service Worker Registration & Update Lifecycle in Production
		if ('serviceWorker' in navigator) {
			if (import.meta.env.DEV) {
				navigator.serviceWorker.getRegistrations().then((registrations) => {
					for (const reg of registrations) {
						reg.unregister();
					}
				});
			} else {
				navigator.serviceWorker.addEventListener('controllerchange', () => {
					if (refreshing) return;
					refreshing = true;
					window.location.reload();
				});

				navigator.serviceWorker
					.getRegistration()
					.then((existing) => existing || navigator.serviceWorker.register('/service-worker.js'))
					.then((registration) => {
						if (!registration) return;
						state.update((s) => ({ ...s, registration }));

						if (registration.waiting) {
							state.update((s) => ({ ...s, isUpdateAvailable: true }));
							showUpdateToast.set(true);
						}

						registration.addEventListener('updatefound', () => {
							const newWorker = registration.installing;
							if (!newWorker) return;

							newWorker.addEventListener('statechange', () => {
								if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
									state.update((s) => ({ ...s, isUpdateAvailable: true }));
									showUpdateToast.set(true);
								}
							});
						});
					})
					.catch((err) => {
						console.warn('Service worker registration failed:', err);
					});

				document.addEventListener('visibilitychange', () => {
					if (document.visibilityState === 'visible') {
						pwaStore.checkForUpdate();
					}
				});

				window.addEventListener('online', () => {
					pwaStore.checkForUpdate();
				});

				if (!updateCheckInterval) {
					updateCheckInterval = setInterval(() => {
						pwaStore.checkForUpdate();
					}, 20 * 60 * 1000);
				}
			}
		}
	},

	checkForUpdate: async () => {
		if (typeof window === 'undefined') return;

		if ('serviceWorker' in navigator) {
			const currentState = get(state);
			const reg = currentState.registration;
			if (reg) {
				try {
					await reg.update();
				} catch {}
			}
		}

		try {
			const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' });
			if (res.ok) {
				const data = await res.json();
				const deployedVersion = data.version || data.buildTime;
				const currentVersion = localStorage.getItem('pq_app_version') || '3.3.0';
				const dismissedVersion = localStorage.getItem('pq_dismissed_version');

				if (deployedVersion && deployedVersion !== currentVersion) {
					if (dismissedVersion !== deployedVersion) {
						state.update((s) => ({ ...s, isUpdateAvailable: true }));
						showUpdateToast.set(true);
					}
				}
			}
		} catch {}
	},

	applyUpdate: async () => {
		if (typeof window === 'undefined') return;

		state.update((s) => ({ ...s, isUpdating: true }));

		try {
			const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' });
			if (res.ok) {
				const data = await res.json();
				if (data.version) {
					localStorage.setItem('pq_app_version', data.version);
				}
			}
		} catch {}

		const currentState = get(state);
		const reg = currentState.registration;

		if (reg && reg.waiting) {
			reg.waiting.postMessage({ type: 'SKIP_WAITING' });
		} else {
			setTimeout(() => {
				window.location.reload();
			}, 300);
		}
	},

	dismissUpdateToast: () => {
		if (typeof window !== 'undefined') {
			fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' })
				.then((r) => r.json())
				.then((data) => {
					if (data.version) {
						localStorage.setItem('pq_dismissed_version', data.version);
					}
				})
				.catch(() => {});
		}
		showUpdateToast.set(false);
	},

	promptInstall: async (): Promise<'accepted' | 'dismissed' | 'manual' | 'already_installed'> => {
		if (typeof window === 'undefined') return 'manual';

		let currentState = get(state);
		if (currentState.isStandalone || currentState.isInstalled) {
			return 'already_installed';
		}

		// Sync latest window prompt if captured right before click
		let currentPrompt = currentState.deferredPrompt || window.__pwaDeferredPrompt || null;

		// If Chromium is still finishing Service Worker activation on first visit, wait briefly (up to 1.5s)
		if (!currentPrompt && currentState.isChromium) {
			await new Promise<void>((resolve) => {
				let done = false;
				const finish = () => {
					if (done) return;
					done = true;
					window.removeEventListener('pwa-install-ready', finish);
					resolve();
				};
				window.addEventListener('pwa-install-ready', finish);
				setTimeout(finish, 1500);
			});
			currentPrompt = get(state).deferredPrompt || window.__pwaDeferredPrompt || null;
		}

		if (currentPrompt) {
			try {
				await currentPrompt.prompt();
				const choice = await currentPrompt.userChoice;
				window.__pwaDeferredPrompt = null;

				if (choice.outcome === 'accepted') {
					try {
						localStorage.setItem('pq_pwa_installed', '1');
					} catch {}
					state.update((s) => ({
						...s,
						deferredPrompt: null,
						isInstalled: true
					}));
					showInstallModal.set(false);
					return 'accepted';
				} else {
					state.update((s) => ({ ...s, deferredPrompt: null }));
					return 'dismissed';
				}
			} catch (err) {
				console.error('Error invoking PWA install prompt:', err);
			}
		}

		// Check if user previously installed it in this browser
		try {
			if (localStorage.getItem('pq_pwa_installed') === '1' && currentState.isChromium) {
				return 'already_installed';
			}
		} catch {}

		showInstallModal.set(true);
		return 'manual';
	},

	// Downloads a standalone desktop/mobile launcher shortcut when browser lacks native JS install API (e.g. Safari/Firefox)
	downloadLauncherShortcut: () => {
		if (typeof window === 'undefined') return;
		const appOrigin = window.location.origin;
		const ua = window.navigator.userAgent.toLowerCase();
		const isMac = /macintosh|mac os x/.test(ua) && !/iphone|ipad/.test(ua);
		const isWin = /windows/.test(ua);

		if (isWin) {
			const urlFileContent = `[InternetShortcut]\r\nURL=${appOrigin}/quran\r\nIconFile=${appOrigin}/favicon.png\r\nIconIndex=0\r\n`;
			const blob = new Blob([urlFileContent], { type: 'application/internet-shortcut' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = "Portal Qur'an.url";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(a.href), 2000);
			return;
		}

		if (isMac) {
			const weblocXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>URL</key>
	<string>${appOrigin}/quran</string>
</dict>
</plist>`;
			const blob = new Blob([weblocXml], { type: 'application/x-apple-plist' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = "Portal Qur'an.webloc";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(a.href), 2000);
			return;
		}

		const htmlLauncher = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=${appOrigin}/quran">
<link rel="icon" href="${appOrigin}/icon-192.png">
<title>Portal Qur'an App</title>
<script>window.location.replace("${appOrigin}/quran");<\/script>
</head>
<body style="background:#3E2723;color:#F8F3EC;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
Membuka Portal Qur'an...
</body>
</html>`;
		const blob = new Blob([htmlLauncher], { type: 'text/html;charset=utf-8' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'Portal-Quran-App.html';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(a.href), 2000);
	},

	openModal: () => {
		showInstallModal.set(true);
	},

	closeModal: () => {
		showInstallModal.set(false);
	}
};

export const canDirectInstall = derived(state, ($state) => !!$state.deferredPrompt);
export const isAppInstalled = derived(state, ($state) => $state.isInstalled || $state.isStandalone);
export const isUpdateAvailable = derived(state, ($state) => $state.isUpdateAvailable);
export const isUpdating = derived(state, ($state) => $state.isUpdating);
