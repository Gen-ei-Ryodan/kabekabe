import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function MemberCreate() {
    const form = useForm({
        name: '',
        gender: '',
        birth_date: '',
        religion: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        whatsapp: '',
        company: '',
        membership_period: '12',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.members.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Add Member" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Member Management</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Add New Member</h1>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="label" htmlFor="name">Full name</label>
                            <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="gender">Gender</label>
                            <select id="gender" className="input" value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            {form.errors.gender && <p className="mt-1 text-xs text-ember">{form.errors.gender}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="birth_date">Birth date</label>
                            <input id="birth_date" type="date" className="input" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} />
                            {form.errors.birth_date && <p className="mt-1 text-xs text-ember">{form.errors.birth_date}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="religion">Religion</label>
                            <select id="religion" className="input" value={form.data.religion} onChange={(e) => form.setData('religion', e.target.value)}>
                                <option value="">Select religion</option>
                                <option value="islam">Islam</option>
                                <option value="kristen">Kristen</option>
                                <option value="katolik">Katolik</option>
                                <option value="buddha">Buddha</option>
                                <option value="hindu">Hindu</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                            {form.errors.religion && <p className="mt-1 text-xs text-ember">{form.errors.religion}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="email">Email</label>
                            <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                            {form.errors.email && <p className="mt-1 text-xs text-ember">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="membership_period">Membership period</label>
                            <select id="membership_period" className="input" value={form.data.membership_period} onChange={(e) => form.setData('membership_period', e.target.value)}>
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <input id="password" type="password" className="input" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                            {form.errors.password && <p className="mt-1 text-xs text-ember">{form.errors.password}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="password_confirmation">Confirm password</label>
                            <input id="password_confirmation" type="password" className="input" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="phone">Phone</label>
                            <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="whatsapp">WhatsApp</label>
                            <input id="whatsapp" type="text" className="input" value={form.data.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label" htmlFor="company">Company</label>
                            <input id="company" type="text" className="input" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.members.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

MemberCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
