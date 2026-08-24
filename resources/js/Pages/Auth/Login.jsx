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
        <GuestLayout>
            <Head title="Login" />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="mt-1 text-sm text-slate">Sign in to access your member card, promos, and community benefits.</p>
            </header>

            {status && (
                <div className="mb-4 rounded-lg bg-sage/10 px-4 py-3 text-sm font-medium text-sage">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-xs font-medium text-gold-deep hover:underline">
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
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
                    />
                    <span className="text-sm text-slate">Remember me</span>
                </label>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Signing in…' : 'Login'}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate">
                Don't have an account?{' '}
                <Link href={route('register')} className="font-semibold text-gold-deep hover:underline">
                    Register as member
                </Link>
            </p>
        </GuestLayout>
    );
}