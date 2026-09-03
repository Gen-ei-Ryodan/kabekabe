import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah, formatDate, daysUntil } from '@/Utils/format';

export default function PaymentCreate({ members, plans }) {
    const form = useForm({
        member_id: '',
        plan_id: '',
        notes: '',
    });

    const selectedMember = members.find((m) => m.id == form.data.member_id);
    const selectedPlan = plans.find((p) => p.id == form.data.plan_id);
    const daysLeft = selectedMember?.membership?.expires_at ? daysUntil(selectedMember.membership.expires_at) : null;
    const memberPlan = selectedMember?.membership_plan;

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

                <form onSubmit={submit} className="mt-8 space-y-6">
                    <div className="card-surface p-6 sm:p-8">
                        <h2 className="font-display text-lg font-bold">Member</h2>
                        <div className="mt-4">
                            <label className="label" htmlFor="member_id">Select Member</label>
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

                        {selectedMember && (
                            <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{selectedMember.name}</span>
                                    <span className={`text-xs font-bold ${selectedMember.membership_status === 'active' ? 'text-sage' : 'text-ember'}`}>
                                        {selectedMember.membership_status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                {selectedMember.membership && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate">Plan:</span>{' '}
                                            <span className="font-medium">{memberPlan?.name || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate">Expires:</span>{' '}
                                            <span className="font-mono">{formatDate(selectedMember.membership?.expires_at)}</span>
                                        </div>
                                        {daysLeft !== null && (
                                            <div className="col-span-2">
                                                <span className="text-slate">Remaining:</span>{' '}
                                                <span className={`font-bold ${daysLeft <= 7 ? 'text-amber-600' : ''}`}>
                                                    {daysLeft >= 0 ? `${daysLeft} days` : 'Expired'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!selectedMember.membership && (
                                    <p className="mt-2 text-xs text-slate">No membership yet — this will create one.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card-surface p-6 sm:p-8">
                        <h2 className="font-display text-lg font-bold">Membership Plan</h2>
                        <div className="mt-4">
                            <label className="label" htmlFor="plan_id">Select Plan</label>
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

                        {selectedPlan && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-paper p-3 text-center">
                                    <p className="eyebrow">Plan</p>
                                    <p className="mt-1 text-sm font-bold">{selectedPlan.name}</p>
                                </div>
                                <div className="rounded-xl bg-paper p-3 text-center">
                                    <p className="eyebrow">Duration</p>
                                    <p className="mt-1 text-sm font-bold">{selectedPlan.duration_months} mo</p>
                                </div>
                                <div className="rounded-xl bg-paper p-3 text-center">
                                    <p className="eyebrow">Price</p>
                                    <p className="mt-1 text-sm font-bold text-gold">{formatRupiah(selectedPlan.price)}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="label" htmlFor="notes">Notes (optional)</label>
                            <textarea
                                id="notes"
                                className="input"
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                placeholder="e.g. Cash payment received at office"
                            />
                            {form.errors.notes && <p className="mt-1 text-xs text-ember">{form.errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.payments.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing || !form.data.member_id || !form.data.plan_id}>
                            {form.processing ? 'Saving…' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PaymentCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
