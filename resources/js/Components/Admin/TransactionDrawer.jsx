import SlideOver from '@/Components/SlideOver';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function TransactionDrawer({ drawer, onClose }) {
    if (!drawer?.mode) return null;

    const t = drawer.transaction;

    return (
        <SlideOver open onClose={onClose} title={t.transaction_number} subtitle={formatDate(t.transacted_at, true)} width="max-w-xl">
            <div className="flex flex-col gap-6">
                <section className="rounded-2xl border border-ink/10 p-5">
                    <h2 className="font-display text-lg font-bold">Transaction Details</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        {[
                            ['Member', `${t.member?.name} · ${t.member?.member_code}`],
                            ['Company', t.member?.company || '-'],
                            ['Partner', t.partner?.name],
                            ['Category', t.partner?.category],
                            ['Promo', t.promo?.title || '-'],
                            ['Notes', t.note || '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">{label}</dt>
                                <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-5 rounded-xl border border-ink/10 p-4">
                        <div className="flex justify-between text-sm"><span>Total purchase</span><span className="font-semibold">{formatRupiah(t.total_amount)}</span></div>
                        <div className="mt-1 flex justify-between text-sm text-sage"><span>Discount</span><span>-{formatRupiah(t.discount_amount)}</span></div>
                        <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-display text-lg font-bold">
                            <span>Net sales</span><span>{formatRupiah(t.net_amount)}</span>
                        </div>
                    </div>

                    {t.proof_url && (
                        <div className="mt-4">
                            <a href={t.proof_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gold-deep">View receipt photo →</a>
                        </div>
                    )}
                </section>
            </div>
        </SlideOver>
    );
}