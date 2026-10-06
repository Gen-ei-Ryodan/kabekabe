import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberForm from '@/Components/Admin/MemberForm';
import InputError from '@/Components/InputError';
import { formatDate } from '@/Utils/format';

export default function MemberEdit({ member, membership }) {
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
        avatar: null,
        remove_avatar: false,
    });

    const toDateInput = (val) => {
        if (!val) return '';
        try {
            const d = new Date(val);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().slice(0, 10);
        } catch {
            return '';
        }
    };

    const membershipForm = useForm({
        status: membership?.status === 'active' ? 'active' : 'inactive',
        started_at: toDateInput(membership?.started_at),
        expires_at: toDateInput(membership?.expires_at),
    });

    const submit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(form.data).forEach(([key, val]) => {
            if (key === 'hobbies' || key === 'business_fields') {
                (Array.isArray(val) ? val : []).forEach((v, i) => fd.append(`${key}[${i}]`, v));
            } else if (key === 'avatar' && val instanceof File) {
                fd.append('avatar', val);
            } else if (key === 'remove_avatar' && val) {
                fd.append('remove_avatar', '1');
            } else if (val !== null && val !== undefined) {
                fd.append(key, val);
            }
        });
        fd.append('_method', 'PUT');
        form.post(route('admin.members.update', member.id), { data: fd, preserveScroll: true, forceFormData: true });
    };

    return (
        <>
            <Head title={`Edit ${member.name}`} />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Manajemen Member</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Edit Member</h1>
                    <p className="mt-1 font-mono text-sm text-slate">{member.member_code}</p>
                </header>

                <div className="card-surface mt-8 p-6 sm:p-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            membershipForm.put(route('admin.members.membership', member.id), {
                                preserveScroll: true,
                            });
                        }}
                        className="mb-8 space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-4"
                    >
                        <div>
                            <p className="eyebrow">Status Masa Aktif</p>
                            <h2 className="font-display text-lg font-bold">Keanggotaan Member</h2>
                            {membership?.plan?.name && (
                                <p className="mt-0.5 text-xs text-slate">
                                    {membership.plan.name} · {formatDate(membership.started_at)} s/d {formatDate(membership.expires_at)}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="label" htmlFor="membership-status">Status</label>
                                <select
                                    id="membership-status"
                                    className="input"
                                    value={membershipForm.data.status}
                                    onChange={(e) => membershipForm.setData('status', e.target.value)}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                                <InputError message={membershipForm.errors.status} className="mt-1" />
                            </div>

                            <div>
                                <label className="label" htmlFor="membership-started">Tanggal Aktif</label>
                                <input
                                    id="membership-started"
                                    type="date"
                                    className="input"
                                    value={membershipForm.data.started_at}
                                    onChange={(e) => membershipForm.setData('started_at', e.target.value)}
                                />
                                <InputError message={membershipForm.errors.started_at} className="mt-1" />
                            </div>

                            <div>
                                <label className="label" htmlFor="membership-expires">Aktif Sampai</label>
                                <input
                                    id="membership-expires"
                                    type="date"
                                    className="input"
                                    value={membershipForm.data.expires_at}
                                    onChange={(e) => membershipForm.setData('expires_at', e.target.value)}
                                />
                                <InputError message={membershipForm.errors.expires_at} className="mt-1" />
                            </div>
                        </div>

                        <button type="submit" disabled={membershipForm.processing} className="btn-ink">
                            {membershipForm.processing ? 'Menyimpan…' : 'Simpan Status & Masa Aktif'}
                        </button>
                    </form>

                    <MemberForm
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                        processing={form.processing}
                        submitLabel="Simpan Perubahan"
                        onCancel={() => window.history.back()}
                        onSubmit={submit}
                        isCreate={false}
                        avatarUrl={member.avatar_url}
                    />
                </div>
            </div>
        </>
    );
}

MemberEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;
