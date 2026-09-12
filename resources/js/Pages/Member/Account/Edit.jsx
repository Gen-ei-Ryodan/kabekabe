import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import Avatar from '@/Components/Avatar';

export default function AccountEdit({ account }) {
    const { data, setData, put, processing, errors } = useForm({
        name: account.name || '',
        email: account.email || '',
        religion: account.religion || '',
        address: account.address || '',
        whatsapp: account.whatsapp || '',
        company: account.company || '',
        avatar: null,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('member.account.update'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Pengaturan Profil" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Pengaturan Akun</h1>
                    <p className="mt-1 text-sm text-slate">Perbarui data profil member, informasi kontak, dan keamanan akun Anda.</p>
                </header>

                <form onSubmit={submit} className="mt-8 space-y-8">
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold text-ink">Profil Member</h2>

                            <div className="mt-6 flex items-center gap-5">
                                <Avatar
                                    src={account.avatar_url}
                                    name={account.name}
                                    tone="dark"
                                    className="h-20 w-20 rounded-full border-2 border-gold text-2xl"
                                />
                                <div>
                                    <label className="btn-ghost cursor-pointer text-xs">
                                        {data.avatar ? 'Foto dipilih ✓' : 'Ganti Foto Profil'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setData('avatar', e.target.files[0])}
                                        />
                                    </label>
                                    {errors.avatar && <p className="mt-1 text-xs text-ember">{errors.avatar}</p>}
                                    <p className="mt-1.5 text-[11px] text-slate-soft">
                                        Pilih foto wajah yang jelas agar mudah dikenali. Format rasio 1:1, minimal 400×400px (maks 2MB).
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="name">Nama Lengkap</label>
                                    <input id="name" type="text" className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                    {errors.name && <p className="mt-1 text-xs text-ember">{errors.name}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="email">Alamat Email</label>
                                    <input id="email" type="email" className="input" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                    {errors.email && <p className="mt-1 text-xs text-ember">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="religion">Agama</label>
                                    <select
                                        id="religion"
                                        className="input"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                    >
                                        <option value="">-- Pilih Agama --</option>
                                        <option value="islam">Islam</option>
                                        <option value="kristen">Kristen Protestan</option>
                                        <option value="katolik">Katolik</option>
                                        <option value="hindu">Hindu</option>
                                        <option value="buddha">Buddha</option>
                                        <option value="konghucu">Konghucu</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                    {errors.religion && <p className="mt-1 text-xs text-ember">{errors.religion}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="whatsapp">Nomor WhatsApp</label>
                                    <input id="whatsapp" type="text" className="input" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} placeholder="08..." />
                                    {errors.whatsapp && <p className="mt-1 text-xs text-ember">{errors.whatsapp}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="address">Alamat Domisili</label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        className="input"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Tuliskan alamat lengkap..."
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-ember">{errors.address}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="company">Nama Perusahaan / Bisnis</label>
                                    <input id="company" type="text" className="input" value={data.company} onChange={(e) => setData('company', e.target.value)} />
                                    {errors.company && <p className="mt-1 text-xs text-ember">{errors.company}</p>}
                                </div>
                            </div>
                        </section>
                    </Reveal>

                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold text-ink">Keamanan & Password</h2>
                            <p className="mt-1 text-xs text-slate">Kosongkan jika tidak ingin mengubah password.</p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="current_password">Password Saat Ini (Wajib jika ingin ganti password)</label>
                                    <input id="current_password" type="password" className="input" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} />
                                    {errors.current_password && <p className="mt-1 text-xs text-ember">{errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password">Password Baru</label>
                                    <input id="password" type="password" className="input" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                    {errors.password && <p className="mt-1 text-xs text-ember">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password_confirmation">Konfirmasi Password Baru</label>
                                    <input id="password_confirmation" type="password" className="input" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                </div>
                            </div>
                        </section>
                    </Reveal>

                    <div className="flex justify-stretch gap-3 sm:justify-end">
                        <button type="submit" className="btn-gold w-full sm:w-auto" disabled={processing}>
                            {processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

AccountEdit.layout = (page) => <MemberLayout>{page}</MemberLayout>;
