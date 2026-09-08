import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			sans: ['var(--font-geist)', 'Arial', 'sans-serif'],
			display: ['var(--font-geist)', 'Arial', 'sans-serif'],
			mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
		},
		colors: {
			brand: {
				deep: 'hsl(var(--brand-deep))',
				cream: 'hsl(var(--brand-cream))',
				orange: 'hsl(var(--brand-orange))',
			},
			pipeline: {
				new: 'hsl(var(--pipeline-new))',
				'new-soft': 'hsl(var(--pipeline-new-soft))',
				'new-foreground': 'hsl(var(--pipeline-new-foreground))',
				'new-border': 'hsl(var(--pipeline-new-border))',
				active: 'hsl(var(--pipeline-active))',
				'active-soft': 'hsl(var(--pipeline-active-soft))',
				'active-foreground': 'hsl(var(--pipeline-active-foreground))',
				'active-border': 'hsl(var(--pipeline-active-border))',
				negotiation: 'hsl(var(--pipeline-negotiation))',
				'negotiation-soft': 'hsl(var(--pipeline-negotiation-soft))',
				'negotiation-foreground': 'hsl(var(--pipeline-negotiation-foreground))',
				'negotiation-border': 'hsl(var(--pipeline-negotiation-border))',
				closed: 'hsl(var(--pipeline-closed))',
				'closed-soft': 'hsl(var(--pipeline-closed-soft))',
				'closed-foreground': 'hsl(var(--pipeline-closed-foreground))',
				'closed-border': 'hsl(var(--pipeline-closed-border))',
				neutral: 'hsl(var(--pipeline-neutral))',
			},
			info: {
				soft: 'hsl(var(--info-soft))',
				foreground: 'hsl(var(--info-foreground))',
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			success: {
				DEFAULT: 'hsl(var(--success))',
				foreground: 'hsl(var(--success-foreground))'
			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
		},
		boxShadow: {
			panel: 'var(--shadow-panel)',
			floating: 'var(--shadow-floating)',
		},
		transitionDuration: {
			fast: 'var(--duration-fast)',
			standard: 'var(--duration-standard)',
		},
		transitionTimingFunction: {
			standard: 'var(--ease-standard)',
			emphasized: 'var(--ease-emphasized)',
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
