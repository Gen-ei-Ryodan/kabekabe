import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PartnerCreate() {
    const form = useForm({
        name: '',
        category: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        logo: null,
        vendor_name: '',
        vendor_email: '',
        vendor_password: '',
        vendor_password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.partners.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Add Partner" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Partner Management</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Add Partner</h1>
                    <p className="mt-2 text-sm text-slate">The partner automatically receives a vendor account to manage promos & transactions.</p>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <section className="space-y-4">
                        <h2 className="font-display text-lg font-bold">Partner Details</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="name">Partner name</label>
                                <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="category">Category</label>
                                <input id="category" type="text" className="input" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} placeholder="Restaurant, Retail, Healthcare…" />
                                {form.errors.category && <p className="mt-1 text-xs text-ember">{form.errors.category}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="phone">Phone no.</label>
                                <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                            </div>
                            <div>
                                <label className="label" htmlFor="email">Contact email</label>
                                <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="address">Address</label>
                                <input id="address" type="text" className="input" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="description">Description</label>
                                <textarea id="description" rows={3} className="input" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                                {form.errors.description && <p className="mt-1 text-xs text-ember">{form.errors.description}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="logo">Logo</label>
                                <input id="logo" type="file" accept="image/*" className="input" onChange={(e) => form.setData('logo', e.target.files[0])} />
                                {form.errors.logo && <p className="mt-1 text-xs text-ember">{form.errors.logo}</p>}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-ink/10 pt-6">
                        <h2 className="font-display text-lg font-bold">Vendor Account</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="vendor_name">Person in charge</label>
                                <input id="vendor_name" type="text" className="input" value={form.data.vendor_name} onChange={(e) => form.setData('vendor_name', e.target.value)} />
                                {form.errors.vendor_name && <p className="mt-1 text-xs text-ember">{form.errors.vendor_name}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="vendor_email">Login email</label>
                                <input id="vendor_email" type="email" className="input" value={form.data.vendor_email} onChange={(e) => form.setData('vendor_email', e.target.value)} />
                                {form.errors.vendor_email && <p className="mt-1 text-xs text-ember">{form.errors.vendor_email}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="vendor_password">Password</label>
                                <input id="vendor_password" type="password" className="input" value={form.data.vendor_password} onChange={(e) => form.setData('vendor_password', e.target.value)} />
                                {form.errors.vendor_password && <p className="mt-1 text-xs text-ember">{form.errors.vendor_password}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="vendor_password_confirmation">Confirm password</label>
                                <input id="vendor_password_confirmation" type="password" className="input" value={form.data.vendor_password_confirmation} onChange={(e) => form.setData('vendor_password_confirmation', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.partners.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Add Partner'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PartnerCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;