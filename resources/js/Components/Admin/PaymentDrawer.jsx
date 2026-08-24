import { router } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PaymentDrawer({ drawer, onClose }) {
    if (!drawer?.mode) return null;

    const { payment } = drawer;
    const isPending = payment.status === 'pending';
    const user = payment.member;

    const approve = () => {
        if (confirm('Approve this payment?')) router.put(route('admin.payments.approve', payment.id), {}, { preserveScroll: true });
    };

    const reject = () => {
        const notes = window.prompt('Rejection reason:');
        if (notes) router.put(route('admin.payments.reject', payment.id), { notes }, { preserveScroll: true });
    };

    return (
        <SlideOver open onClose={onClose} title={`Payment #${payment.payment_code}`} subtitle={formatRupiah(payment.amount)} width="max-w-xl">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-display text-2xl font-bold tracking-tight">{formatRupiah(payment.amount)}</p>
                        <p className="mt-1 text-sm text-slate">{formatDate(payment.created_at, true)}</p>
                    </div>
                    <StatusChip status={payment.status} label={payment.status === 'pending' ? 'Pending' : payment.status === 'approved' ? 'Approved' : 'Rejected'} pulse={isPending} />
                </div>

                <section className="rounded-2xl border border-ink/10 p-5">
                    <h2 className="font-display text-lg font-bold">Details</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        {[
                            ['Member', `${user?.name} · ${user?.email}`],
                            ['Plan', payment.plan?.name || '-'],
                            ['Method', payment.payment_method],
                            ['Ref. transfer', payment.reference || '-'],
                            ['Created', formatDate(payment.created_at)],
                            ['Verified by', payment.approver?.name || '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">{label}</dt>
                                <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {payment.payment_proof_url && (
                    <section className="rounded-2xl border border-ink/10 p-5">
                        <h2 className="font-display text-lg font-bold">Transfer Proof</h2>
                        <img src={payment.payment_proof_url} alt="Transfer proof" className="mt-3 max-h-72 w-full rounded-xl object-contain bg-paper" />
                    </section>
                )}

                {isPending && (
                    <section className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
                        <h2 className="font-display text-lg font-bold">Actions</h2>
                        <p className="mt-1 text-sm text-slate">
                            Approving will activate or renew {user?.name}'s membership for {payment.plan?.duration_months || 1} month(s).
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button onClick={approve} className="btn-gold">Approve & Activate</button>
                            <button onClick={reject} className="btn-danger">Reject</button>
                        </div>
                    </section>
                )}

                {payment.status === 'rejected' && payment.rejection_reason && (
                    <p className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">Rejection reason: {payment.rejection_reason}</p>
                )}

                <a
                    href={route('admin.members.index', { drawer: 'show', id: user?.id })}
                    className="text-sm font-medium text-gold-deep"
                >
                    ← View member profile
                </a>
            </div>
        </SlideOver>
    );
}