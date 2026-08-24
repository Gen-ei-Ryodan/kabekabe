import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import CommunityDrawer from '@/Components/Admin/CommunityDrawer';
import { formatDate } from '@/Utils/format';

const TYPE_LABELS = {
    event: 'Event',
    announcement: 'Announcement',
    news: 'News',
    agenda: 'Agenda',
};

export default function CommunityIndex({ infos, filters, drawer }) {
    const openCreate = () => {
        router.get(route('admin.community.index'), { drawer: 'create' }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.community.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.community.index'), { type: filters.type || undefined }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };
    return (
        <>
            <Head title="Community" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Community Content</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Community Content</h1>
                        <p className="mt-2 text-sm text-slate">Manage community events, announcements, and agenda.</p>
                    </div>
                    <button onClick={openCreate} className="btn-gold">+ Create Content</button>
                </header>

                <div className="flex flex-wrap gap-2">
                    {['all', 'event', 'announcement', 'news', 'agenda'].map((type) => (
                        <button
                            key={type}
                            onClick={() => router.get(route('admin.community.index'), { type: type === 'all' ? undefined : type }, { preserveState: true, replace: true })}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                (filters.type || 'all') === type ? 'bg-ink text-paper' : 'border border-ink/15 bg-white/70 text-slate hover:bg-white'
                            }`}
                        >
                            {type === 'all' ? 'All' : TYPE_LABELS[type] || type}
                        </button>
                    ))}
                </div>

                {infos.data.length === 0 ? (
                    <EmptyState title="No content yet" description="Create the first community content." action={<button onClick={openCreate} className="btn-gold">Create content</button>} />
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
                                    <button onClick={() => openEdit(info.id)} className="btn-ghost text-xs">Edit</button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this content?')) router.delete(route('admin.community.destroy', info.id));
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