import { Head, Link, router, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function TransactionIndex({ transactions, pending_scans = [], filters }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('vendor.transactions.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('vendor.transactions.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Transaksi" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Transaksi</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Transaksi Benefit</h1>
                        <p className="mt-2 text-sm text-slate">Catatan transaksi penggunaan benefit member di outlet Anda.</p>
                    </div>
                    <Link href={route('vendor.transactions.create')} className="btn-gold">
                        + Catat Transaksi
                    </Link>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="label">Dari tanggal</label>
                            <input type="date" className="input" value={filter.data.from || ''} onChange={(e) => filter.setData('from', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Sampai tanggal</label>
                            <input type="date" className="input" value={filter.data.to || ''} onChange={(e) => filter.setData('to', e.target.value)} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="label">Cari</label>
                            <input type="text" className="input" placeholder="No. transaksi / nama / nomor anggota" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                {pending_scans.length > 0 && (
                    <section className="card-surface overflow-hidden">
                        <div className="border-b border-gold/20 bg-gold/10 px-5 py-4">
                            <h2 className="font-display text-lg font-bold">Transaksi Tertunda ({pending_scans.length})</h2>
                            <p className="mt-1 text-sm text-slate">Member yang telah dipindai namun belum dicatat transaksinya. Selesaikan sebelum batas waktu 48 jam berakhir.</p>
                        </div>
                        <div className="divide-y divide-ink/5">
                            {pending_scans.map((scan) => (
                                <div key={scan.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold">{scan.member?.name}</p>
                                        <p className="font-mono text-xs text-slate">{scan.member?.member_code} · dipindai {scan.scanned_at}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-semibold text-sage-deep">sisa {scan.hours_left} jam</span>
                                        <Link href={route('vendor.transactions.create', { scan_id: scan.id })} className="btn-ink text-xs">Selesaikan Transaksi</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {transactions.data.length === 0 ? (
                    <EmptyState
                        title="Transaksi tidak ditemukan"
                        description="Belum ada transaksi pada periode/filter ini."
                        action={<Link href={route('vendor.transactions.create')} className="btn-gold">Catat transaksi</Link>}
                    />
                ) : (
                    <div className="card-surface overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-ink/10 bg-paper/60">
                                <tr>
                                    <th className="table-head px-4 py-3">No. Transaksi</th>
                                    <th className="table-head px-4 py-3">Tanggal</th>
                                    <th className="table-head px-4 py-3">Member</th>
                                    <th className="table-head px-4 py-3 text-right">Total Belanja</th>
                                    <th className="table-head px-4 py-3 text-right">Diskon</th>
                                    <th className="table-head px-4 py-3 text-right">Total Bayar</th>
                                    <th className="table-head px-4 py-3">Bukti Nota</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="transition-colors hover:bg-paper/50">
                                        <td className="px-4 py-3 font-mono text-xs font-semibold">{t.transaction_number}</td>
                                        <td className="px-4 py-3 text-slate">{formatDate(t.transacted_at, true)}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">{t.member?.name}</p>
                                                <p className="font-mono text-[10px] text-slate">{t.member?.member_code}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">{formatRupiah(t.total_amount)}</td>
                                        <td className="px-4 py-3 text-right text-sage">-{formatRupiah(t.discount_amount)}</td>
                                        <td className="px-4 py-3 text-right font-bold">{formatRupiah(t.net_amount)}</td>
                                        <td className="px-4 py-3">
                                            {t.proof_url ? (
                                                <a href={t.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gold-deep underline">Lihat</a>
                                            ) : (
                                                <span className="text-slate-soft">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination links={transactions.links} />
            </div>
        </>
    );
}

TransactionIndex.layout = (page) => <VendorLayout>{page}</VendorLayout>;
