import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import EmptyState from '@/Components/EmptyState';
import HomeBannerDrawer from '@/Components/Admin/HomeBannerDrawer';

const MAX_BANNERS = 3;

function PopupSettings({ popup, promos = [] }) {
    const form = useForm({
        promo_id: popup?.promo_id ? String(popup.promo_id) : '',
        is_active: popup ? Boolean(popup.is_active) : false,
        image: null,
        remove_image: false,
    });
    const preview = form.data.image ? URL.createObjectURL(form.data.image) : popup?.image_url;

    const submit = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            promo_id: data.promo_id || null,
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
                    <p className="eyebrow">Opening moment</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-ink">Home opening popup</h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate">Show one focused promo in a centered modal three seconds after a member opens Home.</p>
                </div>
            </div>
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="label" htmlFor="popup-promo">Promo target</label>
                    <select id="popup-promo" className="input" value={form.data.promo_id} onChange={(e) => form.setData('promo_id', e.target.value)}>
                        <option value="">Select an active promo…</option>
                        {promos.map((promo) => <option key={promo.id} value={promo.id}>{promo.title} {promo.partner?.name ? `— ${promo.partner.name}` : ''}</option>)}
                    </select>
                    {promos.length === 0 && <p className="mt-1.5 text-xs text-slate">No visible promos are available right now.</p>}
                    {form.errors.promo_id && <p className="mt-1 text-xs text-ember">{form.errors.promo_id}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="popup-image">Popup image (optional)</label>
                    <input id="popup-image" type="file" accept=".jpg,.jpeg,.png,.webp" className="input file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-paper" onChange={(e) => form.setData((data) => ({ ...data, image: e.target.files[0] || null, remove_image: false }))} />
                    <p className="mt-1.5 text-xs text-slate">JPG/PNG/WebP, max 2 MB. A wide image works best.</p>
                    {preview && <div className="mt-3 flex items-start gap-3"><img src={preview} alt="Popup preview" className="h-28 w-full max-w-sm rounded-xl border border-ink/10 object-cover" /><button type="button" onClick={() => form.setData((data) => ({ ...data, image: null, remove_image: true }))} className="btn-ghost text-xs">Remove</button></div>}
                    {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
                </div>
                <label className="flex items-center gap-3"><input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="h-4 w-4 accent-gold" /><span className="text-sm">Show popup on member Home</span></label>
                <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-5"><p className="text-xs text-slate">It appears again on the next Home visit after being closed.</p><button type="submit" className="btn-gold shrink-0" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save Popup'}</button></div>
            </form>
        </div>
    );
}

export default function BannersIndex({ banners = [], filters = {}, promos = [], drawer = null, popup = null, popup_promos = [] }) {
    const filter = useForm(filters);
    const [tab, setTab] = useState('banners');

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
        if (confirm(`Delete this banner?`)) {
            router.delete(route('admin.banners.destroy', banner.id), { preserveScroll: true });
        }
    };

    const atCapacity = banners.length >= MAX_BANNERS;

    return (
        <>
            <Head title="Home Banners" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Member Home</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Home Banners</h1>
                        <p className="mt-2 text-sm text-slate">
                            Curate up to three featured slots on the member home.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 sm:items-end">
                        <button
                            onClick={openCreate}
                            className="btn-gold"
                            disabled={atCapacity}
                            title={atCapacity ? 'Maximum of 3 banners. Deactivate or delete one first.' : undefined}
                        >
                            + Add Banner
                        </button>
                        {atCapacity && (
                            <p className="text-xs text-ember">
                                Slot full (3/3) — deactivate or delete a banner first.
                            </p>
                        )}
                    </div>
                </header>

                <div className="flex gap-1 border-b border-ink/10">
                    <button type="button" onClick={() => setTab('banners')} className={`border-b-2 px-3 pb-3 text-sm font-semibold ${tab === 'banners' ? 'border-gold text-ink' : 'border-transparent text-slate'}`}>Featured banners</button>
                    <button type="button" onClick={() => setTab('popup')} className={`border-b-2 px-3 pb-3 text-sm font-semibold ${tab === 'popup' ? 'border-gold text-ink' : 'border-transparent text-slate'}`}>Opening popup</button>
                </div>

                {tab === 'popup' ? <PopupSettings popup={popup} promos={popup_promos} /> : <>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3">
                        <div>
                            <label className="label">Status</label>
                            <select className="input" value={filter.data.status || ''} onChange={(e) => filter.setData('status', e.target.value)}>
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                <div className="card-surface flex items-center justify-between gap-4 px-5 py-4">
                    <p className="text-sm text-slate">
                        <span className="font-display font-bold text-ink">{banners.length}</span> of{' '}
                        {MAX_BANNERS} featured slots in use.
                    </p>
                    <span className="chip border border-gold/30 bg-gold/15 text-gold-deep">Max {MAX_BANNERS}</span>
                </div>

                {banners.length === 0 ? (
                    <EmptyState
                        title="No banners yet"
                        description="Feature a promo on the member home."
                        action={
                            <button onClick={openCreate} className="btn-gold">
                                Add banner
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
                                                label={banner.is_active ? 'Active' : 'Inactive'}
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
                                        {banner.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => destroy(banner)} className="btn-danger text-xs">
                                        Delete
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
