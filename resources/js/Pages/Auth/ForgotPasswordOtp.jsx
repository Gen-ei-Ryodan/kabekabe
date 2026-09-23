import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPasswordOtp({ email, status }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });
    const { t } = useTranslation();

    const submit = (e) => {
        e.preventDefault();
        post(route('password.otp.verify'));
    };

    const resend = (e) => {
        e.preventDefault();
        post(route('password.otp.resend'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <GuestLayout>
            <Head title={t('flow.otp.title')} />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{t('flow.otp.heading')}</h1>
                <p className="mt-2 text-sm text-slate">
                    {t('flow.otp.instructionBefore')}{' '}
                    <span className="font-semibold text-ink">{email}</span>{' '}
                    {t('flow.otp.instructionAfter')}
                </p>
            </header>

            {status && (
                <div className="mb-4 rounded-xl border border-sage/40 bg-sage/15 px-4 py-3 text-sm font-medium text-ink">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="label" htmlFor="otp">{t('flow.otp.codeLabel')}</label>
                    <TextInput
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="mt-1 block w-full text-center font-mono text-xl tracking-[0.5em]"
                        placeholder={t('flow.otp.codePlaceholder')}
                        isFocused={true}
                        value={data.otp}
                        onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <InputError message={errors.otp} className="mt-2" />
                    <p className="mt-2 text-[11px] text-slate-soft">{t('flow.otp.codeValidity', { minutes: 10 })}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={resend}
                        disabled={processing}
                        className="text-sm font-semibold text-gold-deep hover:underline disabled:opacity-50"
                    >
                        {t('flow.otp.resendCode')}
                    </button>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-slate hover:text-ink hover:underline"
                        >
                            {t('flow.otp.changeEmail')}
                        </Link>
                        <PrimaryButton disabled={processing}>
                            {processing ? t('flow.otp.verifying') : t('flow.otp.verifyContinue')}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
