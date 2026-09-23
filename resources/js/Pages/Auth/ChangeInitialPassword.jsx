import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from '@/i18n';
import { Head, useForm } from '@inertiajs/react';

export default function ChangeInitialPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });
    const { t } = useTranslation();

    const submit = (e) => {
        e.preventDefault();

        post(route('password.change-initial.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('flow.changeInitial.title')} />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{t('flow.changeInitial.heading')}</h1>
                <p className="mt-2 text-sm text-slate">
                    {t('flow.changeInitial.instruction')}
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                <div>
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
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                    <p className="mt-2 text-[11px] text-slate-soft">{t('flow.passwordHint')}</p>
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value={t('flow.confirmNewPassword')} />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? t('flow.saving') : t('flow.changeInitial.submit')}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
