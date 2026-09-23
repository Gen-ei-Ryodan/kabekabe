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
                    className="relative w-full max-w-3xl"
                >
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
                                <div>
                                    <InputLabel
                                        htmlFor="email-mobile"
                                        value={t('auth.login.email')}
                                        className="text-white/90"
                                    />
                                    <TextInput
                                        id="email-mobile"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={fieldClass}
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1 text-xs text-ember"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password-mobile"
                                        value={t('auth.login.password')}
                                        className="text-white/90"
                                    />
                                    <TextInput
                                        id="password-mobile"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className={fieldClass}
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-1 text-xs text-ember"
                                    />
                                </div>

                                <PrimaryButton
                                    className="w-full justify-center"
                                    disabled={processing}
                                >
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
                                    <div>
                                        <InputLabel
                                            htmlFor="email-desktop"
                                            value={t('auth.login.email')}
                                            className="text-white/90"
                                        />
                                        <TextInput
                                            id="email-desktop"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className={fieldClass}
                                            autoComplete="username"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-1 text-xs text-ember"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="password-desktop"
                                            value={t('auth.login.password')}
                                            className="text-white/90"
                                        />
                                        <TextInput
                                            id="password-desktop"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className={fieldClass}
                                            autoComplete="current-password"
                                            onChange={(e) =>
                                                setData('password', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="mt-1 text-xs text-ember"
                                        />
                                    </div>

                                    <PrimaryButton
                                        className="w-full justify-center"
                                        disabled={processing}
                                    >
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
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}

Login.layout = (page) => page;
