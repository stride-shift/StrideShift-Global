
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				wrlds: {
					teal: '#9F9EA1',
					dark: '#3F3F3F',
					light: '#F6F6F7',
					accent: '#C8C8C9',
					muted: '#F1F1F1'
				},
				stride: {
					navy: 'hsl(var(--stride-navy) / <alpha-value>)',
					'navy-dark': 'hsl(var(--stride-navy-dark) / <alpha-value>)',
					'navy-light': 'hsl(var(--stride-navy-light) / <alpha-value>)',
					accent: 'hsl(var(--stride-accent) / <alpha-value>)',
					'accent-soft': 'hsl(var(--stride-accent-soft) / <alpha-value>)',
					'text-strong': 'hsl(var(--stride-text-strong) / <alpha-value>)',
					'text-muted': 'hsl(var(--stride-text-muted) / <alpha-value>)',
					bg: 'hsl(var(--stride-bg) / <alpha-value>)',
					'bg-elev': 'hsl(var(--stride-bg-elev) / <alpha-value>)',
					border: 'hsl(var(--stride-border) / <alpha-value>)',
					cream: 'hsl(var(--stride-cream) / <alpha-value>)',
					'cream-warm': 'hsl(var(--stride-cream-warm) / <alpha-value>)',
					ink: 'hsl(var(--stride-ink) / <alpha-value>)',
					'ink-deep': 'hsl(var(--stride-ink-deep) / <alpha-value>)',
					sky: 'hsl(var(--stride-sky) / <alpha-value>)',
					'sky-soft': 'hsl(var(--stride-sky-soft) / <alpha-value>)',
					'sky-tint': 'hsl(var(--stride-sky-tint) / <alpha-value>)',
					sage: 'hsl(var(--stride-sage) / <alpha-value>)',
					'sage-soft': 'hsl(var(--stride-sage-soft) / <alpha-value>)',
					'sage-tint': 'hsl(var(--stride-sage-tint) / <alpha-value>)',
					gold: 'hsl(var(--stride-gold) / <alpha-value>)',
					'gold-soft': 'hsl(var(--stride-gold-soft) / <alpha-value>)',
					success: 'hsl(var(--stride-success) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'sans': ['Wix Madefor Text', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				'space': ['Wix Madefor Text', 'sans-serif'],
				'display': ['Gloock', 'ui-serif', 'Georgia', 'serif'],
				'head': ['Gloock', 'ui-serif', 'Georgia', 'serif'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'scale-in-out': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
				'scale-in-out': 'scale-in-out 3s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 20s linear infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
