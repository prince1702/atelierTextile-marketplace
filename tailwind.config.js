/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00236f', container: '#1e3a8a', fixed: '#dce1ff', 'fixed-dim': '#b6c4ff' },
        secondary: { DEFAULT: '#855300', container: '#fea619', fixed: '#ffddb8', 'fixed-dim': '#ffb95f' },
        tertiary: { DEFAULT: '#1b2b3f', container: '#314156', fixed: '#d3e4fe' },
        surface: {
          DEFAULT: '#f9f9ff', dim: '#d3daef', bright: '#f9f9ff',
          'container-lowest': '#ffffff', 'container-low': '#f1f3ff',
          'container': '#e9edff', 'container-high': '#e1e8fd', 'container-highest': '#dce2f7',
          variant: '#dce2f7', tint: '#4059aa',
        },
        on: {
          primary: '#ffffff', secondary: '#ffffff', tertiary: '#ffffff',
          surface: '#141b2b', 'surface-variant': '#444651',
          background: '#141b2b', error: '#ffffff',
          'primary-container': '#90a8ff', 'secondary-container': '#684000',
          'tertiary-container': '#9dadc6',
        },
        background: '#f9f9ff',
        outline: { DEFAULT: '#757682', variant: '#c5c5d3' },
        error: { DEFAULT: '#ba1a1a', container: '#ffdad6' },
        inverse: { primary: '#b6c4ff', surface: '#293040', 'on-surface': '#edf0ff' },
        navy: { 900: '#00236f', 800: '#1e3a8a', 700: '#264191', 600: '#4059aa', 100: '#dce1ff' },
        amber: { 500: '#fea619', 400: '#ffb95f', 100: '#ffddb8' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      boxShadow: {
        card: '0 4px 6px -1px rgba(30,58,138,0.05), 0 2px 4px -1px rgba(30,58,138,0.04)',
        'card-hover': '0 10px 15px -3px rgba(30,58,138,0.08), 0 4px 6px -2px rgba(30,58,138,0.05)',
        modal: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
