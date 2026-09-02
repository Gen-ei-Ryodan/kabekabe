import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
                    Welcome back
                </h1>
                <p className="mt-1 text-sm text-paper/60">
                    Sign in to access your member card, promos, and community benefits.
                </p>
            </header>

            {status && (
                <div className="mb-4 rounded-lg bg-gold/10 px-4 py-3 text-sm font-medium text-gold-light">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-paper" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-ink/40 border-gold/30 text-paper placeholder:text-paper/40 focus:border-gold focus:ring-gold/30"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" className="text-paper" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-medium text-gold-light hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-ink/40 border-gold/30 text-paper placeholder:text-paper/40 focus:border-gold focus:ring-gold/30"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center gap-2">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="border-gold/40 bg-ink/40 checked:bg-gold"
                    />
                    <span className="text-sm text-paper/80">Remember me</span>
                </label>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Signing in…' : 'Login'}
                </PrimaryButton>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-paper/60">
                    New Member?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-gold-light hover:underline"
                    >
                        Click here for registration
                    </Link>
                </p>
            </div>
        </>
    );
}

Login.layout = (page) => <GuestLayout>{page}</GuestLayout>;