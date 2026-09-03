import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function CommunityShow({ event, members }) {
    const [activeTab, setActiveTab] = useState('attendance');

    const memberForm = useForm({ member_id: '' });
    const nonMemberForm = useForm({ name: '', phone: '', email: '' });
    const paymentForm = useForm({ member_id: '' });

    const handleScan = (decodedText) => {
        const token = String(decodedText || '').trim().replace(/^https?:\/\/[^/]+\//, '').split('/').pop();
        if (!token) return;
        router.post(route('admin.community.attendance.scan', event.id), { token }, {
            preserveScroll: true,
        });
    };

    const handleMemberAttendance = (e) => {
        e.preventDefault();
        memberForm.post(route('admin.community.attendance.store', event.id), {
            preserveScroll: true,
            onSuccess: () => memberForm.reset('member_id'),
        });
    };

    const handleNonMember = (e) => {
        e.preventDefault();
        nonMemberForm.post(route('admin.community.attendance.store', event.id), {
            preserveScroll: true,
            onSuccess: () => nonMemberForm.reset(),
        });
    };

    const handlePayment = (memberId) => {
        if (!confirm('Create contribution bill for this member?')) return;
        router.post(route('admin.community.payment.store', event.id), { member_id: memberId }, { preserveScroll: true });
    };

    const attendedMemberIds = event.member_attendees.map((a) => a.member_id);
    const unpaidMembers = event.member_attendees.filter((a) => !a.billed);

    return (
        <>
            <Head title={event.title} />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Events & Activities</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{event.title}</h1>
                        <p className="mt-2 text-sm text-slate">
                            {formatDate(event.event_date, true)} · {event.location || 'No location'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.community.index')} className="btn-ghost text-xs">Back</Link>
                        <Link href={route('admin.community.edit', event.id)} className="btn-ink text-xs">Edit</Link>
                    </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="card-surface p-4">
                        <p className="eyebrow">Status</p>
                        <StatusChip status={event.is_published ? 'active' : 'inactive'} label={event.is_published ? 'Published' : 'Draft'} pulse={event.is_published} />
                    </div>
                    <div className="card-surface p-4">
                        <p className="eyebrow">Contribution Fee</p>
                        <p className="font-display text-2xl font-bold">{event.fee ? formatRupiah(event.fee) : 'Free'}</p>
                    </div>
                    <div className="card-surface p-4">
                        <p className="eyebrow">Total Attendees</p>
                        <p className="font-display text-2xl font-bold">{event.member_attendees.length + event.non_member_attendees.length}</p>
                    </div>
                </div>

                <div className="border-b border-ink/10">
                    <div className="flex gap-2">
                        {[
                            { key: 'attendance', label: 'Attendance' },
                            { key: 'billing', label: 'Member Billing' },
                            { key: 'non_members', label: 'Non-Member Participants' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? 'text-ink' : 'text-slate hover:text-ink'}`}
                            >
                                {tab.label}
                                {activeTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gold" />}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'attendance' && (
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="card-surface p-5">
                                <h3 className="font-display font-bold">Scan Member Card</h3>
                                <p className="mt-1 text-xs text-slate">Point the camera at the QR code on the member card.</p>
                                <div className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-ink">
                                    <Scanner onScan={(result) => { const first = Array.isArray(result) ? result[0] : result; handleScan(first?.rawValue || first?.toString()); }} constraints={{ facingMode: 'environment' }} formats={['qr_code']} styles={{ container: { height: 280 } }} />
                                </div>
                            </div>

                            <form onSubmit={handleMemberAttendance} className="card-surface p-5">
                                <h3 className="font-display font-bold">Manual Member Input</h3>
                                <p className="mt-1 text-xs text-slate">Select member from the list.</p>
                                <div className="mt-3 flex gap-2">
                                    <select className="input" value={memberForm.data.member_id} onChange={(e) => memberForm.setData('member_id', e.target.value)}>
                                        <option value="">Select member</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id} disabled={attendedMemberIds.includes(m.id)}>
                                                {m.name} ({m.member_code}) {attendedMemberIds.includes(m.id) ? '— attended' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="btn-ink text-xs" disabled={memberForm.processing || !memberForm.data.member_id}>Record</button>
                                </div>
                            </form>
                        </div>

                        <form onSubmit={handleNonMember} className="card-surface p-5">
                            <h3 className="font-display font-bold">Non-Member Attendance</h3>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <input type="text" className="input" placeholder="Name" value={nonMemberForm.data.name} onChange={(e) => nonMemberForm.setData('name', e.target.value)} />
                                <input type="text" className="input" placeholder="Phone" value={nonMemberForm.data.phone} onChange={(e) => nonMemberForm.setData('phone', e.target.value)} />
                                <input type="email" className="input" placeholder="Email" value={nonMemberForm.data.email} onChange={(e) => nonMemberForm.setData('email', e.target.value)} />
                            </div>
                            <button type="submit" className="btn-ink mt-3 text-xs" disabled={nonMemberForm.processing || !nonMemberForm.data.name}>Record Non-Member</button>
                        </form>

                        <div className="card-surface overflow-x-auto p-5">
                            <h3 className="font-display font-bold">Attendee List</h3>
                            <table className="mt-3 w-full text-left text-sm">
                                <thead className="border-b border-ink/10">
                                    <tr>
                                        <th className="table-head px-2 py-2">Name</th>
                                        <th className="table-head px-2 py-2">Type</th>
                                        <th className="table-head px-2 py-2">Contact</th>
                                        <th className="table-head px-2 py-2">Recorded At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink/5">
                                    {event.member_attendees.length === 0 && event.non_member_attendees.length === 0 ? (
                                        <tr><td colSpan={4} className="px-2 py-4 text-center text-sm text-slate">No attendees recorded yet.</td></tr>
                                    ) : (
                                        <>
                                            {event.member_attendees.map((a) => (
                                                <tr key={a.id}>
                                                    <td className="px-2 py-2 font-semibold">{a.name}</td>
                                                    <td className="px-2 py-2"><span className="chip border border-gold/30 bg-gold/15 text-gold-deep">Member</span></td>
                                                    <td className="px-2 py-2 font-mono text-xs">{a.member_code}</td>
                                                    <td className="px-2 py-2 text-slate">{formatDate(a.scanned_at, true)}</td>
                                                </tr>
                                            ))}
                                            {event.non_member_attendees.map((n) => (
                                                <tr key={n.id}>
                                                    <td className="px-2 py-2 font-semibold">{n.name}</td>
                                                    <td className="px-2 py-2"><span className="chip border border-slate/30 bg-slate/15 text-slate">Non-Member</span></td>
                                                    <td className="px-2 py-2 text-xs">{n.phone || n.email || '-'}</td>
                                                    <td className="px-2 py-2 text-slate">{formatDate(n.attended_at, true)}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="card-surface p-5">
                        <h3 className="font-display font-bold">Contribution Billing (Urunan)</h3>
                        <p className="mt-1 text-xs text-slate">Create contribution bills for member attendees.</p>

                        <table className="mt-4 w-full text-left text-sm">
                            <thead className="border-b border-ink/10">
                                <tr>
                                    <th className="table-head px-2 py-2">Member</th>
                                    <th className="table-head px-2 py-2">Code</th>
                                    <th className="table-head px-2 py-2">Status</th>
                                    <th className="table-head px-2 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {event.member_attendees.length === 0 ? (
                                    <tr><td colSpan={4} className="px-2 py-4 text-center text-sm text-slate">No member attendees yet.</td></tr>
                                ) : (
                                    event.member_attendees.map((a) => (
                                        <tr key={a.id}>
                                            <td className="px-2 py-2 font-semibold">{a.name}</td>
                                            <td className="px-2 py-2 font-mono text-xs">{a.member_code}</td>
                                            <td className="px-2 py-2">
                                                {a.billed ? (
                                                    <span className="chip border border-sage/40 bg-sage/15 text-sage">Billed</span>
                                                ) : (
                                                    <span className="chip border border-ember/30 bg-ember/15 text-ember">Not billed</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                {!a.billed && event.fee > 0 && (
                                                    <button onClick={() => handlePayment(a.member_id)} className="btn-gold text-xs">Create Bill</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {event.payments.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-display font-bold">Recorded Payments</h4>
                                <table className="mt-2 w-full text-left text-sm">
                                    <thead className="border-b border-ink/10">
                                        <tr>
                                            <th className="table-head px-2 py-2">Invoice</th>
                                            <th className="table-head px-2 py-2">Member</th>
                                            <th className="table-head px-2 py-2 text-right">Amount</th>
                                            <th className="table-head px-2 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink/5">
                                        {event.payments.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-2 py-2 font-mono text-xs">{p.invoice_number}</td>
                                                <td className="px-2 py-2">{p.member_name}</td>
                                                <td className="px-2 py-2 text-right">{formatRupiah(p.amount)}</td>
                                                <td className="px-2 py-2"><StatusChip status={p.status} label={p.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'non_members' && (
                    <div className="card-surface p-5">
                        <h3 className="font-display font-bold">Non-Member Participants</h3>
                        <table className="mt-3 w-full text-left text-sm">
                            <thead className="border-b border-ink/10">
                                <tr>
                                    <th className="table-head px-2 py-2">Name</th>
                                    <th className="table-head px-2 py-2">Phone</th>
                                    <th className="table-head px-2 py-2">Email</th>
                                    <th className="table-head px-2 py-2">Attended</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {event.non_member_attendees.length === 0 ? (
                                    <tr><td colSpan={4} className="px-2 py-4 text-center text-sm text-slate">No non-member participants yet.</td></tr>
                                ) : (
                                    event.non_member_attendees.map((n) => (
                                        <tr key={n.id}>
                                            <td className="px-2 py-2 font-semibold">{n.name}</td>
                                            <td className="px-2 py-2">{n.phone || '-'}</td>
                                            <td className="px-2 py-2">{n.email || '-'}</td>
                                            <td className="px-2 py-2">{n.attended ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

CommunityShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;
