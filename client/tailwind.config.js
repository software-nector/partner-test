/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#667eea',
                    light: '#764ba2',
                },
                secondary: {
                    DEFAULT: '#f093fb',
                    light: '#f5576c',
                },
                dark: {
                    DEFAULT: '#0f0e17',
                    light: '#1a1a2e',
                },
            },
            fontFamily: {
                display: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'gradient-whatsapp': 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            },
        },
    },
    plugins: [],
}
