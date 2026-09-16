import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PromoShow({ promo, member_active }) {
    return (
        <>
            <Head title={promo.title} />

            <div className="mx-auto max-w-3xl">
                <Link href={route('member.partners.index')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink">
                    ← Kembali ke semua promo
                </Link>

                <div className="card-surface overflow-hidden">
                    <div className="relative flex flex-col gap-6 bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">{promo.partner.name}</p>
                            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-gold-light sm:text-4xl">
                                {promo.discount_type === 'percent'
                                    ? `${promo.discount_value}%`
                                    : promo.discount_type === 'free_item'
                                    ? `Free Barang`
                                    : formatRupiah(promo.discount_value)}
                            </h1>
                            <p className="mt-1 text-paper/70">
                                {promo.discount_type === 'free_item'
                                    ? `Hadiah barang senilai ${formatRupiah(promo.discount_value)}`
                                    : 'Diskon eksklusif member'}
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                            <StatusChip status={member_active ? 'active' : 'inactive'} label={member_active ? 'Tersedia untuk Anda' : 'Perlu status Aktif'} />
                            <p className="font-mono text-xs text-paper/50">
                                {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-10">
                        <h2 className="font-display text-lg font-bold">Tentang Promo Ini</h2>
                        <p className="mt-3 leading-relaxed text-slate">{promo.description}</p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Minimal Belanja</p>
                                <p className="mt-1 font-display font-bold">{promo.min_purchase > 0 ? formatRupiah(promo.min_purchase) : 'Tanpa Minimal'}</p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Benefit / Diskon</p>
                                <p className="mt-1 font-display font-bold">
                                    {promo.discount_type === 'percent'
                                        ? `${promo.discount_value}% off total`
                                        : promo.discount_type === 'free_item'
                                        ? `Free Barang (${formatRupiah(promo.discount_value)})`
                                        : formatRupiah(promo.discount_value)}
                                </p>
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

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link href={route('member.partners.show', promo.partner.id)} className="btn-ink">
                                Kunjungi {promo.partner.name}
                            </Link>
                            {member_active ? (
                                <p className="inline-flex items-center rounded-full bg-sage/10 px-4 py-2.5 text-sm font-semibold text-sage">
                                    ✓ Tunjukkan kartu digital Anda saat pembayaran
                                </p>
                            ) : (
                                <p className="inline-flex items-center rounded-full bg-ember/10 px-4 py-2.5 text-sm font-semibold text-ember">
                                    Untuk memperbarui membership Anda, silakan hubungi admin atau perpanjang langganan.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

PromoShow.layout = (page) => <MemberLayout>{page}</MemberLayout>;
