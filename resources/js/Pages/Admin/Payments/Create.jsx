import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah, formatDate, daysUntil } from '@/Utils/format';

export default function PaymentCreate({ members, plans }) {
    const form = useForm({
        member_id: '',
        plan_id: '',
        notes: '',
    });

    const selectedMember = members.find((m) => m.id == form.data.member_id);
    const selectedPlan = plans.find((p) => p.id == form.data.plan_id);
    const daysLeft = selectedMember?.membership?.expires_at ? daysUntil(selectedMember.membership.expires_at) : null;
    const memberPlan = selectedMember?.membership_plan;

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.payments.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Catat Pembayaran" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Manajemen Pembayaran</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Catat Pembayaran</h1>
                    <p className="mt-2 text-sm text-slate">Catat pembayaran offline/manual dan keanggotaan member akan langsung aktif/diperpanjang.</p>
                </header>

                <form onSubmit={submit} className="mt-8 space-y-6">
                    <div className="card-surface p-6 sm:p-8">
                        <h2 className="font-display text-lg font-bold">Member</h2>
                        <div className="mt-4">
                            <label className="label" htmlFor="member_id">Pilih Member</label>
                            <select
                                id="member_id"
                                className="input"
                                value={form.data.member_id}
                                onChange={(e) => form.setData('member_id', e.target.value)}
                            >
                                <option value="">Pilih member…</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} · {member.member_code}
                                    </option>
                                ))}
                            </select>
                            {form.errors.member_id && <p className="mt-1 text-xs text-ember">{form.errors.member_id}</p>}
                        </div>

                        {selectedMember && (
                            <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{selectedMember.name}</span>
                                    <span className={`text-xs font-bold ${selectedMember.membership_status === 'active' ? 'text-sage' : 'text-ember'}`}>
                                        {selectedMember.membership_status === 'active' ? 'AKTIF' : 'TIDAK AKTIF'}
                                    </span>
                                </div>
                                {selectedMember.membership && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate">Paket:</span>{' '}
                                            <span className="font-medium">{memberPlan?.name || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate">Kadaluarsa:</span>{' '}
                                            <span className="font-mono">{formatDate(selectedMember.membership?.expires_at)}</span>
                                        </div>
                                        {daysLeft !== null && (
                                            <div className="col-span-2">
                                                <span className="text-slate">Sisa Masa Aktif:</span>{' '}
                                                <span className={`font-bold ${daysLeft <= 7 ? 'text-amber-600' : ''}`}>
                                                    {daysLeft >= 0 ? `${daysLeft} hari` : 'Kadaluarsa'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!selectedMember.membership && (
                                    <p className="mt-2 text-xs text-slate">Belum memiliki keanggotaan — langkah ini akan mengaktifkannya.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card-surface p-6 sm:p-8">
                        <h2 className="font-display text-lg font-bold">Paket Keanggotaan</h2>
                        <div className="mt-4">
                            <label className="label" htmlFor="plan_id">Pilih Paket</label>
                            <select
                                id="plan_id"
                                className="input"
                                value={form.data.plan_id}
                                onChange={(e) => form.setData('plan_id', e.target.value)}
                            >
                                <option value="">Pilih paket…</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} · {plan.duration_months} bulan · {formatRupiah(plan.price)}
                                    </option>
                                ))}
                            </select>
                            {form.errors.plan_id && <p className="mt-1 text-xs text-ember">{form.errors.plan_id}</p>}
                        </div>

                        {selectedPlan && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-paper p-3 text-center">
                                    <p className="eyebrow">Paket</p>
                                    <p className="mt-1 text-sm font-bold">{selectedPlan.name}</p>
                                </div>
                                <div className="rounded-xl bg-paper p-3 text-center">
                                    <p className="eyebrow">Durasi</p>
                                    <p className="mt-1 text-sm font-bold">{selectedPlan.duration_months} bln</p>
                                </div>
                                <div className="rounded-xl bg-paper p-3 text-center">
                                    <p className="eyebrow">Harga</p>
                                    <p className="mt-1 text-sm font-bold text-gold">{formatRupiah(selectedPlan.price)}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="label" htmlFor="notes">Catatan (opsional)</label>
                            <textarea
                                id="notes"
                                className="input"
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                placeholder="Contoh: Pembayaran tunai diterima di sekretariat"
                            />
                            {form.errors.notes && <p className="mt-1 text-xs text-ember">{form.errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.payments.index')} className="btn-ghost">Batal</a>
                        <button type="submit" className="btn-gold" disabled={form.processing || !form.data.member_id || !form.data.plan_id}>
                            {form.processing ? 'Menyimpan…' : 'Catat Pembayaran'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PaymentCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
