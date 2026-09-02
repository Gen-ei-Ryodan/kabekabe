import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashMessages from '@/Components/FlashMessages';

function ResultBox({ result }) {
    if (!result) return null;

    if (result.type === 'faspay') {
        return (
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm">
                <p className="eyebrow">Faspay Invoice (Dummy)</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-ink p-3 font-mono text-xs text-paper">
{JSON.stringify(result.invoice, null, 2)}
                </pre>
            </div>
        );
    }

    if (result.type === 'wa_blast') {
        return (
            <div className="rounded-2xl border border-sage/30 bg-sage/5 p-4 text-sm">
                <p className="eyebrow">WA Blast Result (Stub)</p>
                <p className="mt-2 text-xs">
                    <span className="font-bold">{result.result.queued}</span> queued
                    {' · '}
                    <span className="font-bold text-ember">{result.result.failed}</span> failed
                    {' · '}
                    <span className="font-bold">{result.result.total}</span> total
                </p>
            </div>
        );
    }

    return null;
}

export default function IntegrationIndex({ faspay, wa_blast }) {
    const { props } = usePage();
    const result = props.integration_result;

    const faspayForm = useForm({
        amount: 100000,
        channel: 'qris',
    });

    const waForm = useForm({
        message: 'Info promo spesial dari KBKB! Cek aplikasi untuk detail.',
        audience: 'all_members',
    });

    const submitFaspay = (e) => {
        e.preventDefault();
        faspayForm.post(route('admin.integrations.faspay.test'), { preserveScroll: true });
    };

    const submitWa = (e) => {
        e.preventDefault();
        waForm.post(route('admin.integrations.wa-blast.send'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Integrations" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">System</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Integrasi & Otomatisasi</h1>
                    <p className="mt-2 max-w-xl text-sm text-slate">
                        Payment gateway (Faspay) dan WA Blast untuk otomasi notifikasi. UI tersedia, integrasi penuh menyusul.
                    </p>
                </header>

                {result && <ResultBox result={result} />}

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="card-surface p-6">
                        <p className="eyebrow">Payment Gateway</p>
                        <h2 className="mt-1 font-display text-xl font-bold">{faspay.provider}</h2>
                        <p className="mt-1 text-xs text-slate">Merchant ID: {faspay.merchant_id}</p>

                        <form onSubmit={submitFaspay} className="mt-5 space-y-3">
                            <div>
                                <label className="label">Mode / Channel</label>
                                <select className="input" value={faspayForm.data.channel} onChange={(e) => faspayForm.setData('channel', e.target.value)}>
                                    {Object.entries(faspay.modes).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Amount (Rp)</label>
                                <input type="number" min="1" className="input" value={faspayForm.data.amount} onChange={(e) => faspayForm.setData('amount', e.target.value)} />
                            </div>
                            <button type="submit" className="btn-gold" disabled={faspayForm.processing}>
                                {faspayForm.processing ? 'Testing…' : 'Test Invoice (Dummy)'}
                            </button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <p className="eyebrow">WA Blast</p>
                        <h2 className="mt-1 font-display text-xl font-bold">{wa_blast.provider}</h2>
                        <p className="mt-1 text-xs text-slate">Provider: {wa_blast.default_provider}</p>

                        <form onSubmit={submitWa} className="mt-5 space-y-3">
                            <div>
                                <label className="label">Audience</label>
                                <select className="input" value={waForm.data.audience} onChange={(e) => waForm.setData('audience', e.target.value)}>
                                    <option value="all_members">All Members</option>
                                    <option value="active_members">Active Members</option>
                                    <option value="expired_members">Expired Members</option>
                                    <option value="all_admins">All Admins</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Message</label>
                                <textarea rows={3} className="input" value={waForm.data.message} onChange={(e) => waForm.setData('message', e.target.value)} />
                            </div>
                            <button type="submit" className="btn-gold" disabled={waForm.processing}>
                                {waForm.processing ? 'Sending…' : 'Send Broadcast (Stub)'}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}

IntegrationIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;