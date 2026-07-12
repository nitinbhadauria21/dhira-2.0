/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          soft: 'var(--color-primary-soft)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        lavender: 'var(--color-lavender)',
        sage: 'var(--color-sage)',
        crisis: {
          DEFAULT: 'var(--color-crisis)',
          surface: 'var(--color-crisis-surface)',
        },
        mood: {
          happy: '#F0C46B',
          calm: '#8FBCA4',
          hopeful: '#79C2C4',
          neutral: '#B9B2A4',
          stressed: '#E0A94F',
          anxious: '#8794DA',
          lonely: '#A99BC9',
          overwhelmed: '#9C6B8E',
          sad: '#7089B0',
          angry: '#C56B5C',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.1', fontWeight: '500' }],
        'h1': ['40px', { lineHeight: '1.15', fontWeight: '500' }],
        'h2': ['28px', { lineHeight: '1.25', fontWeight: '500' }],
        'h3': ['20px', { lineHeight: '1.35', fontWeight: '500' }],
        'body': ['17px', { lineHeight: '1.6' }],
        'small': ['14px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};