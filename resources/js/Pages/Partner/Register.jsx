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

    const submit = (e) => {
        e.preventDefault();
        post(route('partner.register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
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
        setData('custom_hobby', value);
        const filtered = data.hobbies.filter((h) => h !== data.custom_hobby);
        if (value) {
            setData('hobbies', [...filtered, value]);
        } else {
            setData('hobbies', filtered);
        }
    };

    return (
        <GuestLayout>
            <Head title="Register Partner" />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight">Partner Registration</h1>
                <p className="mt-1 text-sm text-slate">Join KBKB as a partner and grow your business with our community.</p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                {/* Company Information */}
                <section className="space-y-4">
                    <h2 className="font-display text-lg font-bold">Company Information</h2>

                    <div>
                        <InputLabel htmlFor="company_name" value="Nama Perusahaan" />
                        <TextInput
                            id="company_name"
                            name="company_name"
                            value={data.company_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('company_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.company_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="company_address" value="Alamat Perusahaan" />
                        <TextInput
                            id="company_address"
                            name="company_address"
                            value={data.company_address}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('company_address', e.target.value)}
                        />
                        <InputError message={errors.company_address} className="mt-2" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="company_phone" value="Nomor Telfon Perusahaan" />
                            <TextInput
                                id="company_phone"
                                name="company_phone"
                                value={data.company_phone}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('company_phone', e.target.value)}
                            />
                            <InputError message={errors.company_phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="employee_count" value="Jumlah Karyawan" />
                            <TextInput
                                id="employee_count"
                                name="employee_count"
                                type="number"
                                value={data.employee_count}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('employee_count', e.target.value)}
                            />
                            <InputError message={errors.employee_count} className="mt-2" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="established_since" value="Berdiri Sejak" />
                        <TextInput
                            id="established_since"
                            name="established_since"
                            placeholder="Contoh: 2020"
                            value={data.established_since}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('established_since', e.target.value)}
                        />
                        <InputError message={errors.established_since} className="mt-2" />
                    </div>
                </section>

                {/* PIC Information */}
                <section className="space-y-4 border-t border-ink/10 pt-6">
                    <h2 className="font-display text-lg font-bold">PIC (Person In Charge)</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="pic_name" value="PIC" />
                            <TextInput
                                id="pic_name"
                                name="pic_name"
                                value={data.pic_name}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('pic_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.pic_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="pic_phone" value="Nomor HP PIC" />
                            <TextInput
                                id="pic_phone"
                                name="pic_phone"
                                value={data.pic_phone}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('pic_phone', e.target.value)}
                                required
                            />
                            <InputError message={errors.pic_phone} className="mt-2" />
                        </div>
                    </div>
                </section>

                {/* Member Check */}
                <section className="space-y-4 border-t border-ink/10 pt-6">
                    <h2 className="font-display text-lg font-bold">Membership Status</h2>

                    <div>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-ink/20 accent-gold"
                                checked={data.is_member}
                                onChange={(e) => {
                                    setData('is_member', e.target.checked);
                                    if (!e.target.checked) {
                                        setData('member_code', '');
                                    }
                                }}
                            />
                            <span className="text-sm">Apakah anda sudah bergabung sebagai member?</span>
                        </label>
                    </div>

                    {data.is_member && (
                        <div>
                            <InputLabel htmlFor="member_code" value="Nomor ID Member" />
                            <TextInput
                                id="member_code"
                                name="member_code"
                                placeholder="Contoh: MMB-00001"
                                value={data.member_code}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('member_code', e.target.value)}
                                required
                            />
                            <InputError message={errors.member_code} className="mt-2" />
                        </div>
                    )}
                </section>

                {/* Account Information */}
                <section className="space-y-4 border-t border-ink/10 pt-6">
                    <h2 className="font-display text-lg font-bold">Account Information</h2>

                    <div>
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="phone" value="Nomor HP" />
                            <TextInput
                                id="phone"
                                name="phone"
                                value={data.phone}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="date_of_birth" value="Tanggal Lahir" />
                            <TextInput
                                id="date_of_birth"
                                type="date"
                                name="date_of_birth"
                                value={data.date_of_birth}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                            />
                            <InputError message={errors.date_of_birth} className="mt-2" />
                        </div>
                    </div>
                </section>

                {/* Industry & Hobbies */}
                <section className="space-y-4 border-t border-ink/10 pt-6">
                    <h2 className="font-display text-lg font-bold">Industry & Hobbies</h2>

                    <div>
                        <InputLabel htmlFor="industry" value="Bidang Industri" />
                        <select
                            id="industry"
                            className="input mt-1 block w-full"
                            value={data.industry}
                            onChange={(e) => setData('industry', e.target.value)}
                        >
                            <option value="">Pilih bidang industri...</option>
                            {INDUSTRI_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.industry} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Hobby" />
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {HOBBY_OPTIONS.map((hobby) => (
                                <label key={hobby} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-ink/20 accent-gold"
                                        checked={data.hobbies.includes(hobby)}
                                        onChange={() => handleHobbyChange(hobby)}
                                    />
                                    {hobby}
                                </label>
                            ))}
                        </div>
                        <div className="mt-3">
                            <TextInput
                                id="custom_hobby"
                                name="custom_hobby"
                                placeholder="Lainnya (isi sendiri)"
                                value={data.custom_hobby}
                                className="block w-full"
                                onChange={(e) => handleCustomHobby(e.target.value)}
                            />
                        </div>
                        <InputError message={errors.hobbies} className="mt-2" />
                    </div>
                </section>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Processing…' : 'Register as Partner'}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate">
                Already have an account?{' '}
                <Link href={route('login')} className="font-semibold text-gold-deep hover:underline">
                    Login
                </Link>
            </p>
        </GuestLayout>
    );
}
