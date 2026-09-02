import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
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

    return (
        <>
            <Head title="Login" />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-ink" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full border-ink/15 bg-white text-ink placeholder:text-slate-soft focus:border-gold focus:ring-gold/30"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-ink" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full border-ink/15 bg-white text-ink placeholder:text-slate-soft focus:border-gold focus:ring-gold/30"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Signing in…' : 'Login'}
                </PrimaryButton>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate">
                    New Member?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-ink hover:text-gold-deep hover:underline"
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </>
    );
}

Login.layout = (page) => <GuestLayout>{page}</GuestLayout>;