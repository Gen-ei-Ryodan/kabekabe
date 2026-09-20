import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import StatusChip from '@/Components/StatusChip';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Billing({ membership, plans, admin_fee = 0 }) {
    const isActive = membership.status === 'active';
    const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Active checkout payment (only set when member clicks checkout)
    const [activePayment, setActivePayment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Clipboard copy feedback
    const [copiedInvoice, setCopiedInvoice] = useState(false);
    const [copiedAmount, setCopiedAmount] = useState(false);

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);
    const [promoMessage, setPromoMessage] = useState(null);
    const [promoError, setPromoError] = useState(null);

    // Proof upload state
    const [proofFile, setProofFile] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const fileInputRef = useRef(null);

    // Selected plan calculations
    const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
    const planPrice = selectedPlan
        ? (selectedPlan.price_raw ?? parseInt(String(selectedPlan.price).replace(/\D/g, ''), 10))
        : 100000;
    const discountValue = appliedPromo
        ? (appliedPromo.is_free ? planPrice : Math.min(planPrice, Math.round((planPrice * (appliedPromo.discount_value || 0)) / 100)))
        : 0;
    const totalBill = Math.max(0, planPrice - discountValue);

    const applyPromoCode = async () => {
        if (!promoInput.trim()) return;
        setIsCheckingPromo(true);
        setPromoError(null);
        setPromoMessage(null);
        try {
            const res = await fetch(route('member.billing.doku.promo'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    plan_id: selectedPlanId,
                    code: promoInput.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setPromoError(data.message || 'Kode promo tidak valid.');
                setAppliedPromo(null);
            } else {
                setAppliedPromo(data);
                setPromoMessage(`Voucher ${data.code} berhasil diterapkan! Potongan Rp${Number(data.discount_amount).toLocaleString('id-ID')}`);
            }
        } catch (e) {
            setPromoError('Gagal memverifikasi kode promo.');
        } finally {
            setIsCheckingPromo(false);
        }
    };

    const removePromoCode = () => {
        setAppliedPromo(null);
        setPromoInput('');
        setPromoMessage(null);
        setPromoError(null);
    };

    const handleCheckoutManual = async () => {
        if (!selectedPlanId) {
            setErrorMessage('Silakan pilih salah satu paket membership terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(route('member.billing.manual.checkout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    plan_id: selectedPlanId,
                    promo_code: appliedPromo ? appliedPromo.code : null,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || 'Gagal memproses pembuatan tagihan.');
                setIsLoading(false);
                return;
            }

            if (result.is_free) {
                setIsLoading(false);
                alert(result.message || 'Selamat! Keanggotaan Anda telah aktif gratis.');
                router.reload({ only: ['membership', 'pending_payment'] });
                return;
            }

            // Set active pending payment & open QRIS modal
            setActivePayment({
                id: result.payment_id,
                invoice_number: result.invoice_number,
                amount: result.amount,
                plan_name: result.plan_name,
                duration_months: result.duration_months,
                qris_image_url: result.qris_image_url || '/images/qris-kbkb.svg',
                payment_proof_url: null,
                created_at: result.created_at,
            });
            setShowModal(true);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setErrorMessage('Terjadi gangguan jaringan saat menghubungi server.');
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('File harus berupa gambar (JPG, PNG, WEBP).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Ukuran file maksimal 5MB.');
            return;
        }

        setUploadError(null);
        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
    };

    const handleUploadProof = async (e) => {
        e.preventDefault();
        if (!proofFile || !activePayment?.id) {
            setUploadError('Silakan pilih file foto bukti pembayaran terlebih dahulu.');
            return;
        }

        setIsUploadingProof(true);
        setUploadError(null);
        setUploadSuccess(null);

        const formData = new FormData();
        formData.append('proof', proofFile);

        try {
            const response = await fetch(route('member.billing.manual.proof', activePayment.id), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setUploadError(result.message || 'Gagal mengunggah bukti transfer.');
                setIsUploadingProof(false);
                return;
            }

            setUploadSuccess(result.message || 'Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.');
            setActivePayment((prev) => ({
                ...prev,
                payment_proof_url: result.proof_url || result.payment?.payment_proof_url,
                paid_at: 'Baru saja',
            }));
            setProofFile(null);
            setProofPreview(null);
            setIsUploadingProof(false);

            // Sync with backend props
            router.reload({ only: ['pending_payment'] });
        } catch (err) {
            console.error(err);
            setUploadError('Terjadi kesalahan saat mengunggah file bukti transfer.');
            setIsUploadingProof(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!activePayment?.id) return;
        if (!confirm('Apakah Anda yakin ingin membatalkan tagihan pembayaran ini?')) return;

        try {
            const response = await fetch(route('member.billing.manual.cancel', activePayment.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.success) {
                setActivePayment(null);
                setShowModal(false);
                router.reload({ only: ['pending_payment'] });
            } else {
                alert(result.message || 'Gagal membatalkan pembayaran.');
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat membatalkan pembayaran.');
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(String(text));
        if (type === 'invoice') {
            setCopiedInvoice(true);
            setTimeout(() => setCopiedInvoice(false), 2000);
        } else if (type === 'amount') {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
        }
    };

    return (
        <>
            <Head title="Billing & Membership" />

            <div className="mx-auto max-w-3xl">
                <header>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Manajemen Billing & Membership</h1>
                    <p className="mt-1 text-sm text-slate">Kelola paket aktif dan pembayaran keanggotaan KBKB Anda dengan mudah.</p>
                </header>

                <div className="mt-8 space-y-8">
                    {/* Status Paket Saat Ini */}
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-display text-lg font-bold text-ink">Paket Membership Anda</h2>
                                    <p className="text-xs text-slate">Informasi masa berlaku kartu anggota</p>
                                </div>
                                <StatusChip tone={isActive ? 'active' : 'inactive'}>
                                    {membership.status_label}
                                </StatusChip>
                            </div>

                            {membership.plan ? (
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">Nama Paket</p>
                                        <p className="mt-1 font-display text-lg font-bold text-ink">{membership.plan.name}</p>
                                    </div>
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">Durasi</p>
                                        <p className="mt-1 font-display text-lg font-bold text-ink">{membership.plan.duration_months} Bulan ({membership.plan.duration_months * 30} Hari)</p>
                                    </div>
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">Biaya Langganan</p>
                                        <p className="mt-1 font-display text-lg font-bold text-gold-deep">Rp{membership.plan.price}</p>
                                    </div>
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">Berlaku Hingga</p>
                                        <p className="mt-1 font-display text-lg font-bold text-ink">{membership.expires_at ?? '-'}</p>
                                        {isActive && membership.days_remaining !== null && (
                                            <p className="mt-0.5 text-xs font-medium text-emerald-600">
                                                Tersisa {membership.days_remaining} hari lagi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-paper/50 p-6 text-center">
                                    <p className="text-ink font-medium">Anda belum memiliki paket membership aktif.</p>
                                    <p className="mt-1 text-xs text-slate">Pilih paket di bawah untuk mengaktifkan kartu anggota Anda.</p>
                                </div>
                            )}
                        </section>
                    </Reveal>



                    {/* Pembayaran Membership QRIS */}
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h2 className="font-display text-lg font-bold text-ink">Beli / Perpanjang Membership</h2>
                                    <p className="text-xs text-slate">Pembayaran mudah via QRIS (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay).</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse"></span>
                                    QRIS Official KBKB
                                </span>
                            </div>

                            {/* Info Non-Reset Waktu */}
                            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                                <svg className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <span className="font-semibold">Aturan Masa Aktif (30 Hari per Bulan):</span> Jika kartu Anda masih aktif, perpanjangan akan otomatis menambah hari dari tanggal kedaluwarsa sebelumnya. Sisa hari aktif Anda <strong>tidak akan hangus</strong>.
                                </div>
                            </div>

                            {/* Error Alert */}
                            {errorMessage && (
                                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2">
                                    <svg className="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>{errorMessage}</div>
                                </div>
                            )}

                            {/* 1. Pilihan Paket Membership */}
                            <div className="mt-6">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <label className="text-sm font-semibold text-ink">
                                        1. Pilih Durasi Langganan:
                                    </label>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-gold-deep">
                                        🔥 Rekomendasi Komunitas
                                    </span>
                                </div>
                                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                                    {plans.map((plan) => {
                                        const isSelected = selectedPlanId === plan.id;
                                        const promoBadge =
                                            plan.duration_months === 5 ? 'HEMAT 1 BLN' :
                                            plan.duration_months === 10 ? 'HEMAT 2 BLN' :
                                            plan.duration_months === 12 ? 'HEMAT 2 BLN' :
                                            plan.duration_months === 15 ? 'HEMAT 3 BLN' : null;

                                        return (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => setSelectedPlanId(plan.id)}
                                                className={`relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-gold bg-gold/5 ring-2 ring-gold/20 shadow-sm'
                                                        : 'border-ink/15 bg-white hover:border-ink/30 hover:bg-ink/5'
                                                }`}
                                            >
                                                {promoBadge && (
                                                    <span className="absolute -top-2 right-2 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-extrabold text-ink shadow-xs">
                                                        {promoBadge}
                                                    </span>
                                                )}
                                                <div className="flex w-full items-center justify-between gap-1">
                                                    <span className="font-display text-sm font-bold text-ink">{plan.duration_months} Bulan</span>
                                                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-slate">
                                                        {plan.duration_months * 30} Hari
                                                    </span>
                                                </div>
                                                <p className="mt-2.5 font-mono text-base font-bold text-gold-deep">Rp{plan.price}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Input Kode Promo / Voucher */}
                            <div className="mt-6 rounded-xl border border-ink/15 bg-paper/40 p-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-2">
                                    Punya Kode Promo / Voucher Diskon?
                                </label>
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-700">✓ {appliedPromo.code}</span>
                                            <span className="text-xs text-emerald-600 font-medium">({appliedPromo.name})</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removePromoCode}
                                            className="text-xs font-semibold text-rose-600 hover:underline"
                                        >
                                            Hapus Voucher
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                            placeholder="Contoh: KBKBFREE atau KBKB50"
                                            className="block flex-1 rounded-xl border-ink/20 bg-white px-3 py-2 font-mono text-sm uppercase placeholder-slate/50 focus:border-gold focus:ring-1 focus:ring-gold"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyPromoCode}
                                            disabled={isCheckingPromo || !promoInput.trim()}
                                            className="btn-gold shrink-0 text-xs px-4"
                                        >
                                            {isCheckingPromo ? 'Memeriksa…' : 'Gunakan'}
                                        </button>
                                    </div>
                                )}
                                {promoMessage && <p className="mt-1.5 text-xs text-emerald-600 font-medium">{promoMessage}</p>}
                                {promoError && <p className="mt-1.5 text-xs text-rose-600 font-medium">{promoError}</p>}
                            </div>

                            {/* Rincian Biaya Transparan */}
                            <div className="mt-6 rounded-xl border border-ink/10 bg-paper/70 p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate">
                                        <span>Biaya Membership ({selectedPlan?.name || '-'})</span>
                                        <span className="font-medium text-ink">Rp{planPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                    {discountValue > 0 && (
                                        <div className="flex justify-between text-emerald-700 font-medium">
                                            <span>Potongan Voucher ({appliedPromo?.code})</span>
                                            <span>-Rp{discountValue.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-ink/10 flex justify-between font-bold text-ink">
                                        <span>Total Tagihan Pembayaran</span>
                                        <span className="font-mono text-lg text-gold-deep">Rp{totalBill.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-[11px] text-slate italic">
                                    {totalBill === 0
                                        ? 'Voucher 100% aktif! Anda dapat mengaktifkan keanggotaan tanpa biaya transfer.'
                                        : '*Setelah klik Beli, nomor referensi unik dan kode QRIS akan muncul untuk pembayaran.'}
                                </p>
                            </div>

                            {/* Tombol Eksekusi Bayar */}
                            <div className="mt-8 pt-4 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-xs text-slate">
                                    Masa aktif otomatis diperpanjang setelah pembayaran dikonfirmasi oleh admin KBKB.
                                </div>

                                <PrimaryButton
                                    onClick={handleCheckoutManual}
                                    disabled={isLoading}
                                    className="!py-3 !px-6 justify-center text-sm shadow-md shadow-gold/20"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memproses Tagihan...
                                        </span>
                                    ) : totalBill === 0 ? (
                                        <span className="flex items-center gap-2">
                                            <span>🎁</span>
                                            Klaim & Aktivasi Membership Gratis (Rp0)
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="text-base">📱</span>
                                            Beli Sekarang & Bayar via QRIS (Rp{totalBill.toLocaleString('id-ID')})
                                        </span>
                                    )}
                                </PrimaryButton>
                            </div>
                        </section>
                    </Reveal>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODAL QRIS & UPLOAD BUKTI TRANSFER                        */}
            {/* ========================================================= */}
            {showModal && activePayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 my-8">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                            <div>
                                <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-gold-deep mb-1">
                                    Pembayaran QRIS Nasional
                                </span>
                                <h3 className="font-display text-xl font-bold text-ink">
                                    Pembayaran Membership KBKB
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-slate hover:bg-ink/10 hover:text-ink font-bold transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Status Alert */}
                        {activePayment.payment_proof_url ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                                <span className="text-base">✅</span>
                                <div>
                                    <p className="font-bold">Bukti Transfer Berhasil Dikirim</p>
                                    <p className="mt-0.5">
                                        Data Anda sudah tercatat di sistem kami. Admin sedang melakukan verifikasi untuk segera mengaktifkan status membership Anda.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                                <span className="text-base">⏳</span>
                                <span>Permintaan pembayaran Anda telah tercatat di Admin. Silakan selesaikan pembayaran dan unggah bukti transfer.</span>
                            </div>
                        )}

                        {/* Invoice & Total Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-ink/10 bg-paper/70 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">Nomor Referensi</p>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="font-mono text-xs sm:text-sm font-bold text-ink truncate mr-1">
                                        {activePayment.invoice_number}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(activePayment.invoice_number, 'invoice')}
                                        className="text-[10px] font-bold text-gold-deep hover:underline shrink-0"
                                    >
                                        {copiedInvoice ? 'Disalin!' : 'Salin'}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-ink/10 bg-paper/70 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">Total Tagihan</p>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="font-mono text-xs sm:text-sm font-bold text-gold-deep">
                                        Rp{Number(activePayment.amount).toLocaleString('id-ID')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(activePayment.amount, 'amount')}
                                        className="text-[10px] font-bold text-gold-deep hover:underline shrink-0"
                                    >
                                        {copiedAmount ? 'Disalin!' : 'Salin'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QRIS Card Image */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-ink/15 bg-paper/40 p-4">
                            <div className="relative w-full max-w-xs overflow-hidden rounded-xl shadow-md border border-slate-200">
                                <img
                                    src={activePayment.qris_image_url || '/images/qris-kbkb.svg'}
                                    alt="QRIS Pembayaran KBKB"
                                    className="w-full h-auto object-contain block"
                                />
                            </div>
                            <p className="mt-2.5 text-[11px] text-center text-slate font-medium">
                                Scan dengan BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, Dana, ShopeePay
                            </p>
                        </div>

                        {/* Upload Bukti Pembayaran Section */}
                        <div className="rounded-2xl border border-ink/15 bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-display text-sm font-bold text-ink">
                                    {activePayment.payment_proof_url ? 'Bukti Pembayaran Terunggah' : 'Unggah Bukti Pembayaran'}
                                </h4>
                                {activePayment.payment_proof_url && (
                                    <span className="text-[11px] font-semibold text-emerald-600">✓ Terverifikasi terkirim</span>
                                )}
                            </div>

                            {activePayment.payment_proof_url ? (
                                <div className="space-y-3">
                                    <div className="rounded-xl border border-ink/10 overflow-hidden bg-paper/50 p-2">
                                        <img
                                            src={activePayment.payment_proof_url}
                                            alt="Bukti Transfer"
                                            className="max-h-48 w-full object-contain rounded-lg mx-auto"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate text-center">
                                        Perlu mengganti foto bukti pembayaran?
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="ml-1 text-gold-deep font-bold underline"
                                        >
                                            Unggah Ulang
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate">
                                        Setelah berhasil transfer melalui QRIS, foto struk atau tangkapan layar (screenshot) bukti transfer dan unggah di sini:
                                    </p>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-paper/40 p-5 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition"
                                    >
                                        {proofPreview ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={proofPreview}
                                                    alt="Preview Bukti"
                                                    className="max-h-36 rounded-lg object-contain mx-auto shadow-sm"
                                                />
                                                <p className="text-xs font-semibold text-gold-deep">Klik untuk ganti file</p>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-3xl mb-1">📸</span>
                                                <p className="text-xs font-semibold text-ink">Klik untuk memilih foto bukti pembayaran</p>
                                                <p className="text-[10px] text-slate mt-0.5">Format JPG, PNG, WEBP (Maks 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {uploadError && (
                                <p className="text-xs text-red-600 font-medium">{uploadError}</p>
                            )}
                            {uploadSuccess && (
                                <p className="text-xs text-emerald-600 font-medium">{uploadSuccess}</p>
                            )}

                            {proofFile && (
                                <button
                                    type="button"
                                    onClick={handleUploadProof}
                                    disabled={isUploadingProof}
                                    className="w-full btn-gold py-2.5 text-xs font-bold shadow-sm justify-center"
                                >
                                    {isUploadingProof ? 'Mengunggah Bukti…' : 'Kirim Bukti Pembayaran'}
                                </button>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-between pt-2">
                            {!activePayment.payment_proof_url ? (
                                <button
                                    type="button"
                                    onClick={handleCancelPayment}
                                    className="text-xs font-medium text-red-600 hover:underline"
                                >
                                    Batalkan Transaksi
                                </button>
                            ) : <div />}

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-ink text-xs px-5 py-2"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Billing.layout = (page) => <MemberLayout>{page}</MemberLayout>;
