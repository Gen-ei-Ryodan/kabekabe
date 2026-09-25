import { Head, Link } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

const STATUS_LABEL = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const DISCOUNT_LABEL = (promo) => {
    if (promo.discount_type === 'percent') return `${promo.discount_value}%`;
    if (promo.discount_type === 'free_item') return `Free Barang (${formatRupiah(promo.discount_value)})`;
    return formatRupiah(promo.discount_value);
};

export default function PromoShow({ promo }) {
    const canEdit = promo.status !== undefined;

    return (
        <>
            <Head title={promo.title} />

            <div className="mx-auto max-w-3xl">
                <Link
                    href={route('vendor.promos.index')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink"
                >
                    ← Kembali ke daftar promo
                </Link>

                <div className="card-surface overflow-hidden">
                    <div className="flex flex-col gap-6 bg-ink p-6 text-paper sm:flex-row sm:items-start sm:justify-between sm:p-10">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-paper/50">#{promo.id}</span>
                                <StatusChip status={promo.status} label={STATUS_LABEL[promo.status] || promo.status} />
                                {promo.status === 'approved' && (
                                    <StatusChip status={promo.is_active ? 'active' : 'inactive'} label={promo.is_active ? 'Aktif' : 'Tidak Aktif'} />
                                )}
                            </div>
                            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-gold-light">{promo.title}</h1>
                            <p className="mt-1 text-paper/70">{promo.description}</p>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                            <p className="font-mono text-3xl font-bold text-gold-light">{DISCOUNT_LABEL(promo)}</p>
                            <p className="mt-1 font-mono text-xs text-paper/50">
                                {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                            </p>
                        </div>
                    </div>

                    {promo.status === 'rejected' && promo.rejection_reason && (
                        <div className="border-t border-ink/10 bg-ember/10 px-5 py-4 text-sm text-ember sm:px-10">
                            <span className="font-semibold">Alasan penolakan:</span> {promo.rejection_reason}
                        </div>
                    )}

                    {(promo.logo_url || promo.promo_image_url || promo.product_image_url) && (
                        <div className="border-t border-ink/10 bg-paper/30 p-5 sm:p-8">
                            <p className="eyebrow mb-4">Foto Promo</p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {promo.promo_image_url && (
                                    <div className="rounded-xl border border-ink/10 bg-white p-3 flex flex-col">
                                        <div className="aspect-[4/3] overflow-hidden rounded-lg">
                                            <img src={promo.promo_image_url} alt="Foto Promo" className="h-full w-full object-cover" />
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-slate text-center">Foto Promo</p>
                                    </div>
                                )}
                                {promo.product_image_url && (
                                    <div className="rounded-xl border border-ink/10 bg-white p-3 flex flex-col">
                                        <div className="aspect-[4/3] overflow-hidden rounded-lg">
                                            <img src={promo.product_image_url} alt="Foto Produk" className="h-full w-full object-cover" />
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-slate text-center">Foto Produk</p>
                                    </div>
                                )}
                                {promo.logo_url && (
                                    <div className="rounded-xl border border-ink/10 bg-white p-3 flex flex-col">
                                        <div className="aspect-[4/3] flex items-center justify-center overflow-hidden bg-paper/50 rounded-lg">
                                            <img src={promo.logo_url} alt="Logo Perusahaan" className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-slate text-center">Logo Perusahaan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-5 sm:p-10">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Minimal Belanja</p>
                                <p className="mt-1 font-display font-bold">{promo.min_purchase > 0 ? formatRupiah(promo.min_purchase) : 'Tanpa Minimal'}</p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Benefit / Diskon</p>
                                <p className="mt-1 font-display font-bold">{DISCOUNT_LABEL(promo)}</p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Periode</p>
                                <p className="mt-1 font-mono text-sm font-semibold">{formatDate(promo.start_date)} — {formatDate(promo.end_date)}</p>
                            </div>
                        </div>

                        {promo.terms && (
                            <div className="mt-6 rounded-xl bg-ink/5 p-5">
                                <p className="eyebrow">Syarat & Ketentuan</p>
                                <p className="mt-2 text-sm text-slate">{promo.terms}</p>
                            </div>
                        )}

                        {canEdit && (
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link href={route('vendor.promos.edit', promo.id)} className="btn-gold">
                                    Edit & Ajukan Ulang
                                </Link>
                                <Link href={route('vendor.promos.index')} className="btn-ghost">
                                    Kembali
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

PromoShow.layout = (page) => <VendorLayout>{page}</VendorLayout>;
