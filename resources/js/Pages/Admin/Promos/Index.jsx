import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import PromoDrawer from '@/Components/Admin/PromoDrawer';
import { formatDate } from '@/Utils/format';

export default function PromoIndex({ promos, filters, drawer }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.promos.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.promos.index'), { status: filters.status || undefined }, { preserveState: true, replace: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.promos.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.promos.index'), { status: filters.status || undefined }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Promo & Partner" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">Promo Management</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Promo & Partner</h1>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label">Search</label>
                            <input type="text" className="input" placeholder="Title / partner" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                {promos.data.length === 0 ? (
                    <EmptyState title="No promos found" description="No promos match this filter yet." />
                ) : (
                    <div className="space-y-4">
                        {promos.data.map((promo) => (
                            <div key={promo.id} className="card-surface p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {typeof promo.sort_number === 'number' && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-xs font-bold text-gold-light">
                                                    {promo.sort_number}
                                                </span>
                                            )}
                                            <StatusChip
                                                status={promo.status}
                                                label={promo.status === 'pending' ? 'Pending' : promo.status === 'approved' ? 'Approved' : 'Rejected'}
                                            />
                                            {promo.is_active && <StatusChip status="active" label="Active" />}
                                        </div>
                                        <h3 className="mt-2 font-display text-lg font-bold">{promo.title}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate">{promo.description}</p>
                                        <p className="mt-2 text-xs text-slate">
                                            {promo.partner?.name} · {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                                        </p>
                                        {promo.rejection_reason && (
                                            <p className="mt-2 rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">Rejection reason: {promo.rejection_reason}</p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                                        {promo.status === 'pending' && (
                                            <>
                                                <button onClick={() => router.put(route('admin.promos.approve', promo.id), {}, { preserveScroll: true })} className="btn-gold text-xs">Approve</button>
                                                <button onClick={() => {
                                                    const reason = window.prompt('Rejection reason:');
                                                    if (reason) router.put(route('admin.promos.reject', promo.id), { reason }, { preserveScroll: true });
                                                }} className="btn-danger text-xs">Reject</button>
                                            </>
                                        )}
                                        <button onClick={() => openEdit(promo.id)} className="btn-ghost text-xs">Detail/Edit</button>
                                        {promo.status === 'approved' && (
                                            <button onClick={() => router.put(route('admin.promos.toggle', promo.id), {}, { preserveScroll: true })} className="btn-ghost text-xs">
                                                {promo.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination links={promos.links} />
            </div>

            <PromoDrawer drawer={drawer} onClose={closeDrawer} />
        </>
    );
}

PromoIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;