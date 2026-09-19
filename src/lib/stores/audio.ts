import { writable } from 'svelte/store';
import { QARI_LIST, SURAH_LIST } from '$lib/data/surahList';
import type { Qari } from '$lib/types/quran';
import { progressStore } from '$lib/stores/progress';
import { getSurahDetail } from '$lib/services/quranService';

export type RepeatMode = 'none' | 'ayah' | 'surah';

export interface AudioState {
	isPlaying: boolean;
	isLoading: boolean;
	isVisible: boolean;
	surahNumber: number;
	surahName: string;
	ayahNumber: number;
	totalAyahs: number;
	currentQari: Qari;
	currentTime: number;
	duration: number;
	volume: number;
	playbackRate: number;
	repeatMode: RepeatMode;
	isMinimized: boolean;
	audioUrl: string;
}

const initialState: AudioState = {
	isPlaying: false,
	isLoading: false,
	isVisible: false,
	surahNumber: 1,
	surahName: 'Al-Fatihah',
	ayahNumber: 1,
	totalAyahs: 7,
	currentQari: QARI_LIST[0],
	currentTime: 0,
	duration: 0,
	volume: 1.0,
	playbackRate: 1.0,
	repeatMode: 'none',
	isMinimized: false,
	audioUrl: ''
};

function getAyahAudioUrl(qariBaseUrl: string, surahNumber: number, ayahNumber: number): string {
	const surahPad = surahNumber.toString().padStart(3, '0');
	const ayahPad = ayahNumber.toString().padStart(3, '0');
	const base = qariBaseUrl.endsWith('/') ? qariBaseUrl : qariBaseUrl + '/';
	return `${base}${surahPad}${ayahPad}.mp3`;
}

function createAudioStore() {
	const { subscribe, set, update } = writable<AudioState>(initialState);
	
	let audioElement: HTMLAudioElement | null = null;
	let preloaderAudio: HTMLAudioElement | null = null;

	function preloadNext(qariBaseUrl: string, surahNum: number, ayahNum: number, totalAyahs: number, repeatMode: RepeatMode) {
		if (typeof window === 'undefined') return;
		
		let nextSurah = surahNum;
		let nextAyah = ayahNum + 1;

		if (repeatMode === 'ayah') {
			nextSurah = surahNum;
			nextAyah = ayahNum;
		} else if (ayahNum >= totalAyahs) {
			if (repeatMode === 'surah') {
				nextSurah = surahNum;
				nextAyah = 1;
			} else if (surahNum < 114) {
				nextSurah = surahNum + 1;
				nextAyah = 1;
				// Pre-fetch next surah data into cache for instant zero-lag page transition
				getSurahDetail(nextSurah).catch(() => {});
			} else {
				return;
			}
		}

		const nextUrl = getAyahAudioUrl(qariBaseUrl, nextSurah, nextAyah);
		if (!preloaderAudio) {
			preloaderAudio = new Audio();
			preloaderAudio.preload = 'auto';
		}
		preloaderAudio.src = nextUrl;
	}

	if (typeof window !== 'undefined') {
		audioElement = new Audio();
		audioElement.preload = 'auto';

		audioElement.addEventListener('timeupdate', () => {
			if (audioElement) {
				update((s) => ({
					...s,
					currentTime: audioElement!.currentTime,
					duration: audioElement!.duration || 0
				}));
			}
		});

		audioElement.addEventListener('play', () => {
			update((s) => ({ ...s, isPlaying: true, isLoading: false }));
		});

		audioElement.addEventListener('pause', () => {
			update((s) => ({ ...s, isPlaying: false }));
		});

		audioElement.addEventListener('waiting', () => {
			update((s) => ({ ...s, isLoading: true }));
		});

		audioElement.addEventListener('canplay', () => {
			update((s) => ({ ...s, isLoading: false }));
		});

		// GAPLESS INSTANT AUTO-NEXT AYAH & AUTO-NEXT SURAH
		audioElement.addEventListener('ended', () => {
			update((s) => {
				// Record reading progress and statistics immediately
				try {
					progressStore.progress.setLastRead(
						s.surahNumber,
						s.surahName,
						s.ayahNumber,
						Math.ceil(s.surahNumber / 4) || 1
					);
				} catch (e) {
					// safe fallback
				}

				// 1. Repeat Ayah Mode
				if (s.repeatMode === 'ayah') {
					if (audioElement) {
						audioElement.currentTime = 0;
						audioElement.play().catch(() => {});
					}
					return s;
				}

				// 2. Next Ayah within same surah (Zero Delay Instant Gapless)
				if (s.ayahNumber < s.totalAyahs) {
					const nextAyah = s.ayahNumber + 1;
					const nextUrl = getAyahAudioUrl(s.currentQari.source_url, s.surahNumber, nextAyah);

					if (audioElement) {
						audioElement.src = nextUrl;
						audioElement.playbackRate = s.playbackRate;
						audioElement.volume = s.volume;
						audioElement.currentTime = 0;
						audioElement.play().catch(() => {});
					}

					// Preload the one after next
					preloadNext(s.currentQari.source_url, s.surahNumber, nextAyah, s.totalAyahs, s.repeatMode);

					return {
						...s,
						ayahNumber: nextAyah,
						audioUrl: nextUrl,
						isPlaying: true,
						isLoading: false,
						currentTime: 0
					};
				}

				// 3. Last Ayah Finished -> Repeat Surah
				if (s.repeatMode === 'surah') {
					const nextUrl = getAyahAudioUrl(s.currentQari.source_url, s.surahNumber, 1);

					if (audioElement) {
						audioElement.src = nextUrl;
						audioElement.playbackRate = s.playbackRate;
						audioElement.volume = s.volume;
						audioElement.currentTime = 0;
						audioElement.play().catch(() => {});
					}

					preloadNext(s.currentQari.source_url, s.surahNumber, 1, s.totalAyahs, s.repeatMode);

					return {
						...s,
						ayahNumber: 1,
						audioUrl: nextUrl,
						isPlaying: true,
						isLoading: false,
						currentTime: 0
					};
				}

				// 4. Last Ayah Finished -> Auto Next Surah (Surah 1..113 -> Next Surah Ayah 1)
				if (s.surahNumber < 114) {
					const nextSurahNum = s.surahNumber + 1;
					const nextSurahMeta = SURAH_LIST.find((item) => item.number === nextSurahNum);

					if (nextSurahMeta) {
						const nextUrl = getAyahAudioUrl(s.currentQari.source_url, nextSurahNum, 1);

						// Play immediately without artificial timeout or waiting for page load
						if (audioElement) {
							audioElement.src = nextUrl;
							audioElement.playbackRate = s.playbackRate;
							audioElement.volume = s.volume;
							audioElement.currentTime = 0;
							audioElement.play().catch(() => {});
						}

						// Preload Ayah 2 of the new surah
						preloadNext(s.currentQari.source_url, nextSurahNum, 1, nextSurahMeta.number_of_ayahs, s.repeatMode);

						return {
							...s,
							surahNumber: nextSurahNum,
							surahName: nextSurahMeta.name_latin,
							ayahNumber: 1,
							totalAyahs: nextSurahMeta.number_of_ayahs,
							audioUrl: nextUrl,
							isPlaying: true,
							isLoading: false,
							currentTime: 0
						};
					}
				}

				// 5. Quran Finished (Surah 114 / An-Nas Ayah 6 finished)
				return { ...s, isPlaying: false, currentTime: 0 };
			});
		});

		audioElement.addEventListener('error', (e) => {
			console.warn('Audio playback error, falling back:', e);
			update((s) => ({ ...s, isPlaying: false, isLoading: false }));
		});
	}

	const audioPlayer = {
		subscribe,
		playAyah: (surahNumber: number, surahName: string, ayahNumber: number, totalAyahs: number = 7) => {
			update((s) => {
				const url = getAyahAudioUrl(s.currentQari.source_url, surahNumber, ayahNumber);

				if (audioElement) {
					audioElement.pause();
					audioElement.src = url;
					audioElement.playbackRate = s.playbackRate;
					audioElement.volume = s.volume;
					audioElement.currentTime = 0;
					
					const playPromise = audioElement.play();
					if (playPromise !== undefined) {
						playPromise.catch((err) => {
							console.warn('Audio play interrupted:', err);
						});
					}
				}

				// Preload next ayah in advance
				preloadNext(s.currentQari.source_url, surahNumber, ayahNumber, totalAyahs, s.repeatMode);

				return {
					...s,
					surahNumber,
					surahName,
					ayahNumber,
					totalAyahs,
					audioUrl: url,
					isVisible: true,
					isPlaying: true,
					isLoading: true,
					currentTime: 0
				};
			});
		},
		playSurahFull: (surahNumber: number, surahName: string, totalAyahs: number) => {
			audioPlayer.playAyah(surahNumber, surahName, 1, totalAyahs);
		},
		togglePlay: () => {
			update((s) => {
				if (!audioElement) return s;
				if (s.isPlaying) {
					audioElement.pause();
					return { ...s, isPlaying: false };
				} else {
					if (!audioElement.src || audioElement.src === window.location.href || !s.audioUrl) {
						audioPlayer.playAyah(s.surahNumber, s.surahName, s.ayahNumber, s.totalAyahs);
						return s;
					}
					audioElement.play().catch(() => {});
					return { ...s, isPlaying: true, isVisible: true };
				}
			});
		},
		pause: () => {
			if (audioElement) audioElement.pause();
			update((s) => ({ ...s, isPlaying: false }));
		},
		close: () => {
			if (audioElement) {
				audioElement.pause();
				audioElement.currentTime = 0;
			}
			update((s) => ({
				...s,
				isPlaying: false,
				isVisible: false,
				audioUrl: ''
			}));
		},
		open: () => {
			update((s) => ({ ...s, isVisible: true }));
		},
		seek: (seconds: number) => {
			if (audioElement) {
				audioElement.currentTime = seconds;
			}
			update((s) => ({ ...s, currentTime: seconds }));
		},
		setVolume: (val: number) => {
			const clamped = Math.max(0, Math.min(1, val));
			if (audioElement) {
				audioElement.volume = clamped;
			}
			update((s) => ({ ...s, volume: clamped }));
		},
		setPlaybackRate: (rate: number) => {
			if (audioElement) {
				audioElement.playbackRate = rate;
			}
			update((s) => ({ ...s, playbackRate: rate }));
		},
		setQari: (qari: Qari) => {
			update((s) => {
				const wasPlaying = s.isPlaying;
				const url = getAyahAudioUrl(qari.source_url, s.surahNumber, s.ayahNumber);

				if (audioElement) {
					audioElement.src = url;
					if (wasPlaying) {
						audioElement.play().catch(() => {});
					}
				}

				preloadNext(qari.source_url, s.surahNumber, s.ayahNumber, s.totalAyahs, s.repeatMode);

				return {
					...s,
					currentQari: qari,
					audioUrl: url,
					currentTime: 0
				};
			});
		},
		setRepeatMode: (mode: RepeatMode) => {
			update((s) => {
				preloadNext(s.currentQari.source_url, s.surahNumber, s.ayahNumber, s.totalAyahs, mode);
				return { ...s, repeatMode: mode };
			});
		},
		nextAyah: () => {
			update((s) => {
				if (s.ayahNumber < s.totalAyahs) {
					const next = s.ayahNumber + 1;
					audioPlayer.playAyah(s.surahNumber, s.surahName, next, s.totalAyahs);
				} else if (s.surahNumber < 114) {
					const nextSurahMeta = SURAH_LIST.find((item) => item.number === s.surahNumber + 1);
					if (nextSurahMeta) {
						audioPlayer.playAyah(nextSurahMeta.number, nextSurahMeta.name_latin, 1, nextSurahMeta.number_of_ayahs);
					}
				}
				return s;
			});
		},
		prevAyah: () => {
			update((s) => {
				if (s.ayahNumber > 1) {
					const prev = s.ayahNumber - 1;
					audioPlayer.playAyah(s.surahNumber, s.surahName, prev, s.totalAyahs);
				} else if (s.surahNumber > 1) {
					const prevSurahMeta = SURAH_LIST.find((item) => item.number === s.surahNumber - 1);
					if (prevSurahMeta) {
						audioPlayer.playAyah(prevSurahMeta.number, prevSurahMeta.name_latin, prevSurahMeta.number_of_ayahs, prevSurahMeta.number_of_ayahs);
					}
				}
				return s;
			});
		},
		toggleMinimize: () => {
			update((s) => ({ ...s, isMinimized: !s.isMinimized }));
		}
	};

	return audioPlayer;
}

export const audioStore = createAudioStore();
