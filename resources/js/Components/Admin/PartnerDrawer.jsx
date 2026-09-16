import { router, useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import { INDUSTRY_CATEGORIES } from '@/constants/membership';

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
        category: '',
        industry: '',
        pic_name: '',
        pic_phone: '',
        phone: '',
        email: '',
        address: '',
        district: '',
        city: '',
        joined_at: new Date().toISOString().slice(0, 10),
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        description: '',
        logo: null,
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
        <form id="partner-form" onSubmit={submit} className="space-y-5">
            <section className="space-y-4">
                <h2 className="font-display text-lg font-bold">Rincian Partner</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="name">Nama Usaha / Brand</label>
                        <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                        {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="category">Kategori</label>
                        <input id="category" type="text" className="input" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} placeholder="Restoran, Retail, Kesehatan…" required />
                        {form.errors.category && <p className="mt-1 text-xs text-ember">{form.errors.category}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="industry">Bidang Industri</label>
                        <select id="industry" className="input" value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)}>
                            <option value="">Pilih Bidang Industri...</option>
                            {INDUSTRY_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {form.errors.industry && <p className="mt-1 text-xs text-ember">{form.errors.industry}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="email">Email Perusahaan</label>
                        <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="phone">No. Telp Perusahaan</label>
                        <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="pic_name">Nama Pemilik / PIC</label>
                        <input id="pic_name" type="text" className="input" value={form.data.pic_name} onChange={(e) => form.setData('pic_name', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="pic_phone">No. Telp Pemilik / PIC</label>
                        <input id="pic_phone" type="text" className="input" value={form.data.pic_phone} onChange={(e) => form.setData('pic_phone', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="joined_at">Tanggal Bergabung</label>
                        <input id="joined_at" type="date" className="input" value={form.data.joined_at} onChange={(e) => form.setData('joined_at', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="expires_at">Tanggal Berakhir</label>
                        <input id="expires_at" type="date" className="input" value={form.data.expires_at} onChange={(e) => form.setData('expires_at', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="address">Alamat Kantor / Usaha</label>
                        <input id="address" type="text" className="input" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="district">Kecamatan</label>
                        <input id="district" type="text" className="input" value={form.data.district} onChange={(e) => form.setData('district', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="city">Kota / Kabupaten</label>
                        <input id="city" type="text" className="input" value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="description">Deskripsi</label>
                        <textarea id="description" rows={3} className="input" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        {form.errors.description && <p className="mt-1 text-xs text-ember">{form.errors.description}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="logo">Logo</label>
                        <input id="logo" type="file" accept="image/*" className="input" onChange={(e) => form.setData('logo', e.target.files[0])} />
                        {form.errors.logo && <p className="mt-1 text-xs text-ember">{form.errors.logo}</p>}
                    </div>
                </div>
            </section>

            <section className="space-y-4 border-t border-ink/10 pt-5">
                <h2 className="font-display text-lg font-bold">Akun Login Vendor</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="vendor_name">Nama Akun Vendor</label>
                        <input id="vendor_name" type="text" className="input" value={form.data.vendor_name} onChange={(e) => form.setData('vendor_name', e.target.value)} />
                        {form.errors.vendor_name && <p className="mt-1 text-xs text-ember">{form.errors.vendor_name}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="vendor_email">Email Login</label>
                        <input id="vendor_email" type="email" className="input" value={form.data.vendor_email} onChange={(e) => form.setData('vendor_email', e.target.value)} />
                        {form.errors.vendor_email && <p className="mt-1 text-xs text-ember">{form.errors.vendor_email}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="vendor_password">Kata Sandi</label>
                        <input id="vendor_password" type="password" className="input" value={form.data.vendor_password} onChange={(e) => form.setData('vendor_password', e.target.value)} />
                        {form.errors.vendor_password && <p className="mt-1 text-xs text-ember">{form.errors.vendor_password}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="vendor_password_confirmation">Konfirmasi Kata Sandi</label>
                        <input id="vendor_password_confirmation" type="password" className="input" value={form.data.vendor_password_confirmation} onChange={(e) => form.setData('vendor_password_confirmation', e.target.value)} />
                    </div>
                </div>
            </section>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Batal</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Menyimpan…' : 'Simpan Partner'}
                </button>
            </div>
        </form>
    );
}

function EditPartnerDrawer({ partner, onClose }) {
    const form = useForm({
        name: partner.name,
        trade_name: partner.trade_name || '',
        category: partner.category,
        industry: partner.industry || '',
        employee_count: partner.employee_count || '',
        established_since: partner.established_since || '',
        pic_name: partner.pic_name || '',
        pic_phone: partner.pic_phone || '',
        phone: partner.phone || '',
        email: partner.email || '',
        address: partner.address || '',
        district: partner.district || '',
        city: partner.city || '',
        joined_at: toDateInput(partner.joined_at),
        expires_at: toDateInput(partner.expires_at),
        description: partner.description || '',
        logo: null,
        total_belanja: partner.total_belanja || '',
        diskon1: partner.diskon1 || '',
        diskon2: partner.diskon2 || '',
        diskon3: partner.diskon3 || '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.partners.update', partner.id), { preserveScroll: true });
    };

    return (
        <form id="partner-form" onSubmit={submit} className="space-y-5">
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

            {/* KOTAK STATUS KEANGGOTAAN MEMBER */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-xs">
                <p className="font-bold text-ink uppercase tracking-wider mb-1">
                    Status Keanggotaan Member KBKB:
                </p>
                {partner.is_member ? (
                    <div className="space-y-1 text-slate">
                        <p><span className="font-semibold text-ink">Status:</span> <span className="text-sage-deep font-bold">Sudah Terdaftar Sebagai Member</span></p>
                        <p><span className="font-semibold text-ink">ID Member:</span> <span className="font-mono">{partner.member_id_number || '-'}</span></p>
                        <p><span className="font-semibold text-ink">Nama Member:</span> {partner.member_name || '-'}</p>
                        <p><span className="font-semibold text-ink">Tgl Lahir:</span> {partner.member_birth_date ? toDateInput(partner.member_birth_date) : '-'}</p>
                    </div>
                ) : (
                    <div className="space-y-1 text-slate">
                        <p><span className="font-semibold text-ink">Status:</span> <span className="text-gold-deep font-bold">Mendaftar Sekaligus Member</span></p>
                        <p><span className="font-semibold text-ink">Nama Akun:</span> {partner.user?.name || partner.pic_name || '-'}</p>
                        <p><span className="font-semibold text-ink">TTL:</span> {partner.user?.birth_place || '-'}, {partner.user?.birth_date ? toDateInput(partner.user.birth_date) : '-'}</p>
                        <p><span className="font-semibold text-ink">Hobi:</span> {Array.isArray(partner.user?.hobbies) ? partner.user.hobbies.join(', ') : (partner.user?.hobbies || '-')}</p>
                    </div>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label" htmlFor="name">Nama Perusahaan</label>
                    <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                    {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="trade_name">Nama Merk Dagang</label>
                    <input id="trade_name" type="text" className="input" value={form.data.trade_name} onChange={(e) => form.setData('trade_name', e.target.value)} placeholder="Nama brand toko / resto" />
                    {form.errors.trade_name && <p className="mt-1 text-xs text-ember">{form.errors.trade_name}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="category">Kategori</label>
                    <input id="category" type="text" className="input" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} required />
                    {form.errors.category && <p className="mt-1 text-xs text-ember">{form.errors.category}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="industry">Bidang Industri</label>
                    <select id="industry" className="input" value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)}>
                        <option value="">Pilih Bidang Industri...</option>
                        {INDUSTRY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {form.errors.industry && <p className="mt-1 text-xs text-ember">{form.errors.industry}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="employee_count">Jumlah Karyawan</label>
                    <input id="employee_count" type="number" min="0" className="input" value={form.data.employee_count} onChange={(e) => form.setData('employee_count', e.target.value)} placeholder="Misal: 10" />
                </div>
                <div>
                    <label className="label" htmlFor="established_since">Berdiri Sejak</label>
                    <input id="established_since" type="text" className="input" value={form.data.established_since} onChange={(e) => form.setData('established_since', e.target.value)} placeholder="Tahun atau bulan & tahun" />
                </div>
                <div>
                    <label className="label" htmlFor="email">Email Perusahaan</label>
                    <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="phone">No. Telp Perusahaan</label>
                    <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="pic_name">Nama Pemilik / PIC</label>
                    <input id="pic_name" type="text" className="input" value={form.data.pic_name} onChange={(e) => form.setData('pic_name', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="pic_phone">No. Telp Pemilik / PIC</label>
                    <input id="pic_phone" type="text" className="input" value={form.data.pic_phone} onChange={(e) => form.setData('pic_phone', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="joined_at">Tanggal Bergabung</label>
                    <input id="joined_at" type="date" className="input" value={form.data.joined_at} onChange={(e) => form.setData('joined_at', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="expires_at">Tanggal Berakhir</label>
                    <input id="expires_at" type="date" className="input" value={form.data.expires_at} onChange={(e) => form.setData('expires_at', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="address">Alamat Kantor / Usaha</label>
                    <input id="address" type="text" className="input" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="district">Kecamatan</label>
                    <input id="district" type="text" className="input" value={form.data.district} onChange={(e) => form.setData('district', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="city">Kota / Kabupaten</label>
                    <input id="city" type="text" className="input" value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="description">Deskripsi</label>
                    <textarea id="description" rows={3} className="input" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                    {form.errors.description && <p className="mt-1 text-xs text-ember">{form.errors.description}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="logo">Ganti Logo</label>
                    <input id="logo" type="file" accept="image/*" className="input" onChange={(e) => form.setData('logo', e.target.files[0])} />
                    {form.errors.logo && <p className="mt-1 text-xs text-ember">{form.errors.logo}</p>}
                </div>
            </div>

            <div className="border-t border-ink/10 pt-5">
                <h3 className="font-display font-bold">Info Diskon Vendor</h3>
                <p className="mt-1 text-xs text-slate">Field manual untuk info diskon / belanja anggota.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="total_belanja">Total Belanja</label>
                        <input id="total_belanja" type="text" className="input" value={form.data.total_belanja} onChange={(e) => form.setData('total_belanja', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="diskon1">Diskon 1</label>
                        <input id="diskon1" type="text" className="input" value={form.data.diskon1} onChange={(e) => form.setData('diskon1', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="diskon2">Diskon 2</label>
                        <input id="diskon2" type="text" className="input" value={form.data.diskon2} onChange={(e) => form.setData('diskon2', e.target.value)} />
                    </div>
                    <div>
                        <label className="label" htmlFor="diskon3">Diskon 3</label>
                        <input id="diskon3" type="text" className="input" value={form.data.diskon3} onChange={(e) => form.setData('diskon3', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Batal</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
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
