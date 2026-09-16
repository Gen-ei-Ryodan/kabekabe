import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PartnerForm from '@/Components/Admin/PartnerForm';

export default function PartnerCreate() {
    const form = useForm({
        name: '',
        trade_name: '',
        category: '',
        industry: '',
        employee_count: '',
        established_since: '',
        phone: '',
        email: '',
        address: '',
        district: '',
        city: '',
        description: '',
        logo: null,
        sort_number: '',
        total_belanja: '',
        diskon1: '',
        diskon2: '',
        diskon3: '',
        is_member: false,
        member_id_number: '',
        member_name: '',
        member_birth_date: '',
        pic_name: '',
        pic_phone: '',
        nickname: '',
        gender: '',
        birth_place: '',
        birth_date: '',
        marital_status: '',
        religion: '',
        place_of_worship_address: '',
        member_phone: '',
        member_address: '',
        member_district: '',
        member_city: '',
        hobbies: [],
        joined_at: new Date().toISOString().slice(0, 10),
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        vendor_name: '',
        vendor_email: '',
        vendor_password: '',
        vendor_password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.partners.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Tambah Partner" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Manajemen Partner</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Tambah Partner</h1>
                    <p className="mt-2 text-sm text-slate">Formulir pendaftaran partner lengkap disamakan dengan form registrasi.</p>
                </header>

                <div className="card-surface mt-8 p-6 sm:p-8">
                    <PartnerForm
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                        processing={form.processing}
                        submitLabel="Tambah Partner"
                        onCancel={() => window.history.back()}
                        onSubmit={submit}
                        isCreate={true}
                    />
                </div>
            </div>
        </>
    );
}

PartnerCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
