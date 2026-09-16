import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberForm from '@/Components/Admin/MemberForm';

export default function MemberCreate() {
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
        <>
            <Head title="Tambah Member" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Manajemen Member</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Tambah Member Baru</h1>
                    <p className="mt-1 text-sm text-slate">Formulir pendaftaran anggota lengkap disamakan dengan form registrasi.</p>
                </header>

                <div className="card-surface mt-8 p-6 sm:p-8">
                    <MemberForm
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                        processing={form.processing}
                        submitLabel="Tambah Member"
                        onCancel={() => window.history.back()}
                        onSubmit={submit}
                        isCreate={true}
                    />
                </div>
            </div>
        </>
    );
}

MemberCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
