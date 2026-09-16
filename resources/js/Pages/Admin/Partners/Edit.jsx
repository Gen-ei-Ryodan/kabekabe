import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PartnerForm from '@/Components/Admin/PartnerForm';

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

export default function PartnerEdit({ partner }) {
    const form = useForm({
        name: partner.name || '',
        trade_name: partner.trade_name || '',
        category: partner.category || '',
        industry: partner.industry || '',
        employee_count: partner.employee_count || '',
        established_since: partner.established_since || '',
        pic_name: partner.pic_name || partner.user?.name || '',
        pic_phone: partner.pic_phone || partner.user?.phone || '',
        phone: partner.phone || '',
        email: partner.email || '',
        address: partner.address || '',
        district: partner.district || '',
        city: partner.city || '',
        joined_at: toDateInput(partner.joined_at),
        expires_at: toDateInput(partner.expires_at),
        description: partner.description || '',
        logo: null,
        sort_number: partner.sort_number || '',
        total_belanja: partner.total_belanja || '',
        diskon1: partner.diskon1 || '',
        diskon2: partner.diskon2 || '',
        diskon3: partner.diskon3 || '',
        is_member: Boolean(partner.is_member),
        member_id_number: partner.member_id_number || '',
        member_name: partner.member_name || '',
        member_birth_date: toDateInput(partner.member_birth_date),
        nickname: partner.user?.nickname || '',
        gender: partner.user?.gender || '',
        birth_place: partner.user?.birth_place || '',
        birth_date: toDateInput(partner.user?.birth_date),
        marital_status: partner.user?.marital_status || '',
        religion: partner.user?.religion || '',
        place_of_worship_address: partner.user?.place_of_worship_address || '',
        member_phone: partner.user?.phone || '',
        member_address: partner.user?.address || '',
        member_district: partner.user?.district || '',
        member_city: partner.user?.city || '',
        hobbies: Array.isArray(partner.user?.hobbies) ? partner.user.hobbies : [],
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.partners.update', partner.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Edit ${partner.name}`} />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Manajemen Partner</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Edit Partner</h1>
                    {partner.user && <p className="mt-1 text-sm text-slate">Akun vendor: {partner.user.email}</p>}
                </header>

                <div className="card-surface mt-8 p-6 sm:p-8">
                    <PartnerForm
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                        processing={form.processing}
                        submitLabel="Simpan Perubahan"
                        onCancel={() => window.history.back()}
                        onSubmit={submit}
                        isCreate={false}
                    />
                </div>
            </div>
        </>
    );
}

PartnerEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;
