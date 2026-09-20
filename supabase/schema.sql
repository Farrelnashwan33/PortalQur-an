-- ====================================================================
-- PORTAL QUR'AN v3.3 - DATABASE SCHEMA & SUPABASE SQL SCRIPT
-- ====================================================================
-- Ready to run directly in Supabase SQL Editor.
-- Covers: Enum, Tables, Triggers, Functions, Indexes, RLS Policies, & Seeds.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE revelation_type AS ENUM ('Makkiyah', 'Madaniyah');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE publish_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth via Phone / Mobile Number)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    reading_target_juz INT DEFAULT 30,
    daily_target_ayahs INT DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration safety for existing installations
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 4. SURAHS TABLE
CREATE TABLE IF NOT EXISTS public.surahs (
    id SERIAL PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    name_arabic TEXT NOT NULL,
    name_latin TEXT NOT NULL,
    name_id TEXT NOT NULL,
    number_of_ayahs INT NOT NULL,
    revelation_type revelation_type NOT NULL,
    revelation_order INT,
    description TEXT,
    virtues TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AYAHS TABLE
CREATE TABLE IF NOT EXISTS public.ayahs (
    id SERIAL PRIMARY KEY,
    surah_id INT NOT NULL REFERENCES public.surahs(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    juz_number INT NOT NULL DEFAULT 1,
    page_number INT DEFAULT 1,
    manzil_number INT DEFAULT 1,
    text_arabic TEXT NOT NULL,
    text_latin TEXT,
    text_id TEXT NOT NULL, -- Terjemahan Bahasa Indonesia
    tafsir_ringkas TEXT,
    tafsir_tahlili TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(surah_number, ayah_number)
);

-- 6. AYAH WORDS TABLE (Per Kata)
CREATE TABLE IF NOT EXISTS public.ayah_words (
    id SERIAL PRIMARY KEY,
    ayah_id INT REFERENCES public.ayahs(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    word_position INT NOT NULL,
    text_arabic TEXT NOT NULL,
    text_latin TEXT,
    text_id TEXT NOT NULL, -- Arti per kata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. QARIS TABLE
CREATE TABLE IF NOT EXISTS public.qaris (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    arabic_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    source_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AUDIO TRACKS TABLE
CREATE TABLE IF NOT EXISTS public.audio_tracks (
    id SERIAL PRIMARY KEY,
    qari_id INT NOT NULL REFERENCES public.qaris(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    audio_url TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(qari_id, surah_number)
);

-- 9. AGENDAS TABLE
CREATE TABLE IF NOT EXISTS public.agendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Kajian',
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    speaker TEXT,
    image_url TEXT,
    status publish_status NOT NULL DEFAULT 'published',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TOPICS TABLE (Topik Quran)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'book-open',
    color TEXT DEFAULT '#6F4E37',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TOPIC AYAHS TABLE
CREATE TABLE IF NOT EXISTS public.topic_ayahs (
    id SERIAL PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    explanation TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. COLLECTIONS TABLE (Koleksi Pribadi Customer)
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#C9A66B',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. COLLECTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, surah_number, ayah_number)
);

-- 15. READING PROGRESS TABLE (Last read tracker)
CREATE TABLE IF NOT EXISTS public.reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INT NOT NULL DEFAULT 1,
    ayah_number INT NOT NULL DEFAULT 1,
    juz_number INT NOT NULL DEFAULT 1,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. READING SESSIONS & HISTORY
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    ayahs_read_count INT NOT NULL DEFAULT 0,
    surahs_read_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    read_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 18. INDEXES FOR HIGH PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_ayahs_surah_number ON public.ayahs(surah_number);
CREATE INDEX IF NOT EXISTS idx_ayahs_juz_number ON public.ayahs(juz_number);
CREATE INDEX IF NOT EXISTS idx_ayah_words_surah_ayah ON public.ayah_words(surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_date ON public.reading_history(user_id, read_date);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_ayahs_topic ON public.topic_ayahs(topic_id);

-- ====================================================================
-- 19. AUTOMATIC TRIGGER FOR AUTH SIGNUP -> PROFILES
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        phone, 
        email, 
        avatar_url, 
        role, 
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1),
            'Pengguna'
        ),
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', null),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', null),
        CASE 
            WHEN NEW.email ILIKE '%admin%' THEN 'admin'::user_role 
            ELSE 'customer'::user_role 
        END,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = CASE 
            WHEN EXCLUDED.email ILIKE '%admin%' THEN 'admin'::user_role 
            ELSE public.profiles.role 
        END,
        updated_at = NOW();

    -- Inisialisasi progress tilawah otomatis
    INSERT INTO public.reading_progress (user_id, surah_number, ayah_number, juz_number)
    VALUES (NEW.id, 1, 1, 1)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER update_agendas_modtime BEFORE UPDATE ON public.agendas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER update_collections_modtime BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER update_reading_progress_modtime BEFORE UPDATE ON public.reading_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ====================================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ayah_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_ayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR ALL USING (public.is_admin());

-- Quran Content Policies (Surahs, Ayahs, Words)
DROP POLICY IF EXISTS "Quran content is public readable" ON public.surahs;
CREATE POLICY "Quran content is public readable" ON public.surahs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Ayahs are public readable" ON public.ayahs;
CREATE POLICY "Ayahs are public readable" ON public.ayahs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Ayah words are public readable" ON public.ayah_words;
CREATE POLICY "Ayah words are public readable" ON public.ayah_words FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage surahs" ON public.surahs;
CREATE POLICY "Admins can manage surahs" ON public.surahs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ayahs" ON public.ayahs;
CREATE POLICY "Admins can manage ayahs" ON public.ayahs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ayah words" ON public.ayah_words;
CREATE POLICY "Admins can manage ayah words" ON public.ayah_words FOR ALL USING (public.is_admin());

-- Audio & Qari Policies
DROP POLICY IF EXISTS "Qaris are public readable" ON public.qaris;
CREATE POLICY "Qaris are public readable" ON public.qaris FOR SELECT USING (true);

DROP POLICY IF EXISTS "Audio tracks are public readable" ON public.audio_tracks;
CREATE POLICY "Audio tracks are public readable" ON public.audio_tracks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage qaris" ON public.qaris;
CREATE POLICY "Admins can manage qaris" ON public.qaris FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage audio tracks" ON public.audio_tracks;
CREATE POLICY "Admins can manage audio tracks" ON public.audio_tracks FOR ALL USING (public.is_admin());

-- Agendas & Topics Policies
DROP POLICY IF EXISTS "Agendas are readable by everyone" ON public.agendas;
CREATE POLICY "Agendas are readable by everyone" ON public.agendas FOR SELECT USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Topics are readable by everyone" ON public.topics;
CREATE POLICY "Topics are readable by everyone" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Topic ayahs are readable by everyone" ON public.topic_ayahs;
CREATE POLICY "Topic ayahs are readable by everyone" ON public.topic_ayahs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage agendas" ON public.agendas;
CREATE POLICY "Admins can manage agendas" ON public.agendas FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage topics" ON public.topics;
CREATE POLICY "Admins can manage topics" ON public.topics FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage topic ayahs" ON public.topic_ayahs;
CREATE POLICY "Admins can manage topic ayahs" ON public.topic_ayahs FOR ALL USING (public.is_admin());

-- User Data Policies (Collections, Bookmarks, Reading Progress)
DROP POLICY IF EXISTS "Users can manage their collections" ON public.collections;
CREATE POLICY "Users can manage their collections" ON public.collections FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their collection items" ON public.collection_items;
CREATE POLICY "Users can manage their collection items" ON public.collection_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage their bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage their bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their reading progress" ON public.reading_progress;
CREATE POLICY "Users can manage their reading progress" ON public.reading_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can manage their reading sessions" ON public.reading_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their reading history" ON public.reading_history;
CREATE POLICY "Users can manage their reading history" ON public.reading_history FOR ALL USING (auth.uid() = user_id);

-- Admins can view reading statistics across users (anonymized/aggregated)
DROP POLICY IF EXISTS "Admins can view reading progress" ON public.reading_progress;
CREATE POLICY "Admins can view reading progress" ON public.reading_progress FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view reading sessions" ON public.reading_sessions;
CREATE POLICY "Admins can view reading sessions" ON public.reading_sessions FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view reading history" ON public.reading_history;
CREATE POLICY "Admins can view reading history" ON public.reading_history FOR SELECT USING (public.is_admin());

-- Settings Policies
DROP POLICY IF EXISTS "App settings are readable by everyone" ON public.app_settings;
CREATE POLICY "App settings are readable by everyone" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL USING (public.is_admin());

-- ====================================================================
-- 21. SEED DATA (Qaris, Topics, Initial Agendas, Settings)
-- ====================================================================

-- Seed Qaris
INSERT INTO public.qaris (name, arabic_name, avatar_url, source_url) VALUES
('Misyari Rasyid Al-Afasy', 'مشاري راشد العفاسي', 'https://images.unsplash.com/photo-1597934678749-015b67a151b4?w=200&auto=format&fit=crop', 'https://everyayah.com/data/Alafasy_128kbps/'),
('Saad Al-Ghamidi', 'سعد الغامدي', 'https://images.unsplash.com/photo-1597934678749-015b67a151b4?w=200&auto=format&fit=crop', 'https://everyayah.com/data/Ghamadi_40kbps/'),
('Abdurrahman As-Sudais', 'عبد الرحمن السديس', 'https://images.unsplash.com/photo-1597934678749-015b67a151b4?w=200&auto=format&fit=crop', 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/'),
('Mahmoud Khalil Al-Hussary', 'محمود خليل الحصري', 'https://images.unsplash.com/photo-1597934678749-015b67a151b4?w=200&auto=format&fit=crop', 'https://everyayah.com/data/Husary_128kbps/')
ON CONFLICT DO NOTHING;

-- Seed Topics
INSERT INTO public.topics (title, slug, category, description, icon, color) VALUES
('Kemuliaan Akhlak & Adab', 'akhlak', 'Akhlak', 'Ayat-ayat Al-Qur''an tentang kelembutan budi pekerti, sopan santun, dan kejujuran.', 'heart-handshake', '#6F4E37'),
('Khusyuk dalam Ibadah & Shalat', 'ibadah', 'Ibadah', 'Panduan menghidupkan hati dalam shalat, dzikir, dan pengabdian kepada Allah SWT.', 'sparkles', '#8D6E63'),
('Harmoni Keluarga Sakinah', 'keluarga', 'Keluarga', 'Bimbingan membangun rumah tangga penuh cinta, kasih sayang, dan keberkahan.', 'home', '#5D4037'),
('Pendidikan Generasi Rabbani', 'pendidikan', 'Pendidikan', 'Hikmah Luqman dan nasihat para Nabi dalam mendidik anak berakhlak mulia.', 'graduation-cap', '#6F4E37'),
('Keteguhan Hati & Kesabaran', 'kesabaran', 'Kesabaran', 'Kekuatan menghadapi ujian hidup dan janji kemenangan bagi hamba yang sabar.', 'shield', '#C9A66B'),
('Keberkahan Rezeki Halal', 'rezeki', 'Rezeki', 'Kunci meluaskan rezeki melalui taqwa, istighfar, dan sedekah.', 'coins', '#9E783B'),
('Pintu Taubat & Ampunan', 'taubat', 'Taubat', 'Kasih sayang Allah yang Maha Luas bagi hamba yang kembali kepada-Nya.', 'refresh-cw', '#3E2723'),
('Semangat Pemuda Ashabul Kahfi', 'pemuda', 'Pemuda', 'Inspirasi keberanian pemuda mempertahankan iman dan kebenaran.', 'users', '#6F4E37'),
('Keutamaan Menuntut Ilmu', 'ilmu', 'Ilmu', 'Ketinggian derajat orang beriman yang berilmu di sisi Allah SWT.', 'book-open', '#8D6E63'),
('Hakikat Kehidupan Dunia', 'kehidupan', 'Kehidupan', 'Memahami tujuan hidup agar tidak terlena oleh perhiasan dunia yang fana.', 'compass', '#5D4037'),
('Hikmah & Seni Berdakwah', 'dakwah', 'Dakwah', 'Metode mengajak manusia ke jalan Allah dengan hikmah dan tutur kata yang baik.', 'send', '#C9A66B')
ON CONFLICT (slug) DO NOTHING;

-- Seed Agendas
INSERT INTO public.agendas (title, category, description, event_date, location, speaker, status) VALUES
('Kajian Akbar: Menyelami Samudra Al-Baqarah', 'Kajian', 'Tadabbur mendalam mengenai hukum, kisah para Nabi, dan petunjuk keimanan dalam Surah Al-Baqarah.', NOW() + INTERVAL '3 days', 'Masjid Raya Al-Ikhlas & Zoom Live', 'Ust. Dr. Muhammad Zulkarnain, MA', 'published'),
('Khatam Bersama: Malam Nuzulul Quran', 'Tilawah', 'Simaan Al-Qur''an 30 Juz serentak bersama para huffadz dan jamaah Portal Qur''an.', NOW() + INTERVAL '7 days', 'Auditorium Utama & Live YouTube', 'Dewan Asatidz Portal Qur''an', 'published'),
('Webinar: Rahasia Istiqomah Tilawah Harian', 'Event', 'Tips membangun kebiasaan membaca Qur''an minimal 1 juz per hari tanpa merasa terbebani.', NOW() + INTERVAL '12 days', 'Zoom Meeting Interaktif', 'Ust. Ahmad Fauzan Al-Hafizh', 'published')
ON CONFLICT DO NOTHING;

-- Seed App Settings
INSERT INTO public.app_settings (key, value, description) VALUES
('general', '{"app_name": "Portal Qur''an v3.3", "tagline": "Temukan ketenangan dalam setiap ayat.", "maintenance_mode": false, "default_qari_id": 1}', 'Pengaturan umum aplikasi'),
('theme', '{"primary_color": "#6F4E37", "dark_color": "#3E2723", "gold_color": "#C9A66B", "cream_color": "#F8F3EC"}', 'Palet warna Luxury Islamic')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- 22. HELPER QUERY UNTUK PROMOSI AKUN MENJADI ADMIN
-- ====================================================================
-- Jalankan query berikut di Supabase SQL Editor setelah user mendaftar:
-- UPDATE public.profiles SET role = 'admin' WHERE phone = '081234567890';
-- Atau jika menggunakan email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@portalquran.id';
