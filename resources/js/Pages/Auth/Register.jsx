import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        role: 'member',
        name: '',
        email: '',
        phone: '',
        address: '',
        partner_category: 'F&B',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Pendaftaran Akun KBKB" />

            <header className="mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Gabung KBKB</h1>
                <p className="mt-1 text-sm text-slate">
                    Pilih tipe pendaftaran untuk bergabung ke dalam ekosistem komunitas KBKB.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                {/* Pilihan Role */}
                <div>
                    <InputLabel value="Daftar Sebagai" className="mb-2" />
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setData('role', 'member')}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all ${
                                data.role === 'member'
                                    ? 'border-gold bg-gold/10 text-gold-deep font-bold shadow-sm ring-1 ring-gold'
                                    : 'border-ink/15 bg-white/60 text-slate hover:bg-ink/5'
                            }`}
                        >
                            <span className="text-lg mb-1">🪪</span>
                            <span className="text-sm">Member</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setData('role', 'partner')}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all ${
                                data.role === 'partner'
                                    ? 'border-gold bg-gold/10 text-gold-deep font-bold shadow-sm ring-1 ring-gold'
                                    : 'border-ink/15 bg-white/60 text-slate hover:bg-ink/5'
                            }`}
                        >
                            <span className="text-lg mb-1">🏪</span>
                            <span className="text-sm">Partner (Vendor)</span>
                        </button>
                    </div>
                </div>

                {/* Nama Lengkap / Usaha */}
                <div>
                    <InputLabel htmlFor="name" value={data.role === 'partner' ? 'Nama Usaha / Brand Partner' : 'Nama Lengkap'} />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={data.role === 'partner' ? 'Contoh: Kafe Kopi Mantap' : 'Contoh: Ahmad Fauzi'}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Kategori Partner (jika Partner) */}
                {data.role === 'partner' && (
                    <div>
                        <InputLabel htmlFor="partner_category" value="Kategori Usaha" />
                        <select
                            id="partner_category"
                            value={data.partner_category}
                            onChange={(e) => setData('partner_category', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            <option value="F&B">F&B (Makanan & Minuman)</option>
                            <option value="Retail">Retail & Belanja</option>
                            <option value="Jasa">Jasa & Layanan</option>
                            <option value="Kesehatan">Kesehatan & Kecantikan</option>
                            <option value="Otomotif">Otomotif</option>
                            <option value="Olahraga">Olahraga & Hobi</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                        <InputError message={errors.partner_category} className="mt-2" />
                    </div>
                )}

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@email.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* No Telepon / WhatsApp */}
                <div>
                    <InputLabel htmlFor="phone" value="No. WhatsApp / Telepon" />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="081234567890"
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                {/* Alamat */}
                <div>
                    <InputLabel htmlFor="address" value="Alamat Domisili / Lokasi" />
                    <textarea
                        id="address"
                        name="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        rows={2}
                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        placeholder="Tulis alamat lengkap..."
                    />
                    <InputError message={errors.address} className="mt-2" />
                </div>

                <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-slate">
                    ℹ️ <strong>Catatan:</strong> Password awal akan di-generate otomatis oleh sistem setelah formulir dikirim. Pendaftaran Anda akan ditinjau dan disetujui oleh Admin terlebih dahulu.
                </div>

                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Memproses Pendaftaran…' : 'Daftar Sekarang'}
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