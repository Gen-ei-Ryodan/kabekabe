import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import Avatar from '@/Components/Avatar';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/i18n';

export default function AccountEdit({ account, password_otp_sent }) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors } = useForm({
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
        otp: '',
    });

    const otpSent = Boolean(password_otp_sent);
    const willChangePassword = Boolean(data.password) || otpSent;

    const sendOtp = () => {
        post(route('member.account.password.send-otp'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const submit = (e) => {
        e.preventDefault();

        // Ganti password: minta kode OTP ke email dulu sebelum disimpan.
        if (data.password && !otpSent) {
            sendOtp();
            return;
        }

        put(route('member.account.update'), { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('account.headTitle')} />

            <div className="mx-auto max-w-2xl">
                <header>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{t('account.title')}</h1>
                    <p className="mt-1 text-sm text-slate">{t('account.subtitle')}</p>
                </header>

                <form onSubmit={submit} className="mt-8 space-y-8">
                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold text-ink">{t('account.profileTitle')}</h2>

                            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Avatar
                                    src={account.avatar_url}
                                    name={account.name}
                                    tone="dark"
                                    className="h-20 w-20 rounded-full border-2 border-gold text-2xl"
                                />
                                <div>
                                    {account.can_change_avatar ? (
                                        <>
                                            <label className="btn-ghost cursor-pointer text-xs">
                                                {data.avatar ? t('account.avatarChosen') : t('account.avatarPick')}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => setData('avatar', e.target.files[0])}
                                                />
                                            </label>
                                            {errors.avatar && <p className="mt-1 text-xs text-ember">{errors.avatar}</p>}
                                            <p className="mt-1.5 text-[11px] text-slate-soft">
                                                {t('account.avatarHint')}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink/5 px-2.5 py-1 text-xs font-medium text-slate">
                                                {t('account.avatarLocked')}
                                            </span>
                                            <p className="text-[11px] text-slate">
                                                {t('account.avatarLockedHint')}
                                            </p>
                                            <a
                                                href={`https://wa.me/628113888888?text=${encodeURIComponent(`Halo Admin KBKB, saya ingin mengajukan penggantian foto profil member:\nNama: ${account.name}\nNo. Member: ${account.member_code || '-'}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline"
                                            >
                                                {t('account.avatarRequestWa')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <label className="label" htmlFor="name">Nama Lengkap</label>
                                        <span className="text-[10px] text-slate-soft font-mono">Terkunci (Hanya Admin)</span>
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        className="input bg-ink/5 text-slate cursor-not-allowed"
                                        value={account.name || ''}
                                        disabled
                                        readOnly
                                    />
                                    <p className="mt-1 text-[11px] text-slate-soft">
                                        Nama member tidak dapat diubah sendiri. Hubungi admin jika terdapat kesalahan penulisan nama.
                                    </p>
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
                            <p className="mt-1 text-xs text-slate">Password baru wajib minimal 8 karakter dan kombinasi huruf + angka. Penggantian password dikonfirmasi melalui kode OTP yang dikirim ke email Anda.</p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="current_password">Password Saat Ini (Wajib jika ingin ganti password)</label>
                                    <TextInput
                                        id="current_password"
                                        type="password"
                                        name="current_password"
                                        autoComplete="current-password"
                                        className="input"
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                    />
                                    {errors.current_password && <p className="mt-1 text-xs text-ember">{errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password">Password Baru</label>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        autoComplete="new-password"
                                        className="input"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-ember">{errors.password}</p>}
                                    <p className="mt-1 text-[11px] text-slate-soft">Minimal 8 karakter, kombinasi huruf &amp; angka.</p>
                                </div>

                                <div>
                                    <label className="label" htmlFor="password_confirmation">Konfirmasi Password Baru</label>
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        className="input"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    {errors.password_confirmation && <p className="mt-1 text-xs text-ember">{errors.password_confirmation}</p>}
                                </div>

                                {willChangePassword && (
                                    <div className="sm:col-span-2 rounded-xl border border-gold/40 bg-gold/10 p-4">
                                        <label className="label" htmlFor="otp">
                                            Kode OTP dari Email {otpSent && <span className="text-ember">*</span>}
                                        </label>
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            className="input font-mono tracking-[0.4em]"
                                            placeholder="••••••"
                                            value={data.otp}
                                            onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                        {errors.otp && <p className="mt-1 text-xs text-ember">{errors.otp}</p>}
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-[11px] text-slate">
                                                {otpSent
                                                    ? `Kode 6 digit dikirim ke ${account.email} (berlaku 10 menit). Masukkan kode lalu klik Simpan Perubahan.`
                                                    : 'Klik "Simpan Perubahan" untuk mengirim kode OTP ke email Anda terlebih dahulu.'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                disabled={processing}
                                                className="text-[11px] font-bold text-gold-deep hover:underline disabled:opacity-50"
                                            >
                                                {otpSent ? 'Kirim Ulang Kode OTP' : 'Kirim Kode OTP'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </Reveal>

                    <div className="flex justify-stretch gap-3 sm:justify-end">
                        <button type="submit" className="btn-gold w-full sm:w-auto" disabled={processing}>
                            {processing
                                ? 'Memproses…'
                                : data.password && !otpSent
                                    ? 'Kirim OTP ke Email'
                                    : data.password
                                        ? 'Verifikasi OTP & Simpan'
                                        : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

AccountEdit.layout = (page) => <MemberLayout>{page}</MemberLayout>;
