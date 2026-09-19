/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				quran: {
					primary: '#6F4E37',       // Primary Brown
					dark: '#3E2723',          // Dark Brown
					chocolate: '#5D4037',     // Chocolate
					warm: '#8D6E63',          // Warm Brown
					cream: '#F8F3EC',         // Cream background
					beige: '#EFE4D5',         // Soft Beige
					gold: '#C9A66B',          // Gold Accent
					goldLight: '#E8D5B5',     // Soft Gold
					goldDark: '#9E783B',      // Rich Gold
					surface: '#FFFFFF',
					border: '#E3D3C4',
					muted: '#A1887F',
					sand: '#FAF6F0'
				}
			},
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
				arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
				uthmani: ['"Scheherazade New"', '"Amiri"', 'serif']
			},
			boxShadow: {
				luxury: '0 10px 30px -5px rgba(62, 39, 35, 0.08), 0 4px 6px -2px rgba(62, 39, 35, 0.04)',
				'luxury-hover': '0 20px 40px -10px rgba(62, 39, 35, 0.15), 0 8px 12px -3px rgba(62, 39, 35, 0.08)',
				gold: '0 0 20px -3px rgba(201, 166, 107, 0.35)',
				'gold-lg': '0 0 35px -5px rgba(201, 166, 107, 0.45)'
			},
			backgroundImage: {
				'islamic-pattern': "radial-gradient(circle at 50% 50%, rgba(201, 166, 107, 0.08) 0%, transparent 60%)",
				'gradient-luxury': 'linear-gradient(135deg, #3E2723 0%, #5D4037 50%, #6F4E37 100%)',
				'gradient-gold': 'linear-gradient(135deg, #C9A66B 0%, #E8D5B5 50%, #9E783B 100%)',
				'gradient-cream': 'linear-gradient(180deg, #F8F3EC 0%, #FAF6F0 100%)'
			}
		}
	},
	plugins: []
};
