import { router, useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
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

function CreatePartnerDrawer({ onClose }) {
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
        <PartnerForm
            data={form.data}
            setData={form.setData}
            errors={form.errors}
            processing={form.processing}
            submitLabel="Simpan Partner"
            onCancel={onClose}
            onSubmit={submit}
            isCreate={true}
        />
    );
}

function EditPartnerDrawer({ partner, onClose }) {
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
        <div className="space-y-4">
            {partner.user?.approval_status === 'pending' && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-amber-900 text-sm">⚠️ Menunggu Persetujuan Partner</p>
                            <p className="text-xs text-amber-800 mt-0.5">Partner baru mendaftar. Setujui untuk mengaktifkan akun vendor dan profil partner.</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => router.put(route('admin.partners.approve', partner.id), {}, { preserveScroll: true })}
                                className="btn-gold text-xs"
                            >
                                Setujui Partner
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm(`Tolak pendaftaran partner ${partner.name}?`)) {
                                        router.put(route('admin.partners.reject', partner.id), {}, { preserveScroll: true });
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

            <PartnerForm
                data={form.data}
                setData={form.setData}
                errors={form.errors}
                processing={form.processing}
                submitLabel="Simpan Perubahan"
                onCancel={onClose}
                onSubmit={submit}
                isCreate={false}
            />
        </div>
    );
}

export default function PartnerDrawer({ drawer, onClose }) {
    if (!drawer?.mode) return null;

    const meta = {
        create: ['Tambah Partner Baru', 'Partner akan otomatis dibuatkan akun vendor untuk kelola promo & transaksi.'],
        edit: ['Edit Partner', drawer.partner?.name || drawer.partner?.user?.email],
    };

    const [title, subtitle] = meta[drawer.mode] || ['', ''];

    return (
        <SlideOver open onClose={onClose} title={title} subtitle={subtitle} width="max-w-2xl">
            {drawer.mode === 'create' && <CreatePartnerDrawer onClose={onClose} />}
            {drawer.mode === 'edit' && <EditPartnerDrawer key={drawer.partner?.id} partner={drawer.partner} onClose={onClose} />}
        </SlideOver>
    );
}
