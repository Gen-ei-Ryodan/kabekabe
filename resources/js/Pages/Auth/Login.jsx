import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

export default function Login({ status, portal = 'member' }) {
    const { t } = useTranslation();
    const isPartner = portal === 'partner';
    const isAdmin = portal === 'admin';
    const title = isPartner
        ? t('auth.login.titlePartner')
        : isAdmin
          ? t('auth.login.titleAdmin')
          : t('auth.login.title');
    const actionRoute = isPartner ? 'partner.login' : isAdmin ? 'admin.login' : 'login';
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route(actionRoute), {
            onFinish: () => reset('password'),
        });
    };

    const fieldClass =
        'block w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-base text-white placeholder:text-white/40 backdrop-blur-sm focus:border-gold-light focus:ring-2 focus:ring-gold-light/40 sm:text-sm';

    const fields = (prefix) => (
        <>
            <div>
                <InputLabel
                    htmlFor={`email-${prefix}`}
                    value={t('auth.login.email')}
                    className="text-white/90"
                />
                <TextInput
                    id={`email-${prefix}`}
                    type="email"
                    name="email"
                    value={data.email}
                    className={fieldClass}
                    autoComplete="username"
                    isFocused={prefix === 'mobile' || prefix === 'desktop'}
                    onChange={(e) => setData('email', e.target.value)}
                />
                <InputError
                    message={errors.email}
                    className="mt-1 text-xs text-ember"
                />
            </div>

            <div>
                <InputLabel
                    htmlFor={`password-${prefix}`}
                    value={t('auth.login.password')}
                    className="text-white/90"
                />
                <TextInput
                    id={`password-${prefix}`}
                    type="password"
                    name="password"
                    value={data.password}
                    className={fieldClass}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                />
                <InputError
                    message={errors.password}
                    className="mt-1 text-xs text-ember"
                />
            </div>

            <PrimaryButton className="w-full justify-center" disabled={processing}>
                {processing ? t('auth.login.processing') : t('auth.login.submit')}
            </PrimaryButton>

            <div className="text-center">
                <Link
                    href={route('password.request')}
                    className="text-sm font-bold text-white hover:text-white/80 hover:underline"
                >
                    {t('auth.login.forgot')}
                </Link>
            </div>

            <p className="text-center text-sm text-white/90">
                {isPartner ? (
                    <>
                        {t('auth.login.noAccount')}{' '}
                        <Link
                            href={route('partner.register.show')}
                            className="font-semibold text-white hover:underline"
                        >
                            {t('auth.login.partnerRegister')}
                        </Link>
                    </>
                ) : (
                    !isAdmin && (
                        <>
                            {t('auth.login.noAccount')}{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold text-white hover:underline"
                            >
                                {t('auth.login.register')}
                            </Link>
                        </>
                    )
                )}
            </p>

            <p className="text-center text-xs text-white/80">
                {t('auth.login.needHelp')}{' '}
                <a
                    href="https://wa.me/62811290689"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:underline"
                >
                    {t('auth.login.contactAdmin')}
                </a>
            </p>
        </>
    );

    return (
        <>
            <Head title={title} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-8 sm:py-12">
                <div className="mb-4 w-full max-w-3xl flex justify-end">
                    <LanguageSwitcher />
                </div>
                {status && (
                    <div className="mb-4 w-full max-w-3xl rounded-xl border border-sage/40 bg-sage/15 px-4 py-3 text-sm font-medium text-ink backdrop-blur-sm">
                        {status}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className={`relative w-full ${isPartner ? 'max-w-7xl max-sm:mx-auto max-sm:max-w-[390px]' : 'max-w-3xl'}`}
                >
                    {isPartner ? (
                        <>
                            {/* Mobile (sm ke bawah): kartu portrait, form overlay di area bawah gambar */}
                            <div className="sm:hidden">
                                <div className="login-card relative aspect-[1024/1536] min-h-[700px] w-full overflow-hidden rounded-[28px] bg-black shadow-card">
                                    <img
                                        src="/images/auth/partner-portrait.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 h-full w-full select-none object-cover object-top"
                                        draggable="false"
                                    />

                                    <div className="absolute inset-x-5 bottom-5 top-[54%] flex flex-col justify-end space-y-2.5">
                                        {fields('partner')}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop (sm ke atas): kartu landscape, form overlay di area kanan kosong (bawah teks PARTNER, kanan garis emas).
                                Di bawah lg ruang kosong gambar terlalu pendek untuk form, jadi form jadi blok biasa di bawah poster. */}
                            <div className="hidden sm:block">
                                <div className="login-card relative w-full overflow-hidden rounded-[28px] bg-black shadow-card">
                                    <img
                                        src="/images/auth/partner-landscape.jpeg"
                                        alt=""
                                        aria-hidden="true"
                                        className="block h-auto w-full select-none"
                                        draggable="false"
                                    />

                                    <div className="mx-auto w-full max-w-sm space-y-2.5 px-6 py-8 lg:absolute lg:bottom-[4%] lg:right-[3.5%] lg:mx-0 lg:w-[46%] lg:max-w-[420px] lg:space-y-1.5 lg:px-0 lg:py-0">
                                        {fields('partner-d')}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Mobile: form inside portrait image card */}
                            <div className="flex flex-col items-center sm:hidden">
                                <div className="login-card relative overflow-hidden rounded-[28px] shadow-card">
                                    <img
                                        src="/bgmobile.jpeg"
                                        alt=""
                                        aria-hidden="true"
                                        className="block h-auto w-full select-none"
                                        draggable="false"
                                    />

                                    <div className="absolute inset-x-6 bottom-6 space-y-4">
                                        {fields('mobile')}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop layout */}
                            <div className="hidden sm:block">
                                <div className="login-card relative overflow-hidden rounded-[28px] shadow-card">
                                    <img
                                        src="/bglogin.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="block h-auto w-full object-cover object-center select-none"
                                        draggable="false"
                                    />

                                    <div className="absolute inset-0 p-6 sm:p-10 md:p-12">
                                        <div className="absolute bottom-6 right-6 w-full max-w-xs space-y-4 sm:bottom-10 sm:right-10 sm:max-w-sm md:bottom-12 md:right-12">
                                            {fields('desktop')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </>
    );
}

Login.layout = (page) => page;
