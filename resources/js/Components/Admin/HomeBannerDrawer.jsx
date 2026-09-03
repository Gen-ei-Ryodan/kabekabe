import { useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';

function resolveTargetId(banner, promos) {
    if (!banner) return '';

    if (banner.promo_id) return String(banner.promo_id);
    const match = (promos || []).find((p) => p.title === banner.target_title);
    return match ? String(match.id) : '';
}

function BannerForm({ banner, promos, nextSortOrder, onClose }) {
    const editing = Boolean(banner);

    const form = useForm({
        target_id: resolveTargetId(banner, promos),
        sort_order: banner?.sort_order ?? nextSortOrder,
        is_active: banner ? Boolean(banner.is_active) : true,
        image: null,
        remove_image: false,
    });

    const existingImage = banner?.image_path && !form.data.remove_image ? `/storage/${banner.image_path}` : null;
    const newImagePreview = form.data.image ? URL.createObjectURL(form.data.image) : null;
    const imagePreview = newImagePreview || existingImage;

    form.transform((data) => ({
        type: 'promo',
        sort_order: Number(data.sort_order),
        is_active: Boolean(data.is_active),
        promo_id: data.target_id || null,
        agenda_id: null,
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

    const options = promos || [];
    const optionLabel = (item) => item.partner_name ? `${item.title} — ${item.partner_name}` : item.title;

    return (
        <form id="home-banner-form" onSubmit={submit} className="space-y-5">
            <div>
                <label className="label" htmlFor="banner-target">Promo target</label>
                <select
                    id="banner-target"
                    className="input"
                    value={form.data.target_id}
                    onChange={(e) => form.setData('target_id', e.target.value)}
                >
                    <option value="">Select a promo…</option>
                    {options.map((item) => (
                        <option key={item.id} value={item.id}>
                            {optionLabel(item)}
                        </option>
                    ))}
                </select>
                {options.length === 0 && (
                    <p className="mt-1.5 text-xs text-slate">
                        No promos available right now.
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

export default function HomeBannerDrawer({ drawer, onClose, promos = [], nextSortOrder = 1 }) {
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
                nextSortOrder={nextSortOrder}
                onClose={onClose}
            />
        </SlideOver>
    );
}
