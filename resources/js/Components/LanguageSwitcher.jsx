import { useTranslation } from '@/i18n';

const OPTIONS = [
    { code: 'id', label: 'ID' },
    { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher({ className = '' }) {
    const { lang, setLang, t } = useTranslation();

    return (
        <div
            className={`inline-flex items-center rounded-full border border-ink/15 bg-white/70 p-0.5 ${className}`}
            role="group"
            aria-label={t('common.chooseLanguage')}
            title={t('common.chooseLanguage')}
        >
            {OPTIONS.map((opt) => (
                <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLang(opt.code)}
                    aria-pressed={lang === opt.code}
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest transition-colors ${
                        lang === opt.code
                            ? 'bg-ink text-paper'
                            : 'text-slate hover:text-ink'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
