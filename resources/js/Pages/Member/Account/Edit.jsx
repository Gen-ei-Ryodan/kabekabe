import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';

export default function AccountEdit({ account, settings }) {
    const { data, setData, put, processing, errors } = useForm({
        name: account.name,
        whatsapp: account.whatsapp || '',
        company: account.company || '',
        avatar: null,
        current_password: '',
        password: '',
        password_confirmation: '',
        notify_promo: Boolean(settings.notify_promo),
        notify_membership: Boolean(settings.notify_membership),
        notify_community: Boolean(settings.notify_community),
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
                    <p className="eyebrow">Account</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Profile Settings</h1>
                </header>

                <form onSubmit={submit} className="mt-8 space-y-8">
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold">Profile</h2>

                            <div className="mt-6 flex items-center gap-5">
                                {account.avatar_url ? (
                                    <img src={account.avatar_url} alt={account.name} className="h-20 w-20 rounded-full border-2 border-gold object-cover" />
                                ) : (
                                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink font-display text-2xl font-bold text-gold-light">
                                        {account.name.charAt(0)}
                                    </span>
                                )}
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

                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold">Notification Settings</h2>

                            <div className="mt-6 space-y-3">
                                {[
                                    { key: 'notify_promo', label: 'New promos', desc: 'Info about new promos and benefits from partners' },
                                    { key: 'notify_membership', label: 'Membership', desc: 'Membership status and renewals' },
                                    { key: 'notify_community', label: 'Community', desc: 'Community events and announcements' },
                                ].map((item) => (
                                    <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-paper p-4">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-5 w-5 rounded border-ink/20 accent-gold"
                                            checked={data[item.key]}
                                            onChange={(e) => setData(item.key, e.target.checked)}
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold">{item.label}</span>
                                            <span className="block text-xs text-slate">{item.desc}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </Reveal>

                    <div className="flex justify-end gap-3">
                        <button type="submit" className="btn-gold" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

AccountEdit.layout = (page) => <MemberLayout>{page}</MemberLayout>;