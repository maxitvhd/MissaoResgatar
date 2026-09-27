import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import './i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Missão Resgatar';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#d4af37',
    },
});

// Banner Maximo Tecnologias Brasil (console)
console.log(
    '%cMissão Resgatar 1.0.0\nCriado pela Maximo tecnologias brasil.\nConheça mais dos nossos sistemas em: %cwww.maximo.tec.br',
    'font-size: 24px; font-weight: bold; color: #ff0000; text-shadow: 1px 1px #000;',
    'font-size: 14px; color: #000; font-weight: bold;',
    'color: #ff0000; font-weight: bold;',
);
