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
          DEFAULT: '#6E56CF',
          hover: '#5B47B3',
        },
        text: {
          primary: '#111111',
          secondary: '#1A1A1A',
          tertiary: '#8A8A8A',
          muted: '#2A2A2A',
        },
        bg: {
          base: '#FAFAFA',
          card: '#FFFFFF',
          elevated: '#F5F5F5',
        },
        border: {
          DEFAULT: '#EDEDED',
        },
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading': ['32px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subheading': ['24px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      maxWidth: {
        'content': '680px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
