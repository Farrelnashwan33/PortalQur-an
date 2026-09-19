import { writable, derived, get } from 'svelte/store';

export interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed';
		platform: string;
	}>;
	prompt(): Promise<void>;
}

interface PWAState {
	deferredPrompt: BeforeInstallPromptEvent | null;
	isInstalled: boolean;
	isStandalone: boolean;
	isIOS: boolean;
	isAndroid: boolean;
	isSafari: boolean;
	isInitialized: boolean;
	isUpdateAvailable: boolean;
	isUpdating: boolean;
	registration: ServiceWorkerRegistration | null;
}

const initialState: PWAState = {
	deferredPrompt: null,
	isInstalled: false,
	isStandalone: false,
	isIOS: false,
	isAndroid: false,
	isSafari: false,
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

export const pwaStore = {
	subscribe: state.subscribe,

	init: () => {
		if (typeof window === 'undefined') return;

		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
			(window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
		const isAndroid = /android/.test(userAgent);
		const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
		
		const isStandalone = 
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true ||
			document.referrer.includes('android-app://');

		state.update((s) => ({
			...s,
			isIOS,
			isAndroid,
			isSafari,
			isStandalone,
			isInstalled: isStandalone,
			isInitialized: true
		}));

		// Listen for PWA install prompt on Chromium / Android / Desktop Chrome
		window.addEventListener('beforeinstallprompt', (e: Event) => {
			e.preventDefault();
			const installEvent = e as BeforeInstallPromptEvent;
			state.update((s) => ({
				...s,
				deferredPrompt: installEvent
			}));
		});

		// Listen for successful installation
		window.addEventListener('appinstalled', () => {
			state.update((s) => ({
				...s,
				deferredPrompt: null,
				isInstalled: true
			}));
			showInstallModal.set(false);
		});

		// Handle Service Worker Registration & Update Lifecycle in Production
		if ('serviceWorker' in navigator) {
			if (import.meta.env.DEV) {
				navigator.serviceWorker.getRegistrations().then((registrations) => {
					for (const reg of registrations) {
						reg.unregister();
					}
				});
			} else {
				// Listen for when a new SW takes control of the page
				navigator.serviceWorker.addEventListener('controllerchange', () => {
					if (refreshing) return;
					refreshing = true;
					window.location.reload();
				});

				navigator.serviceWorker
					.register('/service-worker.js')
					.then((registration) => {
						state.update((s) => ({ ...s, registration }));

						// Check if there is already a waiting service worker
						if (registration.waiting) {
							state.update((s) => ({ ...s, isUpdateAvailable: true }));
							showUpdateToast.set(true);
						}

						// Listen for updates on the registration
						registration.addEventListener('updatefound', () => {
							const newWorker = registration.installing;
							if (!newWorker) return;

							newWorker.addEventListener('statechange', () => {
								// When the new worker finishes installing and is waiting
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

				// Auto-check for updates when app regains focus or becomes visible
				document.addEventListener('visibilitychange', () => {
					if (document.visibilityState === 'visible') {
						pwaStore.checkForUpdate();
					}
				});

				// Check for update when network recovers
				window.addEventListener('online', () => {
					pwaStore.checkForUpdate();
				});

				// Periodic update check every 20 minutes
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

		// 1. Service worker update check
		if ('serviceWorker' in navigator) {
			const currentState = get(state);
			const reg = currentState.registration;
			if (reg) {
				try {
					await reg.update();
				} catch (e) {
					console.debug('Service worker update check:', e);
				}
			}
		}

		// 2. Fetch /version.json with timestamp to detect Vercel deployment updates
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
		} catch (e) {
			// Offline or network error
		}
	},

	applyUpdate: async () => {
		if (typeof window === 'undefined') return;

		state.update((s) => ({ ...s, isUpdating: true }));

		// Sync latest version in localStorage
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
			// Signal the waiting service worker to skip waiting and activate
			reg.waiting.postMessage({ type: 'SKIP_WAITING' });
		} else {
			// Reload cleanly
			setTimeout(() => {
				window.location.reload();
			}, 300);
		}
	},

	dismissUpdateToast: () => {
		if (typeof window !== 'undefined') {
			fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' })
				.then(r => r.json())
				.then(data => {
					if (data.version) {
						localStorage.setItem('pq_dismissed_version', data.version);
					}
				})
				.catch(() => {});
		}
		showUpdateToast.set(false);
	},

	promptInstall: async (): Promise<'accepted' | 'dismissed' | 'manual' | 'already_installed'> => {
		const currentState = get(state);
		const currentPrompt = currentState.deferredPrompt;
		const standalone = currentState.isStandalone || currentState.isInstalled;

		if (standalone) {
			return 'already_installed';
		}

		if (currentPrompt) {
			try {
				await currentPrompt.prompt();
				const choice = await currentPrompt.userChoice;
				if (choice.outcome === 'accepted') {
					state.update((s) => ({
						...s,
						deferredPrompt: null,
						isInstalled: true
					}));
					showInstallModal.set(false);
					return 'accepted';
				} else {
					return 'dismissed';
				}
			} catch (err) {
				console.error('Error invoking PWA install prompt:', err);
			}
		}

		// If on iOS or no prompt available, trigger modal instructions
		showInstallModal.set(true);
		return 'manual';
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
