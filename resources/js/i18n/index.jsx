import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import id from './dictionaries/id';
import en from './dictionaries/en';

const STORAGE_KEY = 'kbkb_lang';
const dictionaries = { id, en };

const LanguageContext = createContext(null);

function interpolate(value, params) {
    if (!params) return value;

    return value.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] !== undefined ? String(params[name]) : match,
    );
}

function translate(lang, key, params) {
    const value = dictionaries[lang]?.[key] ?? dictionaries.id[key] ?? key;

    return interpolate(value, params);
}

function readStoredLang() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && dictionaries[stored]) return stored;
    } catch {
        /* localStorage tidak tersedia */
    }

    return 'id'; // bahasa default: Indonesia
}

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(readStoredLang);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            /* ignore */
        }
        document.documentElement.lang = lang;
    }, [lang]);

    const setLang = useCallback((next) => {
        if (dictionaries[next]) setLangState(next);
    }, []);

    const t = useCallback((key, params) => translate(lang, key, params), [lang]);

    const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
    const ctx = useContext(LanguageContext);

    if (ctx) return ctx;

    // fallback aman bila provider belum terpasang
    return {
        lang: 'id',
        setLang: () => {},
        t: (key, params) => translate('id', key, params),
    };
}
