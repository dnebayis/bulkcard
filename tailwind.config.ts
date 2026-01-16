import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // BULK Design Tokens
                'bulk-bg': '#1b1a16',
                'bulk-panel': '#24221d',
                'bulk-border': '#2a2823',
                'bulk-text': '#eae7df',
                'bulk-muted': '#8f8b86',
                'bulk-accent': '#139572',
                'bulk-error': '#e23845',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            transitionDuration: {
                '150': '150ms',
                '200': '200ms',
            },
        },
    },
    plugins: [],
};
export default config;
