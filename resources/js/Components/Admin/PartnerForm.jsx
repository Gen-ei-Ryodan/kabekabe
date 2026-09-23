import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import { INDUSTRY_CATEGORIES, HOBBY_LIST } from '@/constants/membership';

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
                        <label className="label" htmlFor="category">Kategori Partner *</label>
                        <input
                            id="category"
                            type="text"
                            className="input"
                            value={data.category || ''}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Restoran, Retail, Cafe, Kesehatan..."
                            required
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

            {/* 2. STATUS KEANGGOTAAN MEMBER KBKB */}
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
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="label" htmlFor="member_id_number">Nomor ID Member</label>
                                <input
                                    id="member_id_number"
                                    type="text"
                                    className="input font-mono"
                                    value={data.member_id_number || ''}
                                    onChange={(e) => setData('member_id_number', e.target.value)}
                                    placeholder="KBKB-XXXXXX"
                                />
                                {errors.member_id_number && <p className="mt-1 text-xs text-ember">{errors.member_id_number}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="member_name">Nama Lengkap Member</label>
                                <input
                                    id="member_name"
                                    type="text"
                                    className="input"
                                    value={data.member_name || ''}
                                    onChange={(e) => setData('member_name', e.target.value)}
                                    placeholder="Sesuai kartu member"
                                />
                                {errors.member_name && <p className="mt-1 text-xs text-ember">{errors.member_name}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="member_birth_date">Tanggal Lahir Member</label>
                                <input
                                    id="member_birth_date"
                                    type="date"
                                    className="input"
                                    value={toDateInput(data.member_birth_date)}
                                    onChange={(e) => setData('member_birth_date', e.target.value)}
                                />
                                {errors.member_birth_date && <p className="mt-1 text-xs text-ember">{errors.member_birth_date}</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-3 rounded-xl border border-ink/10 bg-white/70 p-4 space-y-4">
                        <div className="border-b border-ink/10 pb-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-gold-deep">
                                Biodata Lengkap PIC / Calon Member KBKB
                            </p>
                            <p className="text-xs text-slate mt-0.5">
                                Lengkapi data PIC untuk profil member komunitas.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="pic_name">Nama Lengkap PIC *</label>
                                <input
                                    id="pic_name"
                                    type="text"
                                    className="input"
                                    value={data.pic_name || ''}
                                    onChange={(e) => setData('pic_name', e.target.value)}
                                    placeholder="Nama PIC sesuai KTP"
                                />
                                {errors.pic_name && <p className="mt-1 text-xs text-ember">{errors.pic_name}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="nickname">Nama Panggilan PIC</label>
                                <input
                                    id="nickname"
                                    type="text"
                                    className="input"
                                    value={data.nickname || ''}
                                    onChange={(e) => setData('nickname', e.target.value)}
                                    placeholder="Panggilan akrab"
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="gender">Jenis Kelamin</label>
                                <select
                                    id="gender"
                                    className="input"
                                    value={data.gender || ''}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="">Pilih Jenis Kelamin...</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="label" htmlFor="marital_status">Status Pernikahan</label>
                                <select
                                    id="marital_status"
                                    className="input"
                                    value={data.marital_status || ''}
                                    onChange={(e) => setData('marital_status', e.target.value)}
                                >
                                    <option value="">Pilih Status Pernikahan...</option>
                                    <option value="Belum Menikah">Belum Menikah</option>
                                    <option value="Menikah">Menikah</option>
                                    <option value="Pernah Menikah">Pernah Menikah</option>
                                </select>
                            </div>

                            <div>
                                <label className="label" htmlFor="birth_place">Kota Kelahiran</label>
                                <input
                                    id="birth_place"
                                    type="text"
                                    className="input"
                                    value={data.birth_place || ''}
                                    onChange={(e) => setData('birth_place', e.target.value)}
                                    placeholder="Kota Kelahiran"
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="birth_date">Tanggal Lahir</label>
                                <input
                                    id="birth_date"
                                    type="date"
                                    className="input"
                                    value={toDateInput(data.birth_date)}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="religion">Agama</label>
                                <select
                                    id="religion"
                                    className="input"
                                    value={data.religion || ''}
                                    onChange={(e) => setData('religion', e.target.value)}
                                >
                                    <option value="">Pilih Agama...</option>
                                    <option value="Katolik">Katolik</option>
                                    <option value="Kristen">Kristen</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Buddha">Buddha</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Konghucu">Konghucu</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="label" htmlFor="place_of_worship_address">Alamat Tempat Ibadah</label>
                                <input
                                    id="place_of_worship_address"
                                    type="text"
                                    className="input"
                                    value={data.place_of_worship_address || ''}
                                    onChange={(e) => setData('place_of_worship_address', e.target.value)}
                                    placeholder="Nama/lokasi gereja/tempat ibadah"
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="pic_phone">No. Telp / WA PIC</label>
                                <input
                                    id="pic_phone"
                                    type="tel"
                                    className="input"
                                    value={data.pic_phone || data.member_phone || ''}
                                    onChange={(e) => {
                                        setData('pic_phone', e.target.value);
                                        setData('member_phone', e.target.value);
                                    }}
                                    placeholder="081234567890"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="member_address">Alamat Tinggal Pribadi</label>
                                <textarea
                                    id="member_address"
                                    rows={2}
                                    className="input"
                                    value={data.member_address || ''}
                                    onChange={(e) => setData('member_address', e.target.value)}
                                    placeholder="Jalan, RT/RW, Kelurahan..."
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="member_district">Kecamatan Tinggal</label>
                                <input
                                    id="member_district"
                                    type="text"
                                    className="input"
                                    value={data.member_district || ''}
                                    onChange={(e) => setData('member_district', e.target.value)}
                                    placeholder="Kecamatan tempat tinggal"
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="member_city">Kota / Kabupaten Tinggal</label>
                                <input
                                    id="member_city"
                                    type="text"
                                    className="input"
                                    value={data.member_city || ''}
                                    onChange={(e) => setData('member_city', e.target.value)}
                                    placeholder="Kota tempat tinggal"
                                />
                            </div>
                        </div>

                        {/* HOBI PIC */}
                        <div className="border-t border-ink/10 pt-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="label">Hobi & Kesukaan PIC</label>
                                <span className="text-xs text-slate">
                                    Terpilih: {Array.isArray(data.hobbies) ? data.hobbies.length : 0}
                                </span>
                            </div>

                            {Array.isArray(data.hobbies) && data.hobbies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {data.hobbies.map((h) => (
                                        <span
                                            key={h}
                                            className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-deep"
                                        >
                                            {h}
                                            <button
                                                type="button"
                                                onClick={() => toggleHobby(h)}
                                                className="hover:text-ember ml-1"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={hobbySearch}
                                    onChange={(e) => setHobbySearch(e.target.value)}
                                    placeholder="Cari dari daftar hobi..."
                                    className="input flex-1 text-xs"
                                />
                                {hobbySearch && (
                                    <button
                                        type="button"
                                        onClick={() => setHobbySearch('')}
                                        className="btn-ghost text-xs px-2"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="max-h-36 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {filteredHobbies.map((h) => {
                                        const isSelected = Array.isArray(data.hobbies) && data.hobbies.includes(h);
                                        return (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => toggleHobby(h)}
                                                className={`rounded-lg border px-2 py-0.5 text-xs transition-all ${
                                                    isSelected
                                                        ? 'border-gold bg-gold/20 text-gold-deep font-semibold'
                                                        : 'border-ink/10 bg-white text-slate hover:border-gold/50'
                                                }`}
                                            >
                                                {isSelected ? '✓ ' : '+ '}{h}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    value={customHobbyInput}
                                    onChange={(e) => setCustomHobbyInput(e.target.value)}
                                    placeholder="Hobi lainnya..."
                                    className="input flex-1 text-xs"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomHobby();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomHobby}
                                    className="btn-ink text-xs px-3"
                                >
                                    + Tambah
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

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
