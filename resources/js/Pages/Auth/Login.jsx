import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AppLogo from '@/Components/AppLogo';
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

            <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-8 sm:justify-center sm:py-12">
                <Link href="/" className="group mb-6">
                    <AppLogo className="h-9 w-auto transition-transform group-hover:scale-105" />
                </Link>

                {/* One form wraps the whole login so submit + Enter both work.
                    Input fields are absolutely positioned inside the card image,
                    while the submit button + register link are rendered normally
                    below the card. */}
                <form
                    onSubmit={submit}
                    className="relative w-full max-w-3xl"
                >
                    {/* The card itself */}
                    <div className="login-card relative overflow-hidden rounded-[28px] shadow-card">
                        <img
                            src="/bglogin.png"
                            alt=""
                            aria-hidden="true"
                            className="block h-auto w-full select-none"
                            draggable="false"
                        />

                        {/* Inputs anchored to right-bottom of the card */}
                        <div className="absolute inset-0 p-6 sm:p-10 md:p-12">
                            <div className="absolute bottom-6 right-6 w-full max-w-xs space-y-4 sm:bottom-10 sm:right-10 sm:max-w-sm md:bottom-12 md:right-12">
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email"
                                        className="text-white/90"
                                    />
                                    <TextInput
                                        id="email"
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
                                        htmlFor="password"
                                        value="Password"
                                        className="text-white/90"
                                    />
                                    <TextInput
                                        id="password"
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
                            </div>
                        </div>
                    </div>

                    {/* Below the card: submit button + register link */}
                    <div className="mx-auto mt-6 w-full max-w-xs sm:max-w-sm">
                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={processing}
                        >
                            {processing ? 'Signing in…' : 'Login'}
                        </PrimaryButton>

                        <p className="mt-4 text-center text-sm text-slate">
                            New Member?{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold text-ink hover:text-gold-deep hover:underline"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </>
    );
}

Login.layout = (page) => page;