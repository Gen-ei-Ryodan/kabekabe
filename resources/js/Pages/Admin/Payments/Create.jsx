import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/Utils/format';

export default function PaymentCreate({ members, plans }) {
    const form = useForm({
        member_id: '',
        plan_id: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.payments.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Record Payment" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Payment Management</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Record Payment</h1>
                    <p className="mt-2 text-sm text-slate">Record an offline payment and the member's membership will be extended immediately.</p>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="member_id">Member</label>
                        <select
                            id="member_id"
                            className="input"
                            value={form.data.member_id}
                            onChange={(e) => form.setData('member_id', e.target.value)}
                        >
                            <option value="">Select member…</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} · {member.member_code}
                                </option>
                            ))}
                        </select>
                        {form.errors.member_id && <p className="mt-1 text-xs text-ember">{form.errors.member_id}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="plan_id">Membership plan</label>
                        <select
                            id="plan_id"
                            className="input"
                            value={form.data.plan_id}
                            onChange={(e) => form.setData('plan_id', e.target.value)}
                        >
                            <option value="">Select plan…</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} · {plan.duration_months} month(s) · {formatRupiah(plan.price)}
                                </option>
                            ))}
                        </select>
                        {form.errors.plan_id && <p className="mt-1 text-xs text-ember">{form.errors.plan_id}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="notes">Notes (optional)</label>
                        <textarea
                            id="notes"
                            className="input"
                            rows={3}
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                        />
                        {form.errors.notes && <p className="mt-1 text-xs text-ember">{form.errors.notes}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.payments.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PaymentCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
