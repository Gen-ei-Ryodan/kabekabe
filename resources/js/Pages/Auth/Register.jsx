import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { HOBBY_LIST, INDUSTRY_CATEGORIES } from '@/constants/membership';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        role: 'member',
        // Common
        email: '',
        name: '',
        phone: '',
        address: '',
        district: '',
        city: '',
        // Member specific
        nickname: '',
        gender: '',
        birth_date: '',
        birth_place: '',
        marital_status: '',
        religion: '',
        place_of_worship_address: '',
        company: '',
        business_fields: [],
        business_address: '',
        business_district: '',
        business_city: '',
        industry: '',
        hobbies: [],
        // Partner specific
        pic_name: '',
        pic_phone: '',
        category: 'F&B',
    });

    const [hobbySearch, setHobbySearch] = useState('');
    const [customHobbyInput, setCustomHobbyInput] = useState('');
    const [businessFieldInput, setBusinessFieldInput] = useState('');

    const toggleHobby = (hobby) => {
        if (data.hobbies.includes(hobby)) {
            setData('hobbies', data.hobbies.filter((h) => h !== hobby));
        } else {
            setData('hobbies', [...data.hobbies, hobby]);
        }
    };

    const addCustomHobby = () => {
        const trimmed = customHobbyInput.trim();
        if (trimmed && !data.hobbies.includes(trimmed)) {
            setData('hobbies', [...data.hobbies, trimmed]);
            setCustomHobbyInput('');
        }
    };

    const addBusinessField = () => {
        const trimmed = businessFieldInput.trim();
        if (trimmed && !data.business_fields.includes(trimmed)) {
            setData('business_fields', [...data.business_fields, trimmed]);
            setBusinessFieldInput('');
        }
    };

    const removeBusinessField = (fieldToRemove) => {
        setData('business_fields', data.business_fields.filter((f) => f !== fieldToRemove));
    };

    const filteredHobbies = HOBBY_LIST.filter((h) =>
        h.toLowerCase().includes(hobbySearch.toLowerCase())
    );

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout maxWidth="max-w-3xl">
            <Head title="Pendaftaran Akun KBKB" />

            <header className="mb-6 text-center sm:text-left">
                <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep mb-2">
                    Keanggotaan KBKB
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    Formulir Registrasi
                </h1>
                <p className="mt-1 text-sm text-slate">
                    Silakan isi data lengkap Anda untuk bergabung dalam ekosistem komunitas KBKB.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-8">
                {/* Pilihan Role */}
                <div>
                    <InputLabel value="Tipe Pendaftaran" className="mb-2 text-sm font-semibold" />
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setData('role', 'member')}
                            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                                data.role === 'member'
                                    ? 'border-gold bg-gold/10 text-gold-deep font-bold shadow-sm ring-2 ring-gold/40'
                                    : 'border-ink/15 bg-white/70 text-slate hover:bg-ink/5'
                            }`}
                        >
                            <span className="text-2xl mb-1.5">🪪</span>
                            <span className="text-sm font-semibold">Anggota (Member)</span>
                            <span className="text-xs text-slate mt-0.5">Kartu digital, promo & jejaring</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setData('role', 'partner')}
                            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                                data.role === 'partner'
                                    ? 'border-gold bg-gold/10 text-gold-deep font-bold shadow-sm ring-2 ring-gold/40'
                                    : 'border-ink/15 bg-white/70 text-slate hover:bg-ink/5'
                            }`}
                        >
                            <span className="text-2xl mb-1.5">🏪</span>
                            <span className="text-sm font-semibold">Mitra Usaha (Partner)</span>
                            <span className="text-xs text-slate mt-0.5">Promosi brand & merchant KBKB</span>
                        </button>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* FORM MEMBER                                          */}
                {/* ==================================================== */}
                {data.role === 'member' && (
                    <div className="space-y-8">
                        {/* 1. DATA AKUN & PRIBADI */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">1</span>
                                    Data Akun & Pribadi
                                </h2>
                                <p className="text-xs text-slate mt-0.5">Informasi identitas dasar untuk profil keanggotaan Anda.</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="email" value="Alamat Email *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="nama@email.com"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Nama sesuai KTP"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nickname" value="Nama Panggilan" />
                                    <TextInput
                                        id="nickname"
                                        value={data.nickname}
                                        onChange={(e) => setData('nickname', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Alex, Sari"
                                    />
                                    <InputError message={errors.nickname} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="gender" value="Jenis Kelamin" />
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    >
                                        <option value="">Pilih Jenis Kelamin...</option>
                                        <option value="Pria">Pria</option>
                                        <option value="Wanita">Wanita</option>
                                    </select>
                                    <InputError message={errors.gender} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="No. WhatsApp / Telepon *" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="081234567890"
                                    />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="birth_date" value="Tanggal Lahir" />
                                    <TextInput
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.birth_date} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="birth_place" value="Kota Kelahiran" />
                                    <TextInput
                                        id="birth_place"
                                        value={data.birth_place}
                                        onChange={(e) => setData('birth_place', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Denpasar, Surabaya, Jakarta"
                                    />
                                    <InputError message={errors.birth_place} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="marital_status" value="Status Pernikahan" />
                                    <select
                                        id="marital_status"
                                        value={data.marital_status}
                                        onChange={(e) => setData('marital_status', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    >
                                        <option value="">Pilih Status...</option>
                                        <option value="Belum Menikah">Belum Menikah</option>
                                        <option value="Menikah">Menikah</option>
                                        <option value="Pernah Menikah">Pernah Menikah</option>
                                    </select>
                                    <InputError message={errors.marital_status} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="religion" value="Agama" />
                                    <select
                                        id="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
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
                                    <InputError message={errors.religion} className="mt-1" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="place_of_worship_address" value="Paroki Gereja / Alamat Tempat Ibadah" />
                                    <TextInput
                                        id="place_of_worship_address"
                                        value={data.place_of_worship_address}
                                        onChange={(e) => setData('place_of_worship_address', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Paroki FX Kuta, GBI Rock, dll."
                                    />
                                    <InputError message={errors.place_of_worship_address} className="mt-1" />
                                </div>
                            </div>
                        </section>

                        {/* 2. DOMISILI / TEMPAT TINGGAL */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">2</span>
                                    Domisili / Tempat Tinggal
                                </h2>
                                <p className="text-xs text-slate mt-0.5">Alamat tempat tinggal Anda saat ini.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="address" value="Alamat Tempat Tinggal" />
                                    <textarea
                                        id="address"
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                        placeholder="Jalan, No. Rumah, RT/RW, Kelurahan/Desa"
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="district" value="Kecamatan Tempat Tinggal" />
                                        <TextInput
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Contoh: Kuta, Sanur, Denpasar Selatan"
                                        />
                                        <InputError message={errors.district} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="city" value="Kota / Kabupaten Tempat Tinggal" />
                                        <TextInput
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Contoh: Denpasar, Badung, Gianyar"
                                        />
                                        <InputError message={errors.city} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. PEKERJAAN & USAHA */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">3</span>
                                    Informasi Usaha & Pekerjaan
                                </h2>
                                <p className="text-xs text-slate mt-0.5">Bidang bisnis atau instansi tempat Anda beraktivitas.</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="company" value="Nama Perusahaan / Tempat Kerja" />
                                    <TextInput
                                        id="company"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: PT Sukses Mandiri / Usaha Mandiri"
                                    />
                                    <InputError message={errors.company} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="industry" value="Bidang Industri" />
                                    <select
                                        id="industry"
                                        value={data.industry}
                                        onChange={(e) => setData('industry', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    >
                                        <option value="">Pilih Bidang Industri...</option>
                                        {INDUSTRY_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.industry} className="mt-1" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel value="Bidang Usaha (Dapat menambah beberapa)" />
                                    <div className="mt-1.5 flex gap-2">
                                        <TextInput
                                            value={businessFieldInput}
                                            onChange={(e) => setBusinessFieldInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addBusinessField();
                                                }
                                            }}
                                            placeholder="Ketik bidang usaha (misal: Retail, Ekspedisi, Katering)..."
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={addBusinessField}
                                            className="btn-ink text-xs px-4 py-2"
                                        >
                                            + Tambah
                                        </button>
                                    </div>
                                    {data.business_fields.length > 0 && (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5">
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
                                    <InputError message={errors.business_fields} className="mt-1" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="business_address" value="Alamat Kantor / Usaha" />
                                    <textarea
                                        id="business_address"
                                        rows={2}
                                        value={data.business_address}
                                        onChange={(e) => setData('business_address', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                        placeholder="Alamat kantor atau lokasi toko..."
                                    />
                                    <InputError message={errors.business_address} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="business_district" value="Kecamatan Usaha" />
                                    <TextInput
                                        id="business_district"
                                        value={data.business_district}
                                        onChange={(e) => setData('business_district', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Kecamatan kantor"
                                    />
                                    <InputError message={errors.business_district} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="business_city" value="Kota / Kabupaten Usaha" />
                                    <TextInput
                                        id="business_city"
                                        value={data.business_city}
                                        onChange={(e) => setData('business_city', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Kota/Kabupaten kantor"
                                    />
                                    <InputError message={errors.business_city} className="mt-1" />
                                </div>
                            </div>
                        </section>

                        {/* 4. HOBI & KESUKAAN */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">4</span>
                                    Hobi & Kesukaan
                                </h2>
                                <p className="text-xs text-slate mt-0.5">
                                    Pilih minat atau hobi untuk memudahkan networking dengan sesama anggota komunitas.
                                </p>
                            </div>

                            {/* Terpilih */}
                            <div>
                                <InputLabel value={`Hobi Terpilih (${data.hobbies.length})`} className="mb-1.5" />
                                {data.hobbies.length === 0 ? (
                                    <p className="text-xs italic text-slate">Belum ada hobi yang dipilih.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.hobbies.map((h) => (
                                            <span
                                                key={h}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep"
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
                            </div>

                            {/* Search box & filterable list */}
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <TextInput
                                        type="text"
                                        value={hobbySearch}
                                        onChange={(e) => setHobbySearch(e.target.value)}
                                        placeholder="Cari dari 58 pilihan hobi (misal: Bulutangkis, Golf, Memasak)..."
                                        className="flex-1 text-xs"
                                    />
                                    {hobbySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setHobbySearch('')}
                                            className="btn-ghost text-xs px-3"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/10 bg-white/80 p-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {filteredHobbies.map((h) => {
                                            const isSelected = data.hobbies.includes(h);
                                            return (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => toggleHobby(h)}
                                                    className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                                                        isSelected
                                                            ? 'border-gold bg-gold/20 text-gold-deep font-semibold shadow-xs'
                                                            : 'border-ink/10 bg-white text-slate hover:border-gold/50 hover:text-ink'
                                                    }`}
                                                >
                                                    {isSelected ? '✓ ' : '+ '}{h}
                                                </button>
                                            );
                                        })}
                                        {filteredHobbies.length === 0 && (
                                            <p className="text-xs text-slate py-1">Tidak ditemukan pilihan hobi yang sesuai.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Opsi Custom Hobby Lainnya */}
                            <div className="border-t border-ink/10 pt-3">
                                <InputLabel value="Lainnya (sebutkan hobi khusus jika belum tersedia di atas)" />
                                <div className="mt-1.5 flex gap-2">
                                    <TextInput
                                        value={customHobbyInput}
                                        onChange={(e) => setCustomHobbyInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addCustomHobby();
                                            }
                                        }}
                                        placeholder="Ketik nama hobi lainnya..."
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomHobby}
                                        className="btn-ink text-xs px-4 py-2"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ==================================================== */}
                {/* FORM PARTNER                                         */}
                {/* ==================================================== */}
                {data.role === 'partner' && (
                    <div className="space-y-8">
                        {/* 1. DATA PEMILIK / PIC */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">1</span>
                                    Data Pemilik / PIC
                                </h2>
                                <p className="text-xs text-slate mt-0.5">Penanggung jawab akun mitra dan kontak personal.</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="pic_name" value="Nama Pemilik / PIC *" />
                                    <TextInput
                                        id="pic_name"
                                        value={data.pic_name}
                                        onChange={(e) => setData('pic_name', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Nama lengkap PIC"
                                        required
                                    />
                                    <InputError message={errors.pic_name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pic_phone" value="Nomor Telepon Pemilik / PIC *" />
                                    <TextInput
                                        id="pic_phone"
                                        type="tel"
                                        value={data.pic_phone}
                                        onChange={(e) => setData('pic_phone', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="081234567890"
                                        required
                                    />
                                    <InputError message={errors.pic_phone} className="mt-1" />
                                </div>
                            </div>
                        </section>

                        {/* 2. DATA PERUSAHAAN / USAHA */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">2</span>
                                    Data Usaha & Perusahaan
                                </h2>
                                <p className="text-xs text-slate mt-0.5">Informasi profil bisnis yang akan ditampilkan kepada anggota.</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="name" value="Nama Perusahaan / Usaha *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Kopi Cantik Bali, Toko Sinar Maju"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category" value="Kategori Usaha" />
                                    <TextInput
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="F&B, Retail, Fashion, Otomotif, dll."
                                    />
                                    <InputError message={errors.category} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="partner_industry" value="Bidang Industri" />
                                    <select
                                        id="partner_industry"
                                        value={data.industry}
                                        onChange={(e) => setData('industry', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    >
                                        <option value="">Pilih Bidang Industri...</option>
                                        {INDUSTRY_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.industry} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email Perusahaan (Untuk Login) *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="info@perusahaan.com"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Nomor Telepon Perusahaan" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="0361-XXXXXX atau No WA Kantor"
                                    />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>
                            </div>
                        </section>

                        {/* 3. LOKASI USAHA */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">3</span>
                                    Alamat Kantor & Lokasi Usaha
                                </h2>
                                <p className="text-xs text-slate mt-0.5">Lokasi operasional atau gerai mitra usaha.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="address" value="Alamat Kantor / Usaha" />
                                    <textarea
                                        id="address"
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                        placeholder="Tulis alamat toko / outlet / kantor..."
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="district" value="Kecamatan" />
                                        <TextInput
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Contoh: Kuta, Ubud, Denpasar Barat"
                                        />
                                        <InputError message={errors.district} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="city" value="Kota / Kabupaten" />
                                        <TextInput
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Contoh: Badung, Denpasar, Gianyar"
                                        />
                                        <InputError message={errors.city} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Notifikasi Sistem & Submit */}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-xs text-slate space-y-1">
                    <p className="font-semibold text-gold-deep flex items-center gap-1.5">
                        <span>ℹ️</span> Informasi Keamanan Akun:
                    </p>
                    <p>
                        Password sementara akan di-generate otomatis oleh sistem setelah formulir dikirim. Anda dapat login menggunakan password tersebut dan langsung menggantinya pada halaman profil.
                    </p>
                    <p>
                        Pendaftaran Anda akan ditinjau dan diverifikasi oleh admin pengurus KBKB terlebih dahulu.
                    </p>
                </div>

                <PrimaryButton className="w-full justify-center py-3 text-base font-semibold" disabled={processing}>
                    {processing ? 'Memproses Pendaftaran…' : 'Kirim Pendaftaran'}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate">
                Sudah memiliki akun?{' '}
                <Link href={route('login')} className="font-semibold text-gold-deep hover:underline">
                    Masuk di sini
                </Link>
            </p>
        </GuestLayout>
    );
}