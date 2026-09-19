export type UserRole = 'customer' | 'admin';

export interface UserProfile {
	id: string;
	full_name: string;
	phone: string;
	email?: string;
	avatar_url?: string;
	role: UserRole;
	is_active: boolean;
	reading_target_juz?: number;
	daily_target_ayahs?: number;
	created_at: string;
	last_login_at?: string;
}

export type RevelationType = 'Makkiyah' | 'Madaniyah';

export interface SurahMeta {
	number: number;
	name_arabic: string;
	name_latin: string;
	name_id: string;
	number_of_ayahs: number;
	revelation_type: RevelationType;
	revelation_order: number;
	description?: string;
	virtues?: string;
	audio_url?: string;
	juz_start?: number;
}

export interface AyahWord {
	position: number;
	arabic: string;
	latin?: string;
	translation: string;
}

export interface AyahDetail {
	surah_number: number;
	ayah_number: number;
	juz_number: number;
	page_number: number;
	text_arabic: string;
	text_latin: string;
	text_id: string;
	tafsir_ringkas?: string;
	tafsir_tahlili?: string;
	audio_url?: string;
	words?: AyahWord[];
}

export interface SurahDetail extends SurahMeta {
	ayahs: AyahDetail[];
}

export interface Qari {
	id: number;
	name: string;
	arabic_name: string;
	avatar_url: string;
	source_url: string;
	is_active: boolean;
}

export interface Agenda {
	id: string;
	title: string;
	category: 'Kajian' | 'Tilawah' | 'Event' | 'Pengingat';
	description: string;
	event_date: string;
	location: string;
	speaker?: string;
	image_url?: string;
	status: 'published' | 'draft' | 'archived';
}

export interface QuranTopic {
	id: string;
	title: string;
	slug: string;
	category: string;
	description: string;
	icon: string;
	color: string;
	ayahs: {
		surah_number: number;
		surah_name: string;
		ayah_number: number;
		text_arabic: string;
		text_id: string;
		explanation: string;
	}[];
}

export interface Bookmark {
	id: string;
	user_id?: string;
	surah_number: number;
	surah_name: string;
	ayah_number: number;
	text_arabic?: string;
	text_id?: string;
	notes?: string;
	created_at: string;
}

export interface UserCollection {
	id: string;
	title: string;
	description?: string;
	color?: string;
	is_favorite?: boolean;
	items_count: number;
	created_at: string;
	items?: {
		id: string;
		surah_number: number;
		surah_name: string;
		ayah_number: number;
		text_arabic: string;
		text_id: string;
		notes?: string;
	}[];
}

export interface ReadingProgress {
	surah_number: number;
	surah_name: string;
	ayah_number: number;
	juz_number: number;
	last_read_at: string;
}

export interface ReadingStats {
	total_ayahs_read: number;
	total_surahs_read: number;
	total_reading_minutes: number;
	current_streak_days: number;
	completed_juz: number[];
	weekly_activity: { day: string; count: number; date: string }[];
	top_surahs: { surah_number: number; name: string; count: number }[];
	recent_history: {
		surah_number: number;
		surah_name: string;
		ayah_number: number;
		timestamp: string;
	}[];
}

export type ReadingMode = 'mushaf' | 'terjemahan' | 'tafsir' | 'per-kata' | 'audio' | 'fokus';
export type ThemeMode = 'cream' | 'sand' | 'dark' | 'sepia';
export type ArabicFontFamily = 'Scheherazade New' | 'Amiri';
