import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import MemberDrawer from '@/Components/Admin/MemberDrawer';
import ImportDrawer from '@/Components/Admin/ImportDrawer';

export default function MemberIndex({ members, filters, drawer }) {
    const filter = useForm(filters);
    const [importOpen, setImportOpen] = useState(false);

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

    return (
        <>
            <Head title="Members" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Member Management</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Members</h1>
                        <p className="mt-2 text-sm text-slate">Manage members, status, and membership history.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setImportOpen(true)} className="btn-ghost">Import</button>
                        <button onClick={openCreate} className="btn-gold">+ Add Member</button>
                    </div>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="label">Search</label>
                            <input type="text" className="input" placeholder="Name / email / member ID" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
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

                {members.data.length === 0 ? (
                    <EmptyState
                        title="No members found"
                        description="No members match this filter yet."
                        action={<button onClick={openCreate} className="btn-gold">Add member</button>}
                    />
                ) : (
                    <div className="card-surface overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-ink/10 bg-paper/60">
                                <tr>
                                    <th className="table-head px-4 py-3">Member</th>
                                    <th className="table-head px-4 py-3">Member ID</th>
                                    <th className="table-head px-4 py-3">Contact</th>
                                    <th className="table-head px-4 py-3">Status</th>
                                    <th className="table-head px-4 py-3">Valid until</th>
                                    <th className="table-head px-4 py-3">Joined</th>
                                    <th className="table-head px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {members.data.map((member) => (
                                    <tr key={member.id} className="transition-colors hover:bg-paper/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.name} className="h-9 w-9 rounded-full object-cover" />
                                                ) : (
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-gold-light">{member.name.charAt(0)}</span>
                                                )}
                                                <span className="font-medium">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{member.member_code || '-'}</td>
                                        <td className="px-4 py-3 text-slate">
                                            <p>{member.email}</p>
                                            <p className="font-mono text-[10px]">{member.whatsapp || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3"><StatusChip status={member.membership_status} label={member.membership_status === 'active' ? 'Active' : 'Inactive'} pulse={member.membership_status === 'active'} /></td>
                                        <td className="px-4 py-3 font-mono text-xs">{member.expires_at || '-'}</td>
                                        <td className="px-4 py-3 text-slate">{member.created_at}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => openShow(member.id)} className="text-sm font-medium text-gold-deep">View →</button>
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
                    title="Import Members"
                    subtitle="Bulk-create members from a spreadsheet."
                    columns={['Name*', 'Email*', 'Password', 'Phone', 'WhatsApp', 'Company', 'Valid Until*']}
                    templateHref={route('admin.members.import.template')}
                    uploadRoute={route('admin.members.import')}
                    onClose={() => setImportOpen(false)}
                />
            )}
        </>
    );
}

MemberIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;