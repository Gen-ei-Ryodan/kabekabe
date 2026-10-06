import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import MasterIdentityBiodata from '@/Components/MasterIdentityBiodata';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { INDUSTRY_CATEGORIES, derivePartnerCategory } from '@/constants/membership';
import { useTranslation } from '@/i18n';

const INDUSTRI_OPTIONS = INDUSTRY_CATEGORIES;

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        company_address: '',
        company_phone: '',
        employee_count: '',
        established_since: '',
        industry: [],
        is_member: false,
        member_email: '',
        // 4 section Master Identity (identik dengan registrasi member).
        name: '',
        nickname: '',
        gender: '',
        birth_date: '',
        birth_place: '',
        marital_status: '',
        religion: '',
        place_of_worship_address: '',
        address: '',
        district: '',
        city: '',
        phone: '',
        hobbies: [],
        is_household: false,
        companies: [{ company: '', industry: '', position: '', address: '' }],
        business_district: '',
        business_city: '',
        // Akun login partner.
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [industrySearch, setIndustrySearch] = useState('');
    // Linking member: 'idle' | 'sending' | 'sent' | 'verifying' | 'verified'
    const [linkState, setLinkState] = useState('idle');
    const [linkInfo, setLinkInfo] = useState('');
    const [linkError, setLinkError] = useState('');
    const [memberOtp, setMemberOtp] = useState('');
    const [linkBiodata, setLinkBiodata] = useState(null);

    // Sudah terverifikasi OTP member? → biodata dipinjam dari Master Identity, form disingkirkan.
    const skipBiodata = data.is_member && linkState === 'verified';

    const filteredIndustries = INDUSTRI_OPTIONS.filter((i) =>
        i.toLowerCase().includes(industrySearch.toLowerCase())
    );

    const handleIndustryChange = (industry) => {
        const current = Array.isArray(data.industry) ? data.industry : (data.industry ? [data.industry] : []);
        if (current.includes(industry)) {
            setData('industry', current.filter((i) => i !== industry));
        } else {
            setData('industry', [...current, industry]);
        }
    };

    const resetLink = () => {
        setLinkState('idle');
        setLinkInfo('');
        setLinkError('');
        setMemberOtp('');
        setLinkBiodata(null);
    };

    const readCsrfToken = () => {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const postJson = async (url, body) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': readCsrfToken(),
            },
            body: JSON.stringify(body),
        });
        const payload = await res.json().catch(() => ({}));
        return { ok: res.ok, payload };
    };

    const requestMemberOtp = async () => {
        const email = (data.member_email || '').trim();
        if (!email) {
            setLinkError(t('partner.memberOtpEmailEmpty'));
            return;
        }

        setLinkError('');
        setLinkInfo('');
        setLinkState('sending');

        try {
            const { ok, payload } = await postJson(route('partner.member-link.request'), {
                member_email: email,
            });

            if (!ok) {
                setLinkError(
                    payload?.errors?.member_email?.[0] ||
                        payload?.message ||
                        t('partner.memberOtpSendFailed')
                );
                setLinkState('idle');
                return;
            }

            setLinkState('sent');
            setLinkInfo(t('partner.memberOtpSent', { email: payload.email || email }));
        } catch {
            setLinkError(t('partner.linkServerError'));
            setLinkState('idle');
        }
    };

    const verifyMemberOtp = async () => {
        if (!memberOtp || memberOtp.length !== 6) {
            setLinkError(t('partner.memberOtpInvalidLength'));
            return;
        }

        setLinkError('');
        setLinkState('verifying');

        try {
            const { ok, payload } = await postJson(route('partner.member-link.verify'), {
                otp: memberOtp,
            });

            if (!ok) {
                setLinkError(
                    payload?.errors?.otp?.[0] || payload?.message || t('partner.memberOtpWrong')
                );
                setLinkState('sent');
                return;
            }

            setLinkState('verified');
            setLinkBiodata(payload.biodata || null);
            setLinkInfo(t('partner.memberOtpVerified', { name: payload.member || data.member_email }));
        } catch {
            setLinkError(t('partner.linkServerError'));
            setLinkState('sent');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (Array.isArray(data.industry) && data.industry.length === 0) {
            alert(t('partner.alertIndustry'));
            return;
        }
        if (data.is_member && linkState !== 'verified') {
            alert(t('partner.memberOtpRequired'));
            return;
        }
        post(route('partner.register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidth="max-w-3xl">
            <Head title={t('partner.title')} />

            <header className="mb-6 text-center sm:text-left">
                <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep mb-2">
                    {t('partner.badge')}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    {t('partner.heading')}
                </h1>
                <p className="mt-1 text-sm text-slate">
                    {t('partner.subtitle')}
                </p>
            </header>

            <form onSubmit={submit} className="space-y-8">
                {/* A. DATA PERUSAHAAN */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">A</span>
                            {t('partner.s1Title')}
                        </h2>
                        <p className="text-xs text-slate mt-0.5">{t('partner.s1Desc')}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="company_name" value={t('partner.companyName')} />
                            <TextInput
                                id="company_name"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder={t('partner.companyNamePh')}
                                required
                            />
                            <InputError message={errors.company_name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="industry" value={t('partner.industryLabel')} />
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <TextInput
                                        type="text"
                                        value={industrySearch}
                                        onChange={(e) => setIndustrySearch(e.target.value)}
                                        placeholder={t('partner.industrySearchPh')}
                                        className="flex-1 text-xs"
                                    />
                                    {industrySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setIndustrySearch('')}
                                            className="btn-ghost text-xs px-3"
                                        >
                                            {t('partner.reset')}
                                        </button>
                                    )}
                                </div>
                                {Array.isArray(data.industry) && data.industry.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-gold/10 border border-gold/20">
                                        <span className="text-xs text-gold-deep font-medium mr-1">{t('partner.selected')}</span>
                                        {data.industry.map((ind) => (
                                            <span
                                                key={ind}
                                                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gold-deep shadow-xs border border-gold/30"
                                            >
                                                {ind}
                                                <button
                                                    type="button"
                                                    onClick={() => handleIndustryChange(ind)}
                                                    className="text-slate hover:text-ember ml-0.5"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/10 bg-white/80 p-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {filteredIndustries.map((ind) => {
                                            const isSelected = Array.isArray(data.industry)
                                                ? data.industry.includes(ind)
                                                : data.industry === ind;
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
                                            <p className="text-xs text-slate py-1">{t('partner.industryEmpty')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <InputError message={errors.industry} className="mt-1" />
                            <div className="mt-3">
                                <InputLabel value={t('partner.categoryLabel')} />
                                <div className="mt-1 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-sm font-semibold text-gold-deep">
                                    {Array.isArray(data.industry) && data.industry.length > 0
                                        ? derivePartnerCategory(data.industry)
                                        : '—'}
                                </div>
                                <p className="mt-1 text-xs text-slate">
                                    {t('partner.categoryDesc')}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="company_phone" value={t('partner.companyPhone')} />
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
                                <InputLabel htmlFor="employee_count" value={t('partner.employeeCount')} />
                                <TextInput
                                    id="employee_count"
                                    type="number"
                                    value={data.employee_count}
                                    onChange={(e) => setData('employee_count', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder={t('partner.employeeCountPh')}
                                />
                                <InputError message={errors.employee_count} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="established_since" value={t('partner.establishedSince')} />
                                <TextInput
                                    id="established_since"
                                    value={data.established_since}
                                    onChange={(e) => setData('established_since', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder={t('partner.establishedSincePh')}
                                />
                                <InputError message={errors.established_since} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="company_address" value={t('partner.companyAddress')} />
                                <textarea
                                    id="company_address"
                                    rows={2}
                                    value={data.company_address}
                                    onChange={(e) => setData('company_address', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    placeholder={t('partner.companyAddressPh')}
                                />
                                <InputError message={errors.company_address} className="mt-1" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* B. SUDAH PUNYA AKUN MEMBER? */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">B</span>
                            {t('partner.s3Title')}
                        </h2>
                        <p className="text-xs text-slate mt-0.5">{t('partner.s3Desc')}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (!data.is_member) {
                                    setData('is_member', true);
                                }
                            }}
                            className={`rounded-xl border p-3 text-sm font-semibold transition-all ${
                                data.is_member
                                    ? 'border-gold bg-gold text-ink shadow-sm'
                                    : 'border-ink/15 bg-white text-slate hover:bg-ink/5'
                            }`}
                        >
                            ✓ {t('partner.choiceYes')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (data.is_member) {
                                    setData('is_member', false);
                                }
                                setData('member_email', '');
                                resetLink();
                            }}
                            className={`rounded-xl border p-3 text-sm font-semibold transition-all ${
                                !data.is_member
                                    ? 'border-gold bg-gold text-ink shadow-sm'
                                    : 'border-ink/15 bg-white text-slate hover:bg-ink/5'
                            }`}
                        >
                            ✗ {t('partner.choiceNo')}
                        </button>
                    </div>

                    {data.is_member && (
                        <div className="space-y-3 border-t border-ink/10 pt-3">
                            <div>
                                <InputLabel htmlFor="member_email" value={t('partner.memberEmail')} />
                                <TextInput
                                    id="member_email"
                                    type="email"
                                    value={data.member_email}
                                    disabled={linkState === 'verified'}
                                    onChange={(e) => {
                                        setData('member_email', e.target.value);
                                        if (linkState !== 'idle') {
                                            resetLink();
                                        }
                                    }}
                                    className="mt-1 block w-full"
                                    placeholder={t('partner.memberEmailPh')}
                                    required
                                />
                                <p className="mt-1 text-[11px] text-slate-soft">{t('partner.memberEmailHint')}</p>
                            </div>

                            {linkState !== 'verified' && linkState !== 'sent' && (
                                <button
                                    type="button"
                                    onClick={requestMemberOtp}
                                    disabled={linkState === 'sending'}
                                    className="rounded-xl border border-gold/50 bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-deep hover:bg-gold/25 disabled:opacity-50"
                                >
                                    {linkState === 'sending' ? t('partner.memberOtpSending') : t('partner.memberOtpBtn')}
                                </button>
                            )}

                            {linkState === 'sent' && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <TextInput
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        value={memberOtp}
                                        onChange={(e) =>
                                            setMemberOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                                        }
                                        className="block w-40 text-center font-mono tracking-[0.35em]"
                                        placeholder="000000"
                                    />
                                    <button
                                        type="button"
                                        onClick={verifyMemberOtp}
                                        disabled={linkState === 'verifying'}
                                        className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-50"
                                    >
                                        {t('partner.memberOtpVerify')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={requestMemberOtp}
                                        disabled={linkState === 'sending'}
                                        className="text-sm font-semibold text-gold-deep hover:underline disabled:opacity-50"
                                    >
                                        {t('partner.memberOtpResend')}
                                    </button>
                                </div>
                            )}

                            {linkState === 'verified' && (
                                <div className="rounded-xl border border-sage/40 bg-sage/15 px-4 py-3 text-sm font-medium text-ink">
                                    {linkInfo || t('partner.memberOtpOk')}
                                </div>
                            )}

                            {linkInfo && linkState !== 'verified' && (
                                <p className="text-xs text-slate">{linkInfo}</p>
                            )}
                            <InputError message={linkError || errors.member_email} className="mt-1" />
                        </div>
                    )}
                </section>

                {/* 1-4. MASTER IDENTITY (identik dengan registrasi member) */}
                {skipBiodata ? (
                    <section className="rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:p-6 space-y-4">
                        <div className="border-b border-gold/20 pb-3">
                            <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">✓</span>
                                {t('partner.biodataFromMemberTitle')}
                            </h2>
                            <p className="text-xs text-slate mt-0.5">{t('partner.biodataFromMemberDesc')}</p>
                        </div>

                        {linkBiodata && (
                            <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                                <p className="text-xs font-semibold text-gold-deep uppercase tracking-wider mb-2">
                                    {t('partner.biodataFromMemberLabel')}
                                </p>
                                <dl className="grid gap-2 sm:grid-cols-2">
                                    {[
                                        [t('partner.bioName'), linkBiodata.name],
                                        [t('partner.bioPhone'), linkBiodata.phone],
                                        [t('partner.bioGender'), linkBiodata.gender],
                                        [t('partner.bioBirthDate'), linkBiodata.birth_date],
                                        [t('partner.bioBirthPlace'), linkBiodata.birth_place],
                                        [t('partner.bioMarital'), linkBiodata.marital_status],
                                        [t('partner.bioReligion'), linkBiodata.religion],
                                        [t('partner.bioCity'), linkBiodata.city],
                                        [t('partner.bioDistrict'), linkBiodata.district],
                                        [t('partner.bioAddress'), linkBiodata.address],
                                        [t('partner.bioMemberCode'), linkBiodata.member_code],
                                    ]
                                        .filter(([, v]) => v)
                                        .map(([label, value]) => (
                                            <div key={label} className="rounded-lg bg-paper p-2.5">
                                                <dt className="eyebrow">{label}</dt>
                                                <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
                                            </div>
                                        ))}
                                </dl>
                                {Array.isArray(linkBiodata.hobbies) && linkBiodata.hobbies.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {linkBiodata.hobbies.map((h) => (
                                            <span
                                                key={h}
                                                className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-deep"
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                ) : (
                    <MasterIdentityBiodata
                        data={data}
                        setData={setData}
                        errors={errors}
                        showEmail={false}
                    />
                )}

                {/* C. AKUN LOGIN */}
                <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                    <div className="border-b border-ink/10 pb-3">
                        <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">C</span>
                            {t('partner.s4Title')}
                        </h2>
                        <p className="text-xs text-slate mt-0.5">{t('partner.s4Desc')}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value={t('partner.emailLabel')} />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                placeholder={t('partner.emailPh')}
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                            {skipBiodata && (
                                <p className="mt-1 text-xs text-slate">{t('partner.loginEmailHint')}</p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="password" value={t('partner.passwordLabel')} />
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
                                <p className="mt-1 text-[11px] text-slate-soft">{t('partner.passwordHint')}</p>
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value={t('partner.passwordConfirm')} />
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
                    </div>
                </section>

                {/* Notifikasi & Submit */}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-xs text-slate space-y-1">
                    <p className="font-semibold text-gold-deep flex items-center gap-1.5">
                        <span>ℹ️</span> {t('partner.infoLabel')}
                    </p>
                    <p>
                        {t('partner.infoBody')}
                    </p>
                </div>

                <PrimaryButton className="w-full justify-center py-3 text-base font-semibold" disabled={processing}>
                    {processing ? t('partner.processing') : t('partner.submit')}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate">
                {t('partner.hasAccount')}{' '}
                <Link href={route('login')} className="font-semibold text-gold-deep hover:underline">
                    {t('partner.loginHere')}
                </Link>
            </p>

            <p className="mt-2 text-center text-sm text-slate">
                {t('partner.wantMember')}{' '}
                <Link href={route('register')} className="font-semibold text-gold-deep hover:underline">
                    {t('partner.registerMember')}
                </Link>
            </p>
        </GuestLayout>
    );
}
