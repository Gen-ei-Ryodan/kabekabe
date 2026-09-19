import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import Reveal from '@/Components/Reveal';
import StatusChip from '@/Components/StatusChip';
import { formatRupiah } from '@/Utils/format';

export default function BillingIndex({ partner, ads = [], promos = [], history = [] }) {
    const [isApplyingAd, setIsApplyingAd] = useState(false);

    const confirmPayment = (adId) => {
        if (confirm('Konfirmasi bahwa Anda telah membayar biaya iklan ini? Admin akan diberitahu untuk segera mengatur penayangan iklan.')) {
            router.post(route('vendor.billing.ads.pay', adId), {}, { preserveScroll: true });
        }
    };

    const form = useForm({
        type: 'popup',
        promo_title: '',
        promo_id: '',
        start_date: new Date().toISOString().split('T')[0],
        image: null,
        notes: '',
    });

    // Hitung tanggal berakhir estimasi berdasarkan tipe
    const getEstimatedEndDate = () => {
        if (!form.data.start_date) return '-';
        const start = new Date(form.data.start_date);
        if (isNaN(start.getTime())) return '-';
        const days = form.data.type === 'popup' ? 3 : 5;
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        return end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const submitAd = (e) => {
        e.preventDefault();
        form.post(route('vendor.billing.ads.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsApplyingAd(false);
                form.reset();
            },
        });
    };

    return (
        <>
            <Head title="Billing & Iklan Partner" />

            <div className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            Billing & Pengajuan Iklan Partner
                        </h1>
                        <p className="mt-1 text-sm text-slate">
                            Kelola status kemitraan merchant dan ajukan slot promosi iklan eksklusif untuk member komunitas.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsApplyingAd(true)}
                        className="btn-gold shrink-0"
                    >
                        + Ajukan Iklan Promosi
                    </button>
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
                                    ? 'Partner aktif dapat menerima transaksi benefit & mengajukan promo/iklan.'
                                    : 'Partner tidak aktif tidak dapat menerima transaksi atau mengajukan promo.'}
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.05}>
                        <div className="card-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate">Masa Berlaku Hingga</p>
                            <p className="mt-2 font-display text-2xl font-bold text-ink">
                                {partner.expires_at || 'Masa Aktif Aktif'}
                            </p>
                            <p className="mt-2 text-xs text-slate-soft">
                                Status kemitraan diverifikasi langsung oleh pengelola KBKB.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="card-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate">Sisa Waktu Aktif</p>
                            <p className="mt-2 font-display text-2xl font-bold text-gold-deep">
                                {partner.days_remaining !== null ? `${partner.days_remaining} Hari` : 'Aktif'}
                            </p>
                            <p className="mt-2 text-xs text-slate-soft">
                                Hubungi admin jika membutuhkan penyesuaian kemitraan.
                            </p>
                        </div>
                    </Reveal>
                </div>

                {/* Info Slot Iklan Banner & Popup */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="card-surface relative overflow-hidden p-6 border-l-4 border-gold">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-gold-deep">Slot Unggulan</span>
                            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold-deep">Durasi 3 Hari</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-bold text-ink">Pop-up Pembuka Aplikasi</h3>
                        <p className="mt-2 text-sm text-slate leading-relaxed">
                            Iklan Anda akan otomatis muncul sebagai Pop-up utama saat member pertama kali membuka aplikasi KBKB. Sangat efektif untuk launching produk, event spesial, atau promo diskon terbatas.
                        </p>
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-ink/5">
                            <span className="text-xs text-slate font-medium">Prioritas tayang Slot #1 Beranda</span>
                            <button
                                type="button"
                                onClick={() => {
                                    form.setData('type', 'popup');
                                    setIsApplyingAd(true);
                                }}
                                className="text-xs font-bold text-gold-deep hover:underline"
                            >
                                Ajukan Pop-up →
                            </button>
                        </div>
                    </div>

                    <div className="card-surface relative overflow-hidden p-6 border-l-4 border-sage">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-sage-deep">Slot Carousel</span>
                            <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-bold text-sage-deep">Durasi 5 Hari</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-bold text-ink">Banner Slider Beranda</h3>
                        <p className="mt-2 text-sm text-slate leading-relaxed">
                            Tampil langsung di slider banner beranda member. Dilihat terus-menerus oleh seluruh member yang berselancar mencari merchant dan benefit komunitas.
                        </p>
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-ink/5">
                            <span className="text-xs text-slate font-medium">Tayang aktif selama 5 hari penuh</span>
                            <button
                                type="button"
                                onClick={() => {
                                    form.setData('type', 'banner');
                                    setIsApplyingAd(true);
                                }}
                                className="text-xs font-bold text-sage-deep hover:underline"
                            >
                                Ajukan Banner →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Form Pengajuan Iklan */}
                {isApplyingAd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
                        <div className="card-surface max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 sm:p-8 shadow-2xl rounded-2xl">
                            <div className="flex items-center justify-between pb-4 border-b border-ink/10">
                                <div>
                                    <p className="eyebrow">Form Pengajuan</p>
                                    <h3 className="font-display text-xl font-bold text-ink">Ajukan Slot Iklan Partner</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsApplyingAd(false)}
                                    className="rounded-lg p-2 text-slate hover:bg-ink/5"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={submitAd} className="mt-6 space-y-5">
                                <div>
                                    <label className="label">Pilih Jenis Slot Iklan</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => form.setData('type', 'popup')}
                                            className={`rounded-xl border p-3 text-left transition-all ${
                                                form.data.type === 'popup'
                                                    ? 'border-gold bg-gold/10 font-bold text-ink ring-2 ring-gold/30'
                                                    : 'border-ink/10 hover:border-ink/30'
                                            }`}
                                        >
                                            <p className="text-sm">Pop-up Pembuka</p>
                                            <p className="mt-0.5 text-xs font-normal text-slate">Durasi: 3 Hari</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => form.setData('type', 'banner')}
                                            className={`rounded-xl border p-3 text-left transition-all ${
                                                form.data.type === 'banner'
                                                    ? 'border-gold bg-gold/10 font-bold text-ink ring-2 ring-gold/30'
                                                    : 'border-ink/10 hover:border-ink/30'
                                            }`}
                                        >
                                            <p className="text-sm">Banner Beranda</p>
                                            <p className="mt-0.5 text-xs font-normal text-slate">Durasi: 5 Hari</p>
                                        </button>
                                    </div>
                                    {form.errors.type && <p className="mt-1 text-xs text-ember">{form.errors.type}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="promo_title">Judul Promo / Iklan</label>
                                    <input
                                        id="promo_title"
                                        type="text"
                                        className="input"
                                        placeholder="Contoh: Diskon Spesial Ulang Tahun Outlet"
                                        value={form.data.promo_title}
                                        onChange={(e) => form.setData('promo_title', e.target.value)}
                                        required
                                    />
                                    {form.errors.promo_title && <p className="mt-1 text-xs text-ember">{form.errors.promo_title}</p>}
                                </div>

                                {promos.length > 0 && (
                                    <div>
                                        <label className="label" htmlFor="promo_id">Hubungkan dengan Promo Terdaftar (Opsional)</label>
                                        <select
                                            id="promo_id"
                                            className="input"
                                            value={form.data.promo_id}
                                            onChange={(e) => form.setData('promo_id', e.target.value)}
                                        >
                                            <option value="">-- Tanpa tautan promo khusus --</option>
                                            {promos.map((p) => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-slate">Jika dipilih, banner/popup akan mengarahkan member langsung ke detail promo ini.</p>
                                        {form.errors.promo_id && <p className="mt-1 text-xs text-ember">{form.errors.promo_id}</p>}
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="label" htmlFor="start_date">Tanggal Mulai Tayang</label>
                                        <input
                                            id="start_date"
                                            type="date"
                                            className="input"
                                            value={form.data.start_date}
                                            onChange={(e) => form.setData('start_date', e.target.value)}
                                            required
                                        />
                                        {form.errors.start_date && <p className="mt-1 text-xs text-ember">{form.errors.start_date}</p>}
                                    </div>
                                    <div>
                                        <label className="label">Estimasi Berakhir</label>
                                        <div className="input flex items-center bg-ink/5 font-medium text-slate">
                                            {getEstimatedEndDate()} ({form.data.type === 'popup' ? '3 Hari' : '5 Hari'})
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="label" htmlFor="image">Upload Gambar Banner / Pop-up</label>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="input file:mr-4 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink hover:file:bg-gold-light"
                                        onChange={(e) => form.setData('image', e.target.files[0])}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-slate">Format: JPG, PNG, atau WebP. Maksimal 2MB. Resolusi disarankan rasio 16:9 atau 4:3.</p>
                                    {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="notes">Catatan / Permintaan Tambahan (Opsional)</label>
                                    <textarea
                                        id="notes"
                                        rows={2}
                                        className="input"
                                        placeholder="Tuliskan catatan untuk admin jika ada..."
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                    />
                                    {form.errors.notes && <p className="mt-1 text-xs text-ember">{form.errors.notes}</p>}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-ink/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsApplyingAd(false)}
                                        className="btn-ghost"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-gold"
                                        disabled={form.processing}
                                    >
                                        {form.processing ? 'Mengirim…' : 'Kirim Pengajuan Iklan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Riwayat Pengajuan Iklan */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-ink">Riwayat Pengajuan Iklan Partner</h2>
                    <div className="card-surface overflow-hidden">
                        {ads && ads.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-ink/10 bg-ink/5 text-xs uppercase text-slate">
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">Banner</th>
                                        <th className="px-5 py-3.5 font-semibold">Jenis Iklan</th>
                                        <th className="px-5 py-3.5 font-semibold">Judul Promo</th>
                                        <th className="px-5 py-3.5 font-semibold">Periode Tayang</th>
                                        <th className="px-5 py-3.5 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 font-semibold">Aksi Pembayaran</th>
                                        <th className="px-5 py-3.5 font-semibold">Catatan Admin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink/10">
                                    {ads.map((ad) => (
                                        <tr key={ad.id} className="hover:bg-ink/5">
                                            <td className="px-5 py-4">
                                                {ad.image_url ? (
                                                    <img
                                                        src={ad.image_url}
                                                        alt={ad.promo_title}
                                                        className="h-12 w-20 rounded-lg object-cover border border-ink/10"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-20 rounded-lg bg-ink/10 flex items-center justify-center text-xs text-slate">
                                                        Tanpa Foto
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-ink">
                                                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
                                                    ad.type === 'popup' ? 'bg-gold/15 text-gold-deep' : 'bg-sage/15 text-sage-deep'
                                                }`}>
                                                    {ad.type_label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-ink">{ad.promo_title}</td>
                                            <td className="px-5 py-4 text-xs font-mono">
                                                {ad.start_date} — {ad.end_date}
                                            </td>
                                            <td className="px-5 py-4">
                                                {ad.status === 'paid' && (
                                                    <span className="rounded-md bg-gold-deep/15 text-gold-deep px-2 py-0.5 text-xs font-bold">
                                                        Sudah Dibayar
                                                    </span>
                                                )}
                                                {ad.status === 'active' && (
                                                    <span className="rounded-md bg-sage/15 text-sage-deep px-2 py-0.5 text-xs font-bold">
                                                        Tayang Aktif
                                                    </span>
                                                )}
                                                {ad.status !== 'paid' && ad.status !== 'active' && (
                                                    <StatusChip
                                                        status={ad.status}
                                                        label={ad.status === 'pending' ? 'Menunggu Review' : ad.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {(ad.status === 'pending' || ad.status === 'approved') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmPayment(ad.id)}
                                                        className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-ink hover:bg-gold/90 transition shadow-xs whitespace-nowrap"
                                                    >
                                                        Konfirmasi Bayar
                                                    </button>
                                                )}
                                                {ad.status === 'paid' && (
                                                    <span className="text-xs font-medium text-slate">
                                                        Menunggu Setting Admin
                                                    </span>
                                                )}
                                                {ad.status === 'active' && (
                                                    <span className="text-xs font-semibold text-sage">
                                                        ✓ Sedang Tayang
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate">
                                                {ad.admin_feedback ? (
                                                    <span className="text-ember font-medium">{ad.admin_feedback}</span>
                                                ) : (
                                                    ad.notes || '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-sm text-slate">
                                <p className="font-semibold text-ink">Belum Ada Pengajuan Iklan</p>
                                <p className="mt-1 text-xs">Ajukan iklan Pop-up atau Banner untuk meningkatkan visibilitas penawaran Anda kepada seluruh member.</p>
                                <button
                                    type="button"
                                    onClick={() => setIsApplyingAd(true)}
                                    className="btn-gold mt-4 text-xs"
                                >
                                    + Ajukan Iklan Sekarang
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Riwayat Pembayaran (jika ada) */}
                {history && history.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-ink">Riwayat Pembayaran & Kemitraan</h2>
                        <div className="card-surface overflow-hidden">
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
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

BillingIndex.layout = (page) => <VendorLayout>{page}</VendorLayout>;
