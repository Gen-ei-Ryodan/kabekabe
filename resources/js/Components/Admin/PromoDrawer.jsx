import { useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import StatusChip from '@/Components/StatusChip';
import { formatRupiah } from '@/Utils/format';

function EditPromoDrawer({ promo, onClose }) {
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
        form.put(route('admin.promos.update', promo.id), { preserveScroll: true });
    };

    return (
        <form id="promo-form" onSubmit={submit} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate">{promo.partner?.name} · {promo.partner?.category}</p>
                <StatusChip status={promo.status} label={promo.status === 'pending' ? 'Pending' : promo.status === 'approved' ? 'Approved' : 'Rejected'} />
            </div>

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
                    <label className="label">Discount type</label>
                    <select className="input" value={form.data.discount_type} onChange={(e) => form.setData('discount_type', e.target.value)}>
                        <option value="percent">Percentage (%)</option>
                        <option value="nominal">Amount (Rp)</option>
                    </select>
                </div>
                <div>
                    <label className="label">{form.data.discount_type === 'percent' ? 'Discount (%)' : 'Discount (Rp)'}</label>
                    <input type="number" min="1" className="input" value={form.data.discount_value} onChange={(e) => form.setData('discount_value', e.target.value)} />
                    {form.errors.discount_value && <p className="mt-1 text-xs text-ember">{form.errors.discount_value}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label className="label">Minimum purchase (Rp)</label>
                    <input type="number" min="0" className="input" value={form.data.min_purchase} onChange={(e) => form.setData('min_purchase', e.target.value)} />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label">Start date</label>
                    <input type="date" className="input" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} />
                    {form.errors.start_date && <p className="mt-1 text-xs text-ember">{form.errors.start_date}</p>}
                </div>
                <div>
                    <label className="label">End date</label>
                    <input type="date" className="input" value={form.data.end_date} onChange={(e) => form.setData('end_date', e.target.value)} />
                    {form.errors.end_date && <p className="mt-1 text-xs text-ember">{form.errors.end_date}</p>}
                </div>
            </div>
            <div>
                <label className="label">Terms & conditions</label>
                <textarea rows={2} className="input" value={form.data.terms} onChange={(e) => form.setData('terms', e.target.value)} />
            </div>

            {promo.status === 'approved' && (
                <p className="rounded-xl bg-sage/10 px-4 py-3 text-xs text-sage">
                    Active promo provides {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)} benefit to ACTIVE members. You can toggle active/inactive from the promo list.
                </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Back</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

export default function PromoDrawer({ drawer, onClose }) {
    if (!drawer?.mode) return null;

    return (
        <SlideOver open onClose={onClose} title="Edit Promo" subtitle={drawer.promo?.title} width="max-w-2xl">
            <EditPromoDrawer key={drawer.promo?.id} promo={drawer.promo} onClose={onClose} />
        </SlideOver>
    );
}