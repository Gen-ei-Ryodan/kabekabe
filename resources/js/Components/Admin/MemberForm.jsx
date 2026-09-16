import { useState } from 'react';
import { INDUSTRY_CATEGORIES, HOBBY_LIST } from '@/constants/membership';

export default function MemberForm({
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
    const [businessFieldInput, setBusinessFieldInput] = useState('');

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

    const addBusinessField = () => {
        const trimmed = businessFieldInput.trim();
        const currentBF = Array.isArray(data.business_fields) ? data.business_fields : [];
        if (trimmed && !currentBF.includes(trimmed)) {
            setData('business_fields', [...currentBF, trimmed]);
            setBusinessFieldInput('');
        }
    };

    const removeBusinessField = (fieldToRemove) => {
        const currentBF = Array.isArray(data.business_fields) ? data.business_fields : [];
        setData('business_fields', currentBF.filter((f) => f !== fieldToRemove));
    };

    const filteredHobbies = HOBBY_LIST.filter((h) =>
        h.toLowerCase().includes(hobbySearch.toLowerCase())
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* 1. DATA AKUN & PRIBADI */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                    1. Data Akun & Pribadi
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="email">Email *</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs text-ember">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="name">Nama Lengkap *</label>
                        <input
                            id="name"
                            type="text"
                            className="input"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-ember">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="nickname">Nama Panggilan</label>
                        <input
                            id="nickname"
                            type="text"
                            className="input"
                            value={data.nickname || ''}
                            onChange={(e) => setData('nickname', e.target.value)}
                            placeholder="Contoh: Alex, Sari"
                        />
                        {errors.nickname && <p className="mt-1 text-xs text-ember">{errors.nickname}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="gender">Jenis Kelamin</label>
                        <select
                            id="gender"
                            className="input"
                            value={data.gender || ''}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">Pilih jenis kelamin</option>
                            <option value="male">Laki-laki (male)</option>
                            <option value="female">Perempuan (female)</option>
                        </select>
                        {errors.gender && <p className="mt-1 text-xs text-ember">{errors.gender}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="phone">No. WhatsApp / Telepon</label>
                        <input
                            id="phone"
                            type="text"
                            className="input"
                            value={data.phone || ''}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="081234567890"
                        />
                        {errors.phone && <p className="mt-1 text-xs text-ember">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="birth_date">Tanggal Lahir</label>
                        <input
                            id="birth_date"
                            type="date"
                            className="input"
                            value={data.birth_date || ''}
                            onChange={(e) => setData('birth_date', e.target.value)}
                        />
                        {errors.birth_date && <p className="mt-1 text-xs text-ember">{errors.birth_date}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="birth_place">Kota Kelahiran</label>
                        <input
                            id="birth_place"
                            type="text"
                            className="input"
                            value={data.birth_place || ''}
                            onChange={(e) => setData('birth_place', e.target.value)}
                            placeholder="Denpasar, Surabaya..."
                        />
                        {errors.birth_place && <p className="mt-1 text-xs text-ember">{errors.birth_place}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="marital_status">Status Pernikahan</label>
                        <select
                            id="marital_status"
                            className="input"
                            value={data.marital_status || ''}
                            onChange={(e) => setData('marital_status', e.target.value)}
                        >
                            <option value="">Pilih status pernikahan</option>
                            <option value="Belum Menikah">Belum Menikah</option>
                            <option value="Menikah">Menikah</option>
                            <option value="Pernah Menikah">Pernah Menikah</option>
                        </select>
                        {errors.marital_status && <p className="mt-1 text-xs text-ember">{errors.marital_status}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="religion">Agama</label>
                        <select
                            id="religion"
                            className="input"
                            value={data.religion || ''}
                            onChange={(e) => setData('religion', e.target.value)}
                        >
                            <option value="">Pilih agama</option>
                            <option value="islam">Islam</option>
                            <option value="kristen">Kristen</option>
                            <option value="katolik">Katolik</option>
                            <option value="buddha">Buddha</option>
                            <option value="hindu">Hindu</option>
                            <option value="konghucu">Konghucu</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                        {errors.religion && <p className="mt-1 text-xs text-ember">{errors.religion}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="place_of_worship_address">Paroki Gereja / Alamat Tempat Ibadah</label>
                        <input
                            id="place_of_worship_address"
                            type="text"
                            className="input"
                            value={data.place_of_worship_address || ''}
                            onChange={(e) => setData('place_of_worship_address', e.target.value)}
                            placeholder="Contoh: Paroki FX Kuta, GBI Rock, dll."
                        />
                        {errors.place_of_worship_address && <p className="mt-1 text-xs text-ember">{errors.place_of_worship_address}</p>}
                    </div>
                </div>
            </section>

            {/* 2. DOMISILI / TEMPAT TINGGAL */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                    2. Domisili / Tempat Tinggal
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="address">Alamat Tempat Tinggal</label>
                        <textarea
                            id="address"
                            rows={2}
                            className="input"
                            value={data.address || ''}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Jalan, No. Rumah, RT/RW, Kelurahan/Desa"
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
                            placeholder="Contoh: Kuta, Denpasar Selatan"
                        />
                        {errors.district && <p className="mt-1 text-xs text-ember">{errors.district}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="city">Kota / Kabupaten</label>
                        <input
                            id="city"
                            type="text"
                            className="input"
                            value={data.city || ''}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Contoh: Denpasar, Badung"
                        />
                        {errors.city && <p className="mt-1 text-xs text-ember">{errors.city}</p>}
                    </div>
                </div>
            </section>

            {/* 3. INFORMASI USAHA & PEKERJAAN */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                    3. Informasi Usaha & Pekerjaan
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label" htmlFor="company">Nama Perusahaan / Tempat Kerja</label>
                        <input
                            id="company"
                            type="text"
                            className="input"
                            value={data.company || ''}
                            onChange={(e) => setData('company', e.target.value)}
                            placeholder="PT Sukses Mandiri..."
                        />
                        {errors.company && <p className="mt-1 text-xs text-ember">{errors.company}</p>}
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

                    <div className="sm:col-span-2">
                        <label className="label">Bidang Usaha (Tag Spesifik)</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="Ketik bidang usaha (misal: Retail, Ekspedisi, Katering)..."
                                value={businessFieldInput}
                                onChange={(e) => setBusinessFieldInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addBusinessField();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addBusinessField}
                                className="btn-ink text-xs px-4"
                            >
                                + Tambah
                            </button>
                        </div>
                        {Array.isArray(data.business_fields) && data.business_fields.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {data.business_fields.map((bf) => (
                                    <span
                                        key={bf}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink"
                                    >
                                        {bf}
                                        <button
                                            type="button"
                                            onClick={() => removeBusinessField(bf)}
                                            className="text-slate hover:text-ember"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.business_fields && <p className="mt-1 text-xs text-ember">{errors.business_fields}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="label" htmlFor="business_address">Alamat Kantor / Usaha</label>
                        <textarea
                            id="business_address"
                            rows={2}
                            className="input"
                            value={data.business_address || ''}
                            onChange={(e) => setData('business_address', e.target.value)}
                            placeholder="Alamat kantor atau lokasi toko..."
                        />
                        {errors.business_address && <p className="mt-1 text-xs text-ember">{errors.business_address}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="business_district">Kecamatan Kantor</label>
                        <input
                            id="business_district"
                            type="text"
                            className="input"
                            value={data.business_district || ''}
                            onChange={(e) => setData('business_district', e.target.value)}
                            placeholder="Kecamatan kantor"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="business_city">Kota / Kabupaten Kantor</label>
                        <input
                            id="business_city"
                            type="text"
                            className="input"
                            value={data.business_city || ''}
                            onChange={(e) => setData('business_city', e.target.value)}
                            placeholder="Kota/kabupaten kantor"
                        />
                    </div>
                </div>
            </section>

            {/* 4. HOBI & KESUKAAN */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                        4. Hobi & Kesukaan
                    </h3>
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

                <div className="space-y-2">
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

                    <div className="max-h-40 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2.5">
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
                </div>

                <div className="border-t border-ink/10 pt-2">
                    <label className="label">Lainnya (Hobi kustom)</label>
                    <div className="mt-1 flex gap-2">
                        <input
                            type="text"
                            value={customHobbyInput}
                            onChange={(e) => setCustomHobbyInput(e.target.value)}
                            placeholder="Ketik hobi kustom..."
                            className="input flex-1"
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
            </section>

            {/* 5. KEANGGOTAAN & KATA SANDI */}
            <section className="space-y-4 rounded-xl border border-ink/10 bg-white/40 p-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-deep">
                    5. Keanggotaan & Keamanan Akun
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    {isCreate && (
                        <div>
                            <label className="label" htmlFor="membership_period">Masa Berlaku Keanggotaan</label>
                            <select
                                id="membership_period"
                                className="input"
                                value={data.membership_period || '12'}
                                onChange={(e) => setData('membership_period', e.target.value)}
                            >
                                {[1, 3, 6, 12, 24, 36].map((m) => (
                                    <option key={m} value={String(m)}>
                                        {m} Bulan {m === 12 ? '(1 Tahun - Standar)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.membership_period && <p className="mt-1 text-xs text-ember">{errors.membership_period}</p>}
                        </div>
                    )}

                    <div className={isCreate ? '' : 'sm:col-span-2'}>
                        <label className="label" htmlFor="password">
                            {isCreate ? 'Kata Sandi *' : 'Kata Sandi Baru (kosongkan bila tidak diubah)'}
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={data.password || ''}
                            onChange={(e) => setData('password', e.target.value)}
                            required={isCreate}
                        />
                        {errors.password && <p className="mt-1 text-xs text-ember">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="password_confirmation">Konfirmasi Kata Sandi</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className="input"
                            value={data.password_confirmation || ''}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required={isCreate && Boolean(data.password)}
                        />
                    </div>
                </div>
            </section>

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
