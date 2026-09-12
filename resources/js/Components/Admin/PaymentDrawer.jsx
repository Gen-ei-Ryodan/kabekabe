import { router } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PaymentDrawer({ drawer, onClose }) {
    if (!drawer?.mode) return null;

    const { payment } = drawer;
    const isPending = payment.status === 'pending';
    const user = payment.member;
    const isDoku = payment.notes?.includes('DOKU');
    const paymentMethodLabel = isDoku ? 'DOKU Gateway (Online)' : (payment.payment_method || 'Manual / Transfer');

    const approve = () => {
        if (confirm('Setujui pembayaran ini dan perpanjang masa aktif member?')) {
            router.put(route('admin.payments.approve', payment.id), {}, { preserveScroll: true });
        }
    };

    const reject = () => {
        const notes = window.prompt('Alasan penolakan pembayaran:');
        if (notes) {
            router.put(route('admin.payments.reject', payment.id), { notes }, { preserveScroll: true });
        }
    };

    return (
        <SlideOver
            open
            onClose={onClose}
            title={`Invoice #${payment.invoice_number || payment.payment_code}`}
            subtitle={formatRupiah(payment.amount)}
            width="max-w-xl"
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-display text-2xl font-bold tracking-tight">{formatRupiah(payment.amount)}</p>
                        <p className="mt-1 text-xs text-slate">{formatDate(payment.created_at, true)}</p>
                    </div>
                    <StatusChip
                        status={payment.status}
                        label={payment.status === 'pending' ? 'Pending' : payment.status === 'approved' ? 'Approved' : 'Rejected'}
                        pulse={isPending}
                    />
                </div>

                <section className="rounded-2xl border border-ink/10 p-5">
                    <h2 className="font-display text-lg font-bold">Rincian Pembayaran</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        {[
                            ['Member', `${user?.name || '-'} (${user?.member_code || '-'})`],
                            ['Email', user?.email || '-'],
                            ['Paket', payment.plan?.name || `${payment.period_months} Bulan`],
                            ['Metode Pembayaran', paymentMethodLabel],
                            ['Status Pembayaran', payment.paid_at ? `Lunas (${formatDate(payment.paid_at)})` : 'Belum Bayar'],
                            ['Diverifikasi Oleh', payment.approver?.name || (isDoku ? 'Sistem DOKU Gateway' : '-')],
                            ['Masa Aktif Sebelumnya', payment.previous_expires_at ? formatDate(payment.previous_expires_at) : 'Belum Pernah Aktif'],
                            ['Masa Aktif Baru', payment.new_expires_at ? formatDate(payment.new_expires_at) : '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow text-xs text-slate-500">{label}</dt>
                                <dd className="mt-1 text-sm font-medium break-words text-slate-900">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {payment.notes && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                        <span className="font-semibold text-slate-900 block mb-1">Rincian Transaksi / Catatan:</span>
                        <p className="font-mono text-slate-600 leading-relaxed">{payment.notes}</p>
                    </div>
                )}

                {payment.payment_proof_url && (
                    <section className="rounded-2xl border border-ink/10 p-5">
                        <h2 className="font-display text-lg font-bold">Bukti Transfer</h2>
                        <img src={payment.payment_proof_url} alt="Bukti Transfer" className="mt-3 max-h-72 w-full rounded-xl object-contain bg-paper" />
                    </section>
                )}

                {isPending && (
                    <section className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
                        <h2 className="font-display text-lg font-bold">Tindakan Admin</h2>
                        <p className="mt-1 text-sm text-slate">
                            Menyetujui pembayaran akan mengaktifkan atau memperpanjang masa aktif {user?.name} selama {payment.period_months * 30} hari.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button onClick={approve} className="btn-gold">Setujui & Aktifkan</button>
                            <button onClick={reject} className="btn-danger">Tolak</button>
                        </div>
                    </section>
                )}

                {payment.status === 'rejected' && payment.notes && (
                    <p className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">Alasan penolakan: {payment.notes}</p>
                )}

                <a
                    href={route('admin.members.index', { drawer: 'show', id: user?.id })}
                    className="text-sm font-medium text-gold-deep hover:underline"
                >
                    ← Lihat profil member
                </a>
            </div>
        </SlideOver>
    );
}