import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const INDUSTRI_OPTIONS = [
    'Jasa',
    'F&B - Resto/depot',
    'Hotel & Villa',
    'Kesenian, hiburan dan rekreasi',
    'Perdagangan besar/eceran',
    'Konsultan',
    'Informasi & Komunikasi',
    'Kesehatan',
    'Event organizer',
    'Konstruksi - interior',
    'F&B - Coffee Shop',
    'Konstruksi - exterior',
    'Pendidikan',
    'Arsitektur',
    'Agen perjalanan',
    'Real estate',
    'F&B - Supplier',
    'Keuangan & Akuntansi',
    'F&B - Baking',
    'Elektronik',
    'Penyewaan & sewa guna',
    'Asuransi, dan lain lain',
    'Elektrikal',
    'Otomotif - Roda Empat',
    'Sosial',
    'Otomotif-Parts & aksesoris',
    'Ketenagakerjaan',
    'Trader Forex/saham',
    'Percetakan',
    'Otomotif-Roda Dua & Tiga',
    'Pemerintahan',
    'Pergudangan',
    'Perpajakan',
    'Valuta Asing',
    'Perikanan',
    'Pertanian',
    'Salon',
    'Sekuritas',
    'Ahli ilmiah & teknis',
    'Farmasi',
    'Gas & uap',
    'Pengolahan',
    'Badan internasional',
    'Kehutanan',
    'Pengangkutan',
    'Pertambangan & penggalian',
    'Reparasi',
];

const HOBBY_OPTIONS = [
    'Nonton film',
    'Ngopi',
    'Mendengar Musik',
    'Bulutangkis',
    'Seminar Bisnis',
    'Art & Craft',
    'Camping/glamping',
    'Running/jogging',
    'Fitness/weightlifting',
    'BBQ',
    'Persekutuan Doa',
    'Motorcycle Riding',
    'Nyanyi',
    'Pekerjaan Sosial',
    'Bermain Musik',
    'Memasak',
    'Baking',
    'Hiking',
    'Membaca',
    'Photography',
    'Yoga',
    'Gadget/elektronik',
    'Basketball',
    'Sepeda',
    'Meditasi',
    'Graphic Design',
    'Parenting',
    'Bertaman',
    'Gaming',
    'Billiard',
    'Melukis',
    'Soccer/futsal',
    'Merangkai Bunga',
    'Pilates',
    'Tennis meja',
    'Wine tasting',
    'Dancing',
    'Tennis',
    'Makeup/cosmetic',
    'Rafting',
    'Golf',
    'Catur',
    'Martial Art',
    'Memancing',
    'Nutrisi',
    'Horse Riding',
    'Scuba Diving',
    'Ice Skating',
    'Hair Styling',
    'Surfing',
    'Ikan hias',
    'Menjahit',
    'Kaligrafi',
    'Kayaking',
    'Origami',
    'Reptil',
    'Lainnya',
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        company_address: '',
        company_phone: '',
        employee_count: '',
        established_since: '',
        pic_name: '',
        pic_phone: '',
        is_member: false,
        member_code: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        date_of_birth: '',
        industry: '',
        hobbies: [],
        custom_hobby: '',
    });

    const [industrySearch, setIndustrySearch] = useState('');
    const [hobbySearch, setHobbySearch] = useState('');
    const [customHobbyInput, setCustomHobbyInput] = useState('');

    const filteredIndustries = INDUSTRI_OPTIONS.filter((i) =>
        i.toLowerCase().includes(industrySearch.toLowerCase())
    );

    const filteredHobbies = HOBBY_OPTIONS.filter((h) =>
        h.toLowerCase().includes(hobbySearch.toLowerCase())
    );

    const handleIndustryChange = (industry) => {
        setData('industry', industry);
        setIndustrySearch('');
    };

    const handleHobbyChange = (hobby) => {
        const current = data.hobbies;
        if (current.includes(hobby)) {
            setData('hobbies', current.filter((h) => h !== hobby));
        } else {
            setData('hobbies', [...current, hobby]);
        }
    };

    const handleCustomHobby = (value) => {
        setCustomHobbyInput(value);
        const filtered = data.hobbies.filter((h) => h !== data.custom_hobby);
        if (value) {
            setData('hobbies', [...filtered, value]);
        } else {
            setData('hobbies', filtered);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('partner.register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidth="max-w-3xl">
            <Head title="Registrasi Partner KBKB" />

            <header className="mb-6 text-center sm:text-left">
                <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep mb-2">
                    Mitra Usaha KBKB
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    Formulir Registrasi Partner
                </h1>
                <p className="mt-1 text-sm text-slate">
                    Isi data lengkap perusahaan Anda untuk bergabung sebagai mitra usaha KBKB.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-8">
                {/* 1. DATA PERUSAHAAN */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">1</span>
                            Data Perusahaan
                        </h2>
                        <p className="text-xs text-slate mt-0.5">Informasi identitas perusahaan/usaha Anda.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="company_name" value="Nama Perusahaan *" />
                            <TextInput
                                id="company_name"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Contoh: PT Maju Jaya, Kopi Cantik Bali"
                                required
                            />
                            <InputError message={errors.company_name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="industry" value="Bidang Industri *" />
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <TextInput
                                        type="text"
                                        value={industrySearch}
                                        onChange={(e) => setIndustrySearch(e.target.value)}
                                        placeholder="Cari bidang industri (misal: F&B, Hotel, Retail)..."
                                        className="flex-1 text-xs"
                                    />
                                    {industrySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setIndustrySearch('')}
                                            className="btn-ghost text-xs px-3"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/10 bg-white/80 p-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {filteredIndustries.map((ind) => {
                                            const isSelected = data.industry === ind;
                                            return (
                                                <button
                                                    key={ind}
                                                    type="button"
                                                    onClick={() => handleIndustryChange(ind)}
                                                    className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                                                        isSelected
                                                            ? 'border-gold bg-gold/20 text-gold-deep font-semibold shadow-xs'
                                                            : 'border-ink/10 bg-white text-slate hover:border-gold/50 hover:text-ink'
                                                    }`}
                                                >
                                                    {isSelected ? '✓ ' : ''}{ind}
                                                </button>
                                            );
                                        })}
                                        {filteredIndustries.length === 0 && (
                                            <p className="text-xs text-slate py-1">Tidak ditemukan pilihan industri.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <InputError message={errors.industry} className="mt-1" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="company_phone" value="Nomor Telepon Perusahaan" />
                                <TextInput
                                    id="company_phone"
                                    type="tel"
                                    value={data.company_phone}
                                    onChange={(e) => setData('company_phone', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="0361-XXXXXX / 0812-XXXX-XXXX"
                                />
                                <InputError message={errors.company_phone} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="employee_count" value="Jumlah Karyawan" />
                                <TextInput
                                    id="employee_count"
                                    type="number"
                                    value={data.employee_count}
                                    onChange={(e) => setData('employee_count', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: 25"
                                />
                                <InputError message={errors.employee_count} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="established_since" value="Berdiri Sejak" />
                                <TextInput
                                    id="established_since"
                                    value={data.established_since}
                                    onChange={(e) => setData('established_since', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: 2020"
                                />
                                <InputError message={errors.established_since} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="company_address" value="Alamat Perusahaan" />
                                <textarea
                                    id="company_address"
                                    rows={2}
                                    value={data.company_address}
                                    onChange={(e) => setData('company_address', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan/Desa, Kota"
                                />
                                <InputError message={errors.company_address} className="mt-1" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. PIC (PERSON IN CHARGE) */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">2</span>
                            PIC (Person In Charge)
                        </h2>
                        <p className="text-xs text-slate mt-0.5">Penanggung jawab akun mitra dan kontak personal.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="pic_name" value="Nama PIC *" />
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
                            <InputLabel htmlFor="pic_phone" value="Nomor HP PIC *" />
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

                {/* 3. STATUS KEANGGOTAAN */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">3</span>
                            Status Keanggotaan
                        </h2>
                        <p className="text-xs text-slate mt-0.5">Apakah Anda sudah bergabung sebagai member KBKB?</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-ink/10 bg-white/80">
                        <input
                            type="checkbox"
                            id="is_member"
                            className="h-5 w-5 rounded border-ink/20 accent-gold"
                            checked={data.is_member}
                            onChange={(e) => {
                                setData('is_member', e.target.checked);
                                if (!e.target.checked) {
                                    setData('member_code', '');
                                }
                            }}
                        />
                        <label htmlFor="is_member" className="cursor-pointer text-sm font-medium text-ink">
                            Sudah bergabung sebagai member KBKB
                        </label>
                    </div>

                    {data.is_member && (
                        <div className="border-t border-ink/10 pt-3">
                            <InputLabel htmlFor="member_code" value="Nomor ID Member *" />
                            <TextInput
                                id="member_code"
                                value={data.member_code}
                                onChange={(e) => setData('member_code', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Contoh: MMB-00001"
                                required
                            />
                            <InputError message={errors.member_code} className="mt-1" />
                        </div>
                    )}
                </section>

                {/* 4. AKUN LOGIN & DATA DIRI */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">4</span>
                            Akun Login & Data Diri
                        </h2>
                        <p className="text-xs text-slate mt-0.5">Kredensial untuk mengakses dashboard partner KBKB.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap *" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                autoComplete="name"
                                placeholder="Nama sesuai KTP"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email (Untuk Login) *" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                placeholder="email@perusahaan.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="password" value="Password *" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    required
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password *" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="phone" value="Nomor HP" />
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
                                <InputLabel htmlFor="date_of_birth" value="Tanggal Lahir" />
                                <TextInput
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.date_of_birth} className="mt-1" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. HOBI */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">5</span>
                            Hobi & Kesukaan
                        </h2>
                        <p className="text-xs text-slate mt-0.5">Pilih minat/hobi untuk memudahkan networking dengan sesama mitra KBKB.</p>
                    </div>

                    {/* Hobi Terpilih */}
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
                                            onClick={() => handleHobbyChange(h)}
                                            className="hover:text-ember ml-1"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search & List */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <TextInput
                                type="text"
                                value={hobbySearch}
                                onChange={(e) => setHobbySearch(e.target.value)}
                                placeholder="Cari dari 60+ pilihan hobi (misal: Bulutangkis, Golf, Memasak)..."
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
                                {filteredHobbies.map((hobby) => {
                                    const isSelected = data.hobbies.includes(hobby);
                                    return (
                                        <button
                                            key={hobby}
                                            type="button"
                                            onClick={() => handleHobbyChange(hobby)}
                                            className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                                                isSelected
                                                    ? 'border-gold bg-gold/20 text-gold-deep font-semibold shadow-xs'
                                                    : 'border-ink/10 bg-white text-slate hover:border-gold/50 hover:text-ink'
                                            }`}
                                        >
                                            {isSelected ? '✓ ' : '+ '}{hobby}
                                        </button>
                                    );
                                })}
                                {filteredHobbies.length === 0 && (
                                    <p className="text-xs text-slate py-1">Tidak ditemukan pilihan hobi yang sesuai.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Custom Hobby */}
                    <div className="border-t border-ink/10 pt-3">
                        <InputLabel value="Lainnya (sebutkan hobi khusus jika belum tersedia di atas)" />
                        <div className="mt-1.5 flex gap-2">
                            <TextInput
                                value={customHobbyInput}
                                onChange={(e) => setCustomHobbyInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCustomHobby(e.target.value);
                                        setCustomHobbyInput('');
                                    }
                                }}
                                placeholder="Ketik nama hobi lainnya..."
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    handleCustomHobby(customHobbyInput);
                                    setCustomHobbyInput('');
                                }}
                                className="btn-ink text-xs px-4 py-2"
                            >
                                + Tambah
                            </button>
                        </div>
                    </div>
                </section>

                {/* Notifikasi & Submit */}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-xs text-slate space-y-1">
                    <p className="font-semibold text-gold-deep flex items-center gap-1.5">
                        <span>ℹ️</span> Informasi:
                    </p>
                    <p>
                        Pendaftaran partner akan ditinjau oleh tim KBKB. Anda akan menerima email konfirmasi setelah diverifikasi.
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

            <p className="mt-2 text-center text-sm text-slate">
                Ingin daftar sebagai member biasa?{' '}
                <Link href={route('register')} className="font-semibold text-gold-deep hover:underline">
                    Daftar Member
                </Link>
            </p>
        </GuestLayout>
    );
}