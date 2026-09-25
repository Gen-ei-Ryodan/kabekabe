import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from '@/i18n';

export default function RegisterSuccess({ name, email, role }) {
    const { t } = useTranslation();
    return (
        <GuestLayout>
            <Head title={t('auth.success.title')} />

            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
                    {t('auth.success.heading')}
                </h1>

                <p className="mt-2 text-sm text-slate">
                    {t('auth.success.thanksIntro')} <strong className="capitalize text-ink">{role === 'vendor' || role === 'partner' ? t('auth.role.partner') : t('auth.role.member')}</strong>{t('auth.success.thanksOutro', { name })}
                </p>

                <div className="my-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left text-sm text-amber-900">
                    <p className="font-semibold">{t('auth.success.pendingTitle')}</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                        {t('auth.success.pendingBody')}
                    </p>
                </div>

                <div className="rounded-2xl border border-gold/30 bg-ink p-5 text-left text-paper">
                    <p className="font-mono text-xs uppercase tracking-wider text-gold-light">
                        {t('auth.success.emailHeading')}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-paper/80">
                        {t('auth.success.emailIntro')}{' '}
                        <strong className="text-white">{email}</strong>
                        {t('auth.success.emailMid')}
                        <span className="font-semibold text-gold-light">{t('auth.success.initialPassword')}</span>
                        {t('auth.success.emailOutro')}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-paper/60">
                        {t('auth.success.spamNote')}
                    </p>
                </div>

                <div className="mt-8">
                    <Link
                        href={route('login')}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper shadow-card hover:bg-ink/90 transition-colors"
                    >
                        {t('auth.success.backToLogin')}
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
