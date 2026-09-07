import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const fieldClass =
        'block w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-base text-white placeholder:text-white/40 backdrop-blur-sm focus:border-gold-light focus:ring-2 focus:ring-gold-light/40 sm:text-sm';

    return (
        <>
            <Head title="Forgot Password" />

            <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-8 sm:justify-center sm:py-12">
                <form onSubmit={submit} className="relative w-full max-w-3xl">
                    <div className="login-card relative overflow-hidden rounded-[28px] shadow-card">
                        <img
                            src="/bglogin.png"
                            alt=""
                            aria-hidden="true"
                            className="block h-auto w-full select-none"
                            draggable="false"
                        />

                        <div className="absolute inset-0 p-6 sm:p-10 md:p-12">
                            <div className="absolute bottom-6 right-6 w-full max-w-xs space-y-4 sm:bottom-10 sm:right-10 sm:max-w-sm md:bottom-12 md:right-12">
                                <p className="text-sm text-white/80">
                                    Enter your email and we'll send you a reset link.
                                </p>

                                {status && (
                                    <div className="rounded-lg bg-sage/30 px-3 py-2 text-sm font-medium text-white">
                                        {status}
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-medium text-white/90" htmlFor="email">
                                        Email
                                    </label>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={fieldClass}
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-1 text-xs text-ember" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-6 w-full max-w-xs sm:max-w-sm">
                        <PrimaryButton className="w-full justify-center" disabled={processing}>
                            {processing ? 'Sending…' : 'Send Reset Link'}
                        </PrimaryButton>

                        <p className="mt-4 text-center text-sm text-slate">
                            Remember your password?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-ink hover:text-gold-deep hover:underline"
                            >
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </>
    );
}

ForgotPassword.layout = (page) => page;
