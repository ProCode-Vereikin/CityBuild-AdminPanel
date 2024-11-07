/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#0e2442',
			},
			gridTemplateColumns: {
				auto: 'repeat(auto-fill, minmax(330px, 1fr))',
			},
		},
	},
	plugins: [],
}
