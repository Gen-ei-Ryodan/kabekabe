import { Head, router, useForm } from '@inertiajs/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import VendorLayout from '@/Layouts/VendorLayout';
import StatusChip from '@/Components/StatusChip';
import Avatar from '@/Components/Avatar';
import { formatDate } from '@/Utils/format';

export default function Verify({ result }) {
    const manual = useForm({ query: '' });

    const handleScan = (decodedText) => {
        if (!decodedText) return;

        const token = String(decodedText).trim().replace(/^https?:\/\/[^/]+\//, '').split('/').pop();

        if (token) {
            router.get(route('vendor.verify.token', token), {}, { preserveScroll: true });
        }
    };

    const submitManual = (e) => {
        e.preventDefault();
        const value = manual.data.query.trim();

        if (value) {
            router.get(route('vendor.verify.token', value), {}, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Verify Members" />

            <div className="mx-auto max-w-4xl">
                <header className="mb-8">
                    <p className="eyebrow">Verification</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Verify Members</h1>
                    <p className="mt-2 text-sm text-slate">
                        Scan the QR on the member's digital card or enter the Member ID to check membership status.
                    </p>
                </header>

                {result ? (
                    result.found === false ? (
                        <div className="card-surface p-10 text-center">
                            <span className="text-4xl">⚠</span>
                            <h2 className="mt-4 font-display text-xl font-bold">Card not found</h2>
                            <p className="mt-2 text-sm text-slate">The token or Member ID is not registered on this platform.</p>
                            <button onClick={() => router.get(route('vendor.verify'), {}, { preserveScroll: true })} className="btn-ghost mt-6">
                                Scan again
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="card-surface overflow-hidden">
                                <div className="flex items-center gap-4 bg-ink p-6 text-paper">
                                    <Avatar
                                        src={result.member.avatar_url}
                                        name={result.member.name}
                                        tone="dark"
                                        className="h-16 w-16 rounded-full border-2 border-gold text-xl"
                                    />
                                    <div>
                                        <h2 className="font-display text-xl font-bold">{result.member.name}</h2>
                                        <p className="font-mono text-xs tracking-widest text-gold-light">{result.member.member_code}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 p-6">
                                    <div className="flex justify-between text-sm"><span className="text-slate">Status</span><StatusChip status={result.active ? 'active' : 'inactive'} label={result.status_label} pulse={result.active} /></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate">Valid until</span><span className="font-mono font-semibold">{result.expires_at || '-'}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate">Company</span><span>{result.member.company || '-'}</span></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {result.active ? (
                                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-sage/30 bg-sage/10 p-8 text-center">
                                        <span className="text-3xl">✓</span>
                                        <h3 className="mt-3 font-display text-xl font-bold text-sage-deep">Membership ACTIVE</h3>
                                        <p className="mt-2 text-sm text-slate">
                                            This member can use partner benefits and promos.
                                        </p>
                                        <a
                                            href={route('vendor.transactions.create', { member_code: result.member.member_code })}
                                            className="btn-ink mt-6"
                                        >
                                            Record a transaction for this member
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-ember/30 bg-ember/10 p-8 text-center">
                                        <span className="text-3xl">⛔</span>
                                        <h3 className="mt-3 font-display text-xl font-bold text-ember-deep">Membership INACTIVE</h3>
                                        <p className="mt-2 text-sm text-slate">
                                            This member cannot use benefits/promos until the membership is renewed.
                                        </p>
                                    </div>
                                )}

                                <button onClick={() => router.get(route('vendor.verify'), {}, { preserveScroll: true })} className="btn-ghost">
                                    Scan another member
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        <section className="card-surface p-6">
                            <h2 className="font-display text-lg font-bold">Scan QR Card</h2>
                            <p className="mt-1 text-sm text-slate">Point the camera at the QR code on the member's digital card.</p>

                            <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-ink">
                                <Scanner
                                    onScan={(result) => {
                                        const first = Array.isArray(result) ? result[0] : result;
                                        handleScan(first?.rawValue || first?.toString());
                                    }}
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
                                <label className="label" htmlFor="query">Member ID / Token</label>
                                <input id="query" type="text" className="input font-mono" value={manual.data.query} onChange={(e) => manual.setData('query', e.target.value)} placeholder="MMB-00001" />
                                {manual.errors.query && <p className="mt-1 text-xs text-ember">{manual.errors.query}</p>}
                                <button type="submit" className="btn-gold mt-4 w-full" disabled={manual.processing}>
                                    {manual.processing ? 'Checking…' : 'Check Status'}
                                </button>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}

Verify.layout = (page) => <VendorLayout>{page}</VendorLayout>;