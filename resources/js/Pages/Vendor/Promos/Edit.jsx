import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';

export default function PromoEdit({ promo }) {
    const form = useForm({
        title: promo.title,
        description: promo.description || '',
        discount_type: promo.discount_type,
        discount_value: String(promo.discount_value),
        min_purchase: String(promo.min_purchase),
        start_date: promo.start_date,
        end_date: promo.end_date,
        terms: promo.terms || '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('vendor.promos.update', promo.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Revise Promo" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Rejected Promo</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Revise Promo</h1>
                    {promo.rejection_reason && (
                        <p className="mt-3 rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">
                            Rejection reason: {promo.rejection_reason}
                        </p>
                    )}
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="title">Promo title</label>
                        <input id="title" type="text" className="input" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        {form.errors.title && <p className="mt-1 text-xs text-ember">{form.errors.title}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="description">Description</label>
                        <textarea id="description" rows={3} className="input" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        {form.errors.description && <p className="mt-1 text-xs text-ember">{form.errors.description}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="discount_type">Discount type</label>
                            <select id="discount_type" className="input" value={form.data.discount_type} onChange={(e) => form.setData('discount_type', e.target.value)}>
                                <option value="percent">Percentage (%)</option>
                                <option value="nominal">Amount (Rp)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" htmlFor="discount_value">
                                {form.data.discount_type === 'percent' ? 'Discount amount (%)' : 'Discount amount (Rp)'}
                            </label>
                            <input id="discount_value" type="number" min="1" className="input" value={form.data.discount_value} onChange={(e) => form.setData('discount_value', e.target.value)} />
                            {form.errors.discount_value && <p className="mt-1 text-xs text-ember">{form.errors.discount_value}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="min_purchase">Minimum purchase (Rp)</label>
                            <input id="min_purchase" type="number" min="0" className="input" value={form.data.min_purchase} onChange={(e) => form.setData('min_purchase', e.target.value)} />
                            {form.errors.min_purchase && <p className="mt-1 text-xs text-ember">{form.errors.min_purchase}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="start_date">Start date</label>
                            <input id="start_date" type="date" className="input" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} />
                            {form.errors.start_date && <p className="mt-1 text-xs text-ember">{form.errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="end_date">End date</label>
                            <input id="end_date" type="date" className="input" value={form.data.end_date} onChange={(e) => form.setData('end_date', e.target.value)} />
                            {form.errors.end_date && <p className="mt-1 text-xs text-ember">{form.errors.end_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="label" htmlFor="terms">Terms & conditions</label>
                        <textarea id="terms" rows={2} className="input" value={form.data.terms} onChange={(e) => form.setData('terms', e.target.value)} />
                        {form.errors.terms && <p className="mt-1 text-xs text-ember">{form.errors.terms}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('vendor.promos.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Submitting…' : 'Resubmit'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PromoEdit.layout = (page) => <VendorLayout>{page}</VendorLayout>;