import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import PartnerDrawer from '@/Components/Admin/PartnerDrawer';

export default function PartnerIndex({ partners, filters, drawer }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.partners.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.partners.index'), {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        router.get(route('admin.partners.index'), { drawer: 'create' }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.partners.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.partners.index'), { ...filters }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Promo & Partner" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Partner Management</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Promo & Partner</h1>
                    </div>
                    <button onClick={openCreate} className="btn-gold">+ Add Partner</button>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label">Search</label>
                            <input type="text" className="input" placeholder="Name / category" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                {partners.data.length === 0 ? (
                    <EmptyState
                        title="No partners found"
                        description="No partners match this filter yet."
                        action={<button onClick={openCreate} className="btn-gold">Add partner</button>}
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {partners.data.map((partner, i) => (
                            <div key={partner.id} className="card-surface flex flex-col gap-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {typeof partner.sort_number === 'number' && (
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-bold text-gold-light">
                                                {partner.sort_number}
                                            </span>
                                        )}
                                        {partner.logo_url ? (
                                            <img src={partner.logo_url} alt={partner.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                                        ) : (
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-gold-light">{partner.name.charAt(0)}</span>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="truncate font-display font-bold text-ink">{partner.name}</h3>
                                            <p className="text-xs text-slate">{partner.category}</p>
                                        </div>
                                    </div>
                                    <StatusChip status={partner.is_active ? 'active' : 'inactive'} label={partner.is_active ? 'Active' : 'Inactive'} pulse={partner.is_active} />
                                </div>
                                <p className="line-clamp-2 text-xs text-slate">{partner.description}</p>
                                {partner.user && <p className="font-mono text-[10px] text-slate">Vendor: {partner.user.email}</p>}
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(partner.id)} className="btn-ghost flex-1 text-xs">Edit</button>
                                    <button
                                        onClick={() => router.put(route('admin.partners.toggle', partner.id), { is_active: !partner.is_active }, { preserveScroll: true })}
                                        className="btn-ghost flex-1 text-xs"
                                    >
                                        {partner.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete partner ${partner.name}?`)) router.delete(route('admin.partners.destroy', partner.id));
                                        }}
                                        className="btn-danger flex-1 text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination links={partners.links} />
            </div>

            <PartnerDrawer drawer={drawer} onClose={closeDrawer} />
        </>
    );
}

PartnerIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;