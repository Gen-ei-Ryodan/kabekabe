import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';

export default function RegisterSuccess({ name, email, role, generatedPassword }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(generatedPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <GuestLayout>
            <Head title="Pendaftaran Berhasil" />

            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
                    Pendaftaran Berhasil!
                </h1>

                <p className="mt-2 text-sm text-slate">
                    Terima kasih telah mendaftar sebagai <strong className="capitalize text-ink">{role === 'vendor' || role === 'partner' ? 'Partner' : 'Member'}</strong>, {name}.
                </p>

                <div className="my-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left text-sm text-amber-900">
                    <p className="font-semibold">⚠️ Menunggu Persetujuan Admin</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                        Pendaftaran akun Anda perlu disetujui terlebih dahulu oleh Admin sebelum dapat aktif digunakan.
                    </p>
                </div>

                <div className="rounded-2xl border border-gold/30 bg-ink p-5 text-paper">
                    <p className="font-mono text-xs uppercase tracking-wider text-gold-light">
                        Password Awal Anda:
                    </p>
                    <div className="my-2 flex items-center justify-center gap-3">
                        <span className="font-mono text-2xl font-bold tracking-widest text-white">
                            {generatedPassword}
                        </span>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20"
                        >
                            {copied ? 'Tersalin!' : 'Salin'}
                        </button>
                    </div>
                    <p className="text-[11px] text-paper/70">
                        Simpan password ini. Setelah disetujui, Anda akan diminta mengubah password ini pada login pertama.
                    </p>
                </div>

                <div className="mt-8">
                    <Link
                        href={route('login')}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper shadow-card hover:bg-ink/90 transition-colors"
                    >
                        Kembali ke Halaman Login
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
