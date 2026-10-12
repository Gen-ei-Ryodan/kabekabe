import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import { INDUSTRY_CATEGORIES, HOBBY_LIST } from '@/constants/membership';
import MasterIdentityBiodata from '@/Components/MasterIdentityBiodata';

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

export default function PartnerForm({
    data,
    setData,
    errors,
    processing,
    submitLabel = 'Simpan',
    onCancel,
    onSubmit,
    isCreate = false,
}) {
    const [hobbySearch, setHobbySearch] = useState('');
    const [customHobbyInput, setCustomHobbyInput] = useState('');

    const toggleHobby = (hobby) => {
        const currentHobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
        if (currentHobbies.includes(hobby)) {
            setData('hobbies', currentHobbies.filter((h) => h !== hobby));
        } else {
            setData('hobbies', [...currentHobbies, hobby]);
        }
    };

    const addCustomHobby = () => {
        const trimmed = customHobbyInput.trim();
        const currentHobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
        if (trimmed && !currentHobbies.includes(trimmed)) {
            setData('hobbies', [...currentHobbies, trimmed]);
            setCustomHobbyInput('');
        }
    };

    const filteredHobbies = HOBBY_LIST.filter((h) =>
        h.toLowerCase().includes(hobbySearch.toLowerCase())
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* 1. DATA PERUSAHAAN & USAHA */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                    1. Data Perusahaan & Usaha
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="name">Nama Perusahaan *</label>
                        <input
                            id="name"
                            type="text"
                            className="input"
                            value={data.name || ''}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: PT Kabe Sejahtera Mandiri"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-ember">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="trade_name">Nama Merk Dagang</label>
                        <input
                            id="trade_name"
                            type="text"
                            className="input"
                            value={data.trade_name || ''}
                            onChange={(e) => setData('trade_name', e.target.value)}
                            placeholder="Contoh: Kabe Kabe Coffee & Resto"
                        />
                        {errors.trade_name && <p className="mt-1 text-xs text-ember">{errors.trade_name}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="category">Kategori Partner</label>
                        <input
                            id="category"
                            type="text"
                            className="input"
                            value={data.category || ''}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Otomatis dari industri atau isi manual (F&B, Retail, dll)"
                        />
                        {errors.category && <p className="mt-1 text-xs text-ember">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="industry">Bidang Industri</label>
                        <select
                            id="industry"
                            className="input"
                            value={data.industry || ''}
                            onChange={(e) => setData('industry', e.target.value)}
                        >
                            <option value="">Pilih Bidang Industri...</option>
                            {INDUSTRY_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.industry && <p className="mt-1 text-xs text-ember">{errors.industry}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="employee_count">Jumlah Karyawan</label>
                        <input
                            id="employee_count"
                            type="number"
                            min="0"
                            className="input"
                            value={data.employee_count || ''}
                            onChange={(e) => setData('employee_count', e.target.value)}
                            placeholder="Contoh: 15"
                        />
                        {errors.employee_count && <p className="mt-1 text-xs text-ember">{errors.employee_count}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="established_since">Berdiri Sejak</label>
                        <input
                            id="established_since"
                            type="text"
                            className="input"
                            value={data.established_since || ''}
                            onChange={(e) => setData('established_since', e.target.value)}
                            placeholder="Contoh: 2018 atau Maret 2020"
                        />
                        {errors.established_since && <p className="mt-1 text-xs text-ember">{errors.established_since}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="phone">Nomor Telepon Usaha / PIC</label>
                        <input
                            id="phone"
                            type="tel"
                            className="input"
                            value={data.phone || ''}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="081234567890 / 0361-XXXXXX"
                        />
                        {errors.phone && <p className="mt-1 text-xs text-ember">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="email">Email Perusahaan</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={data.email || ''}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="kontak@perusahaan.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-ember">{errors.email}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="address">Alamat Usaha</label>
                        <textarea
                            id="address"
                            rows={2}
                            className="input"
                            value={data.address || ''}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Alamat lengkap toko / kantor..."
                        />
                        {errors.address && <p className="mt-1 text-xs text-ember">{errors.address}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="district">Kecamatan</label>
                        <input
                            id="district"
                            type="text"
                            className="input"
                            value={data.district || ''}
                            onChange={(e) => setData('district', e.target.value)}
                            placeholder="Kecamatan usaha"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="city">Kota / Kabupaten</label>
                        <input
                            id="city"
                            type="text"
                            className="input"
                            value={data.city || ''}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Kota/kabupaten usaha"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="description">Deskripsi Usaha</label>
                        <textarea
                            id="description"
                            rows={3}
                            className="input"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Rincian produk, profil bisnis, atau layanan..."
                        />
                        {errors.description && <p className="mt-1 text-xs text-ember">{errors.description}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="logo">
                            {isCreate ? 'Logo Partner' : 'Ganti Logo Partner'}
                        </label>
                        <input
                            id="logo"
                            type="file"
                            accept="image/*"
                            className="input"
                            onChange={(e) => setData('logo', e.target.files[0])}
                        />
                        {errors.logo && <p className="mt-1 text-xs text-ember">{errors.logo}</p>}
                    </div>
                </div>
            </section>

            {/* 2. DATA PIC / OWNER (MASTER IDENTITY) */}
{!isCreate ? (
                <section className="space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-4 sm:p-5">
                    <div className="border-b border-gold/20 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                                2. Status Keanggotaan Member KBKB
                            </h3>
                            <p className="text-xs text-slate mt-0.5">
                                Data tersimpan otomatis dari pendaftaran awal (tidak perlu diisi ulang saat edit profil usaha).
                            </p>
                        </div>
                        <span className={`inline-flex items-center w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                            Boolean(data.is_member)
                                ? 'bg-sage/20 text-emerald-800 border border-sage/40'
                                : 'bg-slate/15 text-slate border border-slate/30'
                        }`}>
                            {Boolean(data.is_member) ? '✓ Terdaftar Member KBKB' : 'Mitra Non-Member'}
                        </span>
                    </div>

                    <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                        <div className="grid gap-3 sm:grid-cols-2 text-sm">
                            {Boolean(data.is_member) ? (
                                <>
                                    <div>
                                        <span className="eyebrow block">Nama Member</span>
                                        <span className="font-semibold text-ink">{data.member_name || data.pic_name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="eyebrow block">No. Anggota / ID Member</span>
                                        <span className="font-mono font-semibold text-ink">{data.member_id_number || data.member_code || '—'}</span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="eyebrow block">Email Akun Member</span>
                                        <span className="font-medium text-ink">{data.member_email || '—'}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="eyebrow block">Nama PIC</span>
                                        <span className="font-semibold text-ink">{data.pic_name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="eyebrow block">No. WhatsApp PIC</span>
                                        <span className="font-medium text-ink">{data.pic_whatsapp || data.phone || '—'}</span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="eyebrow block">Email PIC</span>
                                        <span className="font-medium text-ink">{data.pic_email || data.email || '—'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            ) : (
                <section className="space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-4 sm:p-5">
                    <div className="border-b border-gold/20 pb-2">
                        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                            2. Status Keanggotaan Member KBKB
                        </h3>
                        <p className="text-xs text-slate mt-0.5">
                            Apakah pemilik / PIC usaha sudah terdaftar sebagai Member KBKB?
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setData('is_member', true)}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                            Boolean(data.is_member)
                                ? 'border-gold bg-gold text-ink shadow-sm font-bold'
                                : 'border-ink/15 bg-white text-slate hover:bg-ink/5'
                        }`}
                    >
                        <span>✓</span> Ya, Sudah Member
                    </button>

                    <button
                        type="button"
                        onClick={() => setData('is_member', false)}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                            !data.is_member
                                ? 'border-gold bg-gold text-ink shadow-sm font-bold'
                                : 'border-ink/15 bg-white text-slate hover:bg-ink/5'
                        }`}
                    >
                        <span>✗</span> Belum (Daftar Sekaligus)
                    </button>
                </div>

                {Boolean(data.is_member) ? (
                    <div className="mt-3 rounded-xl border border-ink/10 bg-white/70 p-4 space-y-4">
                        <p className="text-xs font-semibold text-gold-deep uppercase tracking-wider">
                            Data Verifikasi Member Terdaftar:
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="member_email">Email Member *</label>
                                <input
                                    id="member_email"
                                    type="email"
                                    className="input"
                                    value={data.member_email || ''}
                                    onChange={(e) => setData('member_email', e.target.value)}
                                    placeholder="email terdaftar sebagai member KBKB"
                                    required
                                />
                                {errors.member_email && <p className="mt-1 text-xs text-ember">{errors.member_email}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-slate">
                            Nomor ID, nama, dan tanggal lahir member diambil otomatis dari akun member tersebut.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs text-gold-deep font-semibold">
                            Biodata PIC / Owner (Master Identity): Calon pengguna belum terdaftar sebagai member KBKB, silakan lengkapi biodata personal berikut.
                        </div>
                        <MasterIdentityBiodata
                            data={data}
                            setData={setData}
                            errors={errors}
                            showEmail={false}
                        />
                    </div>
                )}
            </section>
            )}

            {/* 3. INFO PENGATURAN VENDOR, DISKON & URUTAN */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                    3. Nomor Urut, Periode & Info Diskon
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="label" htmlFor="sort_number">Nomor Urut Tampil</label>
                        <input
                            id="sort_number"
                            type="number"
                            min="1"
                            placeholder="Contoh: 1"
                            className="input"
                            value={data.sort_number || ''}
                            onChange={(e) => setData('sort_number', e.target.value)}
                        />
                        {errors.sort_number && <p className="mt-1 text-xs text-ember">{errors.sort_number}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="joined_at">Tanggal Bergabung</label>
                        <input
                            id="joined_at"
                            type="date"
                            className="input"
                            value={toDateInput(data.joined_at)}
                            onChange={(e) => setData('joined_at', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="expires_at">Tanggal Berakhir</label>
                        <input
                            id="expires_at"
                            type="date"
                            className="input"
                            value={toDateInput(data.expires_at)}
                            onChange={(e) => setData('expires_at', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="total_belanja">Syarat Total Belanja</label>
                        <input
                            id="total_belanja"
                            type="text"
                            className="input"
                            value={data.total_belanja || ''}
                            onChange={(e) => setData('total_belanja', e.target.value)}
                            placeholder="Contoh: Rp 100.000"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="diskon1">Diskon 1</label>
                        <input
                            id="diskon1"
                            type="text"
                            className="input"
                            value={data.diskon1 || ''}
                            onChange={(e) => setData('diskon1', e.target.value)}
                            placeholder="Misal: 10%"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="diskon2">Diskon 2</label>
                        <input
                            id="diskon2"
                            type="text"
                            className="input"
                            value={data.diskon2 || ''}
                            onChange={(e) => setData('diskon2', e.target.value)}
                            placeholder="Misal: 15%"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="diskon3">Diskon 3</label>
                        <input
                            id="diskon3"
                            type="text"
                            className="input"
                            value={data.diskon3 || ''}
                            onChange={(e) => setData('diskon3', e.target.value)}
                            placeholder="Misal: Free Item"
                        />
                    </div>
                </div>
            </section>

            {/* 4. AKUN LOGIN VENDOR (KHUSUS CREATE ATAU JIKA ADA) */}
            {isCreate && (
                <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                        4. Akun Login Vendor KBKB
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="vendor_name">Nama Akun Login *</label>
                            <input
                                id="vendor_name"
                                type="text"
                                className="input"
                                value={data.vendor_name || ''}
                                onChange={(e) => setData('vendor_name', e.target.value)}
                                placeholder="Nama pemilik / nama resto"
                                required
                            />
                            {errors.vendor_name && <p className="mt-1 text-xs text-ember">{errors.vendor_name}</p>}
                        </div>

                        <div>
                            <label className="label" htmlFor="vendor_email">Email Login Vendor *</label>
                            <input
                                id="vendor_email"
                                type="email"
                                className="input"
                                value={data.vendor_email || ''}
                                onChange={(e) => setData('vendor_email', e.target.value)}
                                placeholder="email-login@partner.com"
                                required
                            />
                            {errors.vendor_email && <p className="mt-1 text-xs text-ember">{errors.vendor_email}</p>}
                        </div>

                        <div>
                            <label className="label" htmlFor="vendor_password">Kata Sandi *</label>
                            <TextInput
                                id="vendor_password"
                                type="password"
                                name="vendor_password"
                                autoComplete="new-password"
                                value={data.vendor_password || ''}
                                onChange={(e) => setData('vendor_password', e.target.value)}
                                required
                            />
                            {errors.vendor_password && <p className="mt-1 text-xs text-ember">{errors.vendor_password}</p>}
                            <p className="mt-1 text-[11px] text-slate-soft">Minimal 8 karakter, kombinasi huruf &amp; angka.</p>
                        </div>

                        <div>
                            <label className="label" htmlFor="vendor_password_confirmation">Konfirmasi Kata Sandi</label>
                            <TextInput
                                id="vendor_password_confirmation"
                                type="password"
                                name="vendor_password_confirmation"
                                autoComplete="new-password"
                                value={data.vendor_password_confirmation || ''}
                                onChange={(e) => setData('vendor_password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-ghost">
                        Batal
                    </button>
                )}
                <button type="submit" className="btn-gold" disabled={processing}>
                    {processing ? 'Menyimpan…' : submitLabel}
                </button>
            </div>
        </form>
    );
}
