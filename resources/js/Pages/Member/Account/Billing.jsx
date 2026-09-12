import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import StatusChip from '@/Components/StatusChip';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Billing({ membership, plans, admin_fee = 4500 }) {
    const isActive = membership.status === 'active';
    const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || null);
    const [paymentChannel, setPaymentChannel] = useState('all'); // 'all' for DOKU Checkout, or 'bca', 'mandiri', 'bri'
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [activePayment, setActivePayment] = useState(null);
    const [vaDetails, setVaDetails] = useState(null);
    const [copied, setCopied] = useState(false);
    const pollingRef = useRef(null);

    // Selected plan calculations
    const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
    const planPrice = selectedPlan
        ? (selectedPlan.price_raw ?? parseInt(String(selectedPlan.price).replace(/\D/g, ''), 10))
        : 100000;
    const gatewayFee = Number(admin_fee) || 4500;
    const totalBill = planPrice + gatewayFee;

    // Clean up polling interval
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    const startPolling = (paymentId) => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(route('member.billing.doku.status', paymentId));
                if (res.ok) {
                    const data = await res.json();
                    if (data.is_paid) {
                        clearInterval(pollingRef.current);
                        setActivePayment(null);
                        setVaDetails(null);
                        router.reload({ only: ['membership'] });
                    }
                }
            } catch (err) {
                console.error('Error polling status:', err);
            }
        }, 3000);
    };

    const handlePayOnline = async () => {
        if (!selectedPlanId) {
            setErrorMessage('Silakan pilih salah satu paket membership terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(route('member.billing.doku.checkout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    plan_id: selectedPlanId,
                    channel: paymentChannel,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || 'Gagal memproses pembayaran DOKU.');
                setIsLoading(false);
                return;
            }

            setActivePayment({
                id: result.payment_id,
                invoice_number: result.invoice_number,
                amount: result.amount,
            });

            // Start polling for payment completion
            startPolling(result.payment_id);

            if (result.type === 'va') {
                // Direct Virtual Account details
                setVaDetails(result);
                setIsLoading(false);
            } else if (result.type === 'checkout') {
                // DOKU Checkout Popup (or redirect fallback)
                if (typeof window.loadJokulCheckout === 'function') {
                    window.loadJokulCheckout(result.payment_url);
                } else {
                    // Fallback to direct URL if SDK not loaded
                    window.open(result.payment_url, '_blank');
                }
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Terjadi gangguan jaringan saat menghubungi gateway pembayaran.');
            setIsLoading(false);
        }
    };

    const handleCopyVa = () => {
        if (vaDetails?.va_number) {
            navigator.clipboard.writeText(vaDetails.va_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <Head title="Billing & Membership" />

            <div className="mx-auto max-w-3xl">
                <header>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Manajemen Billing & Membership</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola paket aktif dan perpanjangan langganan member Anda secara online.</p>
                </header>

                <div className="mt-8 space-y-8">
                    {/* Status Paket Saat Ini */}
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-display text-lg font-bold">Paket Membership Anda</h2>
                                    <p className="text-xs text-slate-500">Informasi masa berlaku kartu anggota</p>
                                </div>
                                <StatusChip tone={isActive ? 'active' : 'inactive'}>
                                    {membership.status_label}
                                </StatusChip>
                            </div>

                            {membership.plan ? (
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Nama Paket</p>
                                        <p className="mt-1 font-display text-lg font-bold text-slate-900">{membership.plan.name}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Durasi</p>
                                        <p className="mt-1 font-display text-lg font-bold text-slate-900">{membership.plan.duration_months} Bulan ({membership.plan.duration_months * 30} Hari)</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Biaya Langganan</p>
                                        <p className="mt-1 font-display text-lg font-bold text-gold">Rp{membership.plan.price}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Berlaku Hingga</p>
                                        <p className="mt-1 font-display text-lg font-bold text-slate-900">{membership.expires_at ?? '-'}</p>
                                        {isActive && membership.days_remaining !== null && (
                                            <p className="mt-0.5 text-xs font-medium text-emerald-600">
                                                Tersisa {membership.days_remaining} hari lagi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                    <p className="text-slate-600 font-medium">Anda belum memiliki paket membership aktif.</p>
                                    <p className="mt-1 text-xs text-slate-400">Pilih paket di bawah untuk mengaktifkan kartu anggota Anda.</p>
                                </div>
                            )}
                        </section>
                    </Reveal>

                    {/* Pembayaran Online DOKU */}
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h2 className="font-display text-lg font-bold">Perpanjang / Beli Membership Online</h2>
                                    <p className="text-xs text-slate-500">Pembayaran instan terverifikasi otomatis via DOKU Payment Gateway.</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Instant Verification
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

                            {/* Modal Info Direct Virtual Account */}
                            {vaDetails && (
                                <div className="mt-6 rounded-2xl border-2 border-gold/30 bg-gradient-to-b from-amber-50/60 to-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between pb-4 border-b border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-white font-bold text-xs">
                                                VA
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Virtual Account {vaDetails.bank}</h3>
                                                <p className="text-xs text-slate-500">No. Invoice: {vaDetails.invoice_number}</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                            Menunggu Pembayaran
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        <div>
                                            <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">Nomor Virtual Account</p>
                                            <div className="mt-1 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                                                <span className="font-mono text-xl font-bold tracking-wider">{vaDetails.va_number}</span>
                                                <button
                                                    onClick={handleCopyVa}
                                                    type="button"
                                                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 active:scale-95"
                                                >
                                                    {copied ? 'Tersalin!' : 'Salin Nomor'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-lg bg-slate-50 p-3">
                                                <p className="text-xs text-slate-500">Total Tagihan</p>
                                                <p className="mt-0.5 font-display font-bold text-gold">Rp{Number(vaDetails.amount).toLocaleString('id-ID')}</p>
                                            </div>
                                            <div className="rounded-lg bg-slate-50 p-3">
                                                <p className="text-xs text-slate-500">Batas Waktu</p>
                                                <p className="mt-0.5 font-medium text-slate-700">60 Menit</p>
                                            </div>
                                        </div>

                                        {vaDetails.how_to_pay_page && (
                                            <p className="text-xs text-slate-500">
                                                Panduan pembayaran lengkap:{' '}
                                                <a href={vaDetails.how_to_pay_page} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold underline">
                                                    Lihat Cara Bayar
                                                </a>
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                                            <svg className="h-4 w-4 animate-spin text-gold" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sistem otomatis mendeteksi ketika pembayaran Anda berhasil.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1. Pilihan Paket Membership */}
                            <div className="mt-6">
                                <label className="mb-3 block text-sm font-semibold text-slate-800">
                                    1. Pilih Durasi Langganan:
                                </label>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {plans.map((plan) => {
                                        const isSelected = selectedPlanId === plan.id;
                                        return (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => setSelectedPlanId(plan.id)}
                                                className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-gold bg-gold/5 ring-2 ring-gold/20'
                                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                }`}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="font-display font-bold text-slate-900">{plan.name}</span>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                                        {plan.duration_months * 30} Hari
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">Durasi {plan.duration_months} Bulan</p>
                                                <p className="mt-3 font-mono text-lg font-bold text-gold">Rp{plan.price}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Pilihan Metode Bayar */}
                            <div className="mt-6">
                                <label className="mb-3 block text-sm font-semibold text-slate-800">
                                    2. Pilih Metode Pembayaran:
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {[
                                        { id: 'all', label: 'DOKU All-in-One', sub: 'QRIS, E-Wallet, VA' },
                                        { id: 'bca', label: 'BCA VA', sub: 'Virtual Account' },
                                        { id: 'mandiri', label: 'Mandiri VA', sub: 'Virtual Account' },
                                        { id: 'bri', label: 'BRI VA', sub: 'Virtual Account' },
                                    ].map((method) => {
                                        const isSelected = paymentChannel === method.id;
                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setPaymentChannel(method.id)}
                                                className={`rounded-xl border p-3 text-center transition ${
                                                    isSelected
                                                        ? 'border-gold bg-gold/5 font-semibold text-gold ring-1 ring-gold'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                }`}
                                            >
                                                <p className="text-sm font-bold">{method.label}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{method.sub}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rincian Biaya Transparan (Pass-Through Fee) */}
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Biaya Membership ({selectedPlan?.name || '-'})</span>
                                        <span className="font-medium text-slate-900">Rp{planPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Biaya Layanan Gateway</span>
                                        <span className="font-medium text-slate-900">Rp{gatewayFee.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                                        <span>Total Tagihan</span>
                                        <span className="font-mono text-lg text-gold">Rp{totalBill.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-[11px] text-slate-400 italic">
                                    *Biaya layanan gateway dibebankan ke pembeli untuk memproses transaksi secara instan & otomatis.
                                </p>
                            </div>

                            {/* Tombol Eksekusi Bayar */}
                            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-xs text-slate-500">
                                    Masa aktif bertambah sesuai aturan blok 30 hari langsung setelah transaksi sukses.
                                </div>

                                <PrimaryButton
                                    onClick={handlePayOnline}
                                    disabled={isLoading}
                                    className="!py-3 !px-6 justify-center text-sm shadow-md shadow-gold/20"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menghubungkan ke DOKU...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Bayar Rp{totalBill.toLocaleString('id-ID')} via DOKU
                                        </span>
                                    )}
                                </PrimaryButton>
                            </div>
                        </section>
                    </Reveal>
                </div>
            </div>
        </>
    );
}

Billing.layout = (page) => <MemberLayout>{page}</MemberLayout>;
