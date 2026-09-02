import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import PaymentDrawer from '@/Components/Admin/PaymentDrawer';
import ImportDrawer from '@/Components/Admin/ImportDrawer';
import { formatDate, formatRupiah } from '@/Utils/format';

const STATUS_LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
};

export default function PaymentIndex({ payments, filters, drawer }) {
    const filter = useForm(filters);
    const [importOpen, setImportOpen] = useState(false);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.payments.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.payments.index'), { status: filters.status || 'pending' }, { preserveState: true, replace: true });
    };

    const openShow = (id) => {
        router.get(route('admin.payments.index'), { drawer: 'show', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.payments.index'), { status: filters.status || undefined }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Payments" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="eyebrow">Payment Management</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Payments</h1>
                        <p className="mt-2 text-sm text-slate">Review offline payments and approve them to extend membership.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setImportOpen(true)} className="btn-ghost">Import</button>
                        <Link href={route('admin.payments.create')} className="btn-gold">
                            Record Payment
                        </Link>
                    </div>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label">Search</label>
                            <input type="text" className="input" placeholder="Invoice / member / code" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || 'pending'} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                {payments.data.length === 0 ? (
                    <EmptyState title="No payments" description="There are no payments with this status." />
                ) : (
                    <div className="space-y-3">
                        {payments.data.map((payment) => (
                            <button onClick={() => openShow(payment.id)} className="card-surface flex w-full items-center justify-between gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs text-slate">#{payment.invoice_number}</span>
                                        <StatusChip status={payment.status} label={STATUS_LABELS[payment.status] || payment.status} pulse={payment.status === 'pending'} />
                                    </div>
                                    <p className="mt-1 truncate font-semibold">{payment.member?.name}</p>
                                    <p className="text-xs text-slate">{payment.plan?.name} · {formatDate(payment.created_at)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-display text-lg font-bold">{formatRupiah(payment.amount)}</p>
                                    <p className="text-xs text-slate">{formatDate(payment.paid_at)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <Pagination links={payments.links} />
            </div>

            <PaymentDrawer drawer={drawer} onClose={closeDrawer} />
            {importOpen && (
                <ImportDrawer
                    title="Import Payments"
                    subtitle="Bulk-record approved payments from a spreadsheet. Membership is extended automatically."
                    columns={['Member Code*', 'Plan', 'Period Months', 'Amount', 'Paid At']}
                    templateHref={route('admin.payments.import.template')}
                    uploadRoute={route('admin.payments.import')}
                    onClose={() => setImportOpen(false)}
                />
            )}
        </>
    );
}

PaymentIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
