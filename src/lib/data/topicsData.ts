import type { QuranTopic } from '$lib/types/quran';

export const QURAN_TOPICS: QuranTopic[] = [
	{
		id: 'akhlak',
		title: 'Kemuliaan Akhlak & Adab',
		slug: 'akhlak',
		category: 'Akhlak',
		description: 'Pedoman adab luhur, tutur kata santun, kejujuran, dan keutamaan menahan amarah dalam kehidupan bermasyarakat.',
		icon: 'HeartHandshake',
		color: '#6F4E37',
		ayahs: [
			{
				surah_number: 68,
				surah_name: 'Al-Qalam',
				ayah_number: 4,
				text_arabic: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
				text_id: 'Dan sesungguhnya engkau benar-benar berbudi pekerti yang luhur.',
				explanation: 'Pujian tertinggi dari Allah SWT atas kesempurnaan akhlak Rasulullah SAW sebagai teladan utama seluruh umat manusia.'
			},
			{
				surah_number: 3,
				surah_name: 'Ali \'Imran',
				ayah_number: 134,
				text_arabic: 'الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
				text_id: '(Yaitu) orang yang berinfak, baik di waktu lapang maupun sempit, dan orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang lain. Dan Allah mencintai orang-orang yang berbuat kebaikan.',
				explanation: 'Tiga pilar akhlak mulia mukmin sejati: dermawan di segala kondisi, mengendalikan emosi amarah, dan berlapang dada memberi maaf.'
			},
			{
				surah_number: 17,
				surah_name: 'Al-Isra\'',
				ayah_number: 23,
				text_arabic: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
				text_id: 'Dan Tuhanmu telah memerintahkan agar kamu jangan menyembah selain Dia dan hendaklah berbuat baik kepada ibu bapak. Jika salah seorang di antara keduanya atau kedua-duanya sampai berusia lanjut dalam pemeliharaanmu, maka sekali-kali janganlah engkau mengatakan kepada keduanya perkataan "ah" dan janganlah engkau membentak keduanya, dan ucapkanlah kepada keduanya perkataan yang baik.',
				explanation: 'Perintah bakti kepada kedua orang tua disejajarkan langsung setelah perintah tauhid, melarang keluhan sekecil apapun.'
			}
		]
	},
	{
		id: 'ibadah',
		title: 'Khusyuk dalam Ibadah & Shalat',
		slug: 'ibadah',
		category: 'Ibadah',
		description: 'Kunci ketenangan jiwa melalui penghayatan shalat, dzikir khusyuk, dan hubungan intim dengan Sang Maha Pencipta.',
		icon: 'Sparkles',
		color: '#8D6E63',
		ayahs: [
			{
				surah_number: 23,
				surah_name: 'Al-Mu\'minun',
				ayah_number: 1,
				text_arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ ﴿١﴾ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
				text_id: 'Sungguh beruntung orang-orang yang beriman, (yaitu) orang yang khusyuk dalam shalatnya.',
				explanation: 'Kekhusyukan adalah ruh dari shalat, menghadirkan keagungan Allah dan menyelaraskan lisan dengan detak hati.'
			},
			{
				surah_number: 13,
				surah_name: 'Ar-Ra\'d',
				ayah_number: 28,
				text_arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
				text_id: '(Yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
				explanation: 'Dzikir adalah obat utama bagi kegelisahan jiwa, memberikan kedamaian hakiki yang tidak ditemukan pada materi dunia.'
			},
			{
				surah_number: 29,
				surah_name: 'Al-\'Ankabut',
				ayah_number: 45,
				text_arabic: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
				text_id: 'Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar. Dan (ketahuilah) mengingat Allah (shalat) itu lebih besar (keutamaannya dari ibadah yang lain).',
				explanation: 'Indikator shalat yang diterima adalah dampaknya yang menjadi perisai dari perbuatan dosa di kehidupan sehari-hari.'
			}
		]
	},
	{
		id: 'keluarga',
		title: 'Harmoni Keluarga Sakinah',
		slug: 'keluarga',
		category: 'Keluarga',
		description: 'Pedoman mewujudkan rumah tangga yang dipenuhi ketenangan (sakinah), cinta (mawaddah), dan kasih sayang (rahmah).',
		icon: 'Home',
		color: '#5D4037',
		ayahs: [
			{
				surah_number: 30,
				surah_name: 'Ar-Rum',
				ayah_number: 21,
				text_arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
				text_id: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
				explanation: 'Pernikahan adalah tanda kebesaran Allah yang dirancang untuk melahirkan kedamaian batin dan kehangatan rasa sayang.'
			},
			{
				surah_number: 25,
				surah_name: 'Al-Furqan',
				ayah_number: 74,
				text_arabic: 'وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
				text_id: 'Dan orang-orang yang berkata, "Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa."',
				explanation: 'Doa agung hamba Ar-Rahman memohon keluarga yang menjadi penyejuk pandangan dan generasi pemimpin ketakwaan.'
			}
		]
	},
	{
		id: 'pendidikan',
		title: 'Pendidikan Generasi Rabbani',
		slug: 'pendidikan',
		category: 'Pendidikan',
		description: 'Pesan Luqman Al-Hakim dan metode menanamkan aqidah kokoh serta karakter mulia pada anak sejak dini.',
		icon: 'GraduationCap',
		color: '#6F4E37',
		ayahs: [
			{
				surah_number: 31,
				surah_name: 'Luqman',
				ayah_number: 13,
				text_arabic: 'وَإِذْ قَالَ لُقْمَانُ لِابْنِهِ وَهُوَ يَعِظُهُ يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ ۖ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ',
				text_id: 'Dan (ingatlah) ketika Luqman berkata kepada anaknya, ketika dia memberi pelajaran kepadanya, "Wahai anakku! Janganlah engkau mempersekutukan Allah, sesungguhnya mempersekutukan (Allah) adalah benar-benar kezaliman yang besar."',
				explanation: 'Fondasi pertama dan terpenting dalam pendidikan anak adalah penanaman aqidah tauhid yang murni.'
			},
			{
				surah_number: 31,
				surah_name: 'Luqman',
				ayah_number: 17,
				text_arabic: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ',
				text_id: 'Wahai anakku! Laksanakanlah shalat dan suruhlah (manusia) berbuat yang makruf dan cegahlah (mereka) dari yang mungkar dan bersabarlah terhadap apa yang menimpamu.',
				explanation: 'Tiga bekal kepemimpinan: shalat sebagai koneksi dengan Allah, amar ma\'ruf nahi mungkar, dan ketabahan mental.'
			}
		]
	},
	{
		id: 'kesabaran',
		title: 'Keteguhan Hati & Kesabaran',
		slug: 'kesabaran',
		category: 'Kesabaran',
		description: 'Sumber ketenangan saat menghadapi cobaan hidup, kehilangan, dan janji balasan tanpa batas bagi orang yang sabar.',
		icon: 'Shield',
		color: '#C9A66B',
		ayahs: [
			{
				surah_number: 2,
				surah_name: 'Al-Baqarah',
				ayah_number: 153,
				text_arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
				text_id: 'Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan shalat. Sungguh, Allah beserta orang-orang yang sabar.',
				explanation: 'Sabar dan shalat adalah dua sayap pertolongan mukmin dalam melintasi badai ujian kehidupan.'
			},
			{
				surah_number: 94,
				surah_name: 'Al-Insyirah',
				ayah_number: 5,
				text_arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٥﴾ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
				text_id: 'Maka sesungguhnya beserta kesulitan ada kemudahan, sesungguhnya beserta kesulitan ada kemudahan.',
				explanation: 'Kepastian ilahi bahwa satu kesulitan tidak akan pernah mampu mengalahkan dua kemudahan yang membersamainya.'
			},
			{
				surah_number: 39,
				surah_name: 'Az-Zumar',
				ayah_number: 10,
				text_arabic: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ',
				text_id: 'Hanya orang-orang yang bersabarlah yang disempurnakan pahalanya tanpa batas.',
				explanation: 'Pahala kesabaran dialirkan tanpa takaran hisab di hari kiamat laksana curahan air yang melimpah ruah.'
			}
		]
	},
	{
		id: 'rezeki',
		title: 'Keberkahan Rezeki Halal',
		slug: 'rezeki',
		category: 'Rezeki',
		description: 'Konsep rezeki yang berkah, rahasia membuka pintu rezeki dengan taqwa, istighfar, tawakkal, dan sedekah.',
		icon: 'Coins',
		color: '#9E783B',
		ayahs: [
			{
				surah_number: 65,
				surah_name: 'At-Talaq',
				ayah_number: 2,
				text_arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴿٢﴾ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
				text_id: 'Barangsiapa bertakwa kepada Allah niscaya Dia akan membukakan jalan keluar baginya, dan Dia memberinya rezeki dari arah yang tidak disangka-sangkanya.',
				explanation: 'Ketaqwaan adalah magnet rezeki terkuat yang membuka jalan keluar dari kebuntuan hidup.'
			},
			{
				surah_number: 14,
				surah_name: 'Ibrahim',
				ayah_number: 7,
				text_arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ',
				text_id: 'Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu, tetapi jika kamu mengingkari (nikmat-Ku), maka pasti azab-Ku sangat berat.',
				explanation: 'Syukur mengikat nikmat yang ada dan mengundang tambahan nikmat baru yang belum datang.'
			}
		]
	},
	{
		id: 'taubat',
		title: 'Pintu Taubat & Ampunan',
		slug: 'taubat',
		category: 'Taubat',
		description: 'Keluasan rahmat Allah yang melampaui segala dosa hamba-Nya dan anjuran bersegera kembali kepada-Nya.',
		icon: 'RefreshCw',
		color: '#3E2723',
		ayahs: [
			{
				surah_number: 39,
				surah_name: 'Az-Zumar',
				ayah_number: 53,
				text_arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
				text_id: 'Katakanlah, "Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri! Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya."',
				explanation: 'Ayat paling penuh harapan dalam Al-Qur\'an, memanggil orang berdosa dengan sapaan mesra "hamba-hamba-Ku".'
			}
		]
	},
	{
		id: 'pemuda',
		title: 'Semangat Pemuda Beriman',
		slug: 'pemuda',
		category: 'Pemuda',
		description: 'Kisah keteguhan pemuda Ashabul Kahfi yang mempertahankan prinsip kebenaran di tengah degradasi zaman.',
		icon: 'Users',
		color: '#6F4E37',
		ayahs: [
			{
				surah_number: 18,
				surah_name: 'Al-Kahf',
				ayah_number: 13,
				text_arabic: 'نَّحْنُ نَقُصُّ عَلَيْكَ نَبَأَهُم بِالْحَقِّ ۚ إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ وَزِدْنَاهُمْ هُدًى',
				text_id: 'Kami menceritakan kepadamu (Muhammad) kisah mereka dengan sebenarnya. Sesungguhnya mereka adalah pemuda-pemuda yang beriman kepada Tuhan mereka, dan Kami tambahkan petunjuk kepada mereka.',
				explanation: 'Keberanian pemuda berprinsip menjadi inspirasi gerakan kebaikan di setiap peradaban.'
			}
		]
	},
	{
		id: 'ilmu',
		title: 'Keutamaan Menuntut Ilmu',
		slug: 'ilmu',
		category: 'Ilmu',
		description: 'Tingginya derajat pencari ilmu dan ulama di hadapan Allah serta anugerah pemahaman agama.',
		icon: 'BookOpen',
		color: '#8D6E63',
		ayahs: [
			{
				surah_number: 58,
				surah_name: 'Al-Mujadilah',
				ayah_number: 11,
				text_arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
				text_id: 'Allah akan meninggikan orang-orang yang beriman di antaramu dan orang-orang yang diberi ilmu pengetahuan beberapa derajat.',
				explanation: 'Kombinasi iman dan ilmu adalah elevator kemuliaan seorang insan di dunia dan akhirat.'
			},
			{
				surah_number: 20,
				surah_name: 'Taha',
				ayah_number: 114,
				text_arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
				text_id: 'Dan katakanlah, "Ya Tuhanku, tambahkanlah ilmu kepadaku."',
				explanation: 'Satu-satunya hal tambahan yang diperintahkan kepada Nabi SAW untuk dimohon secara langsung adalah tambahan ilmu.'
			}
		]
	},
	{
		id: 'kehidupan',
		title: 'Hakikat Kehidupan Dunia',
		slug: 'kehidupan',
		category: 'Kehidupan',
		description: 'Menempatkan dunia sebagai jembatan bercocok tanam menuju negeri akhirat yang kekal abadi.',
		icon: 'Compass',
		color: '#5D4037',
		ayahs: [
			{
				surah_number: 57,
				surah_name: 'Al-Hadid',
				ayah_number: 20,
				text_arabic: 'اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ وَزِينَةٌ وَتَفَاخُرٌ بَيْنَكُمْ وَتَكَاثُرٌ فِي الْأَمْوَالِ وَالْأَوْلَادِ',
				text_id: 'Ketahuilah, bahwa sesungguhnya kehidupan dunia itu hanyalah permainan dan sesuatu yang melalaikan, perhiasan dan bermegah-megah antara kamu serta berbangga-banggaan tentang banyaknya harta dan anak.',
				explanation: 'Peringatan cerdas agar tidak tertipu oleh fatamorgana kesenangan duniawi yang berumur singkat.'
			}
		]
	},
	{
		id: 'dakwah',
		title: 'Hikmah & Seni Berdakwah',
		slug: 'dakwah',
		category: 'Dakwah',
		description: 'Metodologi mengajak sesama menuju kebenaran dengan kearifan, teladan baik, dan dialog yang santun.',
		icon: 'Send',
		color: '#C9A66B',
		ayahs: [
			{
				surah_number: 16,
				surah_name: 'An-Nahl',
				ayah_number: 125,
				text_arabic: 'ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ ۖ وَجَادِلْهُم بِالَّتِي هِيَ أَحْسَنُ',
				text_id: 'Serulah (manusia) kepada jalan Tuhanmu dengan hikmah dan pengajaran yang baik, dan berdebatlah dengan mereka dengan cara yang baik.',
				explanation: 'Tiga kaidah emas dakwah: bil hikmah (bijaksana), al-mau\'izhah al-hasanah (nasihat sejuk), dan jidal ahsan (dialog bermartabat).'
			}
		]
	}
];
