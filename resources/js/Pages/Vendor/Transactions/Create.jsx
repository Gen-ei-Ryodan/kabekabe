import { Head, useForm, router, usePage } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';

export default function TransactionCreate({ promos }) {
    const { errors } = usePage().props;

    const form = useForm({
        transaction_number: '',
        member_code: new URLSearchParams(window.location.search).get('member_code') || '',
        promo_id: '',
        total: '',
        note: '',
        proof: null,
    });

    const selectedPromo = promos.find((p) => String(p.id) === String(form.data.promo_id)) || null;

    const preview = selectedPromo && form.data.total
        ? selectedPromo.discount_type === 'percent'
            ? Math.round(Number(form.data.total) * selectedPromo.discount_value / 100)
            : Math.min(selectedPromo.discount_value, Number(form.data.total))
        : 0;

    const net = form.data.total ? Number(form.data.total) - preview : 0;

    const submit = (e) => {
        e.preventDefault();
        form.post(route('vendor.transactions.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Record Transaction" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Transactions</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Record Benefit Transaction</h1>
                    <p className="mt-2 text-sm text-slate">Enter the details of the transaction using membership benefits.</p>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="transaction_number">Transaction / receipt number (optional)</label>
                        <input id="transaction_number" type="text" className="input font-mono" value={form.data.transaction_number} onChange={(e) => form.setData('transaction_number', e.target.value)} placeholder="POS receipt number — auto-generated if empty" />
                        {errors.transaction_number && <p className="mt-1 text-xs text-ember">{errors.transaction_number}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="member_code">Member ID</label>
                        <input id="member_code" type="text" className="input font-mono" value={form.data.member_code} onChange={(e) => form.setData('member_code', e.target.value)} placeholder="MMB-00001" />
                        {errors.member_code && <p className="mt-1 text-xs text-ember">{errors.member_code}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="promo_id">Promo used</label>
                        <select id="promo_id" className="input" value={form.data.promo_id} onChange={(e) => form.setData('promo_id', e.target.value)}>
                            <option value="">No promo</option>
                            {promos.map((promo) => (
                                <option key={promo.id} value={promo.id}>
                                    {promo.title}
                                </option>
                            ))}
                        </select>
                        {errors.promo_id && <p className="mt-1 text-xs text-ember">{errors.promo_id}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="total">Total purchase (Rp)</label>
                        <input id="total" type="number" min="1" className="input" value={form.data.total} onChange={(e) => form.setData('total', e.target.value)} />
                        {errors.total && <p className="mt-1 text-xs text-ember">{errors.total}</p>}
                    </div>

                    {selectedPromo && (
                        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
                            <p className="eyebrow">Summary</p>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex justify-between"><span>Total purchase</span><span className="font-semibold">Rp{Number(form.data.total || 0).toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-sage">
                                    <span>Discount ({selectedPromo.discount_type === 'percent' ? `${selectedPromo.discount_value}%` : 'nominal'})</span>
                                    <span>-Rp{preview.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between border-t border-gold/20 pt-1 font-bold">
                                    <span>Net sales</span><span>Rp{net.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="label" htmlFor="note">Notes (optional)</label>
                        <textarea id="note" rows={2} className="input" value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />
                        {errors.note && <p className="mt-1 text-xs text-ember">{errors.note}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="proof">Receipt photo (optional)</label>
                        <input id="proof" type="file" accept="image/*" className="input" onChange={(e) => form.setData('proof', e.target.files[0])} />
                        {errors.proof && <p className="mt-1 text-xs text-ember">{errors.proof}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => router.get(route('vendor.transactions.index'))} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

TransactionCreate.layout = (page) => <VendorLayout>{page}</VendorLayout>;