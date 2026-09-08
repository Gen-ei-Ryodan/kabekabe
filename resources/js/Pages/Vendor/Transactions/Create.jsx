import { useRef, useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import VendorLayout from '@/Layouts/VendorLayout';
import StatusChip from '@/Components/StatusChip';
import Avatar from '@/Components/Avatar';

export default function TransactionCreate({ member, is_completing = false }) {
    const { errors } = usePage().props;

    const [manualQuery, setManualQuery] = useState('');
    const checkingRef = useRef(false);

    const form = useForm({
        transaction_number: '',
        promo_name: '',
        total: '',
        discount_percent: '',
        discount_amount: '',
        net_amount: '',
        discounts: [{ description: '', amount: '' }],
        note: '',
        proof: null,
    });

    const verified = member?.found && member.active;

    const checkMember = (value) => {
        const token = String(value || '').trim();

        if (!token || checkingRef.current) return;

        checkingRef.current = true;
        router.get(
            route('vendor.transactions.create'),
            { scan: token },
            {
                only: ['member'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { checkingRef.current = false; },
            },
        );
    };

    const resetScan = () => {
        router.get(
            route('vendor.transactions.create'),
            {},
            { only: ['member'], preserveState: true, preserveScroll: true },
        );
    };

    const handleScan = (result) => {
        const first = Array.isArray(result) ? result[0] : result;
        const raw = first?.rawValue || first?.toString();

        if (!raw) return;

        const token = String(raw).trim().replace(/^https?:\/\/[^/]+\//, '').split('/').pop();

        checkMember(token);
    };

    const submitManual = (e) => {
        e.preventDefault();
        checkMember(manualQuery);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('vendor.transactions.store'), {
            preserveScroll: true,
            transform: (data) => ({ ...data, member_code: member.member_code, scan_id: member.scan_id }),
        });
    };

    const updateDiscount = (index, field, value) => {
        const discounts = form.data.discounts.map((discount, i) => i === index ? { ...discount, [field]: value } : discount);
        form.setData('discounts', discounts);
    };

    return (
        <>
            <Head title="Record Transaction" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Transactions</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Record Benefit Transaction</h1>
                    <p className="mt-2 text-sm text-slate">
                        Scan the member's card first. Transactions can only be recorded for members with an active membership.
                    </p>
                </header>

                {!member && (
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <section className="card-surface p-6">
                            <h2 className="font-display text-lg font-bold">Step 1 — Scan QR Card</h2>
                            <p className="mt-1 text-sm text-slate">Point the camera at the QR code on the member's digital card.</p>

                            <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-ink">
                                <Scanner
                                    onScan={handleScan}
                                    constraints={{ facingMode: 'environment' }}
                                    formats={['qr_code']}
                                    styles={{ container: { height: 280 } }}
                                />
                            </div>
                        </section>

                        <section className="card-surface p-6">
                            <h2 className="font-display text-lg font-bold">Or enter the Member ID</h2>
                            <p className="mt-1 text-sm text-slate">Type the Member ID shown on the member's card.</p>

                            <form onSubmit={submitManual} className="mt-4">
                                <label className="label" htmlFor="scan-query">Member ID / Card token</label>
                                <input
                                    id="scan-query"
                                    type="text"
                                    className="input font-mono"
                                    value={manualQuery}
                                    onChange={(e) => setManualQuery(e.target.value)}
                                    placeholder="MMB-00001"
                                />
                                <button type="submit" className="btn-gold mt-4 w-full">
                                    Check Membership
                                </button>
                            </form>
                        </section>
                    </div>
                )}

                {member && member.found === false && (
                    <div className="card-surface mt-8 p-10 text-center">
                        <span className="text-4xl">&#9888;</span>
                        <h2 className="mt-4 font-display text-xl font-bold">Card not found</h2>
                        <p className="mt-2 text-sm text-slate">The scanned token or Member ID is not registered on this platform.</p>
                        <button onClick={resetScan} className="btn-ghost mt-6">
                            Scan again
                        </button>
                    </div>
                )}

                {member?.found && (
                    <div className="mt-8 space-y-6">
                        <div className="card-surface overflow-hidden">
                            <div className="flex flex-wrap items-center gap-4 bg-ink p-5 text-paper sm:p-6">
                                <Avatar
                                    src={member.avatar_url}
                                    name={member.name}
                                    tone="dark"
                                    className="h-14 w-14 rounded-full border-2 border-gold text-lg"
                                />
                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate font-display text-lg font-bold">{member.name}</h2>
                                    <p className="font-mono text-xs tracking-widest text-gold-light">{member.member_code}</p>
                                </div>
                                <StatusChip status={verified ? 'active' : 'inactive'} label={member.status_label} pulse={verified} />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
                                <p className="text-xs text-slate">
                                    Valid until <span className="font-mono font-semibold text-ink">{member.expires_at || '-'}</span>
                                </p>
                                {member.scan && (
                                    <p className="text-xs text-slate">
                                        Scanned at <span className="font-mono font-semibold text-ink">{member.scan.scanned_at}</span>
                                        {' · '}
                                        <span className={member.within_window ? 'font-mono font-semibold text-sage-deep' : 'font-mono font-semibold text-ember'}>
                                            {member.within_window ? `${member.scan.hours_left}h left` : 'Input window expired'}
                                        </span>
                                    </p>
                                )}
                                <button onClick={resetScan} className="text-xs font-semibold text-gold-deep underline-offset-2 hover:underline">
                                    Scan a different card
                                </button>
                            </div>
                        </div>

                        {verified && member.within_window === false && (
                            <div className="rounded-2xl border border-ember/30 bg-ember/10 p-6 text-center">
                                <span className="text-3xl">⛔</span>
                                <h3 className="mt-3 font-display text-xl font-bold text-ember-deep">Input window expired</h3>
                                <p className="mt-2 max-w-sm text-sm text-slate">
                                    More than 48 hours have passed since the card scan. Please scan again or contact admin to edit.
                                </p>
                            </div>
                        )}

                        {verified && member.within_window !== false && !is_completing ? (
                            <div className="card-surface p-6 text-center sm:p-8">
                                <p className="eyebrow">Scan saved</p>
                                <h3 className="mt-2 font-display text-xl font-bold">Ready for transaction input later</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-slate">
                                    The member scan has been saved. Open Pending Transactions when you are ready to enter the purchase details, within 48 hours.
                                </p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    <button type="button" onClick={() => router.get(route('vendor.transactions.index'))} className="btn-gold">Open Pending Transactions</button>
                                    <button type="button" onClick={resetScan} className="btn-ghost">Scan a different card</button>
                                </div>
                            </div>
                        ) : verified && member.within_window !== false ? (
                            <form onSubmit={submit} className="card-surface space-y-6 p-6 sm:p-8">
                                <div className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-semibold text-sage-deep">
                                    <span className="font-semibold">&#10003; Member scan saved</span>
                                    <span className="mt-1 block font-normal">Complete this now or return from Pending Transactions within 48 hours.</span>
                                </div>

                                <div>
                                    <label className="label" htmlFor="transaction_number">Transaction / receipt number (optional)</label>
                                    <input id="transaction_number" type="text" className="input font-mono" value={form.data.transaction_number} onChange={(e) => form.setData('transaction_number', e.target.value)} placeholder="POS receipt number — auto-generated if empty" />
                                    {errors.transaction_number && <p className="mt-1 text-xs text-ember">{errors.transaction_number}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="member_code">Member ID</label>
                                    <input id="member_code" type="text" readOnly className="input cursor-not-allowed bg-ink/5 font-mono text-slate" value={member.member_code} />
                                    <p className="mt-1 text-xs text-slate">Verified via card scan.</p>
                                    {errors.member_code && <p className="mt-1 text-xs text-ember">{errors.member_code}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="promo_name">Promo / benefit (manual)</label>
                                    <input id="promo_name" type="text" className="input" value={form.data.promo_name} onChange={(e) => form.setData('promo_name', e.target.value)} placeholder="Tulis nama promo atau benefit" />
                                    {errors.promo_name && <p className="mt-1 text-xs text-ember">{errors.promo_name}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="total">Total purchase (Rp)</label>
                                    <input id="total" type="number" min="1" className="input" value={form.data.total} onChange={(e) => form.setData('total', e.target.value)} />
                                    {errors.total && <p className="mt-1 text-xs text-ember">{errors.total}</p>}
                                </div>

                                <div className="space-y-4 rounded-xl border border-gold/30 bg-gold/10 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="eyebrow">Diskon manual</p>
                                            <p className="mt-1 text-xs text-slate">Isi semua angka secara manual. Sistem tidak menghitung otomatis.</p>
                                        </div>
                                        <button type="button" className="btn-ghost shrink-0 text-xs" onClick={() => form.setData('discounts', [...form.data.discounts, { description: '', amount: '' }])}>++ Tambah</button>
                                    </div>
                                    {form.data.discounts.map((discount, index) => (
                                        <div key={index} className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
                                            <input type="text" className="input" value={discount.description} onChange={(e) => updateDiscount(index, 'description', e.target.value)} placeholder={`Diskon ${index + 1}`} />
                                            <input type="number" min="0" className="input" value={discount.amount} onChange={(e) => updateDiscount(index, 'amount', e.target.value)} placeholder="Nominal Rp" />
                                            {form.data.discounts.length > 1 && <button type="button" className="btn-ghost" onClick={() => form.setData('discounts', form.data.discounts.filter((_, i) => i !== index))}>Hapus</button>}
                                        </div>
                                    ))}
                                    {errors.discounts && <p className="text-xs text-ember">{errors.discounts}</p>}
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="label" htmlFor="discount_percent">Total diskon (%) manual</label>
                                            <input id="discount_percent" type="number" min="0" className="input" value={form.data.discount_percent} onChange={(e) => form.setData('discount_percent', e.target.value)} />
                                            {errors.discount_percent && <p className="mt-1 text-xs text-ember">{errors.discount_percent}</p>}
                                        </div>
                                        <div>
                                            <label className="label" htmlFor="discount_amount">Total diskon (Rp) manual <span className="text-ember">*</span></label>
                                            <input id="discount_amount" type="number" min="0" required className="input" value={form.data.discount_amount} onChange={(e) => form.setData('discount_amount', e.target.value)} />
                                            {errors.discount_amount && <p className="mt-1 text-xs text-ember">{errors.discount_amount}</p>}
                                        </div>
                                        <div>
                                            <label className="label" htmlFor="net_amount">Net sales (Rp) manual <span className="text-ember">*</span></label>
                                            <input id="net_amount" type="number" min="0" required className="input" value={form.data.net_amount} onChange={(e) => form.setData('net_amount', e.target.value)} />
                                            {errors.net_amount && <p className="mt-1 text-xs text-ember">{errors.net_amount}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="label" htmlFor="note">Notes (optional)</label>
                                    <textarea id="note" rows={2} className="input" value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />
                                    {errors.note && <p className="mt-1 text-xs text-ember">{errors.note}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="proof">Receipt photo (optional)</label>
                                    <input id="proof" type="file" accept="image/*" className="input" onChange={(e) => form.setData('proof', e.target.files[0])} />
                                    {errors.proof && <p className="mt-1 text-xs text-ember">{errors.proof}</p>}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => router.get(route('vendor.transactions.index'))} className="btn-ghost">Cancel</button>
                                    <button type="submit" className="btn-gold" disabled={form.processing}>
                                        {form.processing ? 'Saving…' : 'Save Transaction'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center rounded-2xl border border-ember/30 bg-ember/10 p-8 text-center">
                                <span className="text-3xl">&#9940;</span>
                                <h3 className="mt-3 font-display text-xl font-bold text-ember-deep">Membership INACTIVE</h3>
                                <p className="mt-2 max-w-sm text-sm text-slate">
                                    This member cannot use benefits or promos, so no transaction can be recorded. Ask them to renew their membership first.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

TransactionCreate.layout = (page) => <VendorLayout>{page}</VendorLayout>;
