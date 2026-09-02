import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import EmptyState from '@/Components/EmptyState';
import HomeBannerDrawer from '@/Components/Admin/HomeBannerDrawer';

const TYPE_META = {
    promo: { label: 'Promo', chip: 'border-gold/30 bg-gold/15 text-gold-deep' },
    agenda: { label: 'Agenda', chip: 'border-sage/25 bg-sage/12 text-sage' },
};

const MAX_BANNERS = 3;

export default function BannersIndex({ banners = [], filters = {}, promos = [], agendas = [], drawer = null }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.banners.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.banners.index'), {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        router.get(route('admin.banners.index'), { drawer: 'create' }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.banners.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.banners.index'), {}, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const toggle = (banner) => {
        router.put(route('admin.banners.toggle', banner.id), {}, { preserveScroll: true });
    };

    const destroy = (banner) => {
        if (confirm(`Delete this banner?`)) {
            router.delete(route('admin.banners.destroy', banner.id), { preserveScroll: true });
        }
    };

    const atCapacity = banners.length >= MAX_BANNERS;

    return (
        <>
            <Head title="Home Banners" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Member Home</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Home Banners</h1>
                        <p className="mt-2 text-sm text-slate">
                            Curate up to three featured slots on the member home.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 sm:items-end">
                        <button
                            onClick={openCreate}
                            className="btn-gold"
                            disabled={atCapacity}
                            title={atCapacity ? 'Maximum of 3 banners. Deactivate or delete one first.' : undefined}
                        >
                            + Add Banner
                        </button>
                        {atCapacity && (
                            <p className="text-xs text-ember">
                                Slot full (3/3) — deactivate or delete a banner first.
                            </p>
                        )}
                    </div>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label">Type</label>
                            <select className="input" value={filter.data.type || ''} onChange={(e) => filter.setData('type', e.target.value)}>
                                <option value="">All</option>
                                <option value="promo">Promo</option>
                                <option value="agenda">Agenda</option>
                            </select>
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

                <div className="card-surface flex items-center justify-between gap-4 px-5 py-4">
                    <p className="text-sm text-slate">
                        <span className="font-display font-bold text-ink">{banners.length}</span> of{' '}
                        {MAX_BANNERS} featured slots in use.
                    </p>
                    <span className="chip border border-gold/30 bg-gold/15 text-gold-deep">Max {MAX_BANNERS}</span>
                </div>

                {banners.length === 0 ? (
                    <EmptyState
                        title="No banners yet"
                        description="Feature a promo or an agenda on the member home."
                        action={
                            <button onClick={openCreate} className="btn-gold">
                                Add banner
                            </button>
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-4">
                                    {banner.image_url ? (
                                        <img
                                            src={banner.image_url}
                                            alt=""
                                            className="h-11 w-11 shrink-0 rounded-xl border border-ink/10 object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-xs font-bold text-gold-light">
                                            #{String(banner.sort_order).padStart(2, '0')}
                                        </span>
                                    )}

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`chip border ${TYPE_META[banner.type]?.chip || ''}`}>
                                                {TYPE_META[banner.type]?.label || banner.type}
                                            </span>
                                            <StatusChip
                                                status={banner.is_active ? 'active' : 'inactive'}
                                                label={banner.is_active ? 'Active' : 'Inactive'}
                                                pulse={banner.is_active}
                                            />
                                        </div>
                                        <h3 className="mt-1 truncate font-display text-base font-bold text-ink">
                                            {banner.target_title}
                                        </h3>
                                        {banner.label && <p className="mt-0.5 truncate text-xs text-slate">{banner.label}</p>}
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <button onClick={() => openEdit(banner.id)} className="btn-ghost text-xs">
                                        Edit
                                    </button>
                                    <button onClick={() => toggle(banner)} className="btn-ghost text-xs">
                                        {banner.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => destroy(banner)} className="btn-danger text-xs">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <HomeBannerDrawer
                drawer={drawer}
                onClose={closeDrawer}
                promos={promos}
                agendas={agendas}
                nextSortOrder={banners.length + 1}
            />
        </>
    );
}

BannersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
