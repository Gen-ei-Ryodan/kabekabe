import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import Avatar from '@/Components/Avatar';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { useTranslation } from '@/i18n';
import { pickFile } from '@/Utils/fileValidation';

export default function AccountEdit({ account, password_otp_sent }) {
    const { t } = useTranslation();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [clientErrors, setClientErrors] = useState({});
    const [cooldown, setCooldown] = useState(0);

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

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const resendOtp = () => {
        if (cooldown > 0) return;
        post(route('member.account.password.send-otp'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setCooldown(60);
            },
        });
    };

    const submit = (e) => {
        e.preventDefault();
        setClientErrors({});

        const wantsPasswordChange = Boolean(data.password || data.current_password || data.password_confirmation);

        if (wantsPasswordChange) {
            const errs = {};
            if (!data.current_password) {
                errs.current_password = 'Password saat ini wajib diisi jika ingin ganti password.';
            }
            if (!data.password) {
                errs.password = 'Password baru wajib diisi.';
            } else if (data.password.length < 8) {
                errs.password = 'Password baru minimal 8 karakter.';
            }
            if (data.password !== data.password_confirmation) {
                errs.password_confirmation = 'Konfirmasi password baru tidak cocok.';
            }

            if (Object.keys(errs).length > 0) {
                setClientErrors(errs);
                return;
            }

            // Kirim OTP via endpoint lalu tampilkan Pop-up Modal OTP
            post(route('member.account.password.send-otp'), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowOtpModal(true);
                    setCooldown(60);
                },
            });
            return;
        }

        // Simpan perubahan profil biasa tanpa password
        put(route('member.account.update'), { preserveScroll: true });
    };

    const handleVerifyAndSave = (e) => {
        e.preventDefault();
        setClientErrors({});

        if (!data.otp || data.otp.length < 6) {
            setClientErrors({ otp: 'Masukkan 6 digit kode OTP dari email Anda.' });
            return;
        }

        put(route('member.account.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowOtpModal(false);
                setData((prev) => ({
                    ...prev,
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                    otp: '',
                }));
            },
        });
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
                                                    onChange={(e) => pickFile(e, (file) => setData('avatar', file))}
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
                                                href={`https://wa.me/628113888888?text=${encodeURIComponent(t('account.waPhotoRequest', {
                                                    name: account.name,
                                                    member: account.member_code || '-',
                                                }))}`}
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
                                        <label className="label" htmlFor="name">{t('account.nameLabel')}</label>
                                        <span className="text-[10px] text-slate-soft font-mono">{t('account.nameLocked')}</span>
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
                                        {t('account.nameHint')}
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="email">{t('account.emailLabel')}</label>
                                    <input id="email" type="email" className="input" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                    {errors.email && <p className="mt-1 text-xs text-ember">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="religion">{t('account.religionLabel')}</label>
                                    <select
                                        id="religion"
                                        className="input"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                    >
                                        <option value="">{t('account.religionPlaceholder')}</option>
                                        <option value="islam">{t('account.religion.islam')}</option>
                                        <option value="kristen">{t('account.religion.kristen')}</option>
                                        <option value="katolik">{t('account.religion.katolik')}</option>
                                        <option value="hindu">{t('account.religion.hindu')}</option>
                                        <option value="buddha">{t('account.religion.buddha')}</option>
                                        <option value="konghucu">{t('account.religion.konghucu')}</option>
                                        <option value="lainnya">{t('account.religion.lainnya')}</option>
                                    </select>
                                    {errors.religion && <p className="mt-1 text-xs text-ember">{errors.religion}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="whatsapp">{t('account.whatsappLabel')}</label>
                                    <input id="whatsapp" type="text" className="input" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} placeholder={t('account.whatsappPlaceholder')} />
                                    {errors.whatsapp && <p className="mt-1 text-xs text-ember">{errors.whatsapp}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="address">{t('account.addressLabel')}</label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        className="input"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder={t('account.addressPlaceholder')}
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-ember">{errors.address}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="company">{t('account.companyLabel')}</label>
                                    <input id="company" type="text" className="input" value={data.company} onChange={(e) => setData('company', e.target.value)} />
                                    {errors.company && <p className="mt-1 text-xs text-ember">{errors.company}</p>}
                                </div>
                            </div>
                        </section>
                    </Reveal>

                    <Reveal>
                        <section className="card-surface p-6 sm:p-8">
                            <h2 className="font-display text-lg font-bold text-ink">{t('account.securityTitle')}</h2>
                            <p className="mt-1 text-xs text-slate">{t('account.securityHint1')}</p>
                            <p className="mt-1 text-xs text-slate">{t('account.securityHint2')}</p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="current_password">{t('account.currentPasswordLabel')}</label>
                                    <TextInput
                                        id="current_password"
                                        type="password"
                                        name="current_password"
                                        autoComplete="current-password"
                                        className="input"
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                    />
                                    {(errors.current_password || clientErrors.current_password) && (
                                        <p className="mt-1 text-xs text-ember font-medium">
                                            {errors.current_password || clientErrors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password">{t('account.newPasswordLabel')}</label>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        autoComplete="one-time-code"
                                        className="input"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {(errors.password || clientErrors.password) && (
                                        <p className="mt-1 text-xs text-ember font-medium">
                                            {errors.password || clientErrors.password}
                                        </p>
                                    )}
                                    <p className="mt-1 text-[11px] text-slate-soft">{t('account.passwordHint')}</p>
                                </div>

                                <div>
                                    <label className="label" htmlFor="password_confirmation">{t('account.confirmPasswordLabel')}</label>
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        autoComplete="one-time-code"
                                        className="input"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    {(errors.password_confirmation || clientErrors.password_confirmation) && (
                                        <p className="mt-1 text-xs text-ember font-medium">
                                            {errors.password_confirmation || clientErrors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </Reveal>

                    <div className="flex justify-stretch gap-3 sm:justify-end">
                        <button type="submit" className="btn-gold w-full sm:w-auto" disabled={processing}>
                            {processing
                                ? t('account.processing')
                                : t('account.saveChanges')}
                        </button>
                    </div>
                </form>

                {/* MODAL POP-UP OTP GANTI PASSWORD */}
                <Modal show={showOtpModal} onClose={() => setShowOtpModal(false)} maxWidth="md">
                    <div className="p-6 text-center sm:p-8">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep mb-4">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <h3 className="font-display text-xl font-bold text-ink">
                            Verifikasi Ganti Password
                        </h3>
                        <p className="mt-2 text-xs text-slate leading-relaxed">
                            Kode OTP 6 digit telah dikirim ke <strong className="text-ink">{account.email}</strong>. Masukkan kode tersebut untuk menyelesaikan perubahan kata sandi Anda.
                        </p>

                        <form onSubmit={handleVerifyAndSave} className="mt-6 space-y-4">
                            <div>
                                <input
                                    id="modal_otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    autoFocus
                                    className="input text-center font-mono text-xl tracking-[0.4em] py-3 font-bold"
                                    placeholder="••••••"
                                    value={data.otp}
                                    onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                {(errors.otp || clientErrors.otp) && (
                                    <p className="mt-2 text-xs text-ember font-medium">
                                        {errors.otp || clientErrors.otp}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate">Tidak menerima kode?</span>
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={cooldown > 0 || processing}
                                    className="font-semibold text-gold-deep hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim Ulang Kode OTP'}
                                </button>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowOtpModal(false)}
                                    className="btn-ghost flex-1 py-2.5 text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || data.otp.length < 6}
                                    className="btn-gold flex-1 py-2.5 text-sm"
                                >
                                    {processing ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </>
    );
}

AccountEdit.layout = (page) => <MemberLayout>{page}</MemberLayout>;
