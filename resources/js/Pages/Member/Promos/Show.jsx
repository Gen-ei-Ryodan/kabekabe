import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PromoShow({ promo, member_active }) {
    return (
        <>
            <Head title={promo.title} />

            <div className="mx-auto max-w-3xl">
                <Link href={route('member.partners.index')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink">
                    ← Back to all promos
                </Link>

                <div className="card-surface overflow-hidden">
                    <div className="relative flex flex-col gap-6 bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">{promo.partner.name}</p>
                            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-gold-light sm:text-4xl">
                                {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)}
                            </h1>
                            <p className="mt-1 text-paper/70">Member-exclusive discount</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                            <StatusChip status={member_active ? 'active' : 'inactive'} label={member_active ? 'Available to you' : 'Active status required'} />
                            <p className="font-mono text-xs text-paper/50">
                                {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-10">
                        <h2 className="font-display text-lg font-bold">About this promo</h2>
                        <p className="mt-3 leading-relaxed text-slate">{promo.description}</p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Minimum Purchase</p>
                                <p className="mt-1 font-display font-bold">{promo.min_purchase > 0 ? formatRupiah(promo.min_purchase) : 'No minimum'}</p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Discount</p>
                                <p className="mt-1 font-display font-bold">
                                    {promo.discount_type === 'percent' ? `${promo.discount_value}% off total` : formatRupiah(promo.discount_value)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">Period</p>
                                <p className="mt-1 font-mono text-sm font-semibold">{formatDate(promo.start_date)} — {formatDate(promo.end_date)}</p>
                            </div>
                        </div>

                        {promo.terms && (
                            <div className="mt-6 rounded-xl bg-ink/5 p-5">
                                <p className="eyebrow">Terms & Conditions</p>
                                <p className="mt-2 text-sm text-slate">{promo.terms}</p>
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link href={route('member.partners.show', promo.partner.id)} className="btn-ink">
                                Visit {promo.partner.name}
                            </Link>
                            {member_active ? (
                                <p className="inline-flex items-center rounded-full bg-sage/10 px-4 py-2.5 text-sm font-semibold text-sage">
                                    ✓ Show your digital card at checkout
                                </p>
                            ) : (
                                <p className="inline-flex items-center rounded-full bg-ember/10 px-4 py-2.5 text-sm font-semibold text-ember">
                                    To renew your membership, please contact the admin.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

PromoShow.layout = (page) => <MemberLayout>{page}</MemberLayout>;
