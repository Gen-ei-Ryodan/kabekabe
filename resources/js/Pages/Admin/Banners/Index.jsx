import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import EmptyState from '@/Components/EmptyState';
import HomeBannerDrawer from '@/Components/Admin/HomeBannerDrawer';

const MAX_BANNERS = 4;

function PopupSettings({ popup, promos = [] }) {
    const form = useForm({
        promo_id: popup?.promo_id ? String(popup.promo_id) : '',
        promo_title: popup?.promo_title || '',
        is_active: popup ? Boolean(popup.is_active) : false,
        image: null,
        remove_image: false,
    });
    const preview = form.data.image ? URL.createObjectURL(form.data.image) : popup?.image_url;

    const submit = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            promo_id: data.promo_id || null,
            promo_title: data.promo_title || null,
            is_active: Boolean(data.is_active),
            image: data.image,
            remove_image: data.remove_image,
        }));
        form.put(route('admin.banners.popup.update'), { preserveScroll: true, forceFormData: true });
    };

    return (
        <div className="card-surface max-w-3xl p-5 sm:p-7">
            <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-xl text-gold-light">↗</div>
                <div>
                    <p className="eyebrow">Momen Pembuka & Slot #1 Banner</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-ink">Popup Pembuka Beranda</h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate">
                        Tampilkan satu promo fokus dalam jendela popup. Promo popup aktif otomatis menduduki <strong>Slot #1 Banner Unggulan Beranda</strong>.
                    </p>
                </div>
            </div>
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="label" htmlFor="popup-promo-title">Judul Promo (opsional override)</label>
                    <input
                        id="popup-promo-title"
                        type="text"
                        className="input"
                        value={form.data.promo_title}
                        onChange={(e) => form.setData('promo_title', e.target.value)}
                        placeholder="Kosongkan jika menggunakan judul asli promo"
                    />
                    {form.errors.promo_title && <p className="mt-1 text-xs text-ember">{form.errors.promo_title}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="popup-promo">Target Promo</label>
                    <select id="popup-promo" className="input" value={form.data.promo_id} onChange={(e) => form.setData('promo_id', e.target.value)}>
                        <option value="">Pilih promo aktif…</option>
                        {promos.map((promo) => <option key={promo.id} value={promo.id}>{promo.title} {promo.partner?.name ? `— ${promo.partner.name}` : ''}</option>)}
                    </select>
                    {promos.length === 0 && <p className="mt-1.5 text-xs text-slate">Belum ada promo aktif yang tersedia saat ini.</p>}
                    {form.errors.promo_id && <p className="mt-1 text-xs text-ember">{form.errors.promo_id}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="popup-image">Gambar Popup (opsional)</label>
                    <input id="popup-image" type="file" accept=".jpg,.jpeg,.png,.webp" className="input file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-paper" onChange={(e) => form.setData((data) => ({ ...data, image: e.target.files[0] || null, remove_image: false }))} />
                    <p className="mt-1.5 text-xs text-slate">Format JPG/PNG/WebP, maksimal 2 MB.</p>
                    {preview && <div className="mt-3 flex items-start gap-3"><img src={preview} alt="Pratinjau Popup" className="h-28 w-full max-w-sm rounded-xl border border-ink/10 object-cover" /><button type="button" onClick={() => form.setData((data) => ({ ...data, image: null, remove_image: true }))} className="btn-ghost text-xs">Hapus</button></div>}
                    {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
                </div>
                <label className="flex items-center gap-3"><input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="h-4 w-4 accent-gold" /><span className="text-sm">Tampilkan popup di Beranda member & aktifkan di Slot #1 Banner</span></label>
                <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-5"><p className="text-xs text-slate">Muncul kembali pada kunjungan berikutnya setelah ditutup.</p><button type="submit" className="btn-gold shrink-0" disabled={form.processing}>{form.processing ? 'Menyimpan…' : 'Simpan Popup'}</button></div>
            </form>
        </div>
    );
}

export default function BannersIndex({ banners = [], partner_ads = [], filters = {}, promos = [], drawer = null, popup = null, popup_promos = [] }) {
    const filter = useForm(filters);
    const [tab, setTab] = useState('banners');

    const pendingAdsCount = partner_ads.filter((a) => a.status === 'pending').length;

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.banners.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.banners.index'), {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        router.get(route('admin.banners.index'), { drawer: 'create' }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const openEdit = (id) => {
        router.get(route('admin.banners.index'), { drawer: 'edit', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.banners.index'), {}, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const toggle = (banner) => {
        router.put(route('admin.banners.toggle', banner.id), {}, { preserveScroll: true });
    };

    const destroy = (banner) => {
        if (confirm(`Hapus banner ini?`)) {
            router.delete(route('admin.banners.destroy', banner.id), { preserveScroll: true });
        }
    };

    const approveAd = (adId) => {
        if (confirm('Setujui pengajuan iklan ini?')) {
            router.put(route('admin.banners.ads.approve', adId), {}, { preserveScroll: true });
        }
    };

    const rejectAd = (adId) => {
        const reason = window.prompt('Alasan penolakan pengajuan iklan:');
        if (reason) {
            router.put(route('admin.banners.ads.reject', adId), { reason }, { preserveScroll: true });
        }
    };

    const atCapacity = banners.length >= MAX_BANNERS;

    return (
        <>
            <Head title="Banner Beranda & Iklan" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Promosi & Media</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Banner Beranda & Iklan</h1>
                        <p className="mt-2 text-sm text-slate">
                            Kelola banner beranda, popup pembuka, dan persetujuan pengajuan slot iklan dari partner.
                        </p>
                    </div>
                    {tab === 'banners' && (
                        <div className="flex flex-col items-start gap-1.5 sm:items-end">
                            <button
                                onClick={openCreate}
                                className="btn-gold"
                                disabled={atCapacity}
                                title={atCapacity ? 'Maksimal 4 banner dikelola admin (Slot #1 dari Pop-up Pembuka).' : undefined}
                            >
                                + Tambah Banner
                            </button>
                            {atCapacity && (
                                <p className="text-xs text-ember">
                                    Slot admin penuh (4/4) — nonaktifkan atau hapus banner terlebih dahulu.
                                </p>
                            )}
                        </div>
                    )}
                </header>

                <div className="flex gap-1 border-b border-ink/10">
                    <button
                        type="button"
                        onClick={() => setTab('banners')}
                        className={`border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${
                            tab === 'banners' ? 'border-gold text-ink' : 'border-transparent text-slate hover:text-ink'
                        }`}
                    >
                        Banner Unggulan
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('popup')}
                        className={`border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${
                            tab === 'popup' ? 'border-gold text-ink' : 'border-transparent text-slate hover:text-ink'
                        }`}
                    >
                        Popup Pembuka
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('partner_ads')}
                        className={`relative border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${
                            tab === 'partner_ads' ? 'border-gold text-ink' : 'border-transparent text-slate hover:text-ink'
                        }`}
                    >
                        Pengajuan Iklan Partner
                        {pendingAdsCount > 0 && (
                            <span className="ml-2 rounded-full bg-ember px-2 py-0.5 text-[10px] font-bold text-paper">
                                {pendingAdsCount}
                            </span>
                        )}
                    </button>
                </div>

                {tab === 'popup' && <PopupSettings popup={popup} promos={popup_promos} />}

                {tab === 'partner_ads' && (
                    <div className="space-y-6">
                        <div className="card-surface p-5 border-l-4 border-gold">
                            <h3 className="font-display text-base font-bold text-ink">Ketentuan Pengajuan Iklan Partner</h3>
                            <p className="mt-1 text-xs text-slate">
                                Partner dapat mengajukan 2 jenis slot promosi: <strong>Pop-up Pembuka (durasi 3 hari)</strong> dan <strong>Banner Beranda (durasi 5 hari)</strong>. Setiap pengajuan memerlukan persetujuan admin sebelum ditayangkan.
                            </p>
                        </div>

                        {partner_ads.length === 0 ? (
                            <EmptyState
                                title="Belum ada pengajuan iklan"
                                description="Pengajuan slot iklan dari partner akan muncul di sini untuk ditinjau."
                            />
                        ) : (
                            <div className="space-y-4">
                                {partner_ads.map((ad) => (
                                    <div key={ad.id} className="card-surface p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex min-w-0 gap-4">
                                                {ad.image_url ? (
                                                    <img
                                                        src={ad.image_url}
                                                        alt={ad.promo_title}
                                                        className="h-20 w-32 shrink-0 rounded-xl border border-ink/10 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-xs text-slate">
                                                        Tanpa Gambar
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                                                            ad.type === 'popup' ? 'bg-gold/15 text-gold-deep' : 'bg-sage/15 text-sage-deep'
                                                        }`}>
                                                            {ad.type_label}
                                                        </span>
                                                        <StatusChip
                                                            status={ad.status}
                                                            label={ad.status === 'pending' ? 'Menunggu Persetujuan' : ad.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                        />
                                                    </div>
                                                    <h3 className="mt-1.5 font-display text-base font-bold text-ink">{ad.promo_title}</h3>
                                                    <p className="text-xs text-slate mt-0.5">
                                                        Partner: <strong>{ad.partner_name}</strong> · Diajukan pada {ad.created_at}
                                                    </p>
                                                    <p className="text-xs font-mono text-slate-soft mt-1">
                                                        Periode tayang: {ad.start_date} — {ad.end_date}
                                                    </p>
                                                    {ad.notes && (
                                                        <p className="mt-2 text-xs text-slate italic bg-ink/5 p-2 rounded-lg">
                                                            Catatan partner: "{ad.notes}"
                                                        </p>
                                                    )}
                                                    {ad.admin_feedback && (
                                                        <p className="mt-2 text-xs text-ember bg-ember/10 p-2 rounded-lg">
                                                            Alasan penolakan: {ad.admin_feedback}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 gap-2 sm:self-center">
                                                {ad.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => approveAd(ad.id)}
                                                            className="btn-gold text-xs"
                                                        >
                                                            Setujui Iklan
                                                        </button>
                                                        <button
                                                            onClick={() => rejectAd(ad.id)}
                                                            className="btn-danger text-xs"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                                {ad.status === 'approved' && (
                                                    <span className="text-xs font-semibold text-sage-deep flex items-center gap-1">
                                                        ✓ Disetujui
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'banners' && <>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3">
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">Semua</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Atur Ulang</button>
                    </div>
                </form>

                <div className="card-surface flex items-center justify-between gap-4 px-5 py-4">
                    <p className="text-sm text-slate">
                        <span className="font-display font-bold text-ink">{banners.length}</span> dari{' '}
                        {MAX_BANNERS} slot unggulan sedang digunakan.
                    </p>
                    <span className="chip border border-gold/30 bg-gold/15 text-gold-deep">Maks {MAX_BANNERS}</span>
                </div>

                {banners.length === 0 ? (
                    <EmptyState
                        title="Belum ada banner"
                        description="Unggulkan promo di beranda member."
                        action={
                            <button onClick={openCreate} className="btn-gold">
                                Tambah Banner
                            </button>
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-4">
                                    {banner.image_url ? (
                                        <img
                                            src={banner.image_url}
                                            alt=""
                                            className="h-11 w-11 shrink-0 rounded-xl border border-ink/10 object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-xs font-bold text-gold-light">
                                            #{String(banner.sort_order).padStart(2, '0')}
                                        </span>
                                    )}

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="chip border border-gold/30 bg-gold/15 text-gold-deep">Promo</span>
                                            <StatusChip
                                                status={banner.is_active ? 'active' : 'inactive'}
                                                label={banner.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                pulse={banner.is_active}
                                            />
                                        </div>
                                        <h3 className="mt-1 truncate font-display text-base font-bold text-ink">
                                            {banner.target_title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <button onClick={() => openEdit(banner.id)} className="btn-ghost text-xs">
                                        Edit
                                    </button>
                                    <button onClick={() => toggle(banner)} className="btn-ghost text-xs">
                                        {banner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </button>
                                    <button onClick={() => destroy(banner)} className="btn-danger text-xs">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </>}
            </div>

            <HomeBannerDrawer
                drawer={drawer}
                onClose={closeDrawer}
                promos={promos}
                nextSortOrder={banners.length + 1}
            />
        </>
    );
}

BannersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
