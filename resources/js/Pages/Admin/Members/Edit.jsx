import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function MemberEdit({ member }) {
    const form = useForm({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        whatsapp: member.whatsapp || '',
        company: member.company || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.members.update', member.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Edit ${member.name}`} />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Member Management</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Edit Member</h1>
                    <p className="mt-1 font-mono text-sm text-slate">{member.member_code}</p>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="label" htmlFor="name">Full name</label>
                            <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="email">Email</label>
                            <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                            {form.errors.email && <p className="mt-1 text-xs text-ember">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="phone">Phone</label>
                            <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="whatsapp">WhatsApp</label>
                            <input id="whatsapp" type="text" className="input" value={form.data.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="company">Company</label>
                            <input id="company" type="text" className="input" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="password">New password (optional)</label>
                            <input id="password" type="password" className="input" placeholder="Leave blank to keep current password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                            {form.errors.password && <p className="mt-1 text-xs text-ember">{form.errors.password}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="password_confirmation">Confirm password</label>
                            <input id="password_confirmation" type="password" className="input" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.members.show', member.id)} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

MemberEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;