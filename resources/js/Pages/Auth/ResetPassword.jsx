import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from '@/i18n';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: email || '',
        password: '',
        password_confirmation: '',
    });
    const { t } = useTranslation();

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('flow.resetPassword.title')} />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{t('flow.resetPassword.heading')}</h1>
                <p className="mt-2 text-sm text-slate">
                    {t('flow.resetPassword.instructionBefore')}{' '}
                    <span className="font-semibold text-ink">{email}</span>.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                <div className="mt-4">
                    <InputLabel htmlFor="password" value={t('flow.newPassword')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                    <p className="mt-2 text-[11px] text-slate-soft">{t('flow.passwordHint')}</p>
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={t('flow.confirmNewPassword')}
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {processing ? t('flow.saving') : t('flow.resetPassword.submit')}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
