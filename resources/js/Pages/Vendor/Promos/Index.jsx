import { Head, Link, router, usePage } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PromoIndex({ promos, filters }) {
    const { ziggy } = usePage().props;

    const selectStatus = (status) => {
        router.get(route('vendor.promos.index'), { status: status === 'all' ? undefined : status }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Promo" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Promo</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Promo Saya</h1>
                        <p className="mt-2 text-sm text-slate">Ajukan promo untuk member komunitas. Promo akan tayang setelah disetujui admin.</p>
                    </div>
                    <Link href={route('vendor.promos.create')} className="btn-gold">
                        + Buat Promo
                    </Link>
                </header>

                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'Semua' },
                        { key: 'pending', label: 'Menunggu' },
                        { key: 'approved', label: 'Disetujui' },
                        { key: 'rejected', label: 'Ditolak' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => selectStatus(key)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                (filters.status || 'all') === key
                                    ? 'bg-ink text-paper'
                                    : 'border border-ink/15 bg-white/70 text-slate hover:bg-white'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {promos.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada promo"
                        description="Buat promo pertama Anda untuk member komunitas."
                        action={<Link href={route('vendor.promos.create')} className="btn-gold">Buat promo</Link>}
                    />
                ) : (
                    <div className="space-y-3">
                        {promos.data.map((promo) => (
                            <div key={promo.id} className="card-surface p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 flex-1 items-start gap-4">
                                        {promo.promo_image_url ? (
                                            <img src={promo.promo_image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover border border-ink/10" />
                                        ) : null}
                                        <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs text-slate">#{promo.id}</span>
                                            <StatusChip
                                                status={promo.status}
                                                label={promo.status === 'pending' ? 'Menunggu' : promo.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                            />
                                            {promo.status === 'approved' && (
                                                <StatusChip status={promo.is_active ? 'active' : 'inactive'} label={promo.is_active ? 'Aktif' : 'Tidak Aktif'} />
                                            )}
                                        </div>
                                        <h3 className="mt-2 font-display text-lg font-bold">{promo.title}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate">{promo.description}</p>
                                        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-slate-soft">
                                            {formatDate(promo.start_date)} — {formatDate(promo.end_date)} ·{' '}
                                            {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)}
                                            {promo.min_purchase > 0 && ` · Min. ${formatRupiah(promo.min_purchase)}`}
                                        </p>
                                        {promo.status === 'rejected' && promo.rejection_reason && (
                                            <p className="mt-2 rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">
                                                Alasan penolakan: {promo.rejection_reason}
                                            </p>
                                        )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <Link href={route('vendor.promos.show', promo.id)} className="btn-ghost text-xs">
                                            Detail
                                        </Link>
                                        <Link href={route('vendor.promos.edit', promo.id)} className="btn-ghost text-xs">
                                            {promo.status === 'rejected' ? 'Revisi & Ajukan Ulang' : 'Edit'}
                                        </Link>
                                        {promo.status !== 'approved' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Hapus promo ini?')) router.delete(route('vendor.promos.destroy', promo.id));
                                                }}
                                                className="btn-danger text-xs"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination links={promos.links} />
            </div>
        </>
    );
}

PromoIndex.layout = (page) => <VendorLayout>{page}</VendorLayout>;