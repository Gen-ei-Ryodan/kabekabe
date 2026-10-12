import { Head, Link } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function VendorTransactionShow({ transaction }) {
    return (
        <>
            <Head title={`Transaksi ${transaction.transaction_number}`} />

            <div className="mx-auto max-w-2xl">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="eyebrow">Detail Transaksi</p>
                        <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-ink">{transaction.transaction_number}</h1>
                        <p className="mt-1 text-sm text-slate">{formatDate(transaction.transacted_at, true)}</p>
                    </div>
                    <Link href={route('vendor.transactions.index')} className="btn-ghost text-xs self-start sm:self-auto">
                        ← Kembali
                    </Link>
                </header>

                <section className="card-surface mt-6 p-6">
                    <h2 className="font-display text-lg font-bold">Rincian Transaksi</h2>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                            ['Member', `${transaction.member?.name ?? '-'} · ${transaction.member?.member_code ?? '-'}`],
                            ['Perusahaan / Instansi', transaction.member?.company || '-'],
                            ['Promo Digunakan', transaction.promo?.title || transaction.promo_name || '-'],
                            ['Catatan Kasir', transaction.note || '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">{label}</dt>
                                <dd className="mt-1 text-sm font-medium break-words text-ink">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-6 rounded-xl border border-ink/10 bg-paper/40 p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate">Total Belanja (Gross)</span>
                            <span className="font-semibold text-ink">{formatRupiah(transaction.total_amount)}</span>
                        </div>
                        <div className="mt-2 flex justify-between text-sm text-sage">
                            <span>Potongan Diskon</span>
                            <span className="font-semibold">-{formatRupiah(transaction.discount_amount)}</span>
                        </div>
                        <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 font-display text-lg font-bold text-ink">
                            <span>Pembayaran Bersih (Net Sales)</span>
                            <span className="text-gold-deep">{formatRupiah(transaction.net_amount)}</span>
                        </div>
                    </div>

                    {transaction.proof_url && (
                        <div className="mt-6 rounded-xl border border-ink/10 bg-paper p-4">
                            <p className="eyebrow">Bukti Struk Transaksi</p>
                            <div className="mt-2 flex items-center justify-between gap-4">
                                <a
                                    href={transaction.proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-gold text-xs"
                                >
                                    Buka Foto Struk ↗
                                </a>
                                <span className="text-xs text-slate">Format gambar/dokumen</span>
                            </div>
                        </div>
                    )}
                </section>

                <div className="mt-6 flex items-center justify-between">
                    <Link href={route('vendor.transactions.index')} className="text-sm font-medium text-gold-deep hover:underline">
                        ← Kembali ke Riwayat Transaksi
                    </Link>
                    <Link href={route('vendor.transactions.create')} className="btn-ink text-xs">
                        + Catat Transaksi Baru
                    </Link>
                </div>
            </div>
        </>
    );
}

VendorTransactionShow.layout = (page) => <VendorLayout>{page}</VendorLayout>;
