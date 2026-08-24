import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';

export default function PromoCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        discount_type: 'percent',
        discount_value: '',
        min_purchase: '0',
        start_date: '',
        end_date: '',
        terms: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('vendor.promos.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Create Promo" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Promo</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Create New Promo</h1>
                    <p className="mt-2 text-sm text-slate">The promo will be reviewed by an admin before it is shown to members.</p>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="title">Promo title</label>
                        <input id="title" type="text" className="input" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="10% off for purchases of Rp1,000,000 or more" />
                        {errors.title && <p className="mt-1 text-xs text-ember">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="description">Description</label>
                        <textarea id="description" rows={3} className="input" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        {errors.description && <p className="mt-1 text-xs text-ember">{errors.description}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="discount_type">Discount type</label>
                            <select id="discount_type" className="input" value={data.discount_type} onChange={(e) => setData('discount_type', e.target.value)}>
                                <option value="percent">Percentage (%)</option>
                                <option value="nominal">Amount (Rp)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" htmlFor="discount_value">
                                {data.discount_type === 'percent' ? 'Discount amount (%)' : 'Discount amount (Rp)'}
                            </label>
                            <input id="discount_value" type="number" min="1" className="input" value={data.discount_value} onChange={(e) => setData('discount_value', e.target.value)} />
                            {errors.discount_value && <p className="mt-1 text-xs text-ember">{errors.discount_value}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="min_purchase">Minimum purchase (Rp)</label>
                            <input id="min_purchase" type="number" min="0" className="input" value={data.min_purchase} onChange={(e) => setData('min_purchase', e.target.value)} />
                            {errors.min_purchase && <p className="mt-1 text-xs text-ember">{errors.min_purchase}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="start_date">Start date</label>
                            <input id="start_date" type="date" className="input" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                            {errors.start_date && <p className="mt-1 text-xs text-ember">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="end_date">End date</label>
                            <input id="end_date" type="date" className="input" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                            {errors.end_date && <p className="mt-1 text-xs text-ember">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="label" htmlFor="terms">Terms & conditions</label>
                        <textarea id="terms" rows={2} className="input" value={data.terms} onChange={(e) => setData('terms', e.target.value)} placeholder="Valid for ACTIVE members. Cannot be combined with other promos." />
                        {errors.terms && <p className="mt-1 text-xs text-ember">{errors.terms}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('vendor.promos.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={processing}>
                            {processing ? 'Submitting…' : 'Submit Promo'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PromoCreate.layout = (page) => <VendorLayout>{page}</VendorLayout>;