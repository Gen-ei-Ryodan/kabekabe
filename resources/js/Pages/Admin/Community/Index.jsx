import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import CommunityDrawer from '@/Components/Admin/CommunityDrawer';
import { formatDate } from '@/Utils/format';

const TYPE_LABELS = {
    event: 'Event',
    agenda: 'Aktivitas',
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
            <Head title="Event & Aktivitas" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Event & Aktivitas</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Event & Aktivitas</h1>
                        <p className="mt-2 text-sm text-slate">Kelola agenda kegiatan, kehadiran peserta, dan biaya kontribusi.</p>
                    </div>
                    <button onClick={openCreate} className="btn-gold">+ Buat Event</button>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="label">Cari</label>
                            <input type="text" className="input" placeholder="Judul acara" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input" value={filter.data.type || ''} onChange={(e) => filter.setData('type', e.target.value)}>
                                <option value="">Semua</option>
                                <option value="event">Event</option>
                                <option value="agenda">Aktivitas</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">Semua</option>
                                <option value="published">Diterbitkan</option>
                                <option value="unpublished">Draf</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Atur Ulang</button>
                    </div>
                </form>

                {infos.data.length === 0 ? (
                    <EmptyState title="Belum ada event" description="Buat agenda event atau aktivitas pertama Anda." action={<button onClick={openCreate} className="btn-gold">Buat Event</button>} />
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
                                            <StatusChip status={info.is_published ? 'active' : 'inactive'} label={info.is_published ? 'Diterbitkan' : 'Draf'} pulse={info.is_published} />
                                        </div>
                                        <h3 className="mt-1 truncate font-display text-lg font-bold">{info.title}</h3>
                                        <p className="text-xs text-slate">
                                            {info.event_date ? formatDate(info.event_date) : formatDate(info.published_at)} · oleh {info.creator?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Link href={route('admin.community.show', info.id)} className="btn-ghost text-xs">Lihat</Link>
                                    <button onClick={() => openEdit(info.id)} className="btn-ghost text-xs">Edit</button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Hapus event ini?')) router.delete(route('admin.community.destroy', info.id));
                                        }}
                                        className="btn-danger text-xs"
                                    >
                                        Hapus
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
