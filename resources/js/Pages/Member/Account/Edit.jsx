import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import Avatar from '@/Components/Avatar';

export default function AccountEdit({ account }) {
    const { data, setData, put, processing, errors } = useForm({
        name: account.name,
        whatsapp: account.whatsapp || '',
        company: account.company || '',
        avatar: null,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('member.account.update'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Account" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Profile Settings</h1>
                </header>

                <form onSubmit={submit} className="mt-8 space-y-8">
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold">Profile</h2>

                            <div className="mt-6 flex items-center gap-5">
                                <Avatar
                                    src={account.avatar_url}
                                    name={account.name}
                                    tone="dark"
                                    className="h-20 w-20 rounded-full border-2 border-gold text-2xl"
                                />
                                <div>
                                    <label className="btn-ghost cursor-pointer text-xs">
                                        {data.avatar ? 'Photo selected ✓' : 'Change profile photo'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setData('avatar', e.target.files[0])}
                                        />
                                    </label>
                                    {errors.avatar && <p className="mt-1 text-xs text-ember">{errors.avatar}</p>}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="name">Full name</label>
                                    <input id="name" type="text" className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="mt-1 text-xs text-ember">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="whatsapp">WhatsApp number</label>
                                    <input id="whatsapp" type="text" className="input" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} />
                                    {errors.whatsapp && <p className="mt-1 text-xs text-ember">{errors.whatsapp}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="company">Company</label>
                                    <input id="company" type="text" className="input" value={data.company} onChange={(e) => setData('company', e.target.value)} />
                                    {errors.company && <p className="mt-1 text-xs text-ember">{errors.company}</p>}
                                </div>
                            </div>
                        </section>
                    </Reveal>

                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold">Security</h2>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="current_password">Current password (required to change password)</label>
                                    <input id="current_password" type="password" className="input" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} />
                                    {errors.current_password && <p className="mt-1 text-xs text-ember">{errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password">New password</label>
                                    <input id="password" type="password" className="input" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                    {errors.password && <p className="mt-1 text-xs text-ember">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password_confirmation">Confirm new password</label>
                                    <input id="password_confirmation" type="password" className="input" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                </div>
                            </div>
                        </section>
                    </Reveal>

                    <div className="flex justify-stretch gap-3 sm:justify-end">
                        <button type="submit" className="btn-gold w-full sm:w-auto" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

AccountEdit.layout = (page) => <MemberLayout>{page}</MemberLayout>;
