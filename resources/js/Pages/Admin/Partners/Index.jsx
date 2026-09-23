import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import PartnerDrawer from '@/Components/Admin/PartnerDrawer';

export default function PartnerIndex({ partners, filters, categories = [], drawer, pending_count = 0 }) {
    const filter = useForm(filters);
    const [approveTarget, setApproveTarget] = useState(null);
    const [memberQuery, setMemberQuery] = useState('');
    const [memberResults, setMemberResults] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        if (!approveTarget || memberQuery.trim() === '') {
            setMemberResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${route('admin.members.search')}?q=${encodeURIComponent(memberQuery)}`,
                    { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } },
                );
                if (res.ok) setMemberResults(await res.json());
            } catch {
                setMemberResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [memberQuery, approveTarget]);

    const closeApproveModal = () => {
        setApproveTarget(null);
        setMemberQuery('');
        setMemberResults([]);
        setSelectedMember(null);
    };

    const confirmApprove = () => {
        router.put(
            route('admin.partners.approve', approveTarget.id),
            selectedMember ? { member_user_id: selectedMember.id } : {},
            { preserveScroll: true, onSuccess: closeApproveModal },
        );
    };

    const setQuickTab = (statusVal) => {
        router.get(route('admin.partners.index'), { status: statusVal }, { preserveState: true, replace: true });
    };

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

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const currentStatus = filters.status || '';

    return (
        <>
            <Head title="Partner" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Manajemen Partner</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Partner & Merchant</h1>
                        <p className="mt-2 text-sm text-slate">Kelola mitra usaha partner, persetujuan pendaftaran, dan benefit diskon.</p>
                    </div>
                    <button onClick={openCreate} className="btn-gold">+ Tambah Partner</button>
                </header>

                {/* Quick Status Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-3">
                    <button
                        onClick={() => setQuickTab('')}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            currentStatus === '' ? 'bg-ink text-paper shadow-sm' : 'bg-paper text-slate hover:bg-white hover:text-ink'
                        }`}
                    >
                        Semua Partner
                    </button>
                    <button
                        onClick={() => setQuickTab('pending')}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            currentStatus === 'pending'
                                ? 'bg-amber-500 text-ink shadow-sm'
                                : 'bg-paper text-slate hover:bg-amber-50 hover:text-amber-900'
                        }`}
                    >
                        <span>Menunggu Persetujuan</span>
                        {pending_count > 0 && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                currentStatus === 'pending' ? 'bg-ink text-paper' : 'bg-amber-400 text-ink'
                            }`}>
                                {pending_count}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setQuickTab('active')}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            currentStatus === 'active' ? 'bg-ink text-paper shadow-sm' : 'bg-paper text-slate hover:bg-white hover:text-ink'
                        }`}
                    >
                        Partner Aktif
                    </button>
                    <button
                        onClick={() => setQuickTab('inactive')}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            currentStatus === 'inactive' ? 'bg-ink text-paper shadow-sm' : 'bg-paper text-slate hover:bg-white hover:text-ink'
                        }`}
                    >
                        Tidak Aktif
                    </button>
                </div>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="label">Cari</label>
                            <input type="text" className="input" placeholder="Nama / kategori" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input" value={filter.data.category || ''} onChange={(e) => filter.setData('category', e.target.value)}>
                                <option value="">Semua</option>
                                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="pending">Menunggu Persetujuan</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Atur Ulang</button>
                    </div>
                </form>

                {partners.data.length === 0 ? (
                    <EmptyState
                        title="Partner tidak ditemukan"
                        description="Belum ada partner yang sesuai dengan filter ini."
                        action={<button onClick={openCreate} className="btn-gold">Tambah Partner</button>}
                    />
                ) : (
                    <div className="card-surface overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-ink/10 bg-paper/60">
                                <tr>
                                    <th className="table-head px-4 py-3">Partner</th>
                                    <th className="table-head px-4 py-3">Kategori</th>
                                    <th className="table-head px-4 py-3">PIC / Kontak</th>
                                    <th className="table-head px-4 py-3">Tgl Bergabung</th>
                                    <th className="table-head px-4 py-3">Tgl Berakhir</th>
                                    <th className="table-head px-4 py-3">Status</th>
                                    <th className="table-head px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {partners.data.map((partner) => {
                                    const isPending = partner.user?.approval_status === 'pending' || (partner.status === 'inactive' && partner.user?.approval_status === 'pending');
                                    const isRejected = partner.user?.approval_status === 'rejected';

                                    return (
                                        <tr key={partner.id} className="transition-colors hover:bg-paper/50">
                                            <td className="px-4 py-3">
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
                                                        <p className="line-clamp-1 max-w-xs text-xs text-slate">{partner.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate">
                                                <p className="font-medium text-ink">{partner.category}</p>
                                                {partner.industry && <p className="text-[11px] text-slate">{partner.industry}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-slate">
                                                <p className="font-medium text-ink">{partner.pic_name || partner.user?.name || '-'}</p>
                                                <p className="font-mono text-[11px]">{partner.user?.email || partner.email || '-'}</p>
                                                {(partner.pic_phone || partner.phone) && (
                                                    <p className="font-mono text-[10px] text-slate">{partner.pic_phone || partner.phone}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate">{formatDate(partner.joined_at)}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate">{formatDate(partner.expires_at)}</td>
                                            <td className="px-4 py-3">
                                                {isPending ? (
                                                    <StatusChip status="pending" label="Menunggu Persetujuan" pulse />
                                                ) : isRejected ? (
                                                    <StatusChip status="rejected" label="Ditolak" />
                                                ) : (
                                                    <StatusChip status={partner.is_active ? 'active' : 'inactive'} label={partner.is_active ? 'Aktif' : 'Tidak Aktif'} pulse={partner.is_active} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isPending ? (
                                                        <>
                                                            <button
                                                                onClick={() => setApproveTarget(partner)}
                                                                className="rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-ink hover:bg-gold-light transition-colors"
                                                                title="Setujui partner dan aktifkan akun vendor"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Tolak pendaftaran partner ${partner.name}?`)) {
                                                                        router.put(route('admin.partners.reject', partner.id), {}, { preserveScroll: true });
                                                                    }
                                                                }}
                                                                className="rounded-lg bg-ember/10 px-2.5 py-1 text-xs font-semibold text-ember hover:bg-ember/20 transition-colors"
                                                                title="Tolak pendaftaran partner"
                                                            >
                                                                Tolak
                                                            </button>
                                                            <button onClick={() => openEdit(partner.id)} className="btn-ghost text-xs">Edit</button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Hapus partner ${partner.name}?`)) router.delete(route('admin.partners.destroy', partner.id));
                                                                }}
                                                                className="btn-danger text-xs"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Link href={route('admin.partners.show', partner.id)} className="btn-ghost text-xs">Lihat</Link>
                                                            <button onClick={() => openEdit(partner.id)} className="btn-ghost text-xs">Edit</button>
                                                            <button
                                                                onClick={() => router.put(route('admin.partners.toggle', partner.id), { is_active: !partner.is_active }, { preserveScroll: true })}
                                                                className="btn-ghost text-xs"
                                                            >
                                                                {partner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Hapus partner ${partner.name}?`)) router.delete(route('admin.partners.destroy', partner.id));
                                                                }}
                                                                className="btn-danger text-xs"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination links={partners.links} />
            </div>

            <PartnerDrawer drawer={drawer} onClose={closeDrawer} />

            <Modal show={!!approveTarget} maxWidth="lg" onClose={closeApproveModal}>
                {approveTarget && (
                    <div className="p-6">
                        <h2 className="font-display text-xl font-bold text-ink">Setujui Partner</h2>
                        <p className="mt-1 text-sm text-slate">
                            Pendaftaran <span className="font-semibold text-ink">{approveTarget.name}</span> akan
                            disetujui dan akun vendor diaktifkan.
                        </p>

                        <div className="mt-5">
                            <label className="label" htmlFor="approve-member-search">
                                Kaitkan ke member (opsional)
                            </label>
                            <input
                                id="approve-member-search"
                                type="text"
                                className="input"
                                placeholder="Cari nama / kode member…"
                                value={memberQuery}
                                onChange={(e) => {
                                    setMemberQuery(e.target.value);
                                    setSelectedMember(null);
                                }}
                            />
                            <a
                                href={route('admin.members.index')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-block text-xs font-semibold text-gold-deep hover:underline"
                            >
                                Buka halaman pencarian member →
                            </a>

                            {memberResults.length > 0 && !selectedMember && (
                                <ul className="mt-2 max-h-48 divide-y divide-ink/5 overflow-y-auto rounded-xl border border-ink/10">
                                    {memberResults.map((m) => (
                                        <li key={m.id}>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedMember(m)}
                                                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-paper/60"
                                            >
                                                <span className="font-medium text-ink">{m.name}</span>
                                                <span className="font-mono text-xs text-slate">{m.member_code}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {memberQuery.trim() !== '' && memberResults.length === 0 && !selectedMember && (
                                <p className="mt-2 text-xs italic text-slate">Member tidak ditemukan.</p>
                            )}

                            {selectedMember && (
                                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-sm">
                                    <span className="font-semibold text-ink">{selectedMember.name}</span>
                                    <span className="font-mono text-xs text-slate">{selectedMember.member_code}</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMember(null)}
                                        className="text-xs font-semibold text-ember hover:underline"
                                    >
                                        Ganti
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={closeApproveModal} className="btn-ghost text-xs">
                                Batal
                            </button>
                            <button onClick={confirmApprove} className="btn-gold text-xs">
                                Setujui
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

PartnerIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
