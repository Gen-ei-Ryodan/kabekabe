import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';

const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const PORTAL_LABEL = {
    member: 'Member',
    partner: 'Partner',
    admin: 'Admin',
};

const PORTAL_TONE = {
    member: 'bg-sky-100 text-sky-800',
    partner: 'bg-amber-100 text-amber-800',
    admin: 'bg-ember/10 text-ember',
};

export default function LoginLogIndex({ logs, filters, stats = {} }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.login-logs.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.login-logs.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Log Aktivitas Login" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Keamanan</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Log Aktivitas Login</h1>
                        <p className="mt-2 text-sm text-slate">
                            Riwayat login seluruh pengguna (member, partner, admin): IP, perangkat, browser, dan lokasi.
                        </p>
                    </div>
                    <div className="flex gap-3 text-center">
                        <div className="card-surface px-4 py-2">
                            <p className="font-display text-xl font-bold text-ink">{stats.total ?? 0}</p>
                            <p className="text-[10px] uppercase tracking-wider text-slate">Total</p>
                        </div>
                        <div className="card-surface px-4 py-2">
                            <p className="font-display text-xl font-bold text-ink">{stats.today ?? 0}</p>
                            <p className="text-[10px] uppercase tracking-wider text-slate">Hari Ini</p>
                        </div>
                        <div className="card-surface px-4 py-2">
                            <p className="font-display text-xl font-bold text-ink">{stats.unique_users ?? 0}</p>
                            <p className="text-[10px] uppercase tracking-wider text-slate">Pengguna 7 Hari</p>
                        </div>
                    </div>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="label">Cari</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Nama / email / kode member / IP"
                                value={filter.data.search || ''}
                                onChange={(e) => filter.setData('search', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">Role</label>
                            <select className="input" value={filter.data.role || ''} onChange={(e) => filter.setData('role', e.target.value)}>
                                <option value="">Semua Role</option>
                                <option value="member">Member</option>
                                <option value="vendor">Partner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Portal</label>
                            <select className="input" value={filter.data.portal || ''} onChange={(e) => filter.setData('portal', e.target.value)}>
                                <option value="">Semua Portal</option>
                                <option value="member">Member</option>
                                <option value="partner">Partner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Dari tanggal</label>
                            <input type="date" className="input" value={filter.data.from || ''} onChange={(e) => filter.setData('from', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Sampai tanggal</label>
                            <input type="date" className="input" value={filter.data.to || ''} onChange={(e) => filter.setData('to', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Atur Ulang</button>
                    </div>
                </form>

                {logs.data.length === 0 ? (
                    <EmptyState title="Belum ada aktivitas login" description="Log akan muncul setiap kali ada pengguna yang login." />
                ) : (
                    <div className="card-surface overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-ink/10 bg-paper/60">
                                <tr>
                                    <th className="table-head px-4 py-3">Waktu Login</th>
                                    <th className="table-head px-4 py-3">Pengguna</th>
                                    <th className="table-head px-4 py-3">Portal</th>
                                    <th className="table-head px-4 py-3">Perangkat</th>
                                    <th className="table-head px-4 py-3">Browser / OS</th>
                                    <th className="table-head px-4 py-3">IP Address</th>
                                    <th className="table-head px-4 py-3">Lokasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="transition-colors hover:bg-paper/50">
                                        <td className="px-4 py-3 font-mono text-xs text-slate">{formatDateTime(log.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-ink">{log.user?.name || '-'}</p>
                                            <p className="font-mono text-[10px] text-slate">{log.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PORTAL_TONE[log.portal] || 'bg-paper text-slate'}`}>
                                                {PORTAL_LABEL[log.portal] || log.portal}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate">{log.device || '-'}</td>
                                        <td className="px-4 py-3 text-slate">
                                            <p className="font-medium text-ink">{log.browser || '-'}</p>
                                            <p className="text-[11px]">{log.platform || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate">{log.ip_address || '-'}</td>
                                        <td className="px-4 py-3 text-xs text-slate">{log.location || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination links={logs.links} />
            </div>
        </>
    );
}

LoginLogIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
