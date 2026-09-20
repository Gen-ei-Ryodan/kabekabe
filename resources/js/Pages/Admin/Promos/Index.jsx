import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import PromoDrawer from '@/Components/Admin/PromoDrawer';
import { formatDate } from '@/Utils/format';

function InlineSortNumber({ promo }) {
    const [val, setVal] = useState(promo.sort_number ?? '');
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        const num = val === '' ? null : parseInt(val, 10);
        if (num === (promo.sort_number ?? null)) return;
        setSaving(true);
        router.put(
            route('admin.promos.sort', promo.id),
            { sort_number: num },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <div className="flex items-center gap-1.5 bg-ink/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-ink/10">
            <span className="text-[11px] font-semibold text-slate">No. Urut:</span>
            <input
                type="number"
                min="1"
                placeholder="-"
                className="w-14 text-center text-xs font-bold py-1 px-1.5 rounded border border-ink/20 bg-white focus:border-gold focus:ring-1 focus:ring-gold"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSave();
                        e.target.blur();
                    }
                }}
            />
            {saving && <span className="text-[10px] text-gold animate-pulse">…</span>}
        </div>
    );
}

export default function PromoIndex({ promos, filters, drawer }) {
    const filter = useForm(filters);
    const [items, setItems] = useState(promos.data);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isReordering, setIsReordering] = useState(false);

    // Sync items if promos.data changes via pagination / filter
    useEffect(() => {
        setItems(promos.data);
    }, [promos.data]);

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

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Transparent drag ghost if needed
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        setDragOverIndex(null);
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);

        // Assign continuous sort numbers (1-indexed)
        const updatedPayload = newItems.map((p, idx) => ({
            id: p.id,
            sort_number: idx + 1,
        }));

        const itemsWithNewSort = newItems.map((p, idx) => ({
            ...p,
            sort_number: idx + 1,
        }));

        setItems(itemsWithNewSort);
        setDraggedIndex(null);
        setIsReordering(true);

        router.put(
            route('admin.promos.reorder'),
            { items: updatedPayload },
            {
                preserveScroll: true,
                onFinish: () => setIsReordering(false),
            }
        );
    };

    return (
        <>
            <Head title="Promo" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="eyebrow">Manajemen Promo</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Promo & Penawaran</h1>
                        <p className="mt-1 text-xs text-slate">
                            💡 Tarik (drag & drop) ikon <span className="font-bold text-ink">⋮⋮</span> untuk mengubah urutan promo.
                        </p>
                    </div>
                    {isReordering && (
                        <div className="flex items-center gap-2 rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-deep border border-gold/30">
                            <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
                            Menyimpan urutan baru...
                        </div>
                    )}
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label">Cari</label>
                            <input type="text" className="input" placeholder="Judul / partner" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">Semua</option>
                                <option value="pending">Menunggu Persetujuan</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Atur Ulang</button>
                    </div>
                </form>

                {items.length === 0 ? (
                    <EmptyState title="Promo tidak ditemukan" description="Belum ada promo yang sesuai dengan filter ini." />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/70 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-ink/10 bg-ink/5 font-display text-xs uppercase tracking-wider text-slate">
                                        <th scope="col" className="w-10 px-3 py-3.5 text-center"></th>
                                        <th scope="col" className="w-28 px-3 py-3.5">Urutan</th>
                                        <th scope="col" className="min-w-[220px] px-4 py-3.5">Promo & Mitra</th>
                                        <th scope="col" className="min-w-[140px] px-3 py-3.5">Periode</th>
                                        <th scope="col" className="min-w-[120px] px-3 py-3.5">Status</th>
                                        <th scope="col" className="px-4 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink/5 bg-white/60">
                                    {items.map((promo, index) => {
                                        const isDragging = draggedIndex === index;
                                        const isOver = dragOverIndex === index;

                                        return (
                                            <tr
                                                key={promo.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnd={() => {
                                                    setDraggedIndex(null);
                                                    setDragOverIndex(null);
                                                }}
                                                className={`transition-colors ${
                                                    isDragging
                                                        ? 'opacity-40 bg-gold/10'
                                                        : isOver
                                                        ? 'bg-gold/20 border-t-2 border-gold'
                                                        : 'hover:bg-ink/5'
                                                }`}
                                            >
                                                {/* Drag handle */}
                                                <td className="px-3 py-3.5 text-center">
                                                    <span
                                                        className="inline-flex cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-ink select-none"
                                                        title="Tarik untuk memindahkan urutan"
                                                    >
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-12a2 2 0 10.001 4.001A2 2 0 0013 2zm0 6a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
                                                        </svg>
                                                    </span>
                                                </td>

                                                {/* Urutan */}
                                                <td className="px-3 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-bold text-gold-light">
                                                            #{promo.sort_number ?? index + 1}
                                                        </span>
                                                        <InlineSortNumber promo={promo} />
                                                    </div>
                                                </td>

                                                {/* Promo & Mitra */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-start gap-3">
                                                        {promo.image_url ? (
                                                            <img
                                                                src={promo.image_url}
                                                                alt=""
                                                                className="h-11 w-11 rounded-lg object-cover border border-ink/10 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-deep font-bold text-sm">
                                                                %
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-display font-bold text-ink text-sm hover:text-gold-deep">
                                                                {promo.title}
                                                            </p>
                                                            <p className="text-xs text-slate mt-0.5">
                                                                {promo.partner?.name || 'Mitra Umum'}
                                                            </p>
                                                            {promo.rejection_reason && (
                                                                <p className="mt-1 text-[11px] text-ember font-medium">
                                                                    Ditolak: {promo.rejection_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Periode */}
                                                <td className="px-3 py-3.5 text-xs text-slate whitespace-nowrap">
                                                    <p className="font-medium text-ink">{formatDate(promo.start_date)}</p>
                                                    <p className="text-[11px] text-slate-500">s/d {formatDate(promo.end_date)}</p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-3.5">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <StatusChip
                                                            status={promo.status}
                                                            label={
                                                                promo.status === 'pending'
                                                                    ? 'Menunggu'
                                                                    : promo.status === 'approved'
                                                                    ? 'Disetujui'
                                                                    : 'Ditolak'
                                                            }
                                                        />
                                                        {promo.is_active ? (
                                                            <StatusChip status="active" label="Aktif" />
                                                        ) : (
                                                            <StatusChip status="inactive" label="Nonaktif" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {promo.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => router.put(route('admin.promos.approve', promo.id), {}, { preserveScroll: true })}
                                                                    className="btn-gold !py-1 !px-2.5 text-xs"
                                                                >
                                                                    Setujui
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const reason = window.prompt('Alasan penolakan:');
                                                                        if (reason) router.put(route('admin.promos.reject', promo.id), { reason }, { preserveScroll: true });
                                                                    }}
                                                                    className="btn-danger !py-1 !px-2.5 text-xs"
                                                                >
                                                                    Tolak
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => openEdit(promo.id)}
                                                            className="btn-ghost !py-1 !px-2.5 text-xs"
                                                        >
                                                            Detail / Edit
                                                        </button>
                                                        {promo.status === 'approved' && (
                                                            <button
                                                                onClick={() => router.put(route('admin.promos.toggle', promo.id), {}, { preserveScroll: true })}
                                                                className="btn-ghost !py-1 !px-2.5 text-xs"
                                                            >
                                                                {promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Pagination links={promos.links} />
            </div>

            <PromoDrawer drawer={drawer} onClose={closeDrawer} />
        </>
    );
}

PromoIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
