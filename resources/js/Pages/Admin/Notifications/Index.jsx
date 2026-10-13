import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate } from '@/Utils/format';

const TYPE_LABELS = {
    promo: 'Promo',
    membership: 'Keanggotaan',
    community: 'Komunitas',
    system: 'Sistem',
    transaction: 'Transaksi',
};

export default function NotificationIndex({ sent, members }) {
    const [targetMode, setTargetMode] = useState('all'); // 'all' | 'specific'
    const [recipientSearch, setRecipientSearch] = useState('');
    const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

    const form = useForm({
        recipient_ids: [],
        title: '',
        body: '',
        type: 'system',
        action_url: '',
    });

    const filteredMembers = members.filter((m) => {
        if (!recipientSearch.trim()) return false;
        const q = recipientSearch.toLowerCase();
        return (
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.member_code && m.member_code.toLowerCase().includes(q))
        );
    });

    const addRecipient = (memberId) => {
        if (!selectedRecipientIds.includes(memberId)) {
            setSelectedRecipientIds((prev) => [...prev, memberId]);
        }
        setRecipientSearch('');
    };

    const removeRecipient = (memberId) => {
        setSelectedRecipientIds((prev) => prev.filter((id) => id !== memberId));
    };

    const submit = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            recipient_ids: targetMode === 'specific' ? selectedRecipientIds : [],
        }));
        form.post(route('admin.notifications.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('title', 'body', 'action_url');
                setSelectedRecipientIds([]);
                setRecipientSearch('');
            },
        });
    };

    return (
        <>
            <Head title="Notifikasi" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">Pusat Notifikasi</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Kirim Notifikasi</h1>
                    <p className="mt-2 text-sm text-slate">Kirim pengumuman atau pesan ke seluruh member maupun member tertentu.</p>
                </header>

                <div className="grid gap-8 lg:grid-cols-5">
                    <form onSubmit={submit} className="card-surface space-y-6 p-6 lg:col-span-2">
                        <div>
                            <label className="label">Target Penerima</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => setTargetMode('all')}
                                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                                        targetMode === 'all'
                                            ? 'bg-ink text-paper shadow-xs'
                                            : 'border border-ink/15 bg-white/70 text-slate hover:bg-white'
                                    }`}
                                >
                                    Semua Member
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetMode('specific')}
                                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                                        targetMode === 'specific'
                                            ? 'bg-ink text-paper shadow-xs'
                                            : 'border border-ink/15 bg-white/70 text-slate hover:bg-white'
                                    }`}
                                >
                                    Member Tertentu
                                </button>
                            </div>
                        </div>

                        {targetMode === 'specific' && (
                            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-3">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="label text-xs" htmlFor="recipient_search">
                                            Cari Nama / Kode Anggota <span className="text-ember">*</span>
                                        </label>
                                        {selectedRecipientIds.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRecipientIds([])}
                                                className="text-[11px] text-ember hover:underline"
                                            >
                                                Hapus Semua ({selectedRecipientIds.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative mt-1">
                                        <input
                                            type="text"
                                            id="recipient_search"
                                            className="input text-sm"
                                            placeholder="Ketik nama atau MMB-00001..."
                                            value={recipientSearch}
                                            onChange={(e) => setRecipientSearch(e.target.value)}
                                        />

                                        {recipientSearch.trim() && (
                                            <div className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-ink/10 bg-white shadow-md divide-y divide-ink/5">
                                                {filteredMembers.length > 0 ? (
                                                    filteredMembers.slice(0, 15).map((m) => {
                                                        const isSelected = selectedRecipientIds.includes(m.id);
                                                        return (
                                                            <div
                                                                key={m.id}
                                                                className={`flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-gold/15 cursor-default'
                                                                        : 'hover:bg-gold/10 cursor-pointer'
                                                                }`}
                                                                onClick={() => !isSelected && addRecipient(m.id)}
                                                            >
                                                                <div>
                                                                    <span className="font-medium text-ink">{m.name}</span>
                                                                    <span className="text-slate ml-1.5 font-mono">({m.member_code})</span>
                                                                </div>
                                                                {isSelected ? (
                                                                    <span className="text-[10px] text-gold-deep font-semibold">✓ Dipilih</span>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate hover:text-ink">+ Tambah</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="px-3 py-2.5 text-xs text-slate text-center">
                                                        Member tidak ditemukan
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedRecipientIds.length > 0 ? (
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate mb-1.5">
                                            {selectedRecipientIds.length} Penerima Terpilih:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                            {selectedRecipientIds.map((id) => {
                                                const member = members.find((m) => m.id === id);
                                                if (!member) return null;
                                                return (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-ink"
                                                    >
                                                        <span>{member.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRecipient(id)}
                                                            className="text-ember hover:font-bold"
                                                            title="Hapus"
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-ember">
                                        Belum ada member yang dipilih. Silakan cari dan pilih member.
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="label" htmlFor="type">Tipe Notifikasi</label>
                            <select
                                id="type"
                                className="input"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                            >
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label" htmlFor="title">Judul Notifikasi <span className="text-ember">*</span></label>
                            <input
                                id="title"
                                type="text"
                                className="input"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Contoh: Promo Spesial Akhir Pekan"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-xs text-ember">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label className="label" htmlFor="body">Isi Pesan <span className="text-ember">*</span></label>
                            <textarea
                                id="body"
                                rows={4}
                                className="input"
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                placeholder="Tuliskan isi pengumuman notifikasi di sini..."
                                required
                            />
                            {form.errors.body && <p className="mt-1 text-xs text-ember">{form.errors.body}</p>}
                        </div>

                        <div>
                            <label className="label" htmlFor="action_url">URL Tujuan (opsional)</label>
                            <input
                                id="action_url"
                                type="text"
                                className="input"
                                value={form.data.action_url}
                                onChange={(e) => form.setData('action_url', e.target.value)}
                                placeholder="/member/promos"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate mb-2">
                                {targetMode === 'specific'
                                    ? `Akan dikirimkan ke ${selectedRecipientIds.length} member terpilih.`
                                    : 'Akan dikirimkan ke seluruh member terdaftar.'}
                            </p>
                            <button
                                type="submit"
                                className="btn-gold w-full"
                                disabled={form.processing || (targetMode === 'specific' && selectedRecipientIds.length === 0)}
                            >
                                {form.processing ? 'Mengirim…' : 'Kirim Notifikasi'}
                            </button>
                        </div>
                    </form>

                    <section className="card-surface p-6 lg:col-span-3">
                        <h2 className="font-display text-lg font-bold">Riwayat Notifikasi Terkirim</h2>
                        <div className="mt-4 space-y-3">
                            {sent.length === 0 ? (
                                <p className="text-sm text-slate">Belum ada notifikasi yang dikirim.</p>
                            ) : (
                                sent.map((n) => (
                                    <div key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-ink/10 p-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusChip status={n.read_at ? 'active' : 'inactive'} label={n.read_at ? 'Dibaca' : 'Baru'} />
                                                <span className="font-mono text-[10px] text-slate">{TYPE_LABELS[n.type] || n.type}</span>
                                            </div>
                                            <p className="mt-1 truncate font-semibold">{n.title}</p>
                                            <p className="line-clamp-2 text-sm text-slate">{n.body}</p>
                                            <p className="mt-1 text-xs text-slate-soft">
                                                {n.user?.name} ({n.user?.member_code}) · {formatDate(n.created_at, true)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

NotificationIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;