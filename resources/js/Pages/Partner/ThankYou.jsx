import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ThankYou({ status }) {
    return (
        <GuestLayout>
            <Head title="Registration Complete" />

            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
                    <svg className="h-8 w-8 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>

                <h1 className="font-display text-2xl font-bold tracking-tight">Terima kasih!</h1>
                <p className="mt-2 text-sm text-slate">
                    Pendaftaran Partner Anda berhasil dikirim! Mohon tunggu proses persetujuan Admin hingga 1x24 jam kerja.
                    <br /><br />
                    Setelah pendaftaran Anda disetujui, informasi login berupa email dan kata sandi akan dikirimkan ke alamat email yang Anda daftarkan.
                    <br /><br />
                    Harap periksa kotak masuk email Anda secara berkala, termasuk folder spam atau junk.
                </p>

                {status && (
                    <div className="mx-auto mt-4 max-w-md rounded-xl border border-sage/40 bg-sage/15 px-4 py-3 text-sm font-medium text-ink">
                        {status}
                    </div>
                )}

                <div className="mt-8">
                    <Link
                        href="/"
                        className="btn-gold inline-flex items-center px-6 py-3"
                    >
                        Kembali ke Halaman Awal
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
