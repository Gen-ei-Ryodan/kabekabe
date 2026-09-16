import { router, useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import StatusChip from '@/Components/StatusChip';
import Avatar from '@/Components/Avatar';
import { formatDate, formatRupiah } from '@/Utils/format';

import MemberForm from '@/Components/Admin/MemberForm';

function CreateMemberDrawer({ onClose }) {
    const form = useForm({
        name: '',
        nickname: '',
        gender: '',
        birth_date: '',
        birth_place: '',
        marital_status: '',
        religion: '',
        place_of_worship_address: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        whatsapp: '',
        address: '',
        district: '',
        city: '',
        company: '',
        industry: '',
        business_fields: [],
        business_address: '',
        business_district: '',
        business_city: '',
        hobbies: [],
        membership_period: '12',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.members.store'), { preserveScroll: true });
    };

    return (
        <MemberForm
            data={form.data}
            setData={form.setData}
            errors={form.errors}
            processing={form.processing}
            submitLabel="Tambah Member"
            onCancel={onClose}
            onSubmit={submit}
            isCreate={true}
        />
    );
}

function EditMemberDrawer({ member, onClose }) {
    const form = useForm({
        name: member.name || '',
        nickname: member.nickname || '',
        gender: member.gender || '',
        birth_date: member.birth_date || '',
        birth_place: member.birth_place || '',
        marital_status: member.marital_status || '',
        religion: member.religion || '',
        place_of_worship_address: member.place_of_worship_address || '',
        email: member.email || '',
        phone: member.phone || '',
        whatsapp: member.whatsapp || '',
        address: member.address || '',
        district: member.district || '',
        city: member.city || '',
        company: member.company || '',
        industry: member.industry || '',
        business_fields: Array.isArray(member.business_fields) ? member.business_fields : [],
        business_address: member.business_address || '',
        business_district: member.business_district || '',
        business_city: member.business_city || '',
        hobbies: Array.isArray(member.hobbies) ? member.hobbies : [],
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.members.update', member.id), { preserveScroll: true });
    };

    return (
        <MemberForm
            data={form.data}
            setData={form.setData}
            errors={form.errors}
            processing={form.processing}
            submitLabel="Simpan Perubahan"
            onCancel={onClose}
            onSubmit={submit}
            isCreate={false}
        />
    );
}

function ShowMemberDrawer({ drawer, onClose, onEdit }) {
    const { member, membership, payments, transactions } = drawer;

    const remove = () => {
        if (confirm('Hapus member ini?')) router.delete(route('admin.members.destroy', member.id));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar src={member.avatar_url} name={member.name} tone="dark" className="h-12 w-12 rounded-2xl text-xl" />
                    <div>
                        <p className="font-mono text-xs text-slate">{member.member_code || '-'}</p>
                        <p className="text-sm font-semibold">{member.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="btn-ghost text-xs">Edit</button>
                    <button onClick={remove} className="btn-danger text-xs">Hapus</button>
                </div>
            </div>

            {member.approval_status === 'pending' && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-amber-900 text-sm">⚠️ Menunggu Persetujuan Akun</p>
                            <p className="text-xs text-amber-800 mt-0.5">Member baru mendaftar dan akun belum aktif. Klik setujui agar member dapat login.</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => router.put(route('admin.members.approve', member.id), {}, { preserveScroll: true })}
                                className="btn-gold text-xs"
                            >
                                Setujui Member
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`Tolak pendaftaran member ${member.name}?`)) {
                                        router.put(route('admin.members.reject', member.id), {}, { preserveScroll: true });
                                    }
                                }}
                                className="btn-danger text-xs"
                            >
                                Tolak
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {member.approval_status === 'rejected' && (
                <div className="rounded-2xl border border-ember/30 bg-ember/10 p-4 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-ember text-sm">Pendaftaran Member Ini Ditolak</p>
                        <p className="text-xs text-ember/80 mt-0.5">Member tidak dapat login ke aplikasi.</p>
                    </div>
                    <button
                        onClick={() => router.put(route('admin.members.approve', member.id), {}, { preserveScroll: true })}
                        className="btn-gold text-xs"
                    >
                        Setujui Ulang
                    </button>
                </div>
            )}

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Keanggotaan</h2>
                {membership ? (
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="eyebrow">Status Akun</span>
                            {member.approval_status === 'pending' ? (
                                <StatusChip status="pending" label="Menunggu Persetujuan" pulse />
                            ) : member.approval_status === 'rejected' ? (
                                <StatusChip status="rejected" label="Ditolak" />
                            ) : (
                                <StatusChip status="approved" label="Disetujui" />
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="eyebrow">Status Masa Aktif</span>
                            <StatusChip status={membership.status} label={membership.status === 'active' ? 'Aktif' : 'Tidak Aktif'} pulse={membership.status === 'active'} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate">Paket</span>
                            <span className="font-semibold">{membership.plan?.name || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate">Mulai</span>
                            <span className="font-mono text-xs">{formatDate(membership.starts_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate">Berlaku hingga</span>
                            <span className="font-mono text-xs">{formatDate(membership.expires_at)}</span>
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-slate">Belum ada data keanggotaan.</p>
                )}
            </section>

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Biodata Lengkap Anggota</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                        ['Nama Lengkap', member.name || '-'],
                        ['Nama Panggilan', member.nickname || '-'],
                        ['Jenis Kelamin', member.gender || '-'],
                        ['Status Pernikahan', member.marital_status || '-'],
                        ['Tempat Lahir', member.birth_place || '-'],
                        ['Tanggal Lahir', member.birth_date ? formatDate(member.birth_date) : '-'],
                        ['Agama', member.religion || '-'],
                        ['Alamat Tempat Ibadah', member.place_of_worship_address || '-'],
                        ['Telepon / HP', member.phone || '-'],
                        ['WhatsApp', member.whatsapp || '-'],
                        ['Email', member.email || '-'],
                        ['Bergabung', member.created_at || '-'],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-paper p-3">
                            <dt className="eyebrow">{label}</dt>
                            <dd className="mt-1 text-sm font-medium">{value}</dd>
                        </div>
                    ))}
                </dl>

                {/* Hobi */}
                <div className="mt-4 rounded-xl bg-paper p-3">
                    <dt className="eyebrow">Minat & Hobi</dt>
                    <dd className="mt-1 text-sm font-medium">
                        {Array.isArray(member.hobbies) && member.hobbies.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {member.hobbies.map((h, i) => (
                                    <span key={i} className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-deep">
                                        {h}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            member.hobbies || '-'
                        )}
                    </dd>
                </div>

                {/* Alamat Domisili */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-paper p-3 sm:col-span-3">
                        <dt className="eyebrow">Alamat Rumah Tinggal</dt>
                        <dd className="mt-1 text-sm font-medium">{member.address || '-'}</dd>
                    </div>
                    <div className="rounded-xl bg-paper p-3">
                        <dt className="eyebrow">Kecamatan</dt>
                        <dd className="mt-1 text-sm font-medium">{member.district || '-'}</dd>
                    </div>
                    <div className="rounded-xl bg-paper p-3 sm:col-span-2">
                        <dt className="eyebrow">Kota / Kabupaten</dt>
                        <dd className="mt-1 text-sm font-medium">{member.city || '-'}</dd>
                    </div>
                </div>

                {/* Profil Usaha / Pekerjaan */}
                <div className="mt-4 border-t border-ink/10 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gold-deep mb-3">Pekerjaan & Usaha</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-paper p-3">
                            <dt className="eyebrow">Perusahaan / Usaha</dt>
                            <dd className="mt-1 text-sm font-medium">{member.company || '-'}</dd>
                        </div>
                        <div className="rounded-xl bg-paper p-3">
                            <dt className="eyebrow">Bidang Industri</dt>
                            <dd className="mt-1 text-sm font-medium">{member.industry || '-'}</dd>
                        </div>
                        {member.business_address && (
                            <div className="rounded-xl bg-paper p-3 sm:col-span-2">
                                <dt className="eyebrow">Alamat Usaha</dt>
                                <dd className="mt-1 text-sm font-medium">{member.business_address}</dd>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Transaksi Terkini</h2>
                <div className="mt-3 space-y-3">
                    {transactions.length === 0 ? (
                        <p className="text-sm text-slate">Belum ada transaksi.</p>
                    ) : (
                        transactions.map((t) => (
                            <a
                                key={t.id}
                                href={route('admin.transactions.index', { drawer: 'show', id: t.id })}
                                className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60"
                            >
                                <div>
                                    <p className="font-mono text-xs text-slate">{t.transaction_number}</p>
                                    <p className="text-sm font-semibold">{t.partner?.name}</p>
                                </div>
                                <p className="font-bold">{formatRupiah(t.net_amount)}</p>
                            </a>
                        ))
                    )}
                </div>
            </section>

            {(() => {
                const partner = transactions[0]?.partner;
                if (!partner || (!partner.total_belanja && !partner.diskon1 && !partner.diskon2 && !partner.diskon3)) return null;
                return (
                    <section className="rounded-2xl border border-ink/10 p-5">
                        <h2 className="font-display text-lg font-bold">Info Vendor — {partner.name}</h2>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {[
                                ['Total Belanja', partner.total_belanja],
                                ['Diskon 1', partner.diskon1],
                                ['Diskon 2', partner.diskon2],
                                ['Diskon 3', partner.diskon3],
                            ].filter(([, v]) => v).map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-paper p-3">
                                    <dt className="eyebrow">{label}</dt>
                                    <dd className="mt-1 text-sm font-medium">{value}</dd>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Riwayat Pembayaran</h2>
                <div className="mt-3 space-y-3">
                    {payments.length === 0 ? (
                        <p className="text-sm text-slate">Belum ada pembayaran.</p>
                    ) : (
                        payments.map((p) => (
                            <a
                                key={p.id}
                                href={route('admin.payments.index', { drawer: 'show', id: p.id })}
                                className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60"
                            >
                                <div>
                                    <p className="text-sm font-semibold">{formatRupiah(p.amount)}</p>
                                    <p className="font-mono text-xs text-slate">{p.plan?.name || '-'} · {formatDate(p.created_at)}</p>
                                </div>
                                <StatusChip status={p.status} label={p.status} />
                            </a>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default function MemberDrawer({ drawer, onClose, onEdit }) {
    if (!drawer?.mode) return null;

    const meta = {
        create: ['Tambah Member', 'Buat member baru beserta status keanggotaannya.'],
        edit: ['Edit Member', drawer.member?.member_code],
        show: [drawer.member?.name, drawer.member?.email],
    };

    const [title, subtitle] = meta[drawer.mode] || ['', ''];

    return (
        <SlideOver open onClose={onClose} title={title} subtitle={subtitle} width="max-w-2xl">
            {drawer.mode === 'create' && <CreateMemberDrawer onClose={onClose} />}
            {drawer.mode === 'edit' && <EditMemberDrawer key={drawer.member?.id} member={drawer.member} onClose={onClose} />}
            {drawer.mode === 'show' && <ShowMemberDrawer key={drawer.member?.id} drawer={drawer} onClose={onClose} onEdit={onEdit} />}
        </SlideOver>
    );
}
