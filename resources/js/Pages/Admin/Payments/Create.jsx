import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah, formatDate, formatDateLong, daysUntil, toDateInputValue } from '@/Utils/format';

const today = toDateInputValue(new Date());
const defaultExpires = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return toDateInputValue(d);
})();

export default function PaymentCreate({ members }) {
    const [memberSearch, setMemberSearch] = useState('');
    const form = useForm({
        member_id: '',
        started_at: today,
        expires_at: defaultExpires,
        amount: '',
        method: '',
        notes: '',
    });

    const selectedMember = members.find((m) => m.id == form.data.member_id);
    const daysLeft = selectedMember?.membership?.expires_at ? daysUntil(selectedMember.membership.expires_at) : null;
    const memberPlan = selectedMember?.membership_plan;

    const filteredMembers = members.filter((m) => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.toLowerCase();
        return (
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.member_code && m.member_code.toLowerCase().includes(q)) ||
            (m.email && m.email.toLowerCase().includes(q))
        );
    });

    const selectMember = (m) => {
        form.setData('member_id', String(m.id));
        setMemberSearch('');
    };

    const clearSelectedMember = () => {
        form.setData('member_id', '');
        setMemberSearch('');
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.payments.store'), { preserveScroll: true });
    };

    const canSubmit =
        form.data.member_id &&
        form.data.amount !== '' &&
        form.data.started_at &&
        form.data.expires_at;

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
                        
                        {!selectedMember ? (
                            <div className="mt-4">
                                <label className="label" htmlFor="member_search">Cari Nama / Kode Anggota <span className="text-ember">*</span></label>
                                <input
                                    type="text"
                                    id="member_search"
                                    className="input"
                                    placeholder="Ketik nama atau kode anggota (mis. MMB-00001)..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    autoFocus
                                />
                                {form.errors.member_id && <p className="mt-1 text-xs text-ember">{form.errors.member_id}</p>}
                                
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-ink/10 bg-white shadow-xs divide-y divide-ink/5">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.slice(0, 15).map((m) => (
                                            <div
                                                key={m.id}
                                                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gold/10 transition-colors"
                                                onClick={() => selectMember(m)}
                                            >
                                                <div>
                                                    <span className="font-medium text-sm text-ink">{m.name}</span>
                                                    <span className="text-xs text-slate ml-2 font-mono">({m.member_code})</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    m.membership_status === 'active' ? 'bg-sage/15 text-sage-deep' : 'bg-slate-100 text-slate'
                                                }`}>
                                                    {m.membership_status === 'active' ? 'AKTIF' : 'TIDAK AKTIF'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-xs text-slate text-center">
                                            Tidak ada member ditemukan dengan kata kunci "{memberSearch}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 p-4">
                                <div>
                                    <p className="font-display font-bold text-ink">{selectedMember.name}</p>
                                    <p className="text-xs font-mono text-slate">{selectedMember.member_code} · {selectedMember.email}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearSelectedMember}
                                    className="btn-ghost text-xs text-ember"
                                >
                                    Ganti Member
                                </button>
                            </div>
                        )}

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
                        <h2 className="font-display text-lg font-bold">Keanggotaan & Pembayaran</h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="started_at">Tanggal Mulai Aktif</label>
                                <input
                                    id="started_at"
                                    type="date"
                                    className="input"
                                    value={form.data.started_at}
                                    onChange={(e) => form.setData('started_at', e.target.value)}
                                    required
                                />
                                {form.errors.started_at && <p className="mt-1 text-xs text-ember">{form.errors.started_at}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="expires_at">Aktif Sampai</label>
                                <input
                                    id="expires_at"
                                    type="date"
                                    className="input"
                                    value={form.data.expires_at}
                                    onChange={(e) => form.setData('expires_at', e.target.value)}
                                    required
                                />
                                {form.errors.expires_at && <p className="mt-1 text-xs text-ember">{form.errors.expires_at}</p>}
                            </div>
                        </div>

                        <p className="mt-3 rounded-xl bg-gold/10 px-3 py-2 text-sm font-semibold text-gold-deep">
                            Masa aktif sampai: {form.data.expires_at ? formatDateLong(form.data.expires_at) : 'belum diatur'}
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="amount">Nominal yang Dibayarkan (Rp)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="input"
                                    value={form.data.amount}
                                    onChange={(e) => form.setData('amount', e.target.value)}
                                    placeholder="Contoh: 61300"
                                    required
                                />
                                {form.data.amount !== '' && (
                                    <p className="mt-1 text-xs font-semibold text-gold-deep">{formatRupiah(form.data.amount)}</p>
                                )}
                                {form.errors.amount && <p className="mt-1 text-xs text-ember">{form.errors.amount}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="method">Metode Pembayaran</label>
                                <input
                                    id="method"
                                    type="text"
                                    className="input"
                                    value={form.data.method}
                                    onChange={(e) => form.setData('method', e.target.value)}
                                    placeholder="Transfer Bank / Cash / QRIS"
                                />
                                {form.errors.method && <p className="mt-1 text-xs text-ember">{form.errors.method}</p>}
                            </div>
                        </div>

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
                        <button type="submit" className="btn-gold" disabled={form.processing || !canSubmit}>
                            {form.processing ? 'Menyimpan…' : 'Catat Pembayaran'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PaymentCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
