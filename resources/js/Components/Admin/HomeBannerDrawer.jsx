import { useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import { formatDate } from '@/Utils/format';

function resolveTargetId(banner, promos, agendas) {
    if (!banner) return '';

    if (banner.type === 'promo') {
        if (banner.promo_id) return String(banner.promo_id);
        const match = (promos || []).find((p) => p.title === banner.target_title);
        return match ? String(match.id) : '';
    }

    if (banner.agenda_id) return String(banner.agenda_id);
    const match = (agendas || []).find((a) => a.title === banner.target_title);
    return match ? String(match.id) : '';
}

function BannerForm({ banner, promos, agendas, nextSortOrder, onClose }) {
    const editing = Boolean(banner);

    const form = useForm({
        type: banner?.type || 'promo',
        target_id: resolveTargetId(banner, promos, agendas),
        sort_order: banner?.sort_order ?? nextSortOrder,
        is_active: banner ? Boolean(banner.is_active) : true,
        image: null,
        remove_image: false,
    });

    const existingImage = banner?.image_path && !form.data.remove_image ? `/storage/${banner.image_path}` : null;
    const newImagePreview = form.data.image ? URL.createObjectURL(form.data.image) : null;
    const imagePreview = newImagePreview || existingImage;

    form.transform((data) => ({
        type: data.type,
        sort_order: Number(data.sort_order),
        is_active: Boolean(data.is_active),
        promo_id: data.type === 'promo' ? (data.target_id || null) : null,
        agenda_id: data.type === 'agenda' ? (data.target_id || null) : null,
        image: data.image,
        remove_image: data.remove_image,
    }));

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.banners.update', banner.id), { preserveScroll: true, forceFormData: true });
        } else {
            form.post(route('admin.banners.store'), { preserveScroll: true, forceFormData: true });
        }
    };

    const handleTypeChange = (e) => {
        form.setData((data) => ({ ...data, type: e.target.value, target_id: '' }));
    };

    const isPromo = form.data.type === 'promo';
    const options = isPromo ? promos || [] : agendas || [];
    const optionLabel = (item) =>
        isPromo
            ? item.partner_name
                ? `${item.title} — ${item.partner_name}`
                : item.title
            : item.event_date
              ? `${item.title} · ${formatDate(item.event_date)}`
              : item.title;

    return (
        <form id="home-banner-form" onSubmit={submit} className="space-y-5">
            <div>
                <label className="label" htmlFor="banner-type">Banner type</label>
                <select id="banner-type" className="input" value={form.data.type} onChange={handleTypeChange}>
                    <option value="promo">Promo</option>
                    <option value="agenda">Agenda</option>
                </select>
                <p className="mt-1.5 text-xs text-slate">
                    {isPromo
                        ? 'Promos appear as clickable discount cards with the ink hero header.'
                        : 'Agendas appear as calm, informational cards with a date badge.'}
                </p>
            </div>

            <div>
                <label className="label" htmlFor="banner-target">
                    {isPromo ? 'Promo target' : 'Agenda target'}
                </label>
                <select
                    id="banner-target"
                    className="input"
                    value={form.data.target_id}
                    onChange={(e) => form.setData('target_id', e.target.value)}
                >
                    <option value="">Select a {isPromo ? 'promo' : 'agenda'}…</option>
                    {options.map((item) => (
                        <option key={item.id} value={item.id}>
                            {optionLabel(item)}
                        </option>
                    ))}
                </select>
                {options.length === 0 && (
                    <p className="mt-1.5 text-xs text-slate">
                        No {isPromo ? 'promos' : 'agendas'} available right now.
                    </p>
                )}
                {form.errors.promo_id && <p className="mt-1 text-xs text-ember">{form.errors.promo_id}</p>}
                {form.errors.agenda_id && <p className="mt-1 text-xs text-ember">{form.errors.agenda_id}</p>}
            </div>

            <div>
                <label className="label" htmlFor="banner-image">Image (optional)</label>
                <input
                    id="banner-image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="input file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-paper"
                    onChange={(e) => form.setData((data) => ({ ...data, image: e.target.files[0] || null, remove_image: false }))}
                />
                <p className="mt-1.5 text-xs text-slate">JPG/PNG/WebP, max 2 MB. Shown as the banner cover on member home.</p>

                {imagePreview && (
                    <div className="mt-3 flex items-start gap-3">
                        <img src={imagePreview} alt="Banner preview" className="h-24 w-full max-w-[240px] rounded-xl border border-ink/10 object-cover" />
                        <button
                            type="button"
                            onClick={() => form.setData((data) => ({ ...data, image: null, remove_image: true }))}
                            className="btn-ghost text-xs"
                        >
                            Remove
                        </button>
                    </div>
                )}
                {(form.errors.image || form.errors.remove_image) && (
                    <p className="mt-1 text-xs text-ember">{form.errors.image || form.errors.remove_image}</p>
                )}
            </div>

            <div>
                <label className="label" htmlFor="banner-sort">Sort order</label>
                <input
                    id="banner-sort"
                    type="number"
                    min="1"
                    max="3"
                    className="input"
                    value={form.data.sort_order}
                    onChange={(e) => form.setData('sort_order', e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate">Lower numbers appear first on the member home.</p>
                {form.errors.sort_order && <p className="mt-1 text-xs text-ember">{form.errors.sort_order}</p>}
            </div>

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(e) => form.setData('is_active', e.target.checked)}
                    className="h-4 w-4 accent-gold"
                />
                <span className="text-sm">Show on member home</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">
                    Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Saving…' : editing ? 'Save' : 'Save Banner'}
                </button>
            </div>
        </form>
    );
}

export default function HomeBannerDrawer({ drawer, onClose, promos = [], agendas = [], nextSortOrder = 1 }) {
    if (!drawer?.mode) return null;

    const banner = drawer.banner || drawer.info || null;
    const isEdit = drawer.mode === 'edit';

    return (
        <SlideOver
            open
            onClose={onClose}
            title={isEdit ? 'Edit Banner' : 'Add Home Banner'}
            subtitle={
                isEdit ? banner?.target_title : 'Feature a promo or an agenda on the member home.'
            }
            width="max-w-2xl"
        >
            <BannerForm
                key={banner?.id ?? 'create'}
                banner={banner}
                promos={promos}
                agendas={agendas}
                nextSortOrder={nextSortOrder}
                onClose={onClose}
            />
        </SlideOver>
    );
}
