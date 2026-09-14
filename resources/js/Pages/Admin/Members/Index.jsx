import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import MemberDrawer from '@/Components/Admin/MemberDrawer';
import ImportDrawer from '@/Components/Admin/ImportDrawer';
import Avatar from '@/Components/Avatar';

export default function MemberIndex({ members, filters, drawer, pending_count = 0 }) {
    const filter = useForm(filters);
    const [importOpen, setImportOpen] = useState(false);

    const setQuickTab = (statusVal) => {
        router.get(route('admin.members.index'), { status: statusVal }, { preserveState: true, replace: true });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.members.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.members.index'), {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        router.get(route('admin.members.index'), { drawer: 'create' }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openShow = (id) => {
        router.get(route('admin.members.index'), { drawer: 'show', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.members.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.members.index'), { ...filters }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const currentStatus = filters.status || '';

    return (
        <>
            <Head title="Member" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Manajemen Member</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Member</h1>
                        <p className="mt-2 text-sm text-slate">Kelola member, persetujuan pendaftaran, dan keanggotaan.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setImportOpen(true)} className="btn-ghost">Impor</button>
                        <button onClick={openCreate} className="btn-gold">+ Tambah Member</button>
                    </div>
                </header>

                {/* Quick Status Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-3">
                    <button
                        onClick={() => setQuickTab('')}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            currentStatus === '' ? 'bg-ink text-paper shadow-sm' : 'bg-paper text-slate hover:bg-white hover:text-ink'
                        }`}
                    >
                        Semua Member
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
                        Member Aktif
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

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-4 p-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="label">Cari</label>
                            <input type="text" className="input" placeholder="Nama / email / ID member" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Nama</label>
                            <input type="text" className="input" placeholder="Nama member" value={filter.data.name || ''} onChange={(e) => filter.setData('name', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">ID Member</label>
                            <input type="text" className="input" placeholder="7030260001" value={filter.data.member_id || ''} onChange={(e) => filter.setData('member_id', e.target.value)} />
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
                        <div>
                            <label className="label">Berlaku dari</label>
                            <input type="date" className="input" value={filter.data.valid_from || ''} onChange={(e) => filter.setData('valid_from', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Berlaku sampai</label>
                            <input type="date" className="input" value={filter.data.valid_to || ''} onChange={(e) => filter.setData('valid_to', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Bergabung dari</label>
                            <input type="date" className="input" value={filter.data.joined_from || ''} onChange={(e) => filter.setData('joined_from', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Bergabung sampai</label>
                            <input type="date" className="input" value={filter.data.joined_to || ''} onChange={(e) => filter.setData('joined_to', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-2 self-end">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Atur Ulang</button>
                    </div>
                </form>

                {members.data.length === 0 ? (
                    <EmptyState
                        title="Member tidak ditemukan"
                        description="Belum ada member yang sesuai dengan filter ini."
                        action={<button onClick={openCreate} className="btn-gold">Tambah Member</button>}
                    />
                ) : (
                    <div className="card-surface overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-ink/10 bg-paper/60">
                                <tr>
                                    <th className="table-head px-4 py-3">Member</th>
                                    <th className="table-head px-4 py-3">ID Member</th>
                                    <th className="table-head px-4 py-3">Kontak</th>
                                    <th className="table-head px-4 py-3">Status</th>
                                    <th className="table-head px-4 py-3">Berlaku Hingga</th>
                                    <th className="table-head px-4 py-3">Bergabung</th>
                                    <th className="table-head px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {members.data.map((member) => (
                                    <tr key={member.id} className="transition-colors hover:bg-paper/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={member.avatar_url} name={member.name} tone="dark" className="h-9 w-9 rounded-full text-sm" />
                                                <span className="font-medium">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{member.member_code || '-'}</td>
                                        <td className="px-4 py-3 text-slate">
                                            <p>{member.email}</p>
                                            <p className="font-mono text-[10px]">{member.whatsapp || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {member.approval_status === 'pending' ? (
                                                <StatusChip status="pending" label="Menunggu Persetujuan" pulse />
                                            ) : member.approval_status === 'rejected' ? (
                                                <StatusChip status="rejected" label="Ditolak" />
                                            ) : (
                                                <StatusChip
                                                    status={member.membership_status}
                                                    label={member.membership_status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                    pulse={member.membership_status === 'active'}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{member.expires_at || '-'}</td>
                                        <td className="px-4 py-3 text-slate">{member.created_at}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {member.approval_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => router.put(route('admin.members.approve', member.id), {}, { preserveScroll: true })}
                                                            className="rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-ink hover:bg-gold-light transition-colors"
                                                            title="Setujui pendaftaran member"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Tolak pendaftaran member ${member.name}?`)) {
                                                                    router.put(route('admin.members.reject', member.id), {}, { preserveScroll: true });
                                                                }
                                                            }}
                                                            className="rounded-lg bg-ember/10 px-2.5 py-1 text-xs font-semibold text-ember hover:bg-ember/20 transition-colors"
                                                            title="Tolak pendaftaran member"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => openShow(member.id)} className="text-sm font-medium text-gold-deep hover:underline">
                                                    Lihat →
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination links={members.links} />
            </div>

            <MemberDrawer drawer={drawer} onClose={closeDrawer} onEdit={() => openEdit(drawer?.member?.id)} />
            {importOpen && (
                <ImportDrawer
                    title="Impor Member"
                    subtitle="Buat banyak member sekaligus dari file spreadsheet."
                    columns={['Nama*', 'Email*', 'Password', 'Telepon', 'WhatsApp', 'Perusahaan', 'Berlaku Hingga*']}
                    templateHref={route('admin.members.import.template')}
                    uploadRoute={route('admin.members.import')}
                    onClose={() => setImportOpen(false)}
                />
            )}
        </>
    );
}

MemberIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
