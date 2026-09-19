import { useState } from 'react';
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
            <Head title="Promo" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">Manajemen Promo</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Promo & Penawaran</h1>
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

                {promos.data.length === 0 ? (
                    <EmptyState title="Promo tidak ditemukan" description="Belum ada promo yang sesuai dengan filter ini." />
                ) : (
                    <div className="space-y-4">
                        {promos.data.map((promo) => (
                            <div key={promo.id} className="card-surface p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {typeof promo.sort_number === 'number' && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-xs font-bold text-gold-light">
                                                    #{promo.sort_number}
                                                </span>
                                            )}
                                            <InlineSortNumber promo={promo} />
                                            <StatusChip
                                                status={promo.status}
                                                label={promo.status === 'pending' ? 'Menunggu Persetujuan' : promo.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                            />
                                            {promo.is_active ? (
                                                <StatusChip status="active" label="Aktif" />
                                            ) : (
                                                <StatusChip status="inactive" label="Nonaktif" />
                                            )}
                                        </div>
                                        <h3 className="mt-2 font-display text-lg font-bold">{promo.title}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate">{promo.description}</p>
                                        <p className="mt-2 text-xs text-slate">
                                            {promo.partner?.name} · {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                                        </p>
                                        {promo.rejection_reason && (
                                            <p className="mt-2 rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">Alasan penolakan: {promo.rejection_reason}</p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                                        {promo.status === 'pending' && (
                                            <>
                                                <button onClick={() => router.put(route('admin.promos.approve', promo.id), {}, { preserveScroll: true })} className="btn-gold text-xs">Setujui</button>
                                                <button onClick={() => {
                                                    const reason = window.prompt('Alasan penolakan:');
                                                    if (reason) router.put(route('admin.promos.reject', promo.id), { reason }, { preserveScroll: true });
                                                }} className="btn-danger text-xs">Tolak</button>
                                            </>
                                        )}
                                        <button onClick={() => openEdit(promo.id)} className="btn-ghost text-xs">Detail / Edit</button>
                                        {promo.status === 'approved' && (
                                            <button onClick={() => router.put(route('admin.promos.toggle', promo.id), {}, { preserveScroll: true })} className="btn-ghost text-xs">
                                                {promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
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
