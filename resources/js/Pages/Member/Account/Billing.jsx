import { Head } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import StatusChip from '@/Components/StatusChip';

export default function Billing({ membership, plans }) {
    const isActive = membership.status === 'active';

    return (
        <>
            <Head title="Billing" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Account</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Billing Management</h1>
                </header>

                <div className="mt-8 space-y-8">
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-lg font-bold">Current Plan</h2>
                                <StatusChip tone={isActive ? 'active' : 'inactive'}>
                                    {membership.status_label}
                                </StatusChip>
                            </div>

                            {membership.plan ? (
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">Plan Name</p>
                                        <p className="mt-1 font-display text-xl font-bold">{membership.plan.name}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">Duration</p>
                                        <p className="mt-1 font-display text-xl font-bold">{membership.plan.duration_months} Months</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">Price</p>
                                        <p className="mt-1 font-display text-xl font-bold">Rp{membership.plan.price}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">Valid Until</p>
                                        <p className="mt-1 font-display text-xl font-bold">{membership.expires_at ?? '-'}</p>
                                        {isActive && membership.days_remaining !== null && membership.days_remaining >= 0 && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {membership.days_remaining} days remaining
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
                                    <p className="text-slate-500">You don't have an active plan yet.</p>
                                </div>
                            )}
                        </section>
                    </Reveal>

                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold">Renew / Extend Membership</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                {isActive
                                    ? 'Your membership is currently active. To extend your membership, please contact the admin for offline payment.'
                                    : 'Your membership is inactive. To activate or renew your membership, please contact the admin for offline payment.'}
                            </p>

                            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="mt-0.5 h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-amber-800">Offline Payment Only</p>
                                        <p className="mt-1 text-sm text-amber-700">
                                            Payments are made directly to the admin. The admin will record your payment and extend your membership automatically.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="mb-3 text-sm font-medium text-slate-700">Available Plans:</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className="rounded-lg border border-slate-200 p-4 transition hover:border-gold hover:bg-gold/5"
                                        >
                                            <p className="font-display font-bold">{plan.name}</p>
                                            <p className="mt-1 text-sm text-slate-600">{plan.duration_months} Months</p>
                                            <p className="mt-2 font-mono text-lg font-bold text-gold">Rp{plan.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </Reveal>
                </div>
            </div>
        </>
    );
}

Billing.layout = (page) => <MemberLayout>{page}</MemberLayout>;
