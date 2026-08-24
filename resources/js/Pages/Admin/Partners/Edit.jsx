import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PartnerEdit({ partner }) {
    const form = useForm({
        name: partner.name,
        category: partner.category,
        description: partner.description || '',
        address: partner.address || '',
        phone: partner.phone || '',
        email: partner.email || '',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.partners.update', partner.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Edit ${partner.name}`} />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Partner Management</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Edit Partner</h1>
                    {partner.user && <p className="mt-1 text-sm text-slate">Vendor account: {partner.user.email}</p>}
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="name">Partner name</label>
                            <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="category">Category</label>
                            <input id="category" type="text" className="input" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} />
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
                            <label className="label" htmlFor="logo">Replace logo</label>
                            <input id="logo" type="file" accept="image/*" className="input" onChange={(e) => form.setData('logo', e.target.files[0])} />
                            {form.errors.logo && <p className="mt-1 text-xs text-ember">{form.errors.logo}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.partners.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PartnerEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;