import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FaspayDummy({ payment, invoice }) {
    return (
        <>
            <Head title="Faspay Dummy" />

            <div className="mx-auto max-w-xl">
                <header>
                    <p className="eyebrow">Faspay Dummy</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Payment Gateway Simulation</h1>
                    <p className="mt-2 text-sm text-slate">
                        Ini adalah tampilan dummy untuk simulasi payment gateway. Integrasi penuh dengan Faspay menyusul.
                    </p>
                </header>

                <div className="card-surface mt-8 p-6">
                    <p className="eyebrow">Payment</p>
                    <p className="mt-1 font-mono text-sm">{payment.invoice_number}</p>
                    <p className="mt-3 font-display text-3xl font-bold text-gold-deep">Rp {Number(payment.amount).toLocaleString('id-ID')}</p>
                </div>

                <div className="card-surface mt-6 p-6">
                    <p className="eyebrow">Invoice (Raw Response)</p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-ink p-3 font-mono text-xs text-paper">
{JSON.stringify(invoice, null, 2)}
                    </pre>
                </div>

                <div className="mt-6 flex gap-3">
                    <Link href={route('admin.payments.index')} className="btn-ghost">Kembali ke Payments</Link>
                    <Link href={route('admin.integrations.index')} className="btn-gold">Halaman Integrasi</Link>
                </div>
            </div>
        </>
    );
}

FaspayDummy.layout = (page) => <AdminLayout>{page}</AdminLayout>;