import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageProvider } from '@/i18n';

gsap.registerPlugin(ScrollTrigger);

let appName = 'KBKB';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        appName = props.initialPage.props?.appName || 'KBKB';

        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <App {...props} />
            </LanguageProvider>,
        );
    },
    progress: {
        color: '#C9A227',
    },
});