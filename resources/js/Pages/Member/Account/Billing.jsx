import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import StatusChip from '@/Components/StatusChip';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/i18n';

export default function Billing({ membership, plans, admin_fee = 0, active_bill = null, active_package = null }) {
    const isActive = membership.status === 'active';
    const { t } = useTranslation();
    const [selectedPlanId, setSelectedPlanId] = useState(active_bill?.plan_id || plans[0]?.id || null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Active checkout payment (single order persistence)
    const [activePayment, setActivePayment] = useState(active_bill);
    const [showModal, setShowModal] = useState(false);

    // Sync activePayment if active_bill prop changes
    useEffect(() => {
        setActivePayment(active_bill);
    }, [active_bill]);

    // 24-hour expiration countdown timer for unpaid active payment
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!active_bill?.expires_at_timestamp) return null;
        const nowSec = Math.floor(Date.now() / 1000);
        return Math.max(0, active_bill.expires_at_timestamp - nowSec);
    });

    useEffect(() => {
        if (!activePayment?.expires_at_timestamp || activePayment.stage !== 'unpaid') {
            setTimeLeft(null);
            return;
        }

        const update = () => {
            const nowSec = Math.floor(Date.now() / 1000);
            const rem = Math.max(0, activePayment.expires_at_timestamp - nowSec);
            setTimeLeft(rem);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [activePayment?.expires_at_timestamp, activePayment?.stage]);

    const formatCountdown = (seconds) => {
        if (seconds === null || seconds === undefined) return '';
        if (seconds <= 0) return t('billing.expired');
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return t('billing.countdown', {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0'),
        });
    };

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
                setPromoError(data.message || t('billing.promoInvalid'));
                setAppliedPromo(null);
            } else {
                setAppliedPromo(data);
                setPromoMessage(t('billing.promoApplied', {
                    code: data.code,
                    amount: Number(data.discount_amount).toLocaleString('id-ID'),
                }));
            }
        } catch (e) {
            setPromoError(t('billing.promoVerifyFailed'));
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
            setErrorMessage(t('billing.selectPlanFirst'));
            return;
        }

        // Jika tagihan aktif paket ini sudah ada dan belum dibayar, langsung buka modal transfer
        if (activePayment && activePayment.stage === 'unpaid' && activePayment.plan_id === selectedPlanId) {
            setShowModal(true);
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
                setErrorMessage(result.message || t('billing.createBillFailed'));
                setIsLoading(false);
                return;
            }

            if (result.is_free) {
                setIsLoading(false);
                alert(result.message || t('billing.freeSuccess'));
                router.reload({ only: ['membership', 'active_bill'] });
                return;
            }

            // Set active pending payment & open transfer modal
            setActivePayment({
                id: result.payment_id,
                invoice_number: result.invoice_number,
                amount: result.amount,
                plan_id: result.plan_id || selectedPlanId,
                plan_name: result.plan_name,
                duration_months: result.duration_months,
                stage: result.stage || 'unpaid',
                stage_label: result.stage_label || t('billing.stepUnpaid'),
                payment_proof_url: null,
                created_at: result.created_at,
                expires_at_timestamp: result.expires_at_timestamp,
                remaining_seconds: result.remaining_seconds,
            });
            setShowModal(true);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setErrorMessage(t('billing.networkError'));
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError(t('billing.fileMustImage'));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError(t('billing.fileMaxSize'));
            return;
        }

        setUploadError(null);
        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
    };

    const handleUploadProof = async (e) => {
        e.preventDefault();
        if (!proofFile || !activePayment?.id) {
            setUploadError(t('billing.chooseProofFirst'));
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
                setUploadError(result.message || t('billing.proofUploadFailed'));
                setIsUploadingProof(false);
                return;
            }

            setUploadSuccess(result.message || t('billing.proofUploadSuccess'));
            setActivePayment((prev) => ({
                ...prev,
                stage: 'paid',
                stage_label: t('billing.badgePaid'),
                payment_proof_url: result.proof_url || result.payment?.payment_proof_url,
                paid_at: result.payment?.paid_at || t('billing.justNow'),
            }));
            setProofFile(null);
            setProofPreview(null);
            setIsUploadingProof(false);

            // Sync with backend props
            router.reload({ only: ['active_bill', 'membership'] });
        } catch (err) {
            console.error(err);
            setUploadError(t('billing.proofUploadError'));
            setIsUploadingProof(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!activePayment?.id) return;
        if (!confirm(t('billing.cancelConfirm'))) return;

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
                router.reload({ only: ['active_bill', 'membership'] });
            } else {
                alert(result.message || t('billing.cancelFailed'));
            }
        } catch (err) {
            console.error(err);
            alert(t('billing.cancelError'));
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
            <Head title={t('billing.headTitle')} />

            <div className="mx-auto max-w-3xl">
                <header>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{t('billing.title')}</h1>
                    <p className="mt-1 text-sm text-slate">{t('billing.subtitle')}</p>
                </header>

                <div className="mt-8 space-y-8">
                    {/* Status Paket Saat Ini */}
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-display text-lg font-bold text-ink">{t('billing.planTitle')}</h2>
                                    <p className="text-xs text-slate">{t('billing.planSubtitle')}</p>
                                </div>
                                <StatusChip tone={isActive ? 'active' : 'inactive'}>
                                    {membership.status_label}
                                </StatusChip>
                            </div>

                            {active_package && (
                                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-sage/30 bg-sage/10 p-4">
                                    <div className="min-w-0">
                                        <p className="eyebrow">{t('billing.activeBadge')}</p>
                                        <h3 className="mt-1 truncate font-display text-lg font-bold text-ink">
                                            {active_package.plan_name || t('billing.noPlanTitle')}
                                        </h3>
                                        {active_package.expires_at && (
                                            <p className="mt-0.5 text-xs text-slate">
                                                {t('billing.activeUntil', { date: active_package.expires_at })}
                                            </p>
                                        )}
                                    </div>
                                    {active_package.days_remaining !== null && active_package.days_remaining !== undefined && (
                                        <div className="shrink-0 rounded-xl bg-white/80 px-3 py-2 text-center">
                                            <span className="font-display text-xl font-bold text-ink">
                                                {active_package.days_remaining}
                                            </span>
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-slate">
                                                {t('billing.daysRemaining')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {membership.plan ? (
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">{t('billing.fieldPlanName')}</p>
                                        <p className="mt-1 font-display text-lg font-bold text-ink">{membership.plan.name}</p>
                                    </div>
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">{t('billing.fieldDuration')}</p>
                                        <p className="mt-1 font-display text-lg font-bold text-ink">
                                            {t('billing.durationValue', {
                                                m: membership.plan.duration_months,
                                                d: membership.plan.duration_months * 30,
                                            })}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">{t('billing.fieldSubscriptionFee')}</p>
                                        <p className="mt-1 font-display text-lg font-bold text-gold-deep">Rp{membership.plan.price}</p>
                                    </div>
                                    <div className="rounded-xl border border-ink/10 bg-paper/60 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate">{t('billing.fieldValidUntil')}</p>
                                        <p className="mt-1 font-display text-lg font-bold text-ink">{membership.expires_at ?? '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-paper/50 p-6 text-center">
                                    <p className="text-ink font-medium">{t('billing.noPlanTitle')}</p>
                                    <p className="mt-1 text-xs text-slate">{t('billing.noPlanDesc')}</p>
                                </div>
                            )}
                        </section>
                    </Reveal>

                    {/* ========================================================= */}
                    {/* STATUS TAGIHAN AKTIF ("ADA TAGIHAN" - 3 TAHAPAN & 24 JAM) */}
                    {/* ========================================================= */}
                    {activePayment && (
                        <Reveal>
                            <section className={`card-surface p-6 sm:p-8 border-2 transition-all ${
                                activePayment.stage === 'processed'
                                    ? 'border-emerald-500/40 bg-gradient-to-br from-white via-white to-emerald-50/30'
                                    : activePayment.stage === 'paid'
                                    ? 'border-sky-500/40 bg-gradient-to-br from-white via-white to-sky-50/30'
                                    : 'border-gold/60 bg-gradient-to-br from-white via-white to-amber-50/40 shadow-sm'
                            }`}>
                                {/* Header Tagihan */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink/10 pb-5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${
                                                activePayment.stage === 'processed'
                                                    ? 'bg-emerald-500'
                                                    : activePayment.stage === 'paid'
                                                    ? 'bg-sky-500'
                                                    : 'bg-gold animate-ping'
                                            }`} />
                                            <span className="text-xs font-bold uppercase tracking-wider text-gold-deep">
                                                {t('billing.yourBill')}
                                            </span>
                                        </div>
                                        <h2 className="mt-1 font-display text-xl font-bold text-ink">
                                            {activePayment.plan_name}
                                        </h2>
                                        <p className="text-xs text-slate">
                                            {t('billing.referenceLabel')}: <span className="font-mono font-bold text-ink">{activePayment.invoice_number}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {activePayment.stage === 'unpaid' && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                {t('billing.badgeUnpaid')}
                                            </span>
                                        )}
                                        {activePayment.stage === 'paid' && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold text-sky-800 border border-sky-300">
                                                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                                                {t('billing.badgePaid')}
                                            </span>
                                        )}
                                        {activePayment.stage === 'processed' && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                {t('billing.badgeProcessed')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Stepper 3 Tahapan */}
                                <div className="mt-6 px-2 sm:px-6">
                                    <div className="relative">
                                        <div className="absolute top-4 left-0 right-0 h-1 bg-ink/10 -z-0" />
                                        <div
                                            className="absolute top-4 left-0 h-1 bg-gold transition-all duration-500 -z-0"
                                            style={{
                                                width:
                                                    activePayment.stage === 'processed'
                                                        ? '100%'
                                                        : activePayment.stage === 'paid'
                                                        ? '50%'
                                                        : '10%',
                                            }}
                                        />
                                        <div className="relative z-10 flex justify-between">
                                            {/* Tahap 1: Belum Dibayar */}
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                                                    activePayment.stage === 'unpaid'
                                                        ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                                                        : 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                                }`}>
                                                    {activePayment.stage === 'unpaid' ? '1' : '✓'}
                                                </div>
                                                <span className={`mt-2 text-xs font-bold ${activePayment.stage === 'unpaid' ? 'text-amber-800' : 'text-emerald-700'}`}>
                                                    {t('billing.stepUnpaid')}
                                                </span>
                                                <span className="text-[10px] text-slate hidden sm:block">{t('billing.stepUnpaidHint')}</span>
                                            </div>

                                            {/* Tahap 2: Sudah Dibayar */}
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                                                    activePayment.stage === 'paid'
                                                        ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                                                        : activePayment.stage === 'processed'
                                                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                                        : 'bg-paper text-slate border border-ink/20'
                                                }`}>
                                                    {activePayment.stage === 'processed' ? '✓' : '2'}
                                                </div>
                                                <span className={`mt-2 text-xs font-bold ${
                                                    activePayment.stage === 'paid'
                                                        ? 'text-sky-800'
                                                        : activePayment.stage === 'processed'
                                                        ? 'text-emerald-700'
                                                        : 'text-slate'
                                                }`}>
                                                    {t('billing.stepPaid')}
                                                </span>
                                                <span className="text-[10px] text-slate hidden sm:block">{t('billing.stepPaidHint')}</span>
                                            </div>

                                            {/* Tahap 3: Sudah Diproses */}
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                                                    activePayment.stage === 'processed'
                                                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                                        : 'bg-paper text-slate border border-ink/20'
                                                }`}>
                                                    {activePayment.stage === 'processed' ? '✓' : '3'}
                                                </div>
                                                <span className={`mt-2 text-xs font-bold ${
                                                    activePayment.stage === 'processed' ? 'text-emerald-700' : 'text-slate'
                                                }`}>
                                                    {t('billing.stepProcessed')}
                                                </span>
                                                <span className="text-[10px] text-slate hidden sm:block">{t('billing.stepProcessedHint')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rincian & Aksi Tagihan */}
                                <div className="mt-8 rounded-2xl border border-ink/10 bg-white/90 p-5 shadow-xs">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">{t('billing.totalLabel')}</p>
                                            <p className="mt-1 font-mono text-xl font-extrabold text-gold-deep">
                                                Rp{Number(activePayment.amount).toLocaleString('id-ID')}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">{t('billing.paymentMethod')}</p>
                                            <p className="mt-1 font-medium text-ink flex items-center gap-1.5 text-sm">
                                                <span>🏦</span> {t('billing.methodBankTransfer')}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">
                                                {activePayment.stage === 'unpaid' ? t('billing.deadlineLabel') : t('billing.transactionTimeLabel')}
                                            </p>
                                            {activePayment.stage === 'unpaid' ? (
                                                <div className="mt-1">
                                                    {timeLeft !== null && timeLeft > 0 ? (
                                                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                                            <span>{t('billing.timeLeft', { x: formatCountdown(timeLeft) })}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-rose-600">{t('billing.expired')}</span>
                                                    )}
                                                </div>
                                            ) : activePayment.stage === 'paid' ? (
                                                <p className="mt-1 text-xs font-medium text-slate">
                                                    {t('billing.proofSentLabel')} <span className="text-ink font-semibold">{activePayment.paid_at || '-'}</span>
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs font-medium text-emerald-700">
                                                    {t('billing.approvedLabel')} <span className="font-semibold">{activePayment.approved_at || '-'}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar Berdasarkan Tahap */}
                                    {activePayment.stage === 'unpaid' && (
                                        <div className="mt-5 pt-4 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <p className="text-xs text-slate">
                                                {t('billing.unpaidInfo')}
                                            </p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={handleCancelPayment}
                                                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                                                >
                                                    {t('billing.cancelBill')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowModal(true)}
                                                    className="btn-gold px-4 py-2 text-xs font-bold shadow-md shadow-gold/20 flex items-center gap-1.5"
                                                >
                                                    <span>🏦</span>
                                                    <span>{t('billing.transferUploadProof')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activePayment.stage === 'paid' && (
                                        <div className="mt-5 pt-4 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="text-xs text-slate flex items-start gap-2">
                                                <span className="text-base text-sky-600">ℹ️</span>
                                                <div>
                                                    <span className="font-semibold text-ink">{t('billing.proofSentTitle')}</span>
                                                    <p className="mt-0.5">{t('billing.proofSentDesc')}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(true)}
                                                className="btn-ink px-4 py-2 text-xs font-semibold shrink-0 flex items-center gap-1.5"
                                            >
                                                <span>👁️</span>
                                                <span>{t('billing.viewProofAccount')}</span>
                                            </button>
                                        </div>
                                    )}

                                    {activePayment.stage === 'processed' && (
                                        <div className="mt-5 pt-4 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="text-xs text-slate flex items-start gap-2">
                                                <span className="text-base text-emerald-600">🎉</span>
                                                <div>
                                                    <span className="font-semibold text-emerald-800">{t('billing.doneTitle')}</span>
                                                    <p className="mt-0.5">{t('billing.doneDesc')}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(true)}
                                                className="btn-ink px-4 py-2 text-xs font-semibold shrink-0 flex items-center gap-1.5"
                                            >
                                                <span>📄</span>
                                                <span>{t('billing.viewProofDetail')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </Reveal>
                    )}

                    {/* Pembayaran Membership Transfer Bank */}
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h2 className="font-display text-lg font-bold text-ink">{t('billing.buyTitle')}</h2>
                                    <p className="text-xs text-slate">{t('billing.buySubtitle')}</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse"></span>
                                    {t('billing.transferBadge')}
                                </span>
                            </div>

                            {/* Info Non-Reset Waktu */}
                            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                                <svg className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <span className="font-semibold">{t('billing.activeRuleTitle')}</span> {t('billing.activeRuleLead')} <strong>{t('billing.activeRuleStrong')}</strong>.
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

                            {/* Active Unpaid Notice */}
                            {activePayment && activePayment.stage === 'unpaid' && (
                                <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3.5 text-xs text-ink flex items-start gap-2.5">
                                    <span className="text-base">💡</span>
                                    <div>
                                        <span className="font-bold">{t('billing.activeNotice', { invoice: activePayment.invoice_number, plan: activePayment.plan_name })}</span>
                                        <p className="mt-0.5 text-slate">{t('billing.activeNoticeDesc')}</p>
                                    </div>
                                </div>
                            )}

                            {/* 1. Pilihan Paket Membership */}
                            <div className="mt-6">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <label className="text-sm font-semibold text-ink">
                                        {t('billing.chooseDuration')}
                                    </label>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-gold-deep">
                                        {t('billing.recommendedBadge')}
                                    </span>
                                </div>
                                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                                    {plans.map((plan) => {
                                        const isSelected = selectedPlanId === plan.id;
                                        const promoBadge =
                                            plan.duration_months === 5 ? t('billing.save1Month') :
                                            plan.duration_months === 10 ? t('billing.save2Months') :
                                            plan.duration_months === 12 ? t('billing.save2Months') :
                                            plan.duration_months === 15 ? t('billing.save3Months') : null;

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
                                                    <span className="font-display text-sm font-bold text-ink">{t('billing.monthsCount', { n: plan.duration_months })}</span>
                                                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-slate">
                                                        {t('billing.daysCount', { n: plan.duration_months * 30 })}
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
                                    {t('billing.promoLabel')}
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
                                            {t('billing.removeVoucher')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                            placeholder={t('billing.promoPlaceholder')}
                                            className="block flex-1 rounded-xl border-ink/20 bg-white px-3 py-2 font-mono text-sm uppercase placeholder-slate/50 focus:border-gold focus:ring-1 focus:ring-gold"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyPromoCode}
                                            disabled={isCheckingPromo || !promoInput.trim()}
                                            className="btn-gold shrink-0 text-xs px-4"
                                        >
                                            {isCheckingPromo ? t('billing.checking') : t('billing.usePromo')}
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
                                        <span>{t('billing.membershipFee', { name: selectedPlan?.name || '-' })}</span>
                                        <span className="font-medium text-ink">Rp{planPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                    {discountValue > 0 && (
                                        <div className="flex justify-between text-emerald-700 font-medium">
                                            <span>{t('billing.voucherDiscount', { code: appliedPromo?.code })}</span>
                                            <span>-Rp{discountValue.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-ink/10 flex justify-between font-bold text-ink">
                                        <span>{t('billing.totalPayment')}</span>
                                        <span className="font-mono text-lg text-gold-deep">Rp{totalBill.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-[11px] text-slate italic">
                                    {totalBill === 0
                                        ? t('billing.voucherFreeNote')
                                        : t('billing.afterBuyNote')}
                                </p>
                            </div>

                            {/* Tombol Eksekusi Bayar */}
                            <div className="mt-8 pt-4 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-xs text-slate">
                                    {t('billing.autoExtendNote')}
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
                                            {t('billing.processingBill')}
                                        </span>
                                    ) : totalBill === 0 ? (
                                        <span className="flex items-center gap-2">
                                            <span>🎁</span>
                                            {t('billing.claimFree')}
                                        </span>
                                    ) : activePayment && activePayment.stage === 'unpaid' && activePayment.plan_id === selectedPlanId ? (
                                        <span className="flex items-center gap-2">
                                            <span className="text-base">🏦</span>
                                            {t('billing.openActiveBill', { amount: totalBill.toLocaleString('id-ID') })}
                                        </span>
                                    ) : activePayment && activePayment.stage === 'unpaid' && activePayment.plan_id !== selectedPlanId ? (
                                        <span className="flex items-center gap-2">
                                            <span className="text-base">🔄</span>
                                            {t('billing.changePlanNewBill', { amount: totalBill.toLocaleString('id-ID') })}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="text-base">🏦</span>
                                            {t('billing.buyNowTransfer', { amount: totalBill.toLocaleString('id-ID') })}
                                        </span>
                                    )}
                                </PrimaryButton>
                            </div>
                        </section>
                    </Reveal>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODAL TRANSFER BANK & UPLOAD BUKTI                        */}
            {/* ========================================================= */}
            {showModal && activePayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 my-8">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                            <div>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1 ${
                                    activePayment.stage === 'processed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : activePayment.stage === 'paid'
                                        ? 'bg-sky-100 text-sky-800'
                                        : 'bg-gold/15 text-gold-deep'
                                }`}>
                                    {activePayment.stage === 'processed'
                                        ? t('billing.modalBadgeProcessed')
                                        : activePayment.stage === 'paid'
                                        ? t('billing.modalBadgePaid')
                                        : t('billing.modalBadgeUnpaid')}
                                </span>
                                <h3 className="font-display text-xl font-bold text-ink">
                                    {activePayment.stage === 'processed'
                                        ? t('billing.modalTitleProcessed')
                                        : activePayment.stage === 'paid'
                                        ? t('billing.modalTitlePaid')
                                        : t('billing.modalTitleUnpaid')}
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

                        {/* Status Alert Berdasarkan Tahap */}
                        {activePayment.stage === 'processed' ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                                <span className="text-base">🎉</span>
                                <div>
                                    <p className="font-bold">{t('billing.alertProcessedTitle')}</p>
                                    <p className="mt-0.5">
                                        {t('billing.alertProcessedBody', { date: activePayment.approved_at || t('billing.today') })}
                                    </p>
                                </div>
                            </div>
                        ) : activePayment.stage === 'paid' || activePayment.payment_proof_url ? (
                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-800 flex items-start gap-2.5">
                                <span className="text-base">✅</span>
                                <div>
                                    <p className="font-bold">{t('billing.alertPaidTitle')}</p>
                                    <p className="mt-0.5">
                                        {t('billing.alertPaidBody')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">⏳</span>
                                    <span>{t('billing.alertUnpaidWaiting')}</span>
                                </div>
                                {timeLeft !== null && timeLeft > 0 && (
                                    <span className="font-mono font-bold text-[11px] text-amber-900 shrink-0 bg-amber-200/80 px-2 py-0.5 rounded-md">
                                        {t('billing.timeLeftShort', { x: formatCountdown(timeLeft) })}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Invoice & Total Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-ink/10 bg-paper/70 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">{t('billing.referenceLabel')}</p>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="font-mono text-xs sm:text-sm font-bold text-ink truncate mr-1">
                                        {activePayment.invoice_number}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(activePayment.invoice_number, 'invoice')}
                                        className="text-[10px] font-bold text-gold-deep hover:underline shrink-0"
                                    >
                                        {copiedInvoice ? t('billing.copied') : t('billing.copy')}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-ink/10 bg-paper/70 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">{t('billing.totalLabel')}</p>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="font-mono text-xs sm:text-sm font-bold text-gold-deep">
                                        Rp{Number(activePayment.amount).toLocaleString('id-ID')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(activePayment.amount, 'amount')}
                                        className="text-[10px] font-bold text-gold-deep hover:underline shrink-0"
                                    >
                                        {copiedAmount ? t('billing.copied') : t('billing.copy')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Rekening Tujuan Transfer (Hanya ditampilkan aktif pada tahap Belum Dibayar) */}
                        {activePayment.stage === 'unpaid' ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-amber-50/60 via-white to-gold/5 p-5">
                                <div className="w-full max-w-sm space-y-3">
                                    <div className="text-center mb-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gold-deep">{t('billing.transferDestination')}</p>
                                    </div>
                                    
                                    <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
                                                BCA
                                            </div>
                                            <div>
                                                <p className="font-mono text-lg font-extrabold text-ink tracking-wide">0405358889</p>
                                                <p className="text-[11px] text-slate font-medium">{t('billing.accountName')}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-ink/10">
                                            <p className="text-[11px] text-slate">{t('billing.branch')}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-[11px] text-amber-900">
                                        <span className="font-semibold">{t('billing.important')}</span> {t('billing.transferImportantLead')} <strong className="font-mono">Rp{Number(activePayment.amount).toLocaleString('id-ID')}</strong> {t('billing.transferImportantMid')} <strong className="font-mono">{activePayment.invoice_number}</strong> {t('billing.transferImportantTail')}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Upload Bukti Pembayaran Section */}
                        <div className="rounded-2xl border border-ink/15 bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-display text-sm font-bold text-ink">
                                    {activePayment.stage === 'processed'
                                        ? t('billing.proofTitleVerified')
                                        : activePayment.payment_proof_url
                                        ? t('billing.proofTitleUploaded')
                                        : t('billing.proofTitleUpload')}
                                </h4>
                                {activePayment.stage === 'processed' ? (
                                    <span className="text-[11px] font-semibold text-emerald-600">{t('billing.proofDone')}</span>
                                ) : activePayment.payment_proof_url ? (
                                    <span className="text-[11px] font-semibold text-sky-600">{t('billing.proofSent')}</span>
                                ) : null}
                            </div>

                            {activePayment.payment_proof_url ? (
                                <div className="space-y-3">
                                    <div className="rounded-xl border border-ink/10 overflow-hidden bg-paper/50 p-2">
                                        <img
                                            src={activePayment.payment_proof_url}
                                            alt={t('billing.proofAlt')}
                                            className="max-h-48 w-full object-contain rounded-lg mx-auto"
                                        />
                                    </div>
                                    {activePayment.stage !== 'processed' && (
                                        <p className="text-[11px] text-slate text-center">
                                            {t('billing.replaceProofQuestion')}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="ml-1 text-gold-deep font-bold underline"
                                            >
                                                {t('billing.reupload')}
                                            </button>
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate">
                                        {t('billing.proofInstructions')}
                                    </p>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-paper/40 p-5 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition"
                                    >
                                        {proofPreview ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={proofPreview}
                                                    alt={t('billing.proofPreviewAlt')}
                                                    className="max-h-36 rounded-lg object-contain mx-auto shadow-sm"
                                                />
                                                <p className="text-xs font-semibold text-gold-deep">{t('billing.clickToReplaceFile')}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-3xl mb-1">📸</span>
                                                <p className="text-xs font-semibold text-ink">{t('billing.clickToChooseProof')}</p>
                                                <p className="text-[10px] text-slate mt-0.5">{t('billing.proofFormatHint')}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activePayment.stage !== 'processed' && (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            )}

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
                                    {isUploadingProof ? t('billing.uploadingProof') : t('billing.sendProof')}
                                </button>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-between pt-2">
                            {activePayment.stage === 'unpaid' ? (
                                <button
                                    type="button"
                                    onClick={handleCancelPayment}
                                    className="text-xs font-medium text-red-600 hover:underline"
                                >
                                    {t('billing.cancelBill')}
                                </button>
                            ) : <div />}

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-ink text-xs px-5 py-2"
                            >
                                {t('billing.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Billing.layout = (page) => <MemberLayout>{page}</MemberLayout>;
