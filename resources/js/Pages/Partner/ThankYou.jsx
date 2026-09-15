import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ThankYou() {
    return (
        <GuestLayout>
            <Head title="Registration Complete" />

            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
                    <svg className="h-8 w-8 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>

                <h1 className="font-display text-2xl font-bold tracking-tight">Thank You!</h1>
                <p className="mt-2 text-sm text-slate">
                    Your partner registration has been submitted successfully. Our team will review your application and get back to you soon.
                </p>

                <div className="mt-8">
                    <Link
                        href={route('login')}
                        className="btn-gold inline-flex items-center px-6 py-3"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
