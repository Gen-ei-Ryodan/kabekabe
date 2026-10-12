import { Head, Link } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import StatCard from '@/Components/StatCard';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah, formatMonth, formatDayDateWita } from '@/Utils/format';

export default function VendorDashboard({ partner, stats, recent_transactions }) {
    const numberFormat = (value) => formatRupiah(value ?? 0, false);
    const isPartnerActive = partner.is_partnership_active ?? partner.is_active ?? false;
    const expiresAtText = partner.expires_at_formatted || formatDayDateWita(partner.expires_at);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <p className="eyebrow">Mitra Partner</p>
                            {/* Badge Status Kemitraan Toko */}
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                                    isPartnerActive
                                        ? 'border border-sage/30 bg-sage/15 text-sage'
                                        : 'border border-ember/30 bg-ember/15 text-ember'
                                }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${isPartnerActive ? 'bg-sage animate-pulse' : 'bg-ember'}`} />
                                {partner.status_label || (isPartnerActive ? 'AKTIF' : 'TIDAK AKTIF')}
                            </span>
                        </div>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{partner.name}</h1>
                        <p className="mt-2 text-sm text-slate">Ringkasan aktivitas benefit dan transaksi di gerai/outlet Anda.</p>
                    </div>

                    {/* Masa Berlaku Kemitraan Toko */}
                    <div className="rounded-2xl border border-ink/10 bg-paper p-4 shadow-sm sm:min-w-[280px] sm:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">Masa Berlaku Kemitraan</p>
                        <p className="mt-1 font-display text-sm font-bold text-ink">
                            {expiresAtText}
                        </p>
                        <p className="mt-1 text-xs text-slate-soft">
                            {isPartnerActive ? (
                                <span className="font-semibold text-sage">Status: AKTIF</span>
                            ) : (
                                <span className="font-semibold text-ember">Status: TIDAK AKTIF</span>
                            )}
                            {partner.days_remaining !== null && partner.days_remaining !== undefined && (
                                <span className="ml-1.5 opacity-80">({partner.days_remaining} hari tersisa)</span>
                            )}
                        </p>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <StatCard label="Member Aktif" value={numberFormat(stats.active_members)} tone="ink" />
                    <StatCard label="Total Transaksi" value={numberFormat(stats.total_transactions)} tone="slate" />
                    <StatCard label="Total Penjualan" value={formatRupiah(stats.total_sales)} tone="sage" />
                    <StatCard label="Total Diskon" value={formatRupiah(stats.total_discount)} tone="ember" />
                    <StatCard label="Total Net Sales" value={formatRupiah(stats.net_sales)} tone="gold" />
                </section>

                <div className="grid gap-8 lg:grid-cols-2">
                    <section className="card-surface p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-bold">Transaksi Terkini</h2>
                            <Link href={route('vendor.transactions.index')} className="text-sm font-medium text-gold-deep">Lihat semua →</Link>
                        </div>

                        <div className="space-y-3">
                            {recent_transactions.length === 0 ? (
                                <p className="text-sm text-slate">Belum ada transaksi tercatat.</p>
                            ) : (
                                recent_transactions.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-paper p-4">
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs text-slate">{t.transaction_number}</p>
                                            <p className="truncate text-sm font-semibold">{t.member?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{formatRupiah(t.net_amount)}</p>
                                            {t.discount_amount > 0 && (
                                                <p className="text-xs text-sage">-{formatRupiah(t.discount_amount)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Performa — 6 Bulan Terakhir</h2>
                        <div className="mt-5 space-y-3">
                            {stats.monthly.length === 0 ? (
                                <p className="text-sm text-slate">Belum ada data transaksi.</p>
                            ) : (
                                stats.monthly.map((m) => (
                                    <div key={m.month} className="flex items-center justify-between gap-4 border-b border-ink/5 pb-3 last:border-0">
                                        <span className="text-sm font-medium">{formatMonth(m.month)}</span>
                                        <div className="flex items-center gap-6">
                                            <span className="font-mono text-xs text-slate">{m.total} transaksi</span>
                                            <span className="font-display text-sm font-bold">{formatRupiah(m.net)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div>
                    <h2 className="mb-3 font-display text-base font-bold text-ink">Pintasan Cepat (Quick Actions)</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Reveal>
                            <Link href={route('vendor.verify')} className="card-surface group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                                <span className="text-2xl">▣</span>
                                <div>
                                    <p className="font-display font-bold">Verifikasi / Pindai Member</p>
                                    <p className="text-xs text-slate">Pindai QR kartu digital member</p>
                                </div>
                            </Link>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <Link href={route('vendor.transactions.create')} className="card-surface group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                                <span className="text-2xl">⤹</span>
                                <div>
                                    <p className="font-display font-bold">Catat Transaksi Diskon</p>
                                    <p className="text-xs text-slate">Catat transaksi dan diskon member</p>
                                </div>
                            </Link>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <Link href={route('vendor.promos.index')} className="card-surface group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                                <span className="text-2xl">◈</span>
                                <div>
                                    <p className="font-display font-bold">Kelola Promo Toko</p>
                                    <p className="text-xs text-slate">Kelola promo diskon member</p>
                                </div>
                            </Link>
                        </Reveal>
                        <Reveal delay={0.15}>
                            <Link href={route('vendor.billing.index')} className="card-surface group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                                <span className="text-2xl">💳</span>
                                <div>
                                    <p className="font-display font-bold">Billing Kemitraan</p>
                                    <p className="text-xs text-slate">Status iuran & pengajuan iklan</p>
                                </div>
                            </Link>
                        </Reveal>
                    </div>
                </div>

                <p className="text-xs text-slate-soft">Hari ini, {formatDate(new Date().toISOString())}.</p>
            </div>
        </>
    );
}

VendorDashboard.layout = (page) => <VendorLayout>{page}</VendorLayout>;