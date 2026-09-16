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
        form.transform((data) => ({
            ...data,
            member_code: member.member_code,
            scan_id: member.scan_id,
            discounts: [
                {
                    description: data.promo_name || 'Diskon Manual',
                    amount: parseInt(data.discount_amount) || 0,
                },
            ],
        }));
        form.post(route('vendor.transactions.store'), { preserveScroll: true });
    };

    const updateDiscount = (index, field, value) => {
        const discounts = form.data.discounts.map((discount, i) => i === index ? { ...discount, [field]: value } : discount);
        form.setData('discounts', discounts);
    };

    return (
        <>
            <Head title="Catat Transaksi" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Transaksi</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Catat Transaksi Benefit</h1>
                    <p className="mt-2 text-sm text-slate">
                        Pindai kartu member terlebih dahulu. Transaksi hanya dapat dicatat untuk member dengan status keanggotaan aktif.
                    </p>
                </header>

                {!member && (
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <section className="card-surface p-6">
                            <h2 className="font-display text-lg font-bold">Langkah 1 — Pindai QR Kartu</h2>
                            <p className="mt-1 text-sm text-slate">Arahkan kamera ke kode QR pada kartu digital member.</p>

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
                            <h2 className="font-display text-lg font-bold">Atau Masukkan ID Member</h2>
                            <p className="mt-1 text-sm text-slate">Ketik ID Member yang tertera pada kartu member.</p>

                            <form onSubmit={submitManual} className="mt-4">
                                <label className="label" htmlFor="scan-query">ID Member / Token Kartu</label>
                                <input
                                    id="scan-query"
                                    type="text"
                                    className="input font-mono"
                                    value={manualQuery}
                                    onChange={(e) => setManualQuery(e.target.value)}
                                    placeholder="MMB-00001"
                                />
                                <button type="submit" className="btn-gold mt-4 w-full">
                                    Periksa Keanggotaan
                                </button>
                            </form>
                        </section>
                    </div>
                )}

                {member && member.found === false && (
                    <div className="card-surface mt-8 p-10 text-center">
                        <span className="text-4xl">&#9888;</span>
                        <h2 className="mt-4 font-display text-xl font-bold">Kartu tidak ditemukan</h2>
                        <p className="mt-2 text-sm text-slate">Token atau ID Member yang dipindai tidak terdaftar di sistem.</p>
                        <button onClick={resetScan} className="btn-ghost mt-6">
                            Pindai Ulang
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
                                    Berlaku hingga <span className="font-mono font-semibold text-ink">{member.expires_at || '-'}</span>
                                </p>
                                {member.scan && (
                                    <p className="text-xs text-slate">
                                        Dipindai pada <span className="font-mono font-semibold text-ink">{member.scan.scanned_at}</span>
                                        {' · '}
                                        <span className={member.within_window ? 'font-mono font-semibold text-sage-deep' : 'font-mono font-semibold text-ember'}>
                                            {member.within_window ? `Sisa ${member.scan.hours_left} jam` : 'Batas waktu input berakhir'}
                                        </span>
                                    </p>
                                )}
                                <button onClick={resetScan} className="text-xs font-semibold text-gold-deep underline-offset-2 hover:underline">
                                    Pindai kartu lain
                                </button>
                            </div>
                        </div>

                        {verified && member.within_window === false && (
                            <div className="rounded-2xl border border-ember/30 bg-ember/10 p-6 text-center">
                                <span className="text-3xl">⛔</span>
                                <h3 className="mt-3 font-display text-xl font-bold text-ember-deep">Batas Waktu Input Berakhir</h3>
                                <p className="mt-2 max-w-sm text-sm text-slate">
                                    Lebih dari 48 jam telah berlalu sejak kartu dipindai. Silakan pindai ulang atau hubungi admin untuk bantuan.
                                </p>
                            </div>
                        )}

                        {verified && member.within_window !== false && !is_completing ? (
                            <div className="card-surface p-6 text-center sm:p-8">
                                <p className="eyebrow">Pindaian Tersimpan</p>
                                <h3 className="mt-2 font-display text-xl font-bold">Siap untuk input transaksi nanti</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-slate">
                                    Pindaian kartu member telah disimpan. Buka Transaksi Tertunda saat Anda siap memasukkan rincian transaksi, dalam kurun 48 jam.
                                </p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    <button type="button" onClick={() => router.get(route('vendor.transactions.index'))} className="btn-gold">Buka Transaksi Tertunda</button>
                                    <button type="button" onClick={resetScan} className="btn-ghost">Pindai Kartu Lain</button>
                                </div>
                            </div>
                        ) : verified && member.within_window !== false ? (
                            <form onSubmit={submit} className="card-surface space-y-6 p-6 sm:p-8">
                                <div className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-semibold text-sage-deep">
                                    <span className="font-semibold">&#10003; Pindaian member tersimpan</span>
                                    <span className="mt-1 block font-normal">Selesaikan sekarang atau lanjutkan melalui Transaksi Tertunda dalam kurun 48 jam.</span>
                                </div>

                                <div>
                                    <label className="label" htmlFor="transaction_number">Nomor transaksi / struk (opsional)</label>
                                    <input id="transaction_number" type="text" className="input font-mono" value={form.data.transaction_number} onChange={(e) => form.setData('transaction_number', e.target.value)} placeholder="Nomor struk kasir — dibuat otomatis jika kosong" />
                                    {errors.transaction_number && <p className="mt-1 text-xs text-ember">{errors.transaction_number}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="member_code">ID Member</label>
                                    <input id="member_code" type="text" readOnly className="input cursor-not-allowed bg-ink/5 font-mono text-slate" value={member.member_code} />
                                    <p className="mt-1 text-xs text-slate">Terverifikasi melalui pindaian kartu.</p>
                                    {errors.member_code && <p className="mt-1 text-xs text-ember">{errors.member_code}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="total">Total Belanja (Rp) <span className="text-ember">*</span></label>
                                    <input
                                        id="total"
                                        type="number"
                                        min="1"
                                        className="input"
                                        value={form.data.total}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            form.setData((prev) => {
                                                const totalNum = parseInt(val) || 0;
                                                const discNum = parseInt(prev.discount_amount) || 0;
                                                return {
                                                    ...prev,
                                                    total: val,
                                                    net_amount: prev.net_amount ? prev.net_amount : (val ? Math.max(0, totalNum - discNum) : ''),
                                                };
                                            });
                                        }}
                                        placeholder="0"
                                    />
                                    {errors.total && <p className="mt-1 text-xs text-ember">{errors.total}</p>}
                                </div>

                                <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 sm:p-5">
                                    <div className="mb-3">
                                        <p className="eyebrow">Diskon Manual</p>
                                        <p className="mt-0.5 text-xs text-slate">Isi rincian diskon secara sejajar: Nama Promo/Benefit, Diskon %, Diskon Rp, dan Penjualan Bersih.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label className="label" htmlFor="promo_name">Nama</label>
                                            <input
                                                id="promo_name"
                                                type="text"
                                                className="input"
                                                value={form.data.promo_name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    form.setData((prev) => ({
                                                        ...prev,
                                                        promo_name: val,
                                                        discounts: [{ description: val || 'Diskon', amount: prev.discount_amount || 0 }],
                                                    }));
                                                }}
                                                placeholder="Contoh: Diskon Member"
                                            />
                                            {errors.promo_name && <p className="mt-1 text-xs text-ember">{errors.promo_name}</p>}
                                        </div>

                                        <div>
                                            <label className="label" htmlFor="discount_percent">Diskon %</label>
                                            <input
                                                id="discount_percent"
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="input"
                                                value={form.data.discount_percent}
                                                onChange={(e) => {
                                                    const pct = e.target.value;
                                                    const totalVal = parseInt(form.data.total) || 0;
                                                    let discAmt = form.data.discount_amount;
                                                    let netAmt = form.data.net_amount;
                                                    if (pct && totalVal > 0) {
                                                        discAmt = Math.round((totalVal * parseFloat(pct)) / 100);
                                                        netAmt = Math.max(0, totalVal - discAmt);
                                                    }
                                                    form.setData((prev) => ({
                                                        ...prev,
                                                        discount_percent: pct,
                                                        discount_amount: discAmt !== undefined ? String(discAmt) : prev.discount_amount,
                                                        net_amount: netAmt !== undefined ? String(netAmt) : prev.net_amount,
                                                        discounts: [{ description: prev.promo_name || 'Diskon', amount: discAmt || 0 }],
                                                    }));
                                                }}
                                                placeholder="0"
                                            />
                                            {errors.discount_percent && <p className="mt-1 text-xs text-ember">{errors.discount_percent}</p>}
                                        </div>

                                        <div>
                                            <label className="label" htmlFor="discount_amount">Diskon Rp <span className="text-ember">*</span></label>
                                            <input
                                                id="discount_amount"
                                                type="number"
                                                min="0"
                                                className="input"
                                                value={form.data.discount_amount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const discAmt = parseInt(val) || 0;
                                                    const totalVal = parseInt(form.data.total) || 0;
                                                    const netAmt = totalVal > 0 ? Math.max(0, totalVal - discAmt) : form.data.net_amount;
                                                    form.setData((prev) => ({
                                                        ...prev,
                                                        discount_amount: val,
                                                        net_amount: netAmt ? String(netAmt) : prev.net_amount,
                                                        discounts: [{ description: prev.promo_name || 'Diskon', amount: discAmt }],
                                                    }));
                                                }}
                                                placeholder="0"
                                            />
                                            {errors.discount_amount && <p className="mt-1 text-xs text-ember">{errors.discount_amount}</p>}
                                        </div>

                                        <div>
                                            <label className="label" htmlFor="net_amount">Penjualan Bersih <span className="text-ember">*</span></label>
                                            <input
                                                id="net_amount"
                                                type="number"
                                                min="0"
                                                className="input font-semibold text-sage-deep"
                                                value={form.data.net_amount}
                                                onChange={(e) => form.setData('net_amount', e.target.value)}
                                                placeholder="0"
                                            />
                                            {errors.net_amount && <p className="mt-1 text-xs text-ember">{errors.net_amount}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="label" htmlFor="note">Catatan (opsional)</label>
                                    <textarea id="note" rows={2} className="input" value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />
                                    {errors.note && <p className="mt-1 text-xs text-ember">{errors.note}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="proof">Foto struk (opsional)</label>
                                    <input id="proof" type="file" accept="image/*" className="input" onChange={(e) => form.setData('proof', e.target.files[0])} />
                                    {errors.proof && <p className="mt-1 text-xs text-ember">{errors.proof}</p>}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => router.get(route('vendor.transactions.index'))} className="btn-ghost">Batal</button>
                                    <button type="submit" className="btn-gold" disabled={form.processing}>
                                        {form.processing ? 'Menyimpan…' : 'Simpan Transaksi'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center rounded-2xl border border-ember/30 bg-ember/10 p-8 text-center">
                                <span className="text-3xl">&#9940;</span>
                                <h3 className="mt-3 font-display text-xl font-bold text-ember-deep">Keanggotaan TIDAK AKTIF</h3>
                                <p className="mt-2 max-w-sm text-sm text-slate">
                                    Member ini tidak dapat menggunakan benefit atau promo, sehingga transaksi tidak dapat dicatat. Minta member untuk memperpanjang keanggotaannya terlebih dahulu.
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
