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

    const attendedMemberIds = event.member_attendees.map((a) => a.member_id);

    return (
        <>
            <Head title={event.title} />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Event & Aktivitas</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{event.title}</h1>
                        <p className="mt-2 text-sm text-slate">
                            {formatDate(event.event_date, true)} · {event.location || 'Lokasi belum ditentukan'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.community.index')} className="btn-ghost text-xs">Kembali</Link>
                        <Link href={route('admin.community.edit', event.id)} className="btn-ink text-xs">Edit</Link>
                    </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="card-surface p-4">
                        <p className="eyebrow">Status</p>
                        <StatusChip status={event.is_published ? 'active' : 'inactive'} label={event.is_published ? 'Diterbitkan' : 'Draf'} pulse={event.is_published} />
                    </div>
                    <div className="card-surface p-4">
                        <p className="eyebrow">Biaya Kontribusi</p>
                        <p className="font-display text-2xl font-bold">{event.fee ? formatRupiah(event.fee) : 'Gratis'}</p>
                    </div>
                    <div className="card-surface p-4">
                        <p className="eyebrow">Total Kehadiran</p>
                        <p className="font-display text-2xl font-bold">{event.member_attendees.length + event.non_member_attendees.length}</p>
                    </div>
                </div>

                <div className="border-b border-ink/10">
                    <div className="flex gap-2">
                        {[
                            { key: 'attendance', label: 'Presensi Kehadiran' },
                            { key: 'non_members', label: 'Peserta Non-Member' },
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
                                <h3 className="font-display font-bold">Pindai Kartu Member</h3>
                                <p className="mt-1 text-xs text-slate">Arahkan kamera ke kode QR pada kartu digital member.</p>
                                <div className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-ink">
                                    <Scanner onScan={(result) => { const first = Array.isArray(result) ? result[0] : result; handleScan(first?.rawValue || first?.toString()); }} constraints={{ facingMode: 'environment' }} formats={['qr_code']} styles={{ container: { height: 280 } }} />
                                </div>
                            </div>

                            <form onSubmit={handleMemberAttendance} className="card-surface p-5">
                                <h3 className="font-display font-bold">Input Manual Member</h3>
                                <p className="mt-1 text-xs text-slate">Pilih member dari daftar.</p>
                                <div className="mt-3 flex gap-2">
                                    <select className="input" value={memberForm.data.member_id} onChange={(e) => memberForm.setData('member_id', e.target.value)}>
                                        <option value="">Pilih member</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id} disabled={attendedMemberIds.includes(m.id)}>
                                                {m.name} ({m.member_code}) {attendedMemberIds.includes(m.id) ? '— sudah hadir' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="btn-ink text-xs" disabled={memberForm.processing || !memberForm.data.member_id}>Catat</button>
                                </div>
                            </form>
                        </div>

                        <form onSubmit={handleNonMember} className="card-surface p-5">
                            <h3 className="font-display font-bold">Presensi Non-Member</h3>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <input type="text" className="input" placeholder="Nama" value={nonMemberForm.data.name} onChange={(e) => nonMemberForm.setData('name', e.target.value)} />
                                <input type="text" className="input" placeholder="No. Telepon / WhatsApp" value={nonMemberForm.data.phone} onChange={(e) => nonMemberForm.setData('phone', e.target.value)} />
                                <input type="email" className="input" placeholder="Email" value={nonMemberForm.data.email} onChange={(e) => nonMemberForm.setData('email', e.target.value)} />
                            </div>
                            <button type="submit" className="btn-ink mt-3 text-xs" disabled={nonMemberForm.processing || !nonMemberForm.data.name}>Catat Non-Member</button>
                        </form>

                        <div className="card-surface overflow-x-auto p-5">
                            <h3 className="font-display font-bold">Daftar Kehadiran</h3>
                            <table className="mt-3 w-full text-left text-sm">
                                <thead className="border-b border-ink/10">
                                    <tr>
                                        <th className="table-head px-2 py-2">Nama</th>
                                        <th className="table-head px-2 py-2">Kategori</th>
                                        <th className="table-head px-2 py-2">Kontak / ID</th>
                                        <th className="table-head px-2 py-2">Waktu Hadir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink/5">
                                    {event.member_attendees.length === 0 && event.non_member_attendees.length === 0 ? (
                                        <tr><td colSpan={4} className="px-2 py-4 text-center text-sm text-slate">Belum ada kehadiran tercatat.</td></tr>
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

                {activeTab === 'non_members' && (
                    <div className="card-surface p-5">
                        <h3 className="font-display font-bold">Peserta Non-Member</h3>
                        <table className="mt-3 w-full text-left text-sm">
                            <thead className="border-b border-ink/10">
                                <tr>
                                    <th className="table-head px-2 py-2">Nama</th>
                                    <th className="table-head px-2 py-2">Telepon</th>
                                    <th className="table-head px-2 py-2">Email</th>
                                    <th className="table-head px-2 py-2">Hadir</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {event.non_member_attendees.length === 0 ? (
                                    <tr><td colSpan={4} className="px-2 py-4 text-center text-sm text-slate">Belum ada data peserta non-member.</td></tr>
                                ) : (
                                    event.non_member_attendees.map((n) => (
                                        <tr key={n.id}>
                                            <td className="px-2 py-2 font-semibold">{n.name}</td>
                                            <td className="px-2 py-2">{n.phone || '-'}</td>
                                            <td className="px-2 py-2">{n.email || '-'}</td>
                                            <td className="px-2 py-2">{n.attended ? 'Ya' : 'Tidak'}</td>
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
