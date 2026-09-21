import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberForm from '@/Components/Admin/MemberForm';

export default function MemberEdit({ member }) {
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
