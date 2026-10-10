import { Head, Link, usePage } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function Welcome() {
    const { auth } = usePage().props;
    const isMemberLoggedIn = auth?.user?.role === 'member';
    const isPartnerLoggedIn = Boolean(auth?.partner);

    return (
        <>
            <Head title="Masuk ke KBKB" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-8 sm:py-12">
                <div className="mb-6 w-full max-w-2xl flex justify-end">
                    <LanguageSwitcher />
                </div>

                <div className="w-full max-w-2xl text-center">
                    <div className="mb-8">
                        <img
                            src="/images/logo-kbkb.png"
                            alt="KBKB"
                            className="mx-auto h-24 w-auto object-contain sm:h-28"
                            onError={(e) => {
                                e.currentTarget.src = '/logo.png';
                            }}
                        />
                        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            Selamat Datang di KBKB
                        </h1>
                        <p className="mt-2 text-sm text-slate">
                            Silakan pilih jenis akun Anda untuk melanjutkan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
                        {/* Member Card */}
                        <Link
                            href={isMemberLoggedIn ? route('member.home') : route('login')}
                            className="group relative flex flex-col justify-between rounded-2xl border-2 border-gold/30 bg-white/90 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-card sm:p-7"
                        >
                            <div>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep transition-transform duration-200 group-hover:scale-110">
                                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                                    Member
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-slate">
                                    Nikmati berbagai benefit, fasilitas, dan program khusus yang tersedia bagi anggota Komunitas Bisnis Katolik Bali.
                                </p>
                            </div>
                            <span className="mt-6 inline-flex items-center text-xs font-semibold text-gold-deep group-hover:underline">
                                {isMemberLoggedIn ? 'Buka Akun Member →' : 'Masuk sebagai Member →'}
                            </span>
                        </Link>

                        {/* Partner Card */}
                        <Link
                            href={isPartnerLoggedIn ? route('vendor.dashboard') : route('partner.login')}
                            className="group relative flex flex-col justify-between rounded-2xl border-2 border-gold/30 bg-white/90 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-card sm:p-7"
                        >
                            <div>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep transition-transform duration-200 group-hover:scale-110">
                                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                                    Partner
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-slate">
                                    Daftarkan dan kelola bisnis Anda di KBKB agar usaha Anda dapat dikenal dan terhubung dengan jaringan komunitas.
                                </p>
                            </div>
                            <span className="mt-6 inline-flex items-center text-xs font-semibold text-gold-deep group-hover:underline">
                                {isPartnerLoggedIn ? 'Buka Dashboard Partner →' : 'Masuk sebagai Partner →'}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

Welcome.layout = (page) => page;