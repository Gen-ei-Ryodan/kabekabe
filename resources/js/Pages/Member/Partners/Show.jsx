import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PartnerShow({ partner }) {
    return (
        <>
            <Head title={partner.name} />

            <div className="mx-auto max-w-3xl">
                <Link href={route('member.partners.index')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink">
                    ← Back to partners
                </Link>

                <div className="card-surface overflow-hidden">
                    <div className="flex flex-col gap-6 bg-ink p-8 text-paper sm:flex-row sm:items-center sm:gap-8 sm:p-10">
                        {partner.logo_url ? (
                            <img src={partner.logo_url} alt={partner.name} className="h-20 w-20 rounded-2xl object-cover" />
                        ) : (
                            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/15 font-display text-3xl font-bold text-gold-light">
                                {partner.name.charAt(0)}
                            </span>
                        )}
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">{partner.category}</p>
                            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{partner.name}</h1>
                            <p className="mt-2 text-paper/70">{partner.description}</p>
                        </div>
                    </div>

                    <div className="grid gap-8 p-8 sm:p-10 md:grid-cols-2">
                        <div>
                            <p className="eyebrow">Information</p>
                            <dl className="mt-3 space-y-3 text-sm">
                                <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate">Address</dt><dd>{partner.address || '-'}</dd></div>
                                <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate">Phone</dt><dd className="font-mono">{partner.phone || '-'}</dd></div>
                                <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate">Email</dt><dd>{partner.email || '-'}</dd></div>
                            </dl>
                        </div>

                        <div>
                            <p className="eyebrow">Active promos here</p>
                            <div className="mt-3 space-y-3">
                                {partner.promos.length === 0 ? (
                                    <p className="text-sm text-slate">No active promos right now.</p>
                                ) : (
                                    partner.promos.map((promo) => (
                                        <Link key={promo.id} href={route('member.promos.show', promo.id)} className="block rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:border-gold/40">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-display text-lg font-bold text-gold-deep">
                                                    {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)}
                                                </span>
                                                <span className="text-xs text-slate">{formatDate(promo.start_date)} — {formatDate(promo.end_date)}</span>
                                            </div>
                                            <p className="mt-1 text-sm font-medium">{promo.title}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Reveal className="mt-8">
                    <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6 text-center">
                        <p className="text-sm text-ink">
                            Show your digital card at the counter to use a promo. Make sure your membership status is <span className="font-semibold">ACTIVE</span>.
                        </p>
                    </div>
                </Reveal>
            </div>
        </>
    );
}

PartnerShow.layout = (page) => <MemberLayout>{page}</MemberLayout>;