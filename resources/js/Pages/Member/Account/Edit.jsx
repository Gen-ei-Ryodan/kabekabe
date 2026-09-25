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
                                    {errors.current_password && <p className="mt-1 text-xs text-ember">{errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="label" htmlFor="password">{t('account.newPasswordLabel')}</label>
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
                                    <p className="mt-1 text-[11px] text-slate-soft">{t('account.passwordHint')}</p>
                                </div>

                                <div>
                                    <label className="label" htmlFor="password_confirmation">{t('account.confirmPasswordLabel')}</label>
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
                                            {t('account.otpLabel')} {otpSent && <span className="text-ember">*</span>}
                                        </label>
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            className="input font-mono tracking-[0.4em]"
                                            placeholder={t('account.otpPlaceholder')}
                                            value={data.otp}
                                            onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                        {errors.otp && <p className="mt-1 text-xs text-ember">{errors.otp}</p>}
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-[11px] text-slate">
                                                {otpSent
                                                    ? t('account.otpSentInfo', { email: account.email })
                                                    : t('account.otpNotSentInfo')}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                disabled={processing}
                                                className="text-[11px] font-bold text-gold-deep hover:underline disabled:opacity-50"
                                            >
                                                {otpSent ? t('account.resendOtp') : t('account.sendOtp')}
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
                                ? t('account.processing')
                                : data.password && !otpSent
                                    ? t('account.sendOtpToEmail')
                                    : data.password
                                        ? t('account.verifyOtpAndSave')
                                        : t('account.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

AccountEdit.layout = (page) => <MemberLayout>{page}</MemberLayout>;
