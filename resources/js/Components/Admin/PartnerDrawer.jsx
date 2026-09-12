import { useForm } from '@inertiajs/react';
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
                <h2 className="font-display text-lg font-bold">Partner Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="name">Nama Usaha / Brand</label>
                        <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                        {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="category">Kategori</label>
                        <input id="category" type="text" className="input" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} placeholder="Restaurant, Retail, Healthcare…" required />
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
                <h2 className="font-display text-lg font-bold">Vendor Login Account</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="vendor_name">Vendor Account Name</label>
                        <input id="vendor_name" type="text" className="input" value={form.data.vendor_name} onChange={(e) => form.setData('vendor_name', e.target.value)} />
                        {form.errors.vendor_name && <p className="mt-1 text-xs text-ember">{form.errors.vendor_name}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="vendor_email">Login Email</label>
                        <input id="vendor_email" type="email" className="input" value={form.data.vendor_email} onChange={(e) => form.setData('vendor_email', e.target.value)} />
                        {form.errors.vendor_email && <p className="mt-1 text-xs text-ember">{form.errors.vendor_email}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="vendor_password">Password</label>
                        <input id="vendor_password" type="password" className="input" value={form.data.vendor_password} onChange={(e) => form.setData('vendor_password', e.target.value)} />
                        {form.errors.vendor_password && <p className="mt-1 text-xs text-ember">{form.errors.vendor_password}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="vendor_password_confirmation">Confirm Password</label>
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
        category: partner.category,
        industry: partner.industry || '',
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
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label" htmlFor="name">Nama Usaha / Brand</label>
                    <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                    {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
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