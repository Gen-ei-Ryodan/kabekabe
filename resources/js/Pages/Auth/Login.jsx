import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fieldClass =
        'block w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-base text-white placeholder:text-white/40 backdrop-blur-sm focus:border-gold-light focus:ring-2 focus:ring-gold-light/40 sm:text-sm';

    return (
        <>
            <Head title="Login" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-8 sm:py-12">
                <form
                    onSubmit={submit}
                    className="relative w-full max-w-3xl"
                >
                    {/* Mobile: keep the form inside the portrait image card. */}
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
                                        value="Email"
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
                                        value="Password"
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
                                    {processing ? 'Signing in…' : 'Login'}
                                </PrimaryButton>

                                <div className="text-center">
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-bold text-white hover:text-white/80 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <p className="text-center text-sm text-white/90">
                                    New Member?{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-semibold text-white hover:underline"
                                    >
                                        Register here
                                    </Link>
                                </p>

                                <p className="text-center text-xs text-white/80">
                                    Need help?{' '}
                                    <a
                                        href="https://wa.me/62811290689"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-white hover:underline"
                                    >
                                        Contact Admin
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: original card layout with overlaid inputs */}
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
                                            value="Email"
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
                                            value="Password"
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
                                        {processing ? 'Signing in…' : 'Login'}
                                    </PrimaryButton>

                                    <div className="text-center">
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-bold text-white hover:text-white/80 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <p className="text-center text-sm text-white/90">
                                        New Member?{' '}
                                        <Link
                                            href={route('register')}
                                            className="font-semibold text-white hover:underline"
                                        >
                                            Register here
                                        </Link>
                                    </p>

                                    <p className="text-center text-xs text-white/80">
                                        Need help?{' '}
                                        <a
                                            href="https://wa.me/62811290689"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-white hover:underline"
                                        >
                                            Contact Admin
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
