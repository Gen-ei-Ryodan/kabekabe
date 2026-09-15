import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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

export default function MemberCreate() {
    const form = useForm({
        name: '',
        gender: '',
        birth_date: '',
        religion: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        whatsapp: '',
        company: '',
        industry: '',
        hobbies: [],
        custom_hobby: '',
        membership_period: '12',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.members.store'), { preserveScroll: true });
    };

    const handleHobbyChange = (hobby) => {
        const current = form.data.hobbies;
        if (current.includes(hobby)) {
            form.setData('hobbies', current.filter((h) => h !== hobby));
        } else {
            form.setData('hobbies', [...current, hobby]);
        }
    };

    const handleCustomHobby = (value) => {
        form.setData('custom_hobby', value);
        const filtered = form.data.hobbies.filter((h) => h !== form.data.custom_hobby);
        if (value) {
            form.setData('hobbies', [...filtered, value]);
        } else {
            form.setData('hobbies', filtered);
        }
    };

    return (
        <>
            <Head title="Tambah Member" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Manajemen Member</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Tambah Member Baru</h1>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <section className="space-y-4">
                        <h2 className="font-display text-lg font-bold">Data Diri</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="name">Nama Lengkap</label>
                                <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="gender">Jenis Kelamin</label>
                                <select id="gender" className="input" value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}>
                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                                {form.errors.gender && <p className="mt-1 text-xs text-ember">{form.errors.gender}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="birth_date">Tanggal Lahir</label>
                                <input id="birth_date" type="date" className="input" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} />
                                {form.errors.birth_date && <p className="mt-1 text-xs text-ember">{form.errors.birth_date}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="religion">Agama</label>
                                <select id="religion" className="input" value={form.data.religion} onChange={(e) => form.setData('religion', e.target.value)}>
                                    <option value="">Pilih agama</option>
                                    <option value="islam">Islam</option>
                                    <option value="kristen">Kristen</option>
                                    <option value="katolik">Katolik</option>
                                    <option value="buddha">Buddha</option>
                                    <option value="hindu">Hindu</option>
                                    <option value="konghucu">Konghucu</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                                {form.errors.religion && <p className="mt-1 text-xs text-ember">{form.errors.religion}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="email">Email</label>
                                <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                {form.errors.email && <p className="mt-1 text-xs text-ember">{form.errors.email}</p>}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-ink/10 pt-6">
                        <h2 className="font-display text-lg font-bold">Kontak</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="phone">Telepon</label>
                                <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                            </div>
                            <div>
                                <label className="label" htmlFor="whatsapp">WhatsApp</label>
                                <input id="whatsapp" type="text" className="input" value={form.data.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="company">Perusahaan</label>
                                <input id="company" type="text" className="input" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-ink/10 pt-6">
                        <h2 className="font-display text-lg font-bold">Industri & Hobby</h2>
                        <div>
                            <label className="label" htmlFor="industry">Bidang Industri</label>
                            <select id="industry" className="input" value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)}>
                                <option value="">Pilih bidang industri...</option>
                                {INDUSTRI_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {form.errors.industry && <p className="mt-1 text-xs text-ember">{form.errors.industry}</p>}
                        </div>
                        <div>
                            <label className="label">Hobby</label>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {HOBBY_OPTIONS.map((hobby) => (
                                    <label key={hobby} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-ink/20 accent-gold"
                                            checked={form.data.hobbies.includes(hobby)}
                                            onChange={() => handleHobbyChange(hobby)}
                                        />
                                        {hobby}
                                    </label>
                                ))}
                            </div>
                            <div className="mt-3">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Lainnya (isi sendiri)"
                                    value={form.data.custom_hobby}
                                    onChange={(e) => handleCustomHobby(e.target.value)}
                                />
                            </div>
                            {form.errors.hobbies && <p className="mt-1 text-xs text-ember">{form.errors.hobbies}</p>}
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-ink/10 pt-6">
                        <h2 className="font-display text-lg font-bold">Keanggotaan & Kata Sandi</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="membership_period">Durasi Keanggotaan</label>
                                <select id="membership_period" className="input" value={form.data.membership_period} onChange={(e) => form.setData('membership_period', e.target.value)}>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={String(i + 1)}>
                                            {i + 1} Bulan
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label" htmlFor="password">Kata Sandi</label>
                                <input id="password" type="password" className="input" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                                {form.errors.password && <p className="mt-1 text-xs text-ember">{form.errors.password}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="password_confirmation">Konfirmasi Kata Sandi</label>
                                <input id="password_confirmation" type="password" className="input" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.members.index')} className="btn-ghost">Batal</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Menyimpan…' : 'Tambah Member'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

MemberCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
