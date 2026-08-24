import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

const STATUS_LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
};

export default function PaymentShow({ payment }) {
    const isPending = payment.status === 'pending';
    const member = payment.member;
    const proofUrl = payment.proof_path ? `/storage/${payment.proof_path}` : null;

    return (
        <>
            <Head title={`Payment #${payment.invoice_number}`} />

            <div className="mx-auto max-w-2xl">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="eyebrow">Payment #{payment.invoice_number}</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{formatRupiah(payment.amount)}</h1>
                        <p className="mt-1 text-sm text-slate">{formatDate(payment.created_at, true)}</p>
                    </div>
                    <StatusChip status={payment.status} label={STATUS_LABELS[payment.status] || payment.status} pulse={isPending} />
                </header>

                <section className="card-surface mt-8 p-6">
                    <h2 className="font-display text-lg font-bold">Details</h2>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                            ['Member', `${member?.name} · ${member?.email}`],
                            ['Plan', payment.plan?.name || '-'],
                            ['Period', `${payment.period_months ?? payment.plan?.duration_months ?? 1} month(s)`],
                            ['Paid at', formatDate(payment.paid_at)],
                            ['Created', formatDate(payment.created_at)],
                            ['Approved by', payment.approver?.name || '-'],
                            ['Notes', payment.notes || '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">{label}</dt>
                                <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {proofUrl && (
                    <section className="card-surface mt-6 p-6">
                        <h2 className="font-display text-lg font-bold">Transfer Proof</h2>
                        <img src={proofUrl} alt="Transfer proof" className="mt-4 max-h-96 w-full rounded-xl object-contain bg-paper" />
                    </section>
                )}

                {isPending && (
                    <section className="card-surface mt-6 border-gold/30 bg-gold/10 p-6">
                        <h2 className="font-display text-lg font-bold">Actions</h2>
                        <p className="mt-1 text-sm text-slate">
                            Approving will activate or extend {member?.name}'s membership by {payment.plan?.duration_months || 1} month(s).
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    if (confirm('Approve this payment?')) router.put(route('admin.payments.approve', payment.id), {}, { preserveScroll: true });
                                }}
                                className="btn-gold"
                            >
                                Approve & Activate
                            </button>
                            <button
                                onClick={() => {
                                    const notes = window.prompt('Rejection reason:');
                                    if (notes) router.put(route('admin.payments.reject', payment.id), { notes }, { preserveScroll: true });
                                }}
                                className="btn-danger"
                            >
                                Reject
                            </button>
                        </div>
                    </section>
                )}

                {payment.status === 'rejected' && payment.notes && (
                    <p className="mt-6 rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">Rejection reason: {payment.notes}</p>
                )}

                <div className="mt-8">
                    <Link href={route('admin.members.show', member?.id)} className="text-sm font-medium text-gold-deep">← View member profile</Link>
                </div>
            </div>
        </>
    );
}

PaymentShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;
