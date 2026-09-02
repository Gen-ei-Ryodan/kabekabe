import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import CommunityDrawer from '@/Components/Admin/CommunityDrawer';
import { formatDate } from '@/Utils/format';

const TYPE_LABELS = {
    event: 'Event',
    agenda: 'Agenda',
};

export default function CommunityIndex({ infos, filters, drawer }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.community.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.community.index'), { type: filters.type || undefined }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        router.get(route('admin.community.index'), { drawer: 'create' }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.community.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.community.index'), { ...filters }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };
    return (
        <>
            <Head title="Community" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Agenda Kegiatan</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Agenda Kegiatan</h1>
                        <p className="mt-2 text-sm text-slate">Manage events, attendance, and contribution billing.</p>
                    </div>
                    <button onClick={openCreate} className="btn-gold">+ Create Agenda</button>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="label">Search</label>
                            <input type="text" className="input" placeholder="Title" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Type</label>
                            <select className="input" value={filter.data.type || ''} onChange={(e) => filter.setData('type', e.target.value)}>
                                <option value="">All</option>
                                <option value="event">Event</option>
                                <option value="agenda">Agenda</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">All</option>
                                <option value="published">Published</option>
                                <option value="unpublished">Draft</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                {infos.data.length === 0 ? (
                    <EmptyState title="No agenda yet" description="Create the first event agenda." action={<button onClick={openCreate} className="btn-gold">Create agenda</button>} />
                ) : (
                    <div className="space-y-3">
                        {infos.data.map((info) => (
                            <div key={info.id} className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    {info.image_url ? (
                                        <img src={info.image_url} alt={info.title} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                                    ) : (
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-paper font-display text-lg font-bold text-slate">{TYPE_LABELS[info.type]?.[0]}</span>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[11px] text-slate">{TYPE_LABELS[info.type] || info.type}</span>
                                            <StatusChip status={info.is_published ? 'active' : 'inactive'} label={info.is_published ? 'Published' : 'Draft'} pulse={info.is_published} />
                                        </div>
                                        <h3 className="mt-1 truncate font-display text-lg font-bold">{info.title}</h3>
                                        <p className="text-xs text-slate">
                                            {info.event_date ? formatDate(info.event_date) : formatDate(info.published_at)} · by {info.creator?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Link href={route('admin.community.show', info.id)} className="btn-ghost text-xs">View</Link>
                                    <button onClick={() => openEdit(info.id)} className="btn-ghost text-xs">Edit</button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this agenda?')) router.delete(route('admin.community.destroy', info.id));
                                        }}
                                        className="btn-danger text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination links={infos.links} />
            </div>

            <CommunityDrawer drawer={drawer} onClose={closeDrawer} />
        </>
    );
}

CommunityIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;