import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                ink: {
                    DEFAULT: '#0B1526',
                    soft: '#14233B',
                    mute: '#31415C',
                },
                paper: {
                    DEFAULT: '#F5F2EB',
                    deep: '#ECE7DB',
                },
                gold: {
                    DEFAULT: '#C9A227',
                    light: '#E6C65C',
                    deep: '#8F6F14',
                },
                ember: {
                    DEFAULT: '#C2542E',
                    deep: '#96391B',
                },
                sage: {
                    DEFAULT: '#2E7D5B',
                    deep: '#1F5C42',
                },
                slate: {
                    DEFAULT: '#5B6472',
                    soft: '#8A93A3',
                },
            },
            fontFamily: {
                display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            boxShadow: {
                card: '0 24px 60px -20px rgba(11, 21, 38, 0.45)',
                lift: '0 12px 30px -12px rgba(11, 21, 38, 0.35)',
                ring: '0 0 0 3px rgba(201, 162, 39, 0.35)',
            },
            backgroundImage: {
                'paper-texture': 'radial-gradient(rgba(11,21,38,0.035) 1px, transparent 1px)',
            },
            backgroundSize: {
                dot: '22px 22px',
            },
        },
    },

    plugins: [forms],
};