import { Head } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import Reveal from '@/Components/Reveal';
import { formatRupiah } from '@/Utils/format';

export default function BillingIndex({ partner, plans, history }) {
    return (
        <>
            <Head title="Billing Partner" />

            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                        Billing & Masa Berlaku Partner
                    </h1>
                    <p className="mt-1 text-sm text-slate">
                        Kelola status kemitraan, masa aktif merchant, dan riwayat tagihan akun partner Anda.
                    </p>
                </div>

                {/* Status Card */}
                <div className="grid gap-5 sm:grid-cols-3">
                    <Reveal>
                        <div className="card-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate">Status Kemitraan</p>
                            <div className="mt-3 flex items-center gap-2.5">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                        partner.is_active
                                            ? 'bg-sage/15 text-sage border border-sage/30'
                                            : 'bg-ember/15 text-ember border border-ember/30'
                                    }`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${partner.is_active ? 'bg-sage' : 'bg-ember'}`} />
                                    {partner.status_label}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-soft">
                                {partner.is_active
                                    ? 'Partner aktif dapat menerima transaksi & membuat promo.'
                                    : 'Partner tidak aktif tidak dapat menerima transaksi atau promo.'}
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.05}>
                        <div className="card-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate">Masa Berlaku Hingga</p>
                            <p className="mt-2 font-display text-2xl font-bold text-ink">
                                {partner.expires_at || 'Belum Diatur'}
                            </p>
                            <p className="mt-2 text-xs text-slate-soft">
                                Dihitung per 30 hari sesuai ketentuan masa berlaku.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="card-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate">Sisa Waktu Aktif</p>
                            <p className="mt-2 font-display text-2xl font-bold text-gold-deep">
                                {partner.days_remaining !== null ? `${partner.days_remaining} Hari` : '—'}
                            </p>
                            <p className="mt-2 text-xs text-slate-soft">
                                Tanpa masa tenggang (grace period).
                            </p>
                        </div>
                    </Reveal>
                </div>

                {/* Info Bundling & Ketentuan */}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 text-sm">
                    <h3 className="font-display text-base font-bold text-ink">Ketentuan & Promo Partner Club:</h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate leading-relaxed">
                        <li>Biaya kemitraan Partner adalah <strong>Rp100.000 per 30 hari</strong> (tersedia opsi 1–12 bulan).</li>
                        <li>Biaya payment gateway dibebankan kepada pembeli. Sistem menerima bersih Rp100.000 per 30 hari.</li>
                        <li><strong>Bundling Member:</strong> Member yang berlangganan membership 1 tahun mendapatkan Partner gratis 1 tahun, dan member berlangganan 3 bulan mendapatkan Partner gratis 3 bulan (tercatat sebagai <strong>FREE</strong>).</li>
                        <li>Jika status Partner Tidak Aktif atau expired, nama toko/partner otomatis tidak muncul di daftar partner komunitas.</li>
                    </ul>
                </div>

                {/* Paket Pilihan Perpanjangan */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-ink">Pilihan Periode Perpanjangan</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {plans.map((p) => (
                            <div key={p.months} className="card-surface flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
                                <div>
                                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-deep">
                                        Durasi {p.days} Hari
                                    </span>
                                    <h4 className="mt-1 font-display text-lg font-bold text-ink">{p.name}</h4>
                                    <p className="mt-2 font-display text-2xl font-bold text-ink">{p.formatted_price}</p>
                                    <p className="mt-1 text-[11px] text-slate-soft">Rp100.000 / 30 hari</p>
                                </div>
                                <a
                                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin KBKB, saya ingin memperpanjang kemitraan Partner ${partner.name} untuk paket ${p.name} (${p.formatted_price}).`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-gold mt-4 text-center text-xs py-2"
                                >
                                    Pilih & Konfirmasi
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Riwayat Pembayaran */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-ink">Riwayat Tagihan & Pembayaran</h2>
                    <div className="card-surface overflow-hidden">
                        {history && history.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-ink/10 bg-ink/5 text-xs uppercase text-slate">
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">No. Invoice</th>
                                        <th className="px-5 py-3.5 font-semibold">Periode</th>
                                        <th className="px-5 py-3.5 font-semibold">Nominal</th>
                                        <th className="px-5 py-3.5 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                                        <th className="px-5 py-3.5 font-semibold">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink/10">
                                    {history.map((row) => (
                                        <tr key={row.id} className="hover:bg-ink/5">
                                            <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">{row.invoice_number}</td>
                                            <td className="px-5 py-4 text-xs">{row.period_months ? `${row.period_months * 30} Hari (${row.period_months} Bln)` : '-'}</td>
                                            <td className="px-5 py-4 font-display font-bold text-ink">
                                                {row.amount == 0 ? <span className="text-sage font-mono">FREE</span> : formatRupiah(row.amount)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                    row.status === 'approved' ? 'bg-sage/15 text-sage' : 'bg-gold/15 text-gold-deep'
                                                }`}>
                                                    {row.status === 'approved' ? 'DISETUJUI' : row.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate">{row.paid_at || '-'}</td>
                                            <td className="px-5 py-4 text-xs text-slate">{row.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-sm text-slate">
                                Belum ada riwayat pembayaran tercatat.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

BillingIndex.layout = (page) => <VendorLayout>{page}</VendorLayout>;
